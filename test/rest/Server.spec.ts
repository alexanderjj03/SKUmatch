import Server from "../../src/rest/Server";

import {expect} from "chai";
import request, {Response} from "supertest";
import {Application} from "express";
import ProductFilter from "../../src/controller/ProductFilter";
import {Attribute} from "../../src/controller/dataTypes/Attribute";

const express = require("express");

// Tests for REST server requests
describe("REST server tests", function () {
    const localHost = "http://localhost:6666";
    let filter: ProductFilter;
    let server: Server;

    before(async function () {
        server = new Server(6666);
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
                expect(res.body.result).to.have.deep.members(["CRB4084600"]);
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
                expect(res.body.result).to.have.deep.members(["GR225", "GA414", "GA506", "DA196"]);
                expect(res.status).to.be.equal(200);
            })
            .catch(function (err) {
                console.log(err);
                expect.fail();
            });
    });

    it("GET base model CRB4084600's attribute value table", async function () {
        return request(localHost)
            .get("/data/CARTIER/CRB4084600")
            .then(function (res: Response) {
                expect(res.body.result[Attribute.Size]).to.have.deep.members(["15cm", "16", "17cm",
                    "18cm", "19cm", "20cm", "44mm", "45mm", "46mm", "47mm", "48mm", "49mm", "50mm"]);
                expect(res.body.result[Attribute.Material]).to.have.deep.members(
                    ["GOLD(R)", "GOLD(Y)", "GOLD(W)", "PLATIN"]);
                expect(res.status).to.be.equal(200);
            })
            .catch(function (err) {
                console.log(err);
                expect.fail();
            });
    });

    it("GET base model PBC3070's attribute value table", async function () {
        return request(localHost)
            .get("/data/POMELLATO/PBC3070")
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
            "baseModelSKU": "CRB4084600",
            "attributes": {
                "SIZE": "16",
                "MATERIAL": "GOLD(W)"
            }};
        return request(localHost)
            .post("/query")
            .send(query)
            .set("Content-Type", "application/json")
            .expect("Content-Type", /json/)
            .then(function (res: Response) {
                expect(res.body.result).to.deep.equal("CAR-00001-000014");
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
                "MATERIAL": "GOLD(R)",
                "QUALITY CS": "G SI",
                "TEXTILE COLOR": "RED",
                "TYPE OF CS": "DIAMANT",
                "CUT OF CS": "BRILLIANT",
                "COLOR OF CS": "WHITE",
                "SIZE CS (CT)": 0.3
            },
            "brandCode": "SCHAFFRATH",
            "baseModelSKU": "CT001"
        };
        return request(localHost)
            .post("/query")
            .send(query)
            .set("Content-Type", "application/json")
            .expect("Content-Type", /json/)
            .then(function (res: Response) {
                expect(res.body.result).to.deep.equal("SCH-00001-000010");
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
            "baseModelSKU": "CRB4084600",
            "attributes": {
                "MATERIAL": "GOLD(Y)",
                "SIZE": "16",
                "QUALITY CS": "G SI"
            }
        };
        return request(localHost)
            .post("/query")
            .send(query)
            .set("Content-Type", "application/json")
            .expect("Content-Type", /json/)
            .then(function (res: Response) {
                expect(res.body.error).to.deep.equal("Base model CRB4084600 does not have attribute QUALITY CS.");
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
            "baseModelSKU": "CT000000001",
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
            "baseModelSKU": "CT001",
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
                    "for base model CT001");
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
            "baseModelSKU": "DA196",
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
            "baseModelSKU": "CT001",
            "attributes": {
                "SIZE CS (CT)": 1,
                "QUALITY CS": "G SI",
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
                    "4 attribute values remain un-entered.");
                expect(res.status).to.be.equal(400);
            })
            .catch(function (err) {
                console.log(err);
                expect.fail();
            });
    });
});