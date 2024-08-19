import React, {useEffect, useState} from "react";
import {localHost} from "../App";
import {ProductSelector} from "./productSelector";

// Runs the user's query and displays its result
export function QueryResult({query, reset}) {
    const [isResult, setIsResult] = useState(false);
    const [isError, setIsError] = useState(false);
    const [errMessage, setErrMessage] = useState('');
    const [result, setResult] = useState('');
    const [queryRan, setQueryRan] = useState(false);
    const [buttonDisabled, setButtonDisabled] = useState(false);

    const fetchResult = () => {
        setIsResult(false);
        setIsError(false);
        return fetch(localHost + "/query",
            {
                method: 'POST',
                body: JSON.stringify(query),
                headers: {
                    'content-type':'application/json'
                }
            })
            .then((res) =>res.json())
            .then((data) => {
                setIsResult(true);
                if (data.error) {
                    setIsError(true);
                    setErrMessage(data.error);
                } else if (data.result) {
                    setResult(data.result);
                }
                setQueryRan(true);
            })
            .catch(err => {
                setIsResult(true);
                setIsError(true);
                setErrMessage(err);
            })
    }

    useEffect(() => {
        if (reset === true) { // make query available to run once its changed from attrSelector
            setQueryRan(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reset]);

    if (!queryRan) {
        return (
            <p>
                <button disabled={buttonDisabled}
                        onClick={() => {
                            fetchResult();
                            setButtonDisabled(true);
                            setTimeout(() => setButtonDisabled(false), 1000);
                        }}>
                    Find matching product code
                </button>
            </p>
        );
    } else {
        if (!isResult) {
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
            if (result.length === 1) {
                return (
                    <div className="Query-Result">
                        <p>
                            <b>Manufacturer Reference No</b>: {result[0]["referenceNo"]}
                        </p>
                        <p>
                            <b>Product Code</b>: {result[0]["uuidCode"]}
                        </p>
                        <p>
                            <button onClick={() => {
                                navigator.clipboard.writeText(result[0]["uuidCode"])
                            }}>
                                Copy product code
                            </button>
                        </p>
                    </div>
                );
            } else {
                return (
                    <div className="Query-Result">
                        <ProductSelector productList={result}/>
                    </div>
                );
            }
        }
    }
}