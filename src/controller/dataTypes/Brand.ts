import {BaseModel} from "./BaseModel";
import {AttributePairs} from "./Attribute";
import {Product} from "./Product";

// Represents a jeweler brand, and stores all base models/products associated with it. Keeps track of all possible
// attribute values as more products are added.
export class Brand {
    private brandCode: string;
    private baseModelList: {[key: string]: BaseModel}; // Contains each base model code and its corresponding object.
    private colDescMap: {[key: string]: string}; // Maps each collection code to its corresponding description.

    constructor(brandCode: string) {
        this.brandCode = brandCode;
        this.baseModelList = {};
        this.colDescMap = {};
    }

    public addBaseModel(model: BaseModel) {
        if (typeof(this.baseModelList[model.getModelCode()]) === "undefined") {
            this.baseModelList[model.getModelCode()] = model;
        }

        if (typeof(this.colDescMap[model.getColCode()]) === "undefined") {
            this.colDescMap[model.getColCode()] = model.getColDesc();
        }
    }

    // Add a new product object to this brand. If it belongs to a base model that isn't already in
    // this.baseModelList, create a new one.
    public addProductObj(product: Product) {
        if (typeof(this.baseModelList[product.getModelCode()]) === "undefined") {
            const newBaseModel = new BaseModel(this.brandCode, product.getColCode(), product.getColDesc(),
                product.getSubColCode(), product.getProductType(), product.getModelCode());
            newBaseModel.addProduct(product.getModelSKU(), product.getReferenceNo(), product.getUuidCode(),
                product.getAttributes());
            this.baseModelList[product.getModelCode()] = newBaseModel;
        } else {
            this.baseModelList[product.getModelCode()].addProduct(product.getModelSKU(),
                product.getReferenceNo(), product.getUuidCode(), product.getAttributes());
        }

        if (typeof(this.colDescMap[product.getColCode()]) === "undefined") {
            this.colDescMap[product.getColCode()] = product.getColDesc();
        }
    }

    public getBrandCode(): string {
        return this.brandCode;
    }

    public getTotalProducts(): number {
        let total = 0;
        Object.entries(this.baseModelList).forEach(([bmCode, model]) => {
            total += model.getProductList().length;
        });
        return total;
    }

    public getModelList(): {[key: string]: BaseModel} {
        return this.baseModelList;
    }

    public getColMap(): {[key: string]: string} {
        return this.colDescMap;
    }
}