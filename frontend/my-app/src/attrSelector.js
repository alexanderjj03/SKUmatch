import React, {useEffect, useState} from "react";
import Dropdown from 'react-dropdown'; // Source: https://www.npmjs.com/package/react-dropdown?activeTab=readme
import 'react-dropdown/style.css';
import './attrSelector.css';

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

    let query = {"brandCode": brand, "baseModelSKU": baseModel, "attributes": {}};

    const attrToDesc = {
        "MATERIAL": "Material", "TYPE OF CS": "Central Stone type",
        "CUT OF CS": "Central Stone cut", "COLOR OF CS": "Central Stone color",
        "SIZE CS (CT)": "Central Stone size (Ct)", "QUALITY CS": "Central Stone quality", "SIZE": "Size",
        "TEXTILE COLOR": "Textile color", "GLASS COLOR": "Glass color"
    };

    const fetchAttrs = () => {
        query = {
            "brandCode": brand,
            "baseModelSKU": baseModel,
            "attributes": {}
        };
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
                possibleVals = [];
                if (Array.isArray(value)) {
                    for (const entry of value) {
                        possibleVals.push(entry);
                    }
                }

                dropdownArr.push(
                    <div className={"Attribute-dropdown"} key={attr}>
                        <p>
                            {attrToDesc[attr]}:
                        </p>
                        <Dropdown
                            value=''
                            onChange={(val) => {
                                if (val.value != '') {
                                    let queryAttrs = query["attributes"];
                                    queryAttrs[attr] = val.value;
                                    query["attributes"] = queryAttrs;
                                }
                            }}
                            options={possibleVals}
                            />
                    </div>);
            }
        }
        ;
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
                        Attributes:
                    </p>
                    {displayAttrDropdowns()}
                </div>
            );
        } else {
            return (
                <div className={"Attribute-Selector"}>
                    <p>
                        Attributes:
                    </p>
                    <p>
                        {Object.keys(possibleAttrs)}
                    </p>
                </div>
            );
        }
    }
}