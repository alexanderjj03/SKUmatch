import ProductFilter from "../../src/controller/ProductFilter";

import {Attribute, AttributePairs} from "../../src/controller/dataTypes/Attribute";
import {Brand} from "../../src/controller/dataTypes/Brand";
import {DatabaseError, FilterError, NoResultsError, ResultTooLargeError} from "../../src/controller/Errors";
import {readFileQueries} from "../TestUtil";
import * as fs from "fs";
import {failedQueryDir} from "../../src/controller/CacheDataset";

const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);

let expect = chai.expect;
let assert = chai.assert;

describe("ProductFilter", function () {
    describe("Data type testing", function () {
        let brand: Brand;
        let attributes1: AttributePairs;
        let attributes2: AttributePairs;
        let attributes3: AttributePairs;
        let attributes4: AttributePairs;
        let attributes5: AttributePairs;
        let attributes6: AttributePairs;

        before(  function() {
            attributes1 = {"GLASS COLOR": "RED", "SIZE": "16cm", "SIZE CS (CT)": 0.75,
                "CUT OF CS": "BRILLIANT", "TYPE OF CS": "AMETHYST"};
            attributes2 = {"GLASS COLOR": "BLUE", "SIZE": "15cm", "SIZE CS (CT)": 0.75,
                "CUT OF CS": "BRILLIANT", "TYPE OF CS": "AMETHYST"};
            attributes3 = {"GLASS COLOR": "RED", "SIZE": "17cm", "SIZE CS (CT)": 0.35,
                "CUT OF CS": "DULL LOL", "TYPE OF CS": "AMETHYST"};
            attributes4 = {"MATERIAL": "DIAMANT", "COLOR OF CS": "LILAC", "SIZE": "14",
                "TEXTILE COLOR": "RED", "QUALITY CS": "G VS"};
            attributes5 = {"MATERIAL": "TOPAZ", "COLOR OF CS": "ROSA", "SIZE": "15cm",
                "TEXTILE COLOR": "RED", "QUALITY CS": "G VS"};
            attributes6 = {"TEXTILE COLOR": "BLACK", "QUALITY CS": "G VS",
                "MATERIAL": "MORGANITE", "COLOR OF CS": "ROSA", "SIZE": "15cm"};
        });

        beforeEach( function () {
            brand = new Brand("TestBrand");
        });

        it("Add new products within a single base model to a brand", function() {
            brand.addProduct("12", "-1", "Q3",
                "CT01", "1001", attributes1);
            brand.addProduct("12", "-1", "Q3",
                "CT01", "1002", attributes2);
            brand.addProduct("12", "-1", "Q3",
                "CT01", "1003", attributes3);

            expect(Object.keys(brand.getModelList()).length).to.equal(1);
            expect(brand.getTotalProducts()).to.equal(3);

            let baseModel = brand.getModelList()["CT01"];
            expect(baseModel.getAttributeList()).to.have.deep.members(["GLASS COLOR", "SIZE", "SIZE CS (CT)",
                "CUT OF CS", "TYPE OF CS" ]);

            expect(baseModel.getAttributeValues()["GLASS COLOR"]).to.have.deep.members(["RED", "BLUE"]);
            expect(baseModel.getAttributeValues()["SIZE"]).to.have.deep.members(["15cm", "16cm", "17cm"]);
            expect(baseModel.getAttributeValues()["SIZE CS (CT)"]).to.have.deep.members([0.35, 0.75]);
            expect(baseModel.getAttributeValues()["CUT OF CS"]).to.have.deep.members(["BRILLIANT", "DULL LOL"]);
            expect(baseModel.getAttributeValues()["TYPE OF CS"]).to.have.deep.members(["AMETHYST"]);
        });

        it("Add new products within multiple base models", function() {
            brand.addProduct("12", "-1", "Q3",
                "CT01", "1001", attributes1);
            brand.addProduct("14", "123", "P7",
                "AH72", "2204", attributes5);
            brand.addProduct("12", "-1", "Q3",
                "CT01", "1002", attributes2);
            brand.addProduct("14", "123", "P7",
                "AH72", "2203", attributes4);
            brand.addProduct("14", "123", "P7",
                "AH72", "2205", attributes6);

            expect(Object.keys(brand.getModelList()).length).to.equal(2);
            expect(brand.getTotalProducts()).to.equal(5);

            let baseModel1 = brand.getModelList()["CT01"];
            expect(baseModel1.getAttributeList()).to.have.deep.members(["GLASS COLOR", "SIZE", "SIZE CS (CT)",
                "CUT OF CS", "TYPE OF CS" ]);
            expect(baseModel1.getAttributeValues()["GLASS COLOR"]).to.have.deep.members(["RED", "BLUE"]);
            expect(baseModel1.getAttributeValues()["SIZE"]).to.have.deep.members(["15cm", "16cm"]);
            expect(baseModel1.getAttributeValues()["SIZE CS (CT)"]).to.have.deep.members([0.75]);
            expect(baseModel1.getAttributeValues()["CUT OF CS"]).to.have.deep.members(["BRILLIANT"]);
            expect(baseModel1.getAttributeValues()["TYPE OF CS"]).to.have.deep.members(["AMETHYST"]);

            let baseModel2 = brand.getModelList()["AH72"];
            expect(baseModel2.getAttributeList()).to.have.deep.members(["MATERIAL", "SIZE", "TEXTILE COLOR",
                "QUALITY CS", "COLOR OF CS" ]);
            expect(baseModel2.getAttributeValues()["MATERIAL"]).to.have.deep.members(["DIAMANT",
                "TOPAZ", "MORGANITE"]);
            expect(baseModel2.getAttributeValues()["SIZE"]).to.have.deep.members(["15cm", "14"]);
            expect(baseModel2.getAttributeValues()["TEXTILE COLOR"]).to.have.deep.members(["RED", "BLACK"]);
            expect(baseModel2.getAttributeValues()["QUALITY CS"]).to.have.deep.members(["G VS"]);
            expect(baseModel2.getAttributeValues()["COLOR OF CS"]).to.have.deep.members(["LILAC", "ROSA"]);
        });
    });

    describe("Add/Persist data", function () {
        let filter: ProductFilter;

        before( function () {
            filter = new ProductFilter();
        });


        it("Add SKU match.xlsx to the system, ensure data are properly extracted from persistence file",
            async function() {

            const result = await filter.loadSaveAllData();

            filter = new ProductFilter();
            const result2 = await filter.loadCachedData();
            // Ensure that SKU match is persisted and reloaded from the persistence file

            const loadedData = filter.getLoadedData();
            expect(Object.keys(loadedData)).to.have.deep.members(
                ["CAPOLAVORO", "CARTIER", "POMELLATO", "SCHAFFRATH", "SCHMUCKWERK"]);

            expect(Object.keys(loadedData["CAPOLAVORO"].getModelList()).length).to.equal(1);
            expect(Object.keys(loadedData["CARTIER"].getModelList()).length).to.equal(1);
            expect(Object.keys(loadedData["POMELLATO"].getModelList()).length).to.equal(1);
            expect(Object.keys(loadedData["SCHAFFRATH"].getModelList()).length).to.equal(1);
            expect(Object.keys(loadedData["SCHMUCKWERK"].getModelList()).length).to.equal(4);

            expect(loadedData["CAPOLAVORO"].getModelList()["AB9MOG00373"].getAttributeValues()).to.deep.equal({
                'MATERIAL': [ 'GOLD(R)', 'GOLD(W)' ],
                'TYPE OF CS': [ 'AMETHYST', 'MORGANITE', 'PRASIOLITE', 'TOPAZ' ],
                'COLOR OF CS': [ 'LILAC', 'ROSA', 'GREEN', 'BLUE', 'SKY BLUE' ],
                'SIZE': [ "16cm", "17cm", "18cm" ]});
            expect(loadedData["CAPOLAVORO"].getModelList()["AB9MOG00373"].getSKU()).to.deep.equal("AB9MOG00373");
            expect(loadedData["CAPOLAVORO"].getModelList()["AB9MOG00373"].getProductList().length).to.equal(15);

            expect(loadedData["CARTIER"].getModelList()["CRB4084600"].getAttributeValues()).to.deep.equal({
                'MATERIAL': [ 'GOLD(R)', 'GOLD(Y)', 'GOLD(W)', 'PLATIN'],
                'SIZE': [ "15cm", "16", "17cm", "18cm", "19cm", "20cm", "44mm", "45mm",
                    "46mm", "47mm", "48mm", "49mm", "50mm"]});
            expect(loadedData["CARTIER"].getModelList()["CRB4084600"].getSKU()).to.deep.equal("CRB4084600");
            expect(loadedData["CARTIER"].getModelList()["CRB4084600"].getProductList().length).to.equal(43);

            // There were more (passing) tests for the rest of loadedData, but I removed these to
            // de-clutter the test suite.
        });

        it("Test removal of persistence file then addition of data via the xlsx file.",
            async function() {

            const result = await filter.removeData("SKU matchxlsx");
            filter = new ProductFilter();

            const result2 = await filter.loadPersistNewData();
            const loadedData = filter.getLoadedData();
            expect(Object.keys(loadedData)).to.have.deep.members(
                ["CAPOLAVORO", "CARTIER", "POMELLATO", "SCHAFFRATH", "SCHMUCKWERK"]);

            expect(Object.keys(loadedData["CAPOLAVORO"].getModelList()).length).to.equal(1);
            expect(Object.keys(loadedData["CARTIER"].getModelList()).length).to.equal(1);
            expect(Object.keys(loadedData["POMELLATO"].getModelList()).length).to.equal(1);
            expect(Object.keys(loadedData["SCHAFFRATH"].getModelList()).length).to.equal(1);
            expect(Object.keys(loadedData["SCHMUCKWERK"].getModelList()).length).to.equal(4);

            expect(loadedData["CAPOLAVORO"].getModelList()["AB9MOG00373"].getAttributeValues()).to.deep.equal({
                'MATERIAL': [ 'GOLD(R)', 'GOLD(W)' ],
                'TYPE OF CS': [ 'AMETHYST', 'MORGANITE', 'PRASIOLITE', 'TOPAZ' ],
                'COLOR OF CS': [ 'LILAC', 'ROSA', 'GREEN', 'BLUE', 'SKY BLUE' ],
                'SIZE': [ "16cm", "17cm", "18cm" ]});
            expect(loadedData["CAPOLAVORO"].getModelList()["AB9MOG00373"].getSKU()).to.deep.equal("AB9MOG00373");
            expect(loadedData["CAPOLAVORO"].getModelList()["AB9MOG00373"].getProductList().length).to.equal(15);

            expect(loadedData["CARTIER"].getModelList()["CRB4084600"].getAttributeValues()).to.deep.equal({
                'MATERIAL': [ 'GOLD(R)', 'GOLD(Y)', 'GOLD(W)', 'PLATIN'],
                'SIZE': [ "15cm", "16", "17cm", "18cm", "19cm", "20cm", "44mm", "45mm",
                    "46mm", "47mm", "48mm", "49mm", "50mm"]});
            expect(loadedData["CARTIER"].getModelList()["CRB4084600"].getSKU()).to.deep.equal("CRB4084600");
            expect(loadedData["CARTIER"].getTotalProducts()).to.equal(43);
        });

        // More tests to come (next up: test addition of multiple external/persisted datasets)
    });

    describe("PerformQuery", function () {
        let filter: ProductFilter;
        let query1: any;

        before( async function () {
            query1 = {
                "brandCode": "SCHAFFRATH",
                "baseModelSKU": "CT001",
                "attributes": {
                    "MATERIAL": "GOLD(R)",
                    "SIZE CS (CT)": 1,
                    "QUALITY CS": "G SI",
                    "TEXTILE COLOR": "RED"
                }
            };

            // REMOVE THIS LATER
            if (fs.existsSync(failedQueryDir)) {
                fs.rmSync(failedQueryDir, { recursive: true, force: true });
            }

            filter = new ProductFilter();
            await filter.loadSaveAllData();
            filter.getLoadedData()["CARTIER"].getModelList()["CRB4084600"].addProduct("CAR-00003-8",
                {"MATERIAL": "GOLD(Y)", "SIZE": "16"}); // Add a duplicate product (for later testing)
        });

        describe("valid queries", async function () {
            let validQueries!: any[];
            try {
                validQueries = readFileQueries("valid");
            } catch (e: unknown) {
                expect.fail(`Failed to read one or more test queries. ${e}`);
            }

            validQueries.forEach(function (test: any) {
                it(`${test.title}`, function () {
                    return filter.performQuery(test.query)
                        .then((result) => {
                            return expect(result).to.deep.equal(test.expected);
                        }).catch((err: string) => {
                            return expect.fail(`PerformQuery threw unexpected error: ${err}`);
                        });
                });
            });
        });

        describe("invalid queries", function() {
            let invalidQueries!: any[];

            try {
                invalidQueries = readFileQueries("invalid");
            } catch (e: unknown) {
                expect.fail(`Failed to read one or more test queries. ${e}`);
            }

            invalidQueries.forEach(function(test: any) {
                it(`${test.title}`, function () {
                    return filter.performQuery(test.query).then((result) => {
                        assert.fail(`performQuery resolved when it should have rejected with ${test.expected}`);
                    }).catch((err: any) => {
                        if (test.expected === "FilterError") {
                            expect(err).to.be.instanceOf(FilterError);
                        } else if (test.expected === "ResultTooLargeError") {
                            return expect(err).to.be.instanceOf(ResultTooLargeError);
                        } else if (test.expected === "NoResultsError") {
                            return expect(err).to.be.instanceOf(NoResultsError);
                        } else if (test.expected === "DatabaseError") {
                            return expect(err).to.be.instanceOf(DatabaseError);
                        } else {
                            assert.fail("Query threw unexpected error");
                        }
                    });
                });
            });
        });
    });
});