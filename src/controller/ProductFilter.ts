import * as fs from "fs-extra";
import {Brand} from "./dataTypes/Brand";
import {loadJsonPersistFile, persistData, persistDir} from "./CacheDataset";
import {externalDir, loadExcelFile} from "./loadExcelData";
import {BaseModel} from "./dataTypes/BaseModel";
import {Attribute, AttributePairs} from "./dataTypes/Attribute";
import {DataAddError, FilterError, ResultTooLargeError} from "./Errors";
import {Product} from "./dataTypes/Product";

// Contains all the central functions to filter a list of products via user-provided JSON queries.
export default class ProductFilter {
    private loadedData: {[key: string]: Brand}; // Contains each brand name and its corresponding Brand object.
    private loadedFiles: string[]; // Should NOT contain the file extension (same for cachedFiles)
    private cachedFiles: string[];
    private dataIsLoaded: boolean;

    constructor() {
        console.log("ProductFIlter::init()");
        this.loadedData = {};
        this.loadedFiles = [];
        this.cachedFiles = [];
        this.dataIsLoaded = false;
    }

    // If there are any saved data json files in the persistedData directory (assuming it exists), load these first.
    // Then, load data from files in externalData that don't have a corresponding persistence file in persistedData.
    // Once the data is loaded, create JSON persistence files that each correspond to a file in externalData.
    // E.g. Data from SKU match.xlsx would go into SKU match.json.
    public async loadSaveAllData(): Promise<void> {
        if (this.dataIsLoaded) {
            return Promise.resolve();
        }

        try {
            const res1 = await this.loadCachedData();
            const res2 = await this.loadPersistNewData();
            this.dataIsLoaded = true;
            return Promise.resolve();
        } catch (err: any) {
            return Promise.reject(new DataAddError(err.getMessage()));
        }
    }

    // Code to load data from JSON persistence files in persistedData. Update this.loadedFiles and this.cachedFiles.
    // These should have the same contents on return. Return names of all loaded persistence files.
    public async loadCachedData(): Promise<string[]> {
        let ret: string[] = [];

        if (!fs.existsSync(persistDir)) {
            fs.mkdirSync(persistDir);
            return Promise.resolve([]);
        }

        let files = await fs.readdir(persistDir);
        for (const file of files) {
            let fileNameParts = file.split(".");

            if (fileNameParts[1] === "json") {
                this.cachedFiles.push(fileNameParts[0]);
                const result = await loadJsonPersistFile(file);
                this.loadedFiles.push(fileNameParts[0]);

                this.loadedData = this.mergeBrandDicts(this.loadedData, result);
                ret.push(fileNameParts[0]);
            }
        }

        return Promise.resolve(ret);
    }

    // Load and persist data from files in externalData whose names don't appear in cachedFiles.
    // Returns names of all files from which data were loaded and persisted.
    public async loadPersistNewData(): Promise<string[]> {
        let ret: string[] = [];

        if (!fs.existsSync(externalDir)) {
            fs.mkdirSync(externalDir);
            return Promise.resolve([]);
        }

        let files = await fs.readdir(externalDir);
        for (const file of files) {
            let fileNameParts = file.split(".");
            if (this.cachedFiles.indexOf(fileNameParts[0]) !== -1) {
                continue;
            } // No need to load external files that are already stored in persistedData.

            if (fileNameParts[1] === "xlsx") {
                const result = await loadExcelFile(file);
                this.loadedFiles.push(fileNameParts[0]);

                this.loadedData = this.mergeBrandDicts(this.loadedData, result);

                await persistData(fileNameParts[0], result);
                this.cachedFiles.push(fileNameParts[0]);
                ret.push(fileNameParts[0]);
            }
        }

        return Promise.resolve(ret);
    }

    // Merges two Brand dictionaries, usually to combine the data from multiple external/persistence files.
    // To prevent duplicate product entries, no particular product should appear in both dict1 and dict2.
    // Nevertheless, this case is handled in PerformQuery.
    public mergeBrandDicts(dict1: {[key: string]: Brand}, dict2: {[key: string]: Brand}): {[key: string]: Brand} {
        if (Object.keys(dict1).length === 0) {
            return dict2;
        } else if (Object.keys(dict2).length === 0) {
            return dict1;
        }

        let ret: {[key: string]: Brand} = dict1;
        // dict1 will usually be larger as it normally equals this.loadedData.

        Object.keys(dict2).forEach(brName => {
            if (typeof(dict1[brName]) === "undefined") {
                ret[brName] = dict2[brName];
            } else {
                Object.entries(dict2[brName].getModelList()).forEach(([bmSKU, model]) => {
                    for (const product of model.getProductList()) {
                        ret[brName].addProductObj(product);
                    }
                });
            }
        });
        return ret;
    }

    /*
    Executes a user-provided query to filter through this.loadedData and return all matching product UUID's
    with the desired brand, base model, and attributes.
    REQUIRES: Query provides the brand name and base model SKU, in addition to any number of attribute-value pairs.
    Must follow the format provided in ProductFilterTest.ts (see query1 in line 188).
    (Potential extension): Each attribute within query holds an array of values rather than a single value. This
    way, a user can filter for multiple values of the same attribute at once.
    */
    public async PerformQuery(query: any): Promise<string[]> {
        await this.loadSaveAllData(); // Ensure all data are loaded and saved to the disk first.
        let ret: Product[] = [];

        try {
            let modelToSearch: BaseModel = this.loadedData[query["brandCode"]].getModelList()[query["baseModelSKU"]];
            ret = modelToSearch.getProductList();
            // Isolates a single baseModel to search, given the first two query components.

            Object.keys(query["attributes"]).forEach(attr => {
                this.validateQueryAttr(query, modelToSearch, attr);

                ret = ret.filter((prod) =>
                    prod.getAttributes()[attr as Attribute] === query["attributes"][attr]);
            });
        } catch (err: any) {
            return Promise.reject(new FilterError(err.message));
        }

        if (ret.length >= 50) {
            return Promise.reject(new ResultTooLargeError("Too many results " + "(" + ret.length + ")."));
        }
        return Promise.resolve(ret.map((prod) => prod.getUuidCode()));
    }

    // Validation function to catch any faulty attribute-value pairs. Must be run once per entry in query[attributes].
    public validateQueryAttr(query: any, modelToSearch: BaseModel, attr: string) {
        // If the base model doesn't contain an attribute referenced in the query
        if (modelToSearch.getAttributeList().indexOf(attr as Attribute) === -1) {
            throw new FilterError("Base model " + modelToSearch.getSKU() + " does not have attribute "
                + attr as Attribute + ".");
        }

        // If the referenced attribute appears in attributeList but not AttrValues (shouldn't ever happen)
        let modelAttrValues = modelToSearch.getAttributeValues()[attr as Attribute];
        if (typeof(modelAttrValues) === "undefined") {
            throw new FilterError("Inconsistency in base model " + modelToSearch.getSKU()
                + "'s attribute data. Review code");

        // If the value of the attribute referenced in the query is out of the base model's range
        } else if (modelAttrValues.indexOf(query["attributes"][attr]) === -1) {
            throw new FilterError("Attribute value " + attr as Attribute + " = " + query["attributes"][attr] +
                " is out of range for base model " + modelToSearch.getSKU());
        }
    }

    // Remove any data persistence file (by name) from the persistedData directory.
    // Does NOT remove the associated data from this.loadedData. Do nothing if file isn't present.
    public async removeData(fileName: string): Promise<string> {
        if (!fs.existsSync(persistDir)) {
            fs.mkdirSync(persistDir);
            return Promise.resolve("");
        }

        try {
            await fs.remove(persistDir + "/" + fileName + ".json");
            this.cachedFiles.splice(this.cachedFiles.indexOf(fileName), 1);
            return Promise.resolve(fileName + ".json removed");
        } catch (error: any) {
            return Promise.resolve("");
        }

    }

    public getLoadedData() {
        return this.loadedData;
    }
}