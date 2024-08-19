import {Attribute, AttributePairs} from "./Attribute";

// Represents an individual product.
export class Product {
    private brandCode: string;
    private colCode: string;
    private colDesc: string;
    private subColCode: string; // empty string if product is part of no subcollection.
    private productType: string;
    private baseModelCode: string;
    private baseModelSKU: string;
    private referenceNo: string;
    private uuidCode: string;

    private attributes: AttributePairs;
    private pictureLink: string;

    constructor(brandCode: string, colCode: string, colDesc: string, subColCode: string, productType: string,
                baseModelCode: string, baseModelSKU: string, referenceNo: string, uuidCode: string,
                attributes: AttributePairs, pictureLink: string) {
        this.brandCode = brandCode;
        this.colCode = colCode;
        this.colDesc = colDesc;
        this.subColCode = subColCode;
        this.productType = productType;
        this.baseModelCode = baseModelCode;
        this.baseModelSKU = baseModelSKU;
        this.referenceNo = referenceNo;
        this.uuidCode = uuidCode;
        this.attributes = attributes;
        this.pictureLink = pictureLink;
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

    public getModelSKU(): string {
        return this.baseModelSKU;
    }

    public getReferenceNo(): string {
        return this.referenceNo;
    }

    public getUuidCode(): string {
        return this.uuidCode;
    }

    public getAttributes(): AttributePairs {
        return this.attributes;
    }

    public getPictureLink(): string {
        return this.pictureLink;
    }
}