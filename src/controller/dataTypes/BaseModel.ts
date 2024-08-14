import {Attribute, AttributePairs, AttributeValueTable} from "./Attribute";
import {Product} from "./Product";

// Represents a base model, and stores all products associated with it. Keeps track of all possible
// attribute values as more products are added.
// REQUIRES all associated products have the same set of attributes.
export class BaseModel {
    private brandCode: string;
    private colCode: string;
    private colDesc: string;
    private subColCode: string; // empty string if product is part of no subcollection.
    private productType: string;
    private baseModelCode: string;

    private productList: Product[];
    private attributeList: Attribute[]; // attributes every associated product contains
    private AttrValues: AttributeValueTable; // Lists all attribute values that appear across productList.

    constructor(brandCode: string, colCode: string, colDesc: string, subColCode: string, productType: string,
                baseModelCode: string) {
        this.brandCode = brandCode;
        this.colCode = colCode;
        this.colDesc = colDesc;
        this.subColCode = subColCode;
        this.productType = productType;
        this.baseModelCode = baseModelCode;
        this.productList = [];
        this.attributeList = [];
        this.AttrValues = {};
    }

    // Add a new product, knowing its brand and base model. Update attrValues if any new attribute values are
    // encountered. Add any new attributes to attributeList and attrValues.
    public addProduct(baseModelSKU: string, referenceNo: string, uuid: string, attributes: AttributePairs) {
        Object.entries(attributes).forEach(([attr, value]) => {
            if (!this.attributeList.includes(attr as Attribute)) {
                this.attributeList.push(attr as Attribute);
                this.AttrValues[attr as Attribute] = [value];
            } else {
                let valsToCompare = this.AttrValues[attr as Attribute];
                if (typeof(valsToCompare) !== "undefined") { // should always be true
                    if (!valsToCompare.includes(value)) {
                        valsToCompare.push(value);
                        this.AttrValues[attr as Attribute] = valsToCompare;
                    }
                }
            }
        });

        this.productList.push(new Product(this.brandCode, this.colCode, this.colDesc, this.subColCode,
            this.productType, this.baseModelCode, baseModelSKU, referenceNo, uuid, attributes));
    }

    public getBrandCode(): string {
        return this.brandCode;
    }

    public getColCode(): string {
        return this.colCode;
    }

    public getColDesc(): string {
        return this.colDesc;
    }

    public getSubColCode(): string {
        return this.subColCode;
    }

    public getProductType(): string {
        return this.productType;
    }

    public getModelCode(): string {
        return this.baseModelCode;
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