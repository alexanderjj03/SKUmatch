// Represents an individual base model's information (base model code, product type,
// collection code, brand code, image url)

export class ModelInfo {
    private brandCode: string;
    private colCode: string;
    private productType: string;
    private baseModelCode: string;
    private imageUrl: string;

    constructor(brandCode: string, colCode: string, productType: string, baseModelCode: string, imageUrl: string) {
        this.brandCode = brandCode;
        this.colCode = colCode;
        this.productType = productType;
        this.baseModelCode = baseModelCode;
        this.imageUrl = imageUrl;
    }

    public getBrandCode(): string {
        return this.brandCode;
    }

    public getColCodr(): string {
        return this.colCode;
    }

    public getProductType(): string {
        return this.productType;
    }

    public getModelCode(): string {
        return this.baseModelCode;
    }

    public getImageUrl(): string {
        return this.imageUrl;
    }
}