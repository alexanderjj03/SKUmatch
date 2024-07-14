import {BaseModel} from "./BaseModel";
import {AttributePairs} from "./Attribute";
import {Product} from "./Product";

// Represents a jeweler brand, and stores all base models/products associated with it. Keeps track of all possible
// attribute values as more products are added.
export class Brand {
    private brandCode: string;
    private baseModelList: {[key: string]: BaseModel}; // Contains each base model SKU and its corresponding object.

    constructor(brandCode: string) {
        this.brandCode = brandCode;
        this.baseModelList = {};
    }

    public addBaseModel(model: BaseModel) {
        if (typeof(this.baseModelList[model.getSKU()]) === "undefined") {
            this.baseModelList[model.getSKU()] = model;
        }
    }

    // Add a new product object to this brand. If it belongs to a base model that isn't already in
    // this.baseModelList, create a new one.
    public addProductObj(product: Product) {
        if (typeof(this.baseModelList[product.getModelSKU()]) === "undefined") {
            const newBaseModel = new BaseModel(this.brandCode, product.getColCode(),
                product.getSubColCode(), product.getModelSKU());
            newBaseModel.addProduct(product.getBaseModelCode(), product.getUuidCode(), product.getAttributes());
            this.baseModelList[product.getModelSKU()] = newBaseModel;
        } else {
            this.baseModelList[product.getModelSKU()].addProduct(product.getBaseModelCode(),
                product.getUuidCode(), product.getAttributes());
        }
    }

    // Add a new product, knowing only that it belongs to this brand. Provide the remaining data manually
    // (mainly used for testing)
    public addProduct(colCode: string, subColCode: string, baseModelCode: string, baseModelSKU: string,
                      uuidCode: string, attributes: AttributePairs) {

        if (typeof(this.baseModelList[baseModelSKU]) === "undefined") {
            const newBaseModel = new BaseModel(this.brandCode, colCode,
                subColCode, baseModelSKU);
            newBaseModel.addProduct(baseModelCode, uuidCode, attributes);
            this.baseModelList[baseModelSKU] = newBaseModel;
        } else {
            this.baseModelList[baseModelSKU].addProduct(baseModelCode, uuidCode, attributes);
        }
    }

    public getBrandCode(): string {
        return this.brandCode;
    }

    public getTotalProducts(): number {
        let total = 0;
        Object.entries(this.baseModelList).forEach(([bmSKU, model]) => {
            total += model.getProductList().length;
        });
        return total;
    }

    public getModelList(): {[key: string]: BaseModel} {
        return this.baseModelList;
    }
}