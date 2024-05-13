import * as fs from "fs-extra";
import * as path from "path";
import ProductFilter from "./ProductFilter";
import {Brand} from "./dataTypes/Brand";
import {DataAddError} from "./Errors";
import {Product} from "./dataTypes/Product";

export const externalDir = "./externalData";

const xlsx = require('xlsx');

// Read in all data from an excel file (whose data is in sheet DataSet). Return the data.
// Inspired by code from https://stackoverflow.com/questions/75830686/read-excel-xlsx-file-in-typescript
export async function loadExcelFile(name: string): Promise<{[key: string]: Brand}> {
    let ret: {[key: string]: Brand} = {};
    try {
        const file = xlsx.readFile(`${externalDir}/${name}`);
        for (const sheet of file.SheetNames) {
            if (sheet === "DataSet") {
                const dataJson: any[] = xlsx.utils.sheet_to_json(file.Sheets[sheet]);
                const extractedData = JsontoBrands(dataJson);
            }
        }
        return Promise.resolve(ret);
    } catch (err: any) {
        return Promise.reject(new DataAddError(err.message));
    }
}

// Converts JSON product objects into a Brand dictionary containing all products for each associated brand.
export function JsontoBrands(data: any[]): {[key: string]: Brand} {
    let ret: {[key: string]: Brand} = {};
    for (const obj of data) {
        if (typeof(obj["Brand Code"]) !== "undefined") {
            let brandCode = String(obj["Brand Code"]).trim();
            if (typeof(ret[brandCode]) === "undefined") {
                ret[brandCode] = new Brand(brandCode);
            }

            let product: Product = extractProduct(obj);
            ret[brandCode].addProduct(product.getColCode(), product.getSubColCode(),
                product.getBaseModelCode(), product.getBaseModelSKU(), product.getUuidCode(),
                product.getAttributes());
        }
    }
    console.log(ret);
    return ret;
}

// Extract a product's attributes and information, given its corresponding JSON object. START HERE
export function extractProduct(data: any): Product {
    return new Product("", "","","",
        "","", {});
}