import ProductFilter from "../../src/controller/ProductFilter";

import {Attribute, AttributePairs} from "../../src/controller/dataTypes/Attribute";
import {Brand} from "../../src/controller/dataTypes/Brand";
import {DatabaseError, FilterError, NoResultsError, ResultTooLargeError} from "../../src/controller/Errors";
import {readFileQueries} from "../TestUtil";

const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);

let expect = chai.expect;
let assert = chai.assert;

describe("ProductFilter", function () {

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
            expect(Object.keys(loadedData["CARTIER"].getModelList()).length).to.equal(7);
            expect(Object.keys(loadedData["POMELLATO"].getModelList()).length).to.equal(1);
            expect(Object.keys(loadedData["SCHAFFRATH"].getModelList()).length).to.equal(1);
            expect(Object.keys(loadedData["SCHMUCKWERK"].getModelList()).length).to.equal(4);

            expect(loadedData["CAPOLAVORO"].getModelList()["00368"].getAttributeValues()).to.deep.equal({
                'MATERIAL': [ 'GOLD(R)', 'GOLD(W)' ],
                'TYPE OF CS': [ 'AMETHYST', 'MORGANITE', 'PRASIOLITE', 'TOPAZ' ],
                'COLOR OF CS': [ 'LILAC', 'ROSA', 'GREEN', 'BLUE', 'SKY BLUE' ],
                'SIZE': [ "16cm", "17cm", "18cm" ]});
            expect(loadedData["CAPOLAVORO"].getModelList()["00368"].getSKU()).to.deep.equal("00368");
            expect(loadedData["CAPOLAVORO"].getModelList()["00368"].getProductList().length).to.equal(15);

            expect(loadedData["CARTIER"].getModelList()["CRB4084600TEST01"].getAttributeValues()).to.deep.equal({
                'MATERIAL': [ 'GOLD(R)'],
                'SIZE': [ "15cm", "16cm", "17cm", "18cm", "19cm", "20cm",]});
            expect(loadedData["CARTIER"].getModelList()["CRB4084600TEST02"].getSKU())
                .to.deep.equal("CRB4084600TEST02");
            expect(loadedData["CARTIER"].getModelList()["CRB4084600TEST03"].getProductList().length).to.equal(6);
            expect(loadedData["CARTIER"].getModelList()["CRB6047517TEST04"].getProductList().length).to.equal(8);

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
            expect(Object.keys(loadedData["CARTIER"].getModelList()).length).to.equal(7);
            expect(Object.keys(loadedData["POMELLATO"].getModelList()).length).to.equal(1);
            expect(Object.keys(loadedData["SCHAFFRATH"].getModelList()).length).to.equal(1);
            expect(Object.keys(loadedData["SCHMUCKWERK"].getModelList()).length).to.equal(4);

            expect(loadedData["CAPOLAVORO"].getModelList()["00368"].getAttributeValues()).to.deep.equal({
                'MATERIAL': [ 'GOLD(R)', 'GOLD(W)' ],
                'TYPE OF CS': [ 'AMETHYST', 'MORGANITE', 'PRASIOLITE', 'TOPAZ' ],
                'COLOR OF CS': [ 'LILAC', 'ROSA', 'GREEN', 'BLUE', 'SKY BLUE' ],
                'SIZE': [ "16cm", "17cm", "18cm" ]});
            expect(loadedData["CAPOLAVORO"].getModelList()["00368"].getSKU()).to.deep.equal("00368");
            expect(loadedData["CAPOLAVORO"].getModelList()["00368"].getProductList().length).to.equal(15);

            expect(loadedData["CARTIER"].getModelList()["CRB4084600TEST01"].getAttributeValues()).to.deep.equal({
                'MATERIAL': [ 'GOLD(R)'],
                'SIZE': [ "15cm", "16cm", "17cm", "18cm", "19cm", "20cm",]});
            expect(loadedData["CARTIER"].getModelList()["CRB4084600TEST02"].getSKU())
                .to.deep.equal("CRB4084600TEST02");
            expect(loadedData["CARTIER"].getModelList()["CRB4084600TEST03"].getProductList().length).to.equal(6);
        });
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

            filter = new ProductFilter();
            await filter.loadSaveAllData();
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
                            return expect(result.getUuidCode()).to.deep.equal(test.expected);
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