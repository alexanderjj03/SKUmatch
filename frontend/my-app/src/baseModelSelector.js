import React, {useEffect, useState} from "react";
import Dropdown from 'react-dropdown'; // Source: https://www.npmjs.com/package/react-dropdown?activeTab=readme
import 'react-dropdown/style.css';
import {AttrSelector} from "./attrSelector";
import './baseModelSelector.css';

const localHost = "http://localhost:3500";

// Allows the user to select the brand's base model via a dropdown menu.
export function BaseModelSelector({brand}) {
    const [getModelsUrl, setModelsUrl] = useState(localHost
        + `/data/`);
    const [brandName, setBrandName] = useState(brand);
    const [modelListLoaded, setModelListLoaded] = useState(false);
    const [modelList, setModelList] = useState(['']);
    const [isModelSelected, setModelSelected] = useState(false);
    const [selectedModel, setSelectedModel] = useState('Select...');
    const [errMessage, setMessage] = useState("");

    const fetchModels = () => {
        setSelectedModel('Select...');
        setModelSelected(false);
        setModelListLoaded(false);
        return fetch(getModelsUrl + brand)
            .then((res) =>res.json())
            .then((data) => {
                let dispList = ['Select...'];
                for (const model of data.result) {
                    dispList.push(model);
                }
                setModelList(dispList);
                setModelListLoaded(true);
            })
            .catch(err => {
                setMessage(err);
            })
    }

    useEffect(() => {
        if (brand !== 'Select...') {
            setBrandName(brand);
            fetchModels();
        }
    }, [brand]);

    if (brand === "Select..."){
        return (
            <div></div>
        );
    } else if (!modelListLoaded) {
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
                        Base Model Code (SKU): &nbsp;
                    </span>
                    <Dropdown
                        value={selectedModel}
                        onChange={(val) => {
                            if (val.value !== 'Select...') {
                                setSelectedModel(val.value);
                                setModelSelected(true);
                            } else {
                                setSelectedModel('Select...');
                                setModelSelected(false);
                            }
                        }}
                        options={modelList}
                    />
                    <span>
                        &nbsp; ({modelList.length - 1} options)
                    </span>
                </div>
                <AttrSelector brand={brandName} baseModel={selectedModel}/>
            </div>
        );
    }
}