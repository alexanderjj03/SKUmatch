import Server from "../../src/rest/Server";

import {expect} from "chai";
import request, {Response} from "supertest";
import {Application} from "express";
import ProductFilter from "../../src/controller/ProductFilter";
import {Attribute} from "../../src/controller/dataTypes/Attribute";

const express = require("express");

// Tests for REST server requests
describe("REST server tests", function () {
    const localHost = "http://localhost:3500";
    let filter: ProductFilter;
    let server: Server;

    before(async function () {
        server = new Server(3500);
        filter = Server.filter;
        await server.start();
    });

    after(async function () {
        await server.stop();
    });

    it("GET all brands", async function () {
        return request(localHost)
            .get("/data")
            .then(function (res: Response) {
                expect(res.body.result).to.have.deep.members(["CAPOLAVORO", "CARTIER", "POMELLATO",
                    "SCHAFFRATH", "SCHMUCKWERK"]);
                expect(res.body.result.length).to.deep.equal(5);
                expect(res.status).to.be.equal(200);
            })
            .catch(function (err) {
                console.log(err);
                expect.fail();
            });
    });

    it("GET Cartier's base models", async function () {
        return request(localHost)
            .get("/data/CARTIER")
            .then(function (res: Response) {
                expect(res.body.result).to.have.deep.members(['CAR-00001', 'CAR-00002']);
                expect(res.status).to.be.equal(200);
            })
            .catch(function (err) {
                console.log(err);
                expect.fail();
            });
    });

    it("GET Pomellato's manufacturer reference numbers", async function () {
        return request(localHost)
            .get("/manuRef/POMELLATO")
            .then(function (res: Response) {
                expect(res.body.result).to.have.deep.members([
                    'PAC0100_O7BKR_SM000',
                    'PAC0100_O7BRK_RU000',
                    'PAC0100_O2WHR_DB000',
                    'PAC0100_O2BWR_ZA000']);
                expect(res.status).to.be.equal(200);
            })
            .catch(function (err) {
                console.log(err);
                expect.fail();
            });
    });

    it("GET Schmuckwerk's base models", async function () {
        return request(localHost)
            .get("/data/SCHMUCKWERK")
            .then(function (res: Response) {
                expect(res.body.result).to.have.deep.members(['SMW-00005', 'SMW-00003',
                    'SMW-00004', 'SMW-00002', 'SMW-00001']);
                expect(res.status).to.be.equal(200);
            })
            .catch(function (err) {
                console.log(err);
                expect.fail();
            });
    });

    it("GET base model CRB4084600TEST01's attribute value table", async function () {
        return request(localHost)
            .get("/data/CARTIER/CAR-00001")
            .then(function (res: Response) {
                expect(res.body.result[Attribute.Size]).to.have.deep.members(["15cm", "16cm", "17cm",
                    "18cm", "19cm", "20cm"]);
                expect(res.body.result[Attribute.Material]).to.have.deep.members(
                    ["GOLD(R)", "GOLD(Y)", "GOLD(W)"]);
                expect(res.status).to.be.equal(200);
            })
            .catch(function (err) {
                console.log(err);
                expect.fail();
            });
    });

    it("GET base model PAC0100's attribute value table", async function () {
        return request(localHost)
            .get("/data/POMELLATO/POM-00001")
            .then(function (res: Response) {
                expect(res.body.result[Attribute.TypeCS]).to.have.deep.members(["EMERALD", "RUBY",
                    "DIAMANT", "SAPPHIRE"]);
                expect(res.body.result[Attribute.SizeCS]).to.have.deep.members([0.4, 0.6]);
                expect(res.body.result[Attribute.Material]).to.have.deep.members(["GOLD(R)", "GOLD(W)"]);
                expect(res.status).to.be.equal(200);
            })
            .catch(function (err) {
                console.log(err);
                expect.fail();
            });
    });

    it("POST test for performing a valid query", async function () {
        const query = {
            "brandCode": "CARTIER",
            "baseModelCode": "CAR-00001",
            "attributes": {
                "SIZE": "16cm",
                "MATERIAL": "GOLD(W)"
            }};
        return request(localHost)
            .post("/query")
            .send(query)
            .set("Content-Type", "application/json")
            .expect("Content-Type", /json/)
            .then(function (res: Response) {
                expect(res.body.result["uuidCode"]).to.deep.equal("CAR-00001-000014");
                expect(res.status).to.be.equal(200);
            })
            .catch(function (err) {
                console.log(err);
                expect.fail();
            });
    });

    it("POST test for performing a valid query (part 2)", async function () {
        const query = {
            "attributes": {
                "MATERIAL": "GOLD(W)",
                "TEXTILE COLOR": "RED",
                "TYPE OF CS": "DIAMANT",
                "CUT OF CS": "BRILLIANT",
                "COLOR OF CS": "WHITE",
                "SIZE CS (CT)": 0.18
            },
            "brandCode": "SCHAFFRATH",
            "baseModelCode": "SCH-00001"
        };
        return request(localHost)
            .post("/query")
            .send(query)
            .set("Content-Type", "application/json")
            .expect("Content-Type", /json/)
            .then(function (res: Response) {
                expect(res.body.result["uuidCode"]).to.deep.equal("SCH-00001-000010");
                expect(res.status).to.be.equal(200);
            })
            .catch(function (err) {
                console.log(err);
                expect.fail();
            });
    });

    it("POST test for performing an invalid query (absent attribute)", async function () {
        const query = {
            "brandCode": "CARTIER",
            "baseModelCode": "CAR-00001",
            "attributes": {
                "MATERIAL": "GOLD(R)",
                "SIZE": "16cm",
                "QUALITY CS": "G SI"
            }
        };
        return request(localHost)
            .post("/query")
            .send(query)
            .set("Content-Type", "application/json")
            .expect("Content-Type", /json/)
            .then(function (res: Response) {
                expect(res.body.error).to.deep.equal("Base model CAR-00001" +
                    " does not have attribute QUALITY CS.");
                expect(res.status).to.be.equal(400);
            })
            .catch(function (err) {
                console.log(err);
                expect.fail();
            });
    });

    it("POST test on invalid query (non-existent base model)", async function () {
        const query = {
            "brandCode": "SCHAFFRATH",
            "baseModelCode": "SCH-000001",
            "attributes": {
                "MATERIAL": "GOLD(R)",
                "SIZE CS (CT)": 1,
                "QUALITY CS": "G SI",
                "TEXTILE COLOR": "RED"
            }
        };
        return request(localHost)
            .post("/query")
            .send(query)
            .set("Content-Type", "application/json")
            .expect("Content-Type", /json/)
            .then(function (res: Response) {
                expect(res.body.error).to.deep.equal("Cannot read properties of undefined " +
                    "(reading 'getProductList')");
                expect(res.status).to.be.equal(400);
            })
            .catch(function (err) {
                console.log(err);
                expect.fail();
            });
    });

    it("POST test on invalid query (attribute out of range)", async function () {
        const query = {
            "brandCode": "SCHAFFRATH",
            "baseModelCode": "SCH-00001",
            "attributes": {
                "MATERIAL": "GOLD(R)",
                "SIZE CS (CT)": "0.4"
            }
        };
        return request(localHost)
            .post("/query")
            .send(query)
            .set("Content-Type", "application/json")
            .expect("Content-Type", /json/)
            .then(function (res: Response) {
                expect(res.body.error).to.deep.equal("Attribute value SIZE CS (CT) = 0.4 is out of range " +
                    "for base model SCH-00001");
                expect(res.status).to.be.equal(400);
            })
            .catch(function (err) {
                console.log(err);
                expect.fail();
            });
    });

    it("POST test on invalid query (no results)", async function () {
        const query = {
            "brandCode": "SCHMUCKWERK",
            "baseModelCode": "SMW-00002",
            "attributes": {
                "MATERIAL": "GOLD(R)",
                "GLASS COLOR": "BLACK",
                "TEXTILE COLOR": "BLACK"
            }
        };
        return request(localHost)
            .post("/query")
            .send(query)
            .set("Content-Type", "application/json")
            .expect("Content-Type", /json/)
            .then(function (res: Response) {
                expect(res.body.error).to.deep.equal("No results found. Please ensure all attribute " +
                    "values are entered correctly");
                expect(res.status).to.be.equal(404);
            })
            .catch(function (err) {
                console.log(err);
                expect.fail();
            });
    });

    it("POST test on invalid query (too many results)", async function () {
        const query = {
            "brandCode": "SCHAFFRATH",
            "baseModelCode": "SCH-00001",
            "attributes": {
                "SIZE CS (CT)": 1,
                "TEXTILE COLOR": "BLACK"
            }
        };
        return request(localHost)
            .post("/query")
            .send(query)
            .set("Content-Type", "application/json")
            .expect("Content-Type", /json/)
            .then(function (res: Response) {
                expect(res.body.error).to.deep.equal("Too many results (3). Please refine your search. " +
                    "4 attribute value(s) remain un-entered.");
                expect(res.status).to.be.equal(400);
            })
            .catch(function (err) {
                console.log(err);
                expect.fail();
            });
    });
});