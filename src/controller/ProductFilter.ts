import * as fs from "fs-extra";
import {Brand} from "./dataTypes/Brand";
import {loadJsonPersistFile, persistData, persistDir, persistFailedQuery} from "./CacheDataset";
import {externalDir, loadExcelFile} from "./loadExcelData";
import {BaseModel} from "./dataTypes/BaseModel";
import {Attribute, AttributePairs} from "./dataTypes/Attribute";
import {DataAddError, DatabaseError, FilterError, NoResultsError, ResultTooLargeError} from "./Errors";
import {Product} from "./dataTypes/Product";
import {ModelInfo} from "./dataTypes/modelInfo";

// Contains all the central functions to filter a list of products via user-provided JSON queries.
export default class ProductFilter {
    private loadedData: {[key: string]: Brand}; // Contains each brand name and its corresponding Brand object.
    private modelInfoMap: {[key: string]: ModelInfo} // Contains each base model code and its info
    // (product type, brand code, base model code, collection code, image URL).
    private loadedFiles: string[];
    // Represented as a filename (in externalData) minus the period (e.g. SKU match 3xlsx).
    private cachedFiles: string[]; // Represented in the same way as loadedFiles.
    private dataIsLoaded: boolean;

    constructor() {
        console.log("ProductFIlter::init()");
        this.loadedData = {};
        this.modelInfoMap = {};
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
            return Promise.reject(new DataAddError(err.message));
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
                const result: [{[key: string]: Brand}, {[key: string]: ModelInfo}] = await loadJsonPersistFile(file);
                this.loadedFiles.push(fileNameParts[0]);

                this.loadedData = this.mergeBrandDicts(this.loadedData, result[0]);
                this.modelInfoMap = this.mergeInfoDicts(this.modelInfoMap, result[1]);
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
            let rawName = fileNameParts[0] + fileNameParts[1]; // File name without the period
            if (this.cachedFiles.includes(rawName)) {
                continue;
            } // No need to load external files that are already stored in persistedData.

            if (fileNameParts[1] === "xlsx") {
                const result: [{[key: string]: Brand}, {[key: string]: ModelInfo}] = await loadExcelFile(file);
                this.loadedFiles.push(rawName);

                this.loadedData = this.mergeBrandDicts(this.loadedData, result[0]);
                this.modelInfoMap = this.mergeInfoDicts(this.modelInfoMap, result[1]);

                const res2= await persistData(rawName, result[0], result[1]);
                this.cachedFiles.push(rawName);
                ret.push(fileNameParts[0]);
            }
        }

        return Promise.resolve(ret);
    }

    // Merges two model info dictionaries, usually to combine the data from multiple external/persistence files.
    public mergeInfoDicts(dict1: {[key: string]: ModelInfo}, dict2: {[key: string]: ModelInfo}):
        {[key: string]: ModelInfo} {

        if (Object.keys(dict1).length === 0) {
            return dict2;
        } else if (Object.keys(dict2).length === 0) {
            return dict1;
        }

        let ret: {[key: string]: ModelInfo} = dict1;
        // dict1 will usually be larger as it equals this.modelInfoMap.

        Object.keys(dict2).forEach(modelCode => {
            if (typeof(ret[modelCode]) === "undefined" ||
                ret[modelCode].getImageUrl() !== dict2[modelCode].getImageUrl()) {

                ret[modelCode] = dict2[modelCode];
            }
        });
        return ret;
    }

    // Merges two Brand dictionaries, usually to combine the data from multiple external/persistence files.
    // To prevent duplicate product entries, NO PARTICULAR PRODUCT SHOULD APPEAR in both dict1 and dict2.
    public mergeBrandDicts(dict1: {[key: string]: Brand}, dict2: {[key: string]: Brand}): {[key: string]: Brand} {
        if (Object.keys(dict1).length === 0) {
            return dict2;
        } else if (Object.keys(dict2).length === 0) {
            return dict1;
        }

        let ret: {[key: string]: Brand} = dict1;
        // dict1 will usually be larger as it normally equals this.loadedData.

        Object.keys(dict2).forEach(brName => {
            if (typeof(ret[brName]) === "undefined") {
                ret[brName] = dict2[brName];
            } else {
                Object.entries(dict2[brName].getModelList()).forEach(([bmCode, model]) => {
                    for (const product of model.getProductList()) {
                        ret[brName].addProductObj(product);
                    }
                });
            }
        });
        return ret;
    }

    /*
    Executes a user-provided query to filter through this.loadedData and return a matching product UUID with the
    desired brand, base model, and attributes. Removes any duplicate UUID's.
    REQUIRES: query provides the brand name and base model code, in addition to any number of attribute-value pairs
    (so long as the base model contains every referenced attribute).
    Must follow the format provided in ProductFilter.spec.ts (line 192).
    */
    public async performQuery(query: any): Promise<Product[]> {
        await this.loadSaveAllData(); // Ensure all data are loaded and saved to the disk first.
        let modelToSearch: BaseModel;
        let ret: Product[] = [];

        try {
            modelToSearch = this.loadedData[query["brandCode"]].getModelList()[query["baseModelCode"]];
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

        let retUUIDs: {[key: string]: Product} = {};
        for (const product of ret) {
            retUUIDs[product.getUuidCode().trim().toUpperCase()] = product;
        } // eliminates any products with duplicate UUID's

        if (Object.keys(retUUIDs).length >= 2) {
            let attrsReferenced =  Object.keys(query["attributes"]).length;
            let AttrNumDiff = modelToSearch.getAttributeList().length - attrsReferenced;
            // Checking if any of modelToSearch's attributes aren't referenced in query

            if (AttrNumDiff > 0) {
                return Promise.reject(new ResultTooLargeError("Too many results " + "(" + Object.keys(retUUIDs).length
                    + "). Please refine your search. " + AttrNumDiff + " attribute value(s) remain un-entered."));
            } else {
                for (const prod of Object.values(retUUIDs)) {
                    if (prod.getPictureLink() === "") {
                        // If any of the matching products doesn't have a picture link, the user can't compare them.
                        await persistFailedQuery(query, Object.keys(retUUIDs));
                        // This is of interest to the developers for bug fixing purposes.
                        return Promise.reject(new DatabaseError("Multiple matching products found: " +
                            Object.keys(retUUIDs) + ". Your query and its result have been sent to our developers " +
                            "for review. Apologies for the inconvenience"));
                    }
                }
            }
        } else if (Object.keys(retUUIDs).length === 0) {
            return Promise.reject(new NoResultsError("No results found. Please ensure all " +
                "attribute values are entered correctly"));
        }

        return Promise.resolve(Object.values(retUUIDs)); // There should usually only be one return value.
    }

    // Validation function to catch any faulty attribute-value(s) pairs in query[attributes].
    // Must be run once per entry in query[attributes].
    public validateQueryAttr(query: any, modelToSearch: BaseModel, attr: string) {
        // If the base model doesn't contain an attribute referenced in the query
        if (!modelToSearch.getAttributeList().includes(attr as Attribute)) {
            throw new FilterError("Base model " + modelToSearch.getModelCode() + " does not have attribute "
                + attr as Attribute + ".");
        }

        // If the referenced attribute appears in attributeList but not AttrValues (shouldn't ever happen)
        let modelAttrValues = modelToSearch.getAttributeValues()[attr as Attribute];
        if (typeof(modelAttrValues) === "undefined") {
            throw new FilterError("Inconsistency in base model " + modelToSearch.getModelCode()
                + "'s attribute data. Review code");

        // If the desired value(s) of the attribute referenced in the query is/are out of the base model's range
        } else if (!modelAttrValues.includes(query["attributes"][attr])) {
            throw new FilterError("Attribute value " + attr as Attribute + " = " + query["attributes"][attr] +
                " is out of range for base model " + modelToSearch.getModelCode());
        }
    }

    // Returns all unique elements in a string arr.
    public removeDuplicates(arr: string[]): string[] {
        const counts: {[key: string]: number} = {};
        for (const str of arr) {
            counts[str] = counts[str] ? counts[str] + 1 : 1;
        }

        return Object.keys(counts);
    }

    // Finds a product object based on its corresponding brand and manufacturer reference number.
    // Fails if there are multiple matches.             Fix this later.
    // REQUIRES: No duplicate products can be present (BE CAREFUL if loading data from multiple files).
    public async getProdFromRef(brand: string, manuRef: string): Promise<Product> {
        await this.loadSaveAllData(); // Ensure all data are loaded and saved to the disk first.
        let brandToSearch: Brand;
        let ret: Product[] = [];

        try {
            brandToSearch = this.loadedData[brand];
            Object.values(brandToSearch.getModelList()).forEach((model: BaseModel) => {
                for (const product of model.getProductList()) {
                    if (product.getReferenceNo().toUpperCase() === manuRef.toUpperCase()) {
                        ret.push(product);
                    }
                }
            });
        } catch (err: any) {
            return Promise.reject(new FilterError(err.message));
        }

        let retUUIDs = ret.map((value) => value.getUuidCode());

        if (this.removeDuplicates(retUUIDs).length >= 2) {
            await persistFailedQuery({"Brand": brand, "Manufacturer Reference No.": manuRef}, retUUIDs);
            // This is of interest to the developers for bug fixing purposes.
            return Promise.reject(new DatabaseError("Multiple matching products found: " + retUUIDs + ". " +
                "Your query and its result have been sent to our developers for review. " +
                "Apologies for the inconvenience"));
        } else if (ret.length === 0) {
            return Promise.reject(new NoResultsError("No results found. Please ensure all " +
                "attribute values are entered correctly"));
        }

        return Promise.resolve(ret[0]); // There should only be one return value.
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
            return Promise.resolve("File not found");
        }

    }

    public getLoadedData() {
        return this.loadedData;
    }

    public getInfoMap() {
        return this.modelInfoMap;
    }
}