import JSZip from "jszip";
import * as fs from "fs-extra";
import {Brand} from "./dataTypes/Brand";
import {persistDir} from "./CacheDataset";
import {externalDir, loadExcelFile} from "./loadExcelData";

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
        await this.loadCachedData();
        await this.loadPersistNewData();
        return Promise.resolve();
    }

    // Load data from JSON filed in persistedData.
    public async loadCachedData(): Promise<void> {
        if (!fs.existsSync(persistDir)) {
            fs.mkdirSync(persistDir);
            return Promise.resolve();
        }

        // Code to load data from persistence files. Update this.loadedFiles and this.cachedFiles.
        // Should have the same contents on return.

        return Promise.resolve();
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
            }

            if (fileNameParts[1] === "xlsx") {
                const result = await loadExcelFile(file);
                this.loadedFiles.push(fileNameParts[0]);

                await this.persistData(fileNameParts[0], result);
                this.cachedFiles.push(fileNameParts[0]);
                ret.push(fileNameParts[0]);
            }
        }

        return Promise.resolve(ret);
    }

    // Save new data to the disk, given the file name it originated from. Called from loadNewData.
    public async persistData(name: string, data: {[key: string]: Brand}): Promise<void> {
        if (this.dataIsLoaded) {
            return Promise.resolve();
        }
        return Promise.resolve();
    }

    // Executes a user-provided query to filter through this.loadedData and return all matching product UUID's
    // with the desired brand, base model, and attributes. Any duplicate items will only be shown once.
    // REQUIRES: Query provides the brand name and base model SKU, in addition to any number of attribute-value pairs.
    // Specific query format provided in tests.
    public async PerformQuery(query: any): Promise<string[]> {
        await this.loadSaveAllData(); // Ensure all data are loaded and saved to the disk first.

        return Promise.resolve(["yes"]);
    }

    // Remove any data persistence file (by name) from the persistedData directory.
    public async removeData(fileName: string): Promise<void> {
        if (!fs.existsSync(persistDir)) {
            fs.mkdirSync(persistDir);
            return Promise.resolve();
        }


        return Promise.resolve();
    }
}