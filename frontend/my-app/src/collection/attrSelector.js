import React, {useEffect, useState} from "react";
import Dropdown from 'react-dropdown'; // Source: https://www.npmjs.com/package/react-dropdown?activeTab=readme
import 'react-dropdown/style.css';
import './attrSelector.css';
import {QueryResult} from "./queryResult";
import {localHost} from "../App";

export const attrToDesc = {
    "MATERIAL": "Material", "TYPE OF CS": "Central Stone type",
    "CUT OF CS": "Central Stone cut", "COLOR OF CS": "Central Stone color",
    "SIZE CS (CT)": "Central Stone size (Ct)", "QUALITY CS": "Central Stone quality", "SIZE": "Size",
    "TEXTILE COLOR": "Textile color", "GLASS COLOR": "Glass color"
};

export const attrValMap = { "GOLD(R)": "Gold (rose)", "GOLD(W)": "Gold (white)", "GOLD(Y)": "Gold (yellow)",
    "STEEL": "St. Steel", "G SI": "G SI", "G VS": "G VS", "LB VS": "LB VS", "TW/VS": "TW/VS", "s": "S", "m": "M",
    "l": "L", "xs": "XS", "xl": "XL", "GOLD(R+W)": "Gold (rose & white)", "GOLD(Y+W)": "Gold (yellow & white)",
    "GOLD(R+Y)": "Gold (rose & yellow)"
};
// Matching attribute values with how they are to be displayed (by default, de-capitalize the value,
// as most attribute values are expressed in all caps).

// Allows the user to select which attributes their product contains
export function AttrSelector({brand, baseModel}) {
    const [getAttrsUrl] = useState(localHost + `/data/`);
    const [attrsLoaded, setAttrsLoaded] = useState(false);
    const [possibleAttrs, setPossibleAttrs] = useState({});
    const [errMessage, setMessage] = useState("");
    const [query, setQuery] = useState({"brandCode": brand,
        "baseModelCode": baseModel, "attributes": {}});
    const [resetResult, setResetResult] = useState(false);
    // turns true temporarily upon query change, makes the query available to run again

    useEffect(() => {
        const fetchAttrs = () => {
            setAttrsLoaded(false);
            setQuery({
                "brandCode": brand,
                "baseModelCode": baseModel,
                "attributes": {}
            });
            return fetch(getAttrsUrl + brand + '/' + baseModel)
                .then((res) => res.json())
                .then((data) => {
                    setPossibleAttrs(data.result);
                    setAttrsLoaded(true);
                })
                .catch(err => {
                    setMessage(err);
                })
        }

        if (baseModel !== 'Select an option...') {
            fetchAttrs();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [baseModel]);

    useEffect(() => {
        setAttrsLoaded(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [brand]);

    const displayAttrDropdowns = () => {
        let dropdownArr = [];
        for (const [attr, value] of Object.entries(possibleAttrs)) {
            let possibleVals = [[], []];
            if (typeof(attrToDesc[attr] !== "undefined")) {
                possibleVals[0] = ['Select an option...']; // raw values
                possibleVals[1] = ['Select an option...']; // displayed values
                if (Array.isArray(value)) {
                    for (const entry of value) {
                        possibleVals[0].push(entry);
                        if (typeof(attrValMap[entry]) !== "undefined") {
                            possibleVals[1].push(attrValMap[entry]);
                        } else if (typeof(entry) === "number") {
                            possibleVals[1].push(entry);
                        } else {
                            possibleVals[1].push(entry.substring(0, 1) + entry.substring(1).toLowerCase());
                        }
                    }
                }

                dropdownArr.push(
                    <div className={"Attribute-dropdown"} key={attr}>
                        <span>
                            {attrToDesc[attr]}: &nbsp;
                        </span>
                        <Dropdown
                            placeholder='Select an option...'
                            value=''
                            onChange={(val) => {
                                let curQuery = query;
                                if ((val.value !== 'Select an option...') && (possibleVals[1].indexOf(val.value) !== -1)) {
                                    curQuery["attributes"][attr] = possibleVals[0][possibleVals[1].indexOf(val.value)];
                                } else if ((val.value === 'Select an option...')
                                    && (typeof query["attributes"][attr] !== "undefined")) {
                                    delete curQuery["attributes"][attr];
                                }
                                setQuery(curQuery);
                                setResetResult(true)
                                setTimeout(() => setResetResult(false), 500);
                            }}
                            options={possibleVals[1]}
                        />
                        <span>
                            &nbsp; ({possibleVals[1].length - 1} options)
                        </span>
                    </div>
                );
            }
        }
        return dropdownArr;
    }

    if (baseModel === "Select an option..."){
        return (
            <div></div>
        );
    } else if (!attrsLoaded) {
        if (errMessage === "") {
            return (
                <div className={"Attribute-Selector"}>
                    <p>
                        Attribute list loading, please wait:
                    </p>
                </div>
            );
        } else {
            return (
                <div className={"Attribute-Selector"}>
                    <p>
                        Error: {errMessage}
                    </p>
                    <p>
                        Please try selecting a different base model then yours again (or refreshing the page).
                        If issues persist, please reach out to [placeholder]
                    </p>
                </div>
            );
        }
    } else {
        return (
            <div className={"Attribute-Selector"}>
                <p>
                    Attributes (please fill all attribute values
                    to ensure that a unique product is found):
                </p>
                {displayAttrDropdowns()}
                <QueryResult query={query} reset={resetResult}/>
            </div>
        );
    }
}