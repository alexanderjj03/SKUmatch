import JSZip from "jszip";
import * as fs from "fs-extra";
import {Brand} from "./dataTypes/Brand";

// Contains all the central functions to filter a list of products via user-provided JSON queries.
export default class ProductFilter {
    private loadedData: {[key: string]: Brand};
    private loadedFiles: string[];
    private cachedFiles: string[];
    private dataIsLoaded: boolean;

    constructor() {
        console.log("ProductFIlter::init()");
        this.loadedData = {};
        this.loadedFiles = [];
        this.cachedFiles = [];
        this.dataIsLoaded = false;
    }

    // Load data from files in externalData that don't yet have a corresponding persistence file in persistData. Once
    // the data is loaded, create JSON persistence files that each correspond to a file in externalData.
    // E.g. Data from SKU match.xlsx would go into SKU match.json.
    public async loadData(): Promise<void> {
        if (this.dataIsLoaded) {
            return Promise.resolve();
        }
        return Promise.resolve();
    }

    public async persistData(): Promise<void> {
        if (this.dataIsLoaded) {
            return Promise.resolve();
        }
        return Promise.resolve();
    }

    // LATER, instead of creating one json persistence file per dataset in externalData, organize persistence files
    // by brand. IDEALLY there should be one file in externalData per brand.

    public async PerformQuery(query: any): Promise<string[]> {
        await this.loadData();
        await this.persistData();
        return Promise.resolve(["yes"]);
    }
}