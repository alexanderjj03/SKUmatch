import * as fs from "fs-extra";
import * as path from "path";
import {Brand} from "./dataTypes/Brand";
import {DataPersistError} from "./Errors";
import {externalDir} from "./loadExcelData";
import Base = Mocha.reporters.Base;
import {BaseModel} from "./dataTypes/BaseModel";
import {AttributePairs} from "./dataTypes/Attribute";

export const persistDir = "./persistedData";

export async function loadJsonPersistFile(name: string): Promise<{[key: string]: Brand}> {
    let ret: {[key: string]: Brand} = {};
    let content = fs.readFileSync(persistDir + "/" + name, "utf8");
    let data = JSON.parse(content);
    Object.keys(data).forEach(key => {
        ret[key] = new Brand(key);
        for (const baseModel of data[key]["baseModelList"]) {
            let model: BaseModel = new BaseModel(key, String(baseModel["colCode"]), String(baseModel["subColCode"]),
                String(baseModel["baseModelCode"]), String(baseModel["baseModelSKU"]));

            for (const product of baseModel["productList"]) {
                model.addProduct(String(product["uuidCode"]), product["attributes"] as AttributePairs);
            }
            ret[key].addBaseModel(model);
        }
    });
    return Promise.resolve(ret);
}

// Save new data to the disk, given the file name it originated from. Called from loadPersistNewData.
export async function persistData(name: string, data: {[key: string]: Brand}): Promise<void> {
    if (!fs.existsSync(persistDir)) {
        fs.mkdirSync(persistDir);
    }

    let toWrite = JSON.stringify(data);
    fs.writeFile(persistDir + "/" + name + ".json", toWrite, "utf8",
        async (err) => {
            if (err) {
                await Promise.reject(new DataPersistError("Unable to save file "
                    + name + ", error encountered."));
            } else {
                await Promise.resolve();
            }
        });
}