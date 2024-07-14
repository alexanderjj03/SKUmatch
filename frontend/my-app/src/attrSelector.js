import React, {useEffect, useState} from "react";
import Dropdown from 'react-dropdown'; // Source: https://www.npmjs.com/package/react-dropdown?activeTab=readme
import 'react-dropdown/style.css';
import './attrSelector.css';
import Button from "react-widgets/Button";
import {QueryResult} from "./queryResult";

const localHost = "http://localhost:3500";

// Allows the user to select which attributes their product contains
export function AttrSelector({brand, baseModel}) {
    const [getAttrsUrl, setAttrsUrl] = useState(localHost
        + `/data/`);
    const [brandName, setBrandName] = useState(brand);
    const [bModel, setBModel] = useState(baseModel);
    const [attrsLoaded, setAttrsLoaded] = useState(false);
    const [possibleAttrs, setPossibleAttrs] = useState({});
    const [queryRan, setQueryRan] = useState(false);
    const [query, setQuery] = useState({"brandCode": brand,
        "baseModelSKU": baseModel, "attributes": {}});

    const attrToDesc = {
        "MATERIAL": "Material", "TYPE OF CS": "Central Stone type",
        "CUT OF CS": "Central Stone cut", "COLOR OF CS": "Central Stone color",
        "SIZE CS (CT)": "Central Stone size (Ct)", "QUALITY CS": "Central Stone quality", "SIZE": "Size",
        "TEXTILE COLOR": "Textile color", "GLASS COLOR": "Glass color"
    };

    const fetchAttrs = () => {
        setQuery({
            "brandCode": brand,
            "baseModelSKU": baseModel,
            "attributes": {}
        });
        setQueryRan(false);
        setAttrsLoaded(false);
        return fetch(getAttrsUrl + brand + '/' + baseModel)
            .then((res) => res.json())
            .then((data) => {
                setPossibleAttrs(data.result);
                setAttrsLoaded(true);
            })
            .catch(err => console.log(err))
    }

    useEffect(() => {
        fetchAttrs();
    }, [baseModel]);

    useEffect(() => {
        setAttrsLoaded(false);
    }, [brand]);

    const displayAttrDropdowns = () => {
        let dropdownArr = [];
        let possibleVals = [];
        for (const [attr, value] of Object.entries(possibleAttrs)) {
            if (typeof(attrToDesc[attr] !== "undefined")) {
                possibleVals = ['Select...'];
                if (Array.isArray(value)) {
                    for (const entry of value) {
                        possibleVals.push(entry);
                    }
                }

                dropdownArr.push(
                    <div className={"Attribute-dropdown"} key={attr}>
                        <span>
                            {attrToDesc[attr]}: &nbsp;
                        </span>
                        <Dropdown
                            value=''
                            onChange={(val) => {
                                setQueryRan(false);
                                let curQuery = query;
                                if (val.value !== 'Select...') {
                                    curQuery["attributes"][attr] = val.value;
                                } else if (typeof query["attributes"][attr] !== "undefined") {
                                    delete curQuery["attributes"][attr];
                                }
                                setQuery(curQuery);
                            }}
                            options={possibleVals}
                        />
                        <span>
                            &nbsp; ({possibleVals.length - 1} options)
                        </span>
                    </div>
                );
            }
        }
        return dropdownArr;
    }

    if (!attrsLoaded) {
        return (
            <div className={"Attribute-Selector"}>
                <p>
                    Attributes:
                </p>
                <p>
                    Attribute list loading, please wait:
                </p>
            </div>
        );
    } else {
        if (!queryRan) {
            return (
                <div className={"Attribute-Selector"}>
                    <p>
                        Attributes (we recommend filling all attribute values
                        to ensure that a unique product is found):
                    </p>
                    {displayAttrDropdowns()}
                    <p>
                        <button onClick={() => {setQueryRan(true)}}>
                            Find matching product code
                        </button>
                    </p>
                </div>
            );
        } else {
            return (
                <div className={"Attribute-Selector"}>
                    <p>
                        Attributes (we recommend filling all attribute values
                        to ensure that a unique product is found):
                    </p>
                    {displayAttrDropdowns()}
                    <QueryResult query={query}/>
                </div>
            );
        }
    }
}