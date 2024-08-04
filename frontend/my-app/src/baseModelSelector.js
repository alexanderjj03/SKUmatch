import React, {useEffect, useState} from "react";
import Dropdown from 'react-dropdown'; // Source: https://www.npmjs.com/package/react-dropdown?activeTab=readme
import 'react-dropdown/style.css';
import {AttrSelector} from "./attrSelector";
import './baseModelSelector.css';
import {localHost} from "./App";

// Allows the user to select the brand's base model via a dropdown menu.
export function BaseModelSelector({brand}) {
    const [getModelsUrl] = useState(localHost + `/data/`);
    const [brandName, setBrandName] = useState(brand);
    const [modelList, setModelList] = useState(['']);
    const [dispListLoaded, setDispListLoaded] = useState(false);
    const [dispList, setDispList] = useState(['']);
    const [enteredModel, setEnteredModel] = useState('');
    const [selectedModel, setSelectedModel] = useState('Select an option...');
    const [errMessage, setMessage] = useState("");

    useEffect(() => {
        const fetchModels = () => {
            setSelectedModel('Select an option...');
            return fetch(getModelsUrl + brand)
                .then((res) =>res.json())
                .then((data) => {
                    let modelsList = [];
                    for (const model of data.result) {
                        modelsList.push(model);
                    }
                    setModelList(modelsList);

                    filterModelList(modelsList, '');
                })
                .catch(err => {
                    setMessage(err);
                })
        }

        if (brand !== 'Select an option...') {
            setBrandName(brand);
            setEnteredModel('');
            fetchModels();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [brand]);

    const filterModelList = (fullList, prefix) => {
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
                <div className={"Model-Selector"}>
                    <p>
                        Base model list loading, please wait:
                    </p>
                </div>
            );
        } else {
            return (
                <div className={"Model-Selector"}>
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
            <div className="Model-Selector">
                <div className="Model-Dropdown">
                    <span>
                        Base Model Code: &nbsp;
                    </span>
                    <textarea
                        placeholder="Start typing your product's base model code"
                        value={enteredModel}
                        rows={3}
                        cols={35}
                        onChange={e => {
                            setEnteredModel(e.target.value.trim());
                            filterModelList(modelList, e.target.value.trim());
                        }}
                    />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <Dropdown
                        placeholder='Select an option...'
                        value={selectedModel}
                        onChange={(val) => {
                            if (val.value !== 'Select an option...') {
                                setSelectedModel(val.value);
                            } else {
                                setSelectedModel('Select an option...');
                            }
                        }}
                        options={dispList}
                    />
                    <span>
                        &nbsp; ({dispList.length - 1} options)
                    </span>
                </div>
                <AttrSelector brand={brandName} baseModel={selectedModel}/>
            </div>
        );
    }
}