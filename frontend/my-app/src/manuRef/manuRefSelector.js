import React, {useEffect, useState} from "react";
import Dropdown from 'react-dropdown'; // Source: https://www.npmjs.com/package/react-dropdown?activeTab=readme
import 'react-dropdown/style.css';
import './manuRefSelector.css';
import {localHost} from "../App";
import {ManuRefResult} from "./manuRefResult";

// Allows the user to view all possible manufacturer reference numbers and select one to view its information.
export function ManuRefSelector({brand}) {
    const [getRefsUrl] = useState(localHost + `/manuRef/`);
    const [brandName, setBrandName] = useState(brand);
    const [refList, setRefList] = useState(['']);
    const [dispListLoaded, setDispListLoaded] = useState(false);
    const [dispList, setDispList] = useState(['']);
    const [enteredRef, setEnteredRef] = useState('');
    const [selectedRef, setSelectedRef] = useState('Select an option...');
    const [errMessage, setMessage] = useState("");

    useEffect(() => {
        const fetchRefs = () => {
            setSelectedRef('Select an option...');
            return fetch(getRefsUrl + brand)
                .then((res) =>res.json())
                .then((data) => {
                    let refsList = [];
                    for (const ref of data.result) {
                        refsList.push(ref);
                    }
                    setRefList(refsList);

                    filterRefList(refsList, '');
                })
                .catch(err => {
                    setMessage(err);
                })
        }

        if (brand !== 'Select an option...') {
            setBrandName(brand);
            setEnteredRef('');
            fetchRefs();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [brand]);

    const filterRefList = (fullList, prefix) => {
        let options = ['Select an option...'];
        if (prefix === '') {
            options = options.concat(fullList);
        } else {
            options = options.concat(fullList.filter(ref => ref.toUpperCase().startsWith(prefix.toUpperCase())));
        }

        setDispList(options);
        setDispListLoaded(true);
    }

    if (brand === "Select an option..."){
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
                    <textarea
                        placeholder="Start typing your product's manufacturer reference number"
                        value={enteredRef}
                        rows={3}
                        cols={35}
                        onChange={e => {
                            setEnteredRef(e.target.value.trim());
                            filterRefList(refList, e.target.value.trim());
                        }}
                    />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <Dropdown
                        placeholder='Select an option...'
                        value={selectedRef}
                        onChange={(val) => {
                            setSelectedRef(val.value);
                        }}
                        options={dispList}
                    />
                    <span>
                        &nbsp; ({dispList.length - 1} options)
                    </span>
                </div>
                <ManuRefResult brand={brandName} manuRef={selectedRef}/>
            </div>
        );
    }
}