import * as fs from "fs-extra";
import * as path from "path";
import {Brand} from "./dataTypes/Brand";
import {DataPersistError} from "./Errors";
import {externalDir} from "./loadExcelData";
import Base = Mocha.reporters.Base;
import {BaseModel} from "./dataTypes/BaseModel";
import {AttributePairs} from "./dataTypes/Attribute";
import {sendEmail} from "./NotifyDevs";
import {ModelInfo} from "./dataTypes/modelInfo";

export const persistDir = "./persistedData";
export const failedQueryDir = "./failedQueries";

// Load a Brand dictionary from a JSON persistence file.
export async function loadJsonPersistFile(name: string): Promise<[{[key: string]: Brand},
    {[key: string]: ModelInfo}]> {

    let products: {[key: string]: Brand} = {};
    let modelInfo: {[key: string]: ModelInfo} = {};
    let content = fs.readFileSync(persistDir + "/" + name, "utf8");
    let data = JSON.parse(content);
    Object.keys(data["Products"]).forEach(brName => {
        products[brName] = new Brand(brName);
        Object.keys(data["Products"][brName]["baseModelList"]).forEach(bmCode => {
            let curModel: any = data["Products"][brName]["baseModelList"][bmCode];
            let model: BaseModel = new BaseModel(brName, String(curModel["colCode"]), String(curModel["colDesc"]),
                String(curModel["subColCode"]), String(curModel["productType"]), bmCode);

            for (const product of curModel["productList"]) {
                model.addProduct(String(product["baseModelSKU"]), String(product["referenceNo"]),
                    String(product["uuidCode"]), product["attributes"] as AttributePairs, product["pictureLink"]);
            }
            products[brName].addBaseModel(model);
        });
    });

    Object.keys(data["Model Info"]).forEach(bmCode => {
        modelInfo[bmCode] = new ModelInfo(String(data["Model Info"][bmCode]["brandCode"]),
            String(data["Model Info"][bmCode]["colCode"]), String(data["Model Info"][bmCode]["colDesc"]),
            String(data["Model Info"][bmCode]["productType"]), bmCode, String(data["Model Info"][bmCode]["imageUrl"]));
    });
    return Promise.resolve([products, modelInfo]);
}

// Save new data to the disk, given the file name it originated from. Called from loadPersistNewData.
export async function persistData(name: string, data: {[key: string]: Brand},
                                  modelInfo: {[key: string]: ModelInfo}): Promise<void> {
    if (!fs.existsSync(persistDir)) {
        fs.mkdirSync(persistDir);
    }

    let jsonData = {"Products": data, "Model Info": modelInfo};
    let toWrite = JSON.stringify(jsonData);
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
// Also sends an email to the developers (CHANGE EMAILS LATER)
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

    await sendEmail(query, result, name);

    return Promise.resolve();
}