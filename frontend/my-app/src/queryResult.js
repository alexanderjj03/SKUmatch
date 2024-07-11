import React, {useEffect, useState} from "react";

const localHost = "http://localhost:3500";

// Runs the user's query and displays its result
export function QueryResult({query}) {
    const [isResult, setIsResult] = useState(false);
    const [isError, setIsError] = useState(false);
    const [errMessage, setErrMessage] = useState('');
    const [result, setResult] = useState('');

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
            })
            .catch(err => {
                setIsResult(true);
                setIsError(true);
                setErrMessage(err);
            })
    }

    useEffect(() => {
        fetchResult();
    },[])

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
        return (
            <div className="Query-Result">
                <p>
                    Product code: {result}
                </p>
            </div>
        );
    }
}