import {Brand} from "./dataTypes/Brand";
import {DataAddError} from "./Errors";
import {Product} from "./dataTypes/Product";
import {Attribute, AttributePairs} from "./dataTypes/Attribute";
import {ModelInfo} from "./dataTypes/modelInfo";

export const externalDir = "./externalData";

const xlsx = require('xlsx');

// Read in all data from an excel file (whose data is in sheet DataSet). Return the data.
// Inspired by code from https://stackoverflow.com/questions/75830686/read-excel-xlsx-file-in-typescript
export async function loadExcelFile(name: string): Promise<[{[key: string]: Brand}, {[key: string]: ModelInfo}]> {
    let brands: {[key: string]: Brand} = {};
    let modelInfo: {[key: string]: ModelInfo} = {};
    try {
        const file = xlsx.readFile(externalDir + "/" + name);
        for (const sheet of file.SheetNames) {
            if (sheet === "DataSet") {
                const dataJson: any[] = xlsx.utils.sheet_to_json(file.Sheets[sheet]);
                brands = JsontoBrands(dataJson);
            } else if (sheet === "Picture Set Up") {
                const rawInfo: any[] = xlsx.utils.sheet_to_json(file.Sheets[sheet]);
                modelInfo = TabletoModelInfo(rawInfo);
            }
        }
        return Promise.resolve([brands, modelInfo]);
    } catch (err: any) {
        return Promise.reject(new DataAddError(err.message));
    }
}

// Load model information table (contains images for each base mode)
export function TabletoModelInfo(data: any[]): {[key: string]: ModelInfo} {
    let ret: {[key: string]: ModelInfo} = {};
    for (const obj of data) {
        if (typeof(obj["Base Model Code"]) !== "undefined") {
            let modelCode = String(obj["Base Model Code"]).trim();
            ret[modelCode] = new ModelInfo(String(obj["Brand Code"]).trim(), String(obj["Collection Code"]).trim(),
                String(obj["Collection Description"]).trim(), String(obj["Type of Product"]).trim(),
                String(obj["Base Model Code"]).trim(), String(obj["Picture URL"]).trim());
        }
    }
    return ret;
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
    let colDesc = String(data["Collection Description"]).trim();
    let subColCode = "";
    if (typeof(data["Subcollection Code"]) !== "undefined") {
        subColCode = String(data["Subcollection Code"]).trim();
    }
    let productType = String(data["Type of product"]).trim();
    let baseModelCode = String(data["Base Model Code"]).trim();
    let baseModelSKU = String(data["Base Model SKU"]).trim();
    let referenceNo = String(data["Manufacturer Reference No."]).trim();
    let uuidCode = String(data["Code"]).trim();

    let pictureLink = "";
    if (typeof(data["Picture Link"]) !== "undefined") {
        pictureLink = String(data["Picture Link"]).trim();
    }

    let attributes: AttributePairs = {};
    let curAttrNum: number = 1; // used to reflect that different base models have varying numbers of attributes.

    // Reading out attributes
    while ((typeof(data["Attribute Code " + curAttrNum]) !== "undefined") &&
    (typeof(data["Attribute Code " + curAttrNum + " Value"]) !== "undefined")) {
        let attr: Attribute = String(data["Attribute Code " + curAttrNum]).trim() as Attribute;
        let value: any;

        if (attr === Attribute.SizeCS) {
            let csRaw: string = String(data["Attribute Code " + curAttrNum + " Value"])
                .trim().replace(",", ".");
            value = Number(csRaw);
        } else if (attr === Attribute.Size) {
            value = String(data["Attribute Code " + curAttrNum + " Value"]).toLowerCase().trim();
        } else {
            value = String(data["Attribute Code " + curAttrNum + " Value"]).trim();
        }

        attributes[attr] = value;
        curAttrNum += 1;
    }

    return new Product(brandCode, colCode, colDesc, subColCode, productType, baseModelCode, baseModelSKU,
        referenceNo, uuidCode, attributes, pictureLink);
}