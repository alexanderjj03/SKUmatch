// All attributes are expressed as strings, with the following exceptions
export enum Attribute {
    Material = "MATERIAL",
    TypeCS = "TYPE OF CS",
    CutCS = "CUT OF CS",
    ColorCS = "COLOR OF CS",
    SizeCS = "SIZE CS (CT)", // number
    QualityCS = "QUALITY CS",
    Size = "SIZE",
    TextileColor = "TEXTILE COLOR",
    GlassColor = "GLASS COLOR",
}

// Single key-pair for a product's attribute and its value
export type AttributePairs = {
    [key in Attribute]?: any;
};

// Used to store all possible values for an attribute. Each base model contains one of these.
export type AttributeValueTable = {
    [key in Attribute]?: any[];
};