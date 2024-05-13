import ProductFilter from "../../src/controller/ProductFilter";

import {Attribute, AttributePairs} from "../../src/controller/dataTypes/Attribute";
import {Brand} from "../../src/controller/dataTypes/Brand";
import base = Mocha.reporters.base;

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
            attributes1 = {"GLASS COLOR": "RED", "SIZE": 16, "SIZE CS (CT)": 0.75,
                "CUT OF CS": "BRILLIANT", "TYPE OF CS": "AMETHYST"};
            attributes2 = {"GLASS COLOR": "BLUE", "SIZE": 15, "SIZE CS (CT)": 0.75,
                "CUT OF CS": "BRILLIANT", "TYPE OF CS": "AMETHYST"};
            attributes3 = {"GLASS COLOR": "RED", "SIZE": 17, "SIZE CS (CT)": 0.35,
                "CUT OF CS": "DULL LOL", "TYPE OF CS": "AMETHYST"};
            attributes4 = {"MATERIAL": "DIAMANT", "COLOR OF CS": "LILAC", "SIZE": 14,
                "TEXTILE COLOR": "RED", "QUALITY CS": "G VS"};
            attributes5 = {"MATERIAL": "TOPAZ", "COLOR OF CS": "ROSA", "SIZE": 15,
                "TEXTILE COLOR": "RED", "QUALITY CS": "G VS"};
            attributes6 = {"TEXTILE COLOR": "BLACK", "QUALITY CS": "G VS",
                "MATERIAL": "MORGANITE", "COLOR OF CS": "ROSA", "SIZE": 15};
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

            expect(brand.getModelList().length).to.equal(1);
            expect(brand.getTotalProducts()).to.equal(3);

            let baseModel = brand.getModelList()[0];
            expect(baseModel.getAttributeList()).to.have.deep.members(["GLASS COLOR", "SIZE", "SIZE CS (CT)",
                "CUT OF CS", "TYPE OF CS" ]);

            expect(baseModel.getAttributeValues()["GLASS COLOR"]).to.have.deep.members(["RED", "BLUE"]);
            expect(baseModel.getAttributeValues()["SIZE"]).to.have.deep.members([15, 16, 17]);
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

            expect(brand.getModelList().length).to.equal(2);
            expect(brand.getTotalProducts()).to.equal(5);

            let baseModel1 = brand.getModelList()[0];
            expect(baseModel1.getAttributeList()).to.have.deep.members(["GLASS COLOR", "SIZE", "SIZE CS (CT)",
                "CUT OF CS", "TYPE OF CS" ]);
            expect(baseModel1.getAttributeValues()["GLASS COLOR"]).to.have.deep.members(["RED", "BLUE"]);
            expect(baseModel1.getAttributeValues()["SIZE"]).to.have.deep.members([15, 16]);
            expect(baseModel1.getAttributeValues()["SIZE CS (CT)"]).to.have.deep.members([0.75]);
            expect(baseModel1.getAttributeValues()["CUT OF CS"]).to.have.deep.members(["BRILLIANT"]);
            expect(baseModel1.getAttributeValues()["TYPE OF CS"]).to.have.deep.members(["AMETHYST"]);

            let baseModel2 = brand.getModelList()[1];
            expect(baseModel2.getAttributeList()).to.have.deep.members(["MATERIAL", "SIZE", "TEXTILE COLOR",
                "QUALITY CS", "COLOR OF CS" ]);
            expect(baseModel2.getAttributeValues()["MATERIAL"]).to.have.deep.members(["DIAMANT",
                "TOPAZ", "MORGANITE"]);
            expect(baseModel2.getAttributeValues()["SIZE"]).to.have.deep.members([15, 14]);
            expect(baseModel2.getAttributeValues()["TEXTILE COLOR"]).to.have.deep.members(["RED", "BLACK"]);
            expect(baseModel2.getAttributeValues()["QUALITY CS"]).to.have.deep.members(["G VS"]);
            expect(baseModel2.getAttributeValues()["COLOR OF CS"]).to.have.deep.members(["LILAC", "ROSA"]);
        });
    });

    describe("Add data", function () {
        let filter: ProductFilter;

        before( function () {
            filter = new ProductFilter();
        });

        it("live testing", async function() {
            const result = await filter.loadPersistNewData();
            console.log(result);
        });

    });

    // More tests to come
});