import {Attribute, AttributePairs} from "./Attribute";

// Represents an individual product.
export class Product {
    private brandCode: string;
    private colCode: string;
    private subColCode: string; // empty string if  product is part of no subcollection.
    private baseModelCode: string;
    private baseModelSKU: string;
    private uuidCode: string;

    private attributes: AttributePairs;

    constructor(brandCode: string, colCode: string, subColCode: string, baseModelCode: string,
                baseModelSKU: string, uuidCode: string, attributes: AttributePairs) {
        this.brandCode = brandCode;
        this.colCode = colCode;
        this.subColCode = subColCode;
        this.baseModelCode = baseModelCode;
        this.baseModelSKU = baseModelSKU;
        this.uuidCode = uuidCode;
        this.attributes = attributes;
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

    public getBaseModelSKU(): string {
        return this.baseModelSKU;
    }

    public getUuidCode(): string {
        return this.uuidCode;
    }

    public getAttributes(): AttributePairs {
        return this.attributes;
    }
}