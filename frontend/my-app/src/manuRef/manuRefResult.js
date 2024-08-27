import React, {useEffect, useState} from "react";
import 'react-dropdown/style.css';
import {attrToDesc, attrValMap} from "../collection/attrSelector";
import {localHost} from "../App";

// Shows the user the corresponding product, given its manufacturer reference number
export function ManuRefResult({brand, manuRef}) {
    const [getProdUrl] = useState(localHost + `/manuRef/`);
    const [isResult, setIsResult] = useState(false);
    const [isError, setIsError] = useState(false);
    const [errMessage, setErrMessage] = useState('');
    const [result, setResult] = useState({});

    useEffect(() => {
        const fetchProduct = () => {
            setIsError(false);
            setIsResult(false);
            return fetch(getProdUrl + brand + "/" + manuRef)
                .then((res) =>res.json())
                .then((data) => {
                    setIsResult(true);
                    if (data.error) {
                        setIsError(true);
                        setErrMessage(data.error);
                    } else if (data.result) {
                        setResult(data.result);
                    }
                })
                .catch(err => {
                    setIsResult(true);
                    setIsError(true);
                    setErrMessage(err);
                })
        }

        if (manuRef !== '') {
            fetchProduct();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [manuRef]);

    useEffect(() => {
        setIsResult(false);
        setIsError(false);
    }, [brand]);

    const displayAttrs = () => {
        let attrArr = [];
        for (const [attr, value] of Object.entries(result["attributes"])) {
            if (typeof(attrToDesc[attr] !== "undefined")) {
                let textVal = "";
                if (typeof(attrValMap[value]) !== "undefined") {
                    textVal = attrValMap[value];
                } else if (typeof(value) === "number") {
                    textVal = value;
                } else {
                    if (value.length > 2) {
                        textVal = value.substring(0, 1) + value.substring(1).toLowerCase();
                    } else {
                        textVal = value;
                    }
                }

                if (attrArr.length === 0) {
                    attrArr.push(
                        <p key={attr}>
                            <b>Attributes</b>: &nbsp; {attrToDesc[attr]}: {textVal}
                        </p>
                    );
                } else {
                    attrArr.push(
                        <p key={attr}>
                            {attrToDesc[attr]}: {textVal}
                        </p>
                    );
                }
            }
        }
        return attrArr;
    }

    if ((manuRef === "") || (brand === "")) {
        return (
            <div></div>
        );
    } else if (!isResult) {
        return (
            <div className="Query-Result">
                <p>
                    Loading, please wait...
                </p>
            </div>
        );
    } else if (isError) {
        return (
            <div className="Query-Result">
                <p>
                    {errMessage}
                </p>
            </div>
        );
    } else {
        return (
            <div className="Query-Result">
                {displayAttrs()}
                <p>
                    <b>Manufacturer Reference No</b>: {result["referenceNo"]}
                </p>
                <p>
                    <b>Product Code</b>: {result["uuidCode"]}
                </p>
                <p>
                    <button onClick={() => {
                        navigator.clipboard.writeText(result["uuidCode"])
                    }}>
                        Copy product code
                    </button>
                </p>
            </div>
        );
    }
}