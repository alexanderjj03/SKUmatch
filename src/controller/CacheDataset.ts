import * as fs from "fs-extra";
import * as path from "path";
import {Brand} from "./dataTypes/Brand";
import {DataPersistError} from "./Errors";
import {externalDir} from "./loadExcelData";
import Base = Mocha.reporters.Base;
import {BaseModel} from "./dataTypes/BaseModel";
import {AttributePairs} from "./dataTypes/Attribute";

export const persistDir = "./persistedData";
export const failedQueryDir = "./failedQueries";

// Load a Brand dictionary from a JSON persistence file.
export async function loadJsonPersistFile(name: string): Promise<{[key: string]: Brand}> {
    let ret: {[key: string]: Brand} = {};
    let content = fs.readFileSync(persistDir + "/" + name, "utf8");
    let data = JSON.parse(content);
    Object.keys(data).forEach(brName => {
        ret[brName] = new Brand(brName);
        Object.keys(data[brName]["baseModelList"]).forEach(bmSKU => {
            let curModel: any = data[brName]["baseModelList"][bmSKU];
            let model: BaseModel = new BaseModel(brName, String(curModel["colCode"]), String(curModel["subColCode"]),
                String(curModel["baseModelCode"]), bmSKU);

            for (const product of curModel["productList"]) {
                model.addProduct(String(product["uuidCode"]), product["attributes"] as AttributePairs);
            }
            ret[brName].addBaseModel(model);
        });
    });
    return Promise.resolve(ret);
}

// Save new data to the disk, given the file name it originated from. Called from loadPersistNewData.
export async function persistData(name: string, data: {[key: string]: Brand}): Promise<void> {
    if (!fs.existsSync(persistDir)) {
        fs.mkdirSync(persistDir);
    }

    let toWrite = JSON.stringify(data);
    await (async () => {
        await new Promise((resolve, reject) => {
            fs.writeFile(persistDir + "/" + name + ".json", toWrite, "utf8",
                async (err) => {
                    if (err) {
                        reject(err);
                    }

                    resolve("Success");
            });
        }).catch((err: any) => {
            console.log(err.getMessage());
            return Promise.reject(new DataPersistError("Unable to save file " + name
                + ", error encountered."));
        });

        const file = require("../." + persistDir + "/" + name + ".json");
        // require and fs use differing relative paths.
    })();

    return Promise.resolve();
}

// Persists "failed queries" (queries that result in multiple return values despite filtering via all the base model's
// attributes. Ideally, this function should never be called. But if it is, the developers can know what went wrong.
export async function persistFailedQuery(query: any, result: string[]): Promise<void> {
    if (!fs.existsSync(failedQueryDir)) {
        fs.mkdirSync(failedQueryDir);
    }

    let writeObj: any = {};
    writeObj["Query"] = query;
    writeObj["Result"] = result;

    let name = new Date();
    let toWrite = JSON.stringify(writeObj);
    await (async () => {
        await new Promise((resolve, reject) => {
            fs.writeFile(failedQueryDir + "/" + name + ".json", toWrite, "utf8",
                async (err) => {
                    if (err) {
                        reject(err);
                    }

                    resolve("Success");
                });
        }).catch((err: any) => {
            console.log(err.getMessage());
            return Promise.reject(new DataPersistError("Unable to save file " + name
                + ", error encountered."));
        });

        const file = require("../." + failedQueryDir + "/" + name + ".json");
    })();

    return Promise.resolve();
}