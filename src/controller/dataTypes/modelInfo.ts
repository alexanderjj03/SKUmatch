// Represents an individual base model's information (base model code, product type,
// collection code, brand code, image url)

export class ModelInfo {
    private brandCode: string;
    private colCode: string;
    private colDesc: string;
    private productType: string;
    private baseModelCode: string;
    private imageUrl: string;

    constructor(brandCode: string, colCode: string, colDesc: string, productType: string, baseModelCode: string,
                imageUrl: string) {
        this.brandCode = brandCode;
        this.colCode = colCode;
        this.colDesc = colDesc;
        this.productType = productType;
        this.baseModelCode = baseModelCode;
        this.imageUrl = imageUrl;
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