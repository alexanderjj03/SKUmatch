import express, {Application, Request, Response} from "express";
import * as http from "http";
import cors from "cors";
import ProductFilter from "../controller/ProductFilter";
import {Brand} from "../controller/dataTypes/Brand";
import {AttributeValueTable} from "../controller/dataTypes/Attribute";
import {BaseModel} from "../controller/dataTypes/BaseModel";
import {NoResultsError} from "../controller/Errors";
import {Product} from "../controller/dataTypes/Product";

export default class Server {
    private port: number;
    private server: http.Server | undefined;
    private express: Application;
    public static filter: ProductFilter = new ProductFilter();

    // Constructs the server, configures Express.
    constructor(port: number) {
        console.log("Server port: " + port);
        this.port = port;
        this.express = express();
        this.express.use(express.json()); // since request bodies will be JSON queries.
        this.express.use(cors());

        this.addRoutes();
    }

    // Starts the server and ensures that the server's ProductFilter loads all of its data.
    public async start(): Promise<void> {
        await Server.filter.loadSaveAllData();
        if (this.server !== undefined) {
            console.log("Error: Server already listening");
            return Promise.reject();
        }

        try {
            this.server = this.express.listen(this.port, () => {
                console.log("Server started: listening on port: " + this.port);
                return Promise.resolve();
            });
        } catch (err: any) {
            console.log("Error: " + err.message);
            return Promise.reject(err);
        }
    }

    // Stops the server
    public stop(): Promise<void> {
        console.log("Server stopping:");
        return new Promise((resolve, reject) => {
            if (this.server === undefined) {
                console.log("Error: server not started");
                reject();
            } else {
                this.server.close(() => {
                    console.log("Server closed");
                    resolve();
                });
            }
        });
    }

    // Registers all request handlers to routes
    private addRoutes() {
        // The get requests are to supply the options for dropdown menus that the frontend will use.
        this.express.get("/data", Server.getBrands);
        this.express.get("/table/:brand", Server.getCollections)
        this.express.get("/data/:brand", Server.getBaseModels);
        this.express.get("/manuRef/:brand", Server.getAllRefs);
        this.express.get("/manuRef/:brand/:refNum", Server.getProductFromRef);
        this.express.get("/data/:brand/:modelCode", Server.getAttrTable);
        this.express.post("/query",Server.performQuery);
    }

    // Server request to show all brand names that have products stored in the backend..
    private static async getBrands(req: Request, res: Response) {
        try {
            const output: string[] = Object.keys(Server.filter.getLoadedData());
            res.status(200).json({result: output});
        } catch (err: any) {
            res.status(400).json({error: err.message});
        }
    }

    private static async getCollections(req: Request, res: Response) {
        try {
            const map = Server.filter.getInfoMap()
            const cols = Object.values(map).filter((model) =>
                model.getBrandCode().toUpperCase().trim() === req.params.brand.toUpperCase().trim());
            res.status(200).json({result: cols});
        } catch (err: any) {
            res.status(400).json({error: err.message});
        }
    }

    // Server request to show all base models within a brand (needed for dropdown menu).
    private static async getBaseModels(req: Request, res: Response) {
        try {
            const curBrand: Brand = Server.filter.getLoadedData()[req.params.brand];
            const output: string[] = Object.keys(curBrand.getModelList());
            res.status(200).json({result: output});
        } catch (err: any) {
            res.status(400).json({error: err.message});
        }
    }

    // Server request to show all manufacturer reference numbers for a brand.
    private static async getAllRefs(req: Request, res: Response) {
        try {
            const curBrand: Brand = Server.filter.getLoadedData()[req.params.brand];
            let output: string[] = [];
            Object.values(curBrand.getModelList()).forEach((model: BaseModel) => {
                output = output.concat(model.getProductList().map((prod) => prod.getReferenceNo()));
            });
            output = Server.filter.removeDuplicates(output);
            res.status(200).json({result: output});
        } catch (err: any) {
            res.status(400).json({error: err.message});
        }
    }

    // Server request to get product object from a manufacturer reference number
    private static async getProductFromRef(req: Request, res: Response) {
        try {
            const output: Product = await Server.filter.getProdFromRef(req.params.brand, req.params.refNum)
            res.status(200).json({result: output});
        } catch (err: any) {
            if (err instanceof NoResultsError) {
                res.status(404).json({error: err.message});
            } else {
                res.status(400).json({error: err.message});
            }
        }
    }

    // Server request to get a base model's attribute value table
    private static async getAttrTable(req: Request, res: Response) {
        try {
            const curBrand: Brand = Server.filter.getLoadedData()[req.params.brand];
            const baseModel: BaseModel = curBrand.getModelList()[req.params.modelCode];
            const output: AttributeValueTable = baseModel.getAttributeValues();
            res.status(200).json({result: output});
        } catch (err: any) {
            res.status(400).json({error: err.message});
        }
    }

    // Server request for running a json query, returning a product ID (or error if needed).
    private static async performQuery(req: Request, res: Response) {
        try {
            const obj = req.body;
            const output: Product[] = await Server.filter.performQuery(obj);
            res.status(200).json({result: output});
        } catch (err: any) {
            if (err instanceof NoResultsError) {
                res.status(404).json({error: err.message});
            } else {
                res.status(400).json({error: err.message});
            }
        }
    }

    public getApplication(): Application {
        return this.express;
    }
}
