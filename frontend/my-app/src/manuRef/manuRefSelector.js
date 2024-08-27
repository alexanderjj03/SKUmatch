import React, {useEffect, useState} from "react";
import Combobox from "react-widgets/Combobox";
import "react-widgets/styles.css";
import './manuRefSelector.css';
import {localHost} from "../App";
import {ManuRefResult} from "./manuRefResult";

// Allows the user to view all possible manufacturer reference numbers and select one to view its information.
export function ManuRefSelector({brand}) {
    const [getRefsUrl] = useState(localHost + `/manuRef/`);
    const [brandName, setBrandName] = useState(brand);
    const [dispListLoaded, setDispListLoaded] = useState(false);
    const [dispList, setDispList] = useState(['']);
    const [enteredRef, setEnteredRef] = useState('');
    const [selectedRef, setSelectedRef] = useState('');
    const [errMessage, setMessage] = useState("");
    const [disableDropdown, setDisableDropdown] = useState(false);

    useEffect(() => {
        const fetchRefs = () => {
            return fetch(getRefsUrl + brand)
                .then((res) =>res.json())
                .then((data) => {
                    let refsList = [];
                    for (const ref of data.result) {
                        refsList.push(ref);
                    }
                    setDispList(refsList);
                    setDispListLoaded(true);
                })
                .catch(err => {
                    setMessage(err);
                })
        }

        if (brand !== '') {
            setBrandName(brand);
            setSelectedRef('');
            setEnteredRef('');
            setDispListLoaded(false);
            fetchRefs();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [brand]);

    if (brand === ''){
        return (
            <div></div>
        );
    } else if (!dispListLoaded) {
        if (errMessage === "") {
            return (
                <div className={"Ref-Selector"}>
                    <p>
                        Base model list loading, please wait:
                    </p>
                </div>
            );
        } else {
            return (
                <div className={"Ref-Selector"}>
                    <p>
                        Error: {errMessage}
                    </p>
                    <p>
                        Please try selecting a different brand then yours again (or refreshing the page).
                        If issues persist, please reach out to [placeholder]
                    </p>
                </div>
            );
        }
    } else {
        return (
            <div className={"Ref-Selector"}>
                <div className={"Ref-Dropdown"}>
                    <span>
                        Manufacturer Reference No.: &nbsp;
                    </span>
                    <Combobox
                        placeholder={"Start typing..."}
                        value={enteredRef}
                        disabled={disableDropdown}
                        data={dispList}
                        onChange={(enteredVal) => {
                            setEnteredRef(enteredVal);
                        }}
                        onSelect={(option) => {
                            setSelectedRef(option);
                            setDisableDropdown(true);
                            setTimeout(() => setDisableDropdown(false), 1000);
                        }}
                    />
                </div>
                <ManuRefResult brand={brandName} manuRef={selectedRef}/>
            </div>
        );
    }
}