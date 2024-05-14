import {BaseModel} from "./BaseModel";
import {AttributePairs} from "./Attribute";

// Represents a jeweler brand, and stores all base models/products associated with it. Keeps track of all possible
// attribute values as more products are added.
export class Brand {
    private brandCode: string;

    private baseModelList: BaseModel[];

    constructor(brandCode: string) {
        this.brandCode = brandCode;
        this.baseModelList = [];
    }

    public addBaseModel(model: BaseModel) {
        this.baseModelList.push(model);
    }

    // LATER: Implement alternative addProduct method which accepts a Product object as input.

    // Add a new product, knowing only that it belongs to this brand.
    public addProduct(colCode: string, subColCode: string, baseModelCode: string, baseModelSKU: string,
                      uuidCode: string, attributes: AttributePairs) {

        const baseModelIndex = this.baseModelList.map(value =>
            value.getBaseModelSKU()).indexOf(baseModelSKU); // index of new product's base model in baseModelList

        // If the new product's base model isn't present, create a new one & add the product to it.
        if (this.baseModelList.length === 0 || baseModelIndex === -1) {
            const newBaseModel = new BaseModel(this.brandCode, colCode, subColCode, baseModelCode,
                baseModelSKU);
            newBaseModel.addProduct(uuidCode, attributes);
            this.addBaseModel(newBaseModel);
        } else {
            this.baseModelList[baseModelIndex].addProduct(uuidCode, attributes);
        }
    }

    public getBrandCode(): string {
        return this.brandCode;
    }

    public getTotalProducts(): number {
        let total = 0;
        for (const baseModel of this.baseModelList) {
            total += baseModel.getProductList().length;
        }
        return total;
    }

    public getModelList(): BaseModel[] {
        return this.baseModelList;
    }
}