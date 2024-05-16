import {Attribute, AttributePairs, AttributeValueTable} from "./Attribute";
import {Product} from "./Product";

// Represents a base model, and stores all products associated with it. Keeps track of all possible
// attribute values as more products are added.
// REQUIRES all associated products have the same set of attributes.
export class BaseModel {
    private brandCode: string;
    private colCode: string;
    private subColCode: string; // empty string if part of no subcollection.
    private baseModelCode: string;
    private baseModelSKU: string;

    private productList: Product[];
    private attributeList: Attribute[]; // attributes every associated product contains
    private AttrValues: AttributeValueTable;

    constructor(brandCode: string, colCode: string, subColCode: string, baseModelCode: string,
                baseModelSKU: string) {
        this.brandCode = brandCode;
        this.colCode = colCode;
        this.subColCode = subColCode;
        this.baseModelCode = baseModelCode;
        this.baseModelSKU = baseModelSKU;
        this.productList = [];
        this.attributeList = [];
        this.AttrValues = {};
    }

    // Add a new product, knowing its brand and base model. Update attrValues if any new attribute values are
    // encountered. Add any new attributes to attributeList and attrValues.
    // RUNTIME OPTIMIZATION NEEDED (do later).
    public addProduct(uuid: string, attributes: AttributePairs) {
        Object.entries(attributes).forEach(([key, value]) => {
            if (this.attributeList.length === 0 || this.attributeList.indexOf(key as Attribute) === -1) {
                this.attributeList.push(key as Attribute);
                this.AttrValues[key as Attribute] = [value];
            } else {
                let valsToCompare = this.AttrValues[key as Attribute];
                if (typeof(valsToCompare) !== "undefined") { // should always be true
                    if (valsToCompare.indexOf(value) === -1) {
                        valsToCompare.push(value);
                        this.AttrValues[key as Attribute] = valsToCompare;
                    }
                }
            }
        });

        this.productList.push(new Product(this.brandCode, this.colCode, this.subColCode, this.baseModelCode,
            this.baseModelSKU, uuid, attributes));
    }

    public getBrandCode(): string {
        return this.brandCode;
    }

    public getColCode(): string {
        return this.colCode;
    }

    public getSubColCode(): string {
        return this.subColCode;
    }

    public getBaseModelCode(): string {
        return this.baseModelCode;
    }

    public getSKU(): string {
        return this.baseModelSKU;
    }

    public getProductList(): Product[] {
        return this.productList;
    }

    public getAttributeList(): Attribute[] {
        return this.attributeList;
    }

    public getAttributeValues(): AttributeValueTable {
        return this.AttrValues;
    }
}