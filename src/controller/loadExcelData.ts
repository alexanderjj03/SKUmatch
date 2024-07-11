import {Brand} from "./dataTypes/Brand";
import {DataAddError} from "./Errors";
import {Product} from "./dataTypes/Product";
import {Attribute, AttributePairs} from "./dataTypes/Attribute";

export const externalDir = "./externalData";

const xlsx = require('xlsx');

// Read in all data from an excel file (whose data is in sheet DataSet). Return the data.
// Inspired by code from https://stackoverflow.com/questions/75830686/read-excel-xlsx-file-in-typescript
export async function loadExcelFile(name: string): Promise<{[key: string]: Brand}> {
    let ret: {[key: string]: Brand} = {};
    try {
        const file = xlsx.readFile(externalDir + "/" + name);
        for (const sheet of file.SheetNames) {
            if (sheet === "DataSet") {
                const dataJson: any[] = xlsx.utils.sheet_to_json(file.Sheets[sheet]);
                ret = JsontoBrands(dataJson);
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

            let product: Product = extractProduct(brandCode, obj);
            ret[brandCode].addProductObj(product);
        }
    }
    return ret;
}

// Extract a product's attributes and information, given its corresponding JSON object.
export function extractProduct(brandCode: string, data: any): Product {
    let colCode = String(data["Collection Code"]).trim();
    let subColCode = "";
    if (typeof(data["Subcollection Code"]) !== "undefined") {
        subColCode = String(data["Subcollection Code"]).trim();
    }
    let baseModelCode = String(data["Base Model Code"]).trim();
    let baseModelSKU = String(data["Base Model SKU"]).trim();
    let uuidCode = String(data["Code"]).trim();

    let attributes: AttributePairs = {};
    let curAttrNum: number = 1; // used to reflect that different base models have varying numbers of attributes.

    // Reading out attributes
    while ((typeof(data["Attribute Code " + curAttrNum]) !== "undefined") &&
    (typeof(data["Attribute Code " + curAttrNum + " Value"]) !== "undefined")) {
        let attr: Attribute = String(data["Attribute Code " + curAttrNum]).trim() as Attribute;
        let value: any;

        if (attr === Attribute.SizeCS) {
            value = Number(data["Attribute Code " + curAttrNum + " Value"]);
        } else if (attr === Attribute.Size) {
            value = String(data["Attribute Code " + curAttrNum + " Value"]).trim().toLowerCase();
        } else {
            value = String(data["Attribute Code " + curAttrNum + " Value"]).trim();
        }

        attributes[attr] = value;
        curAttrNum += 1;
    }

    return new Product(brandCode, colCode, subColCode, baseModelCode, baseModelSKU, uuidCode, attributes);
}