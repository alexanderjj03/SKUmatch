import React, {useEffect, useState} from "react";
import Dropdown from 'react-dropdown'; // Source: https://www.npmjs.com/package/react-dropdown?activeTab=readme
import 'react-dropdown/style.css';
import {AttrSelector} from "./attrSelector";

const localHost = "http://localhost:3500";

// Allows the user to select the brand's base model via a dropdown menu.
export function BaseModelSelector({brand}) {
    const [getModelsUrl, setModelsUrl] = useState(localHost
        + `/data/`);
    const [brandName, setBrandName] = useState(brand);
    const [modelListLoaded, setModelListLoaded] = useState(false);
    const [modelList, setModelList] = useState(['']);
    const [isModelSelected, setModelSelected] = useState(false);
    const [selectedModel, setSelectedModel] = useState('');

    const fetchModels = () => {
        setSelectedModel('');
        setModelSelected(false);
        setModelListLoaded(false);
        return fetch(getModelsUrl + brand)
            .then((res) =>res.json())
            .then((data) => {
                setModelList(data.result);
                setModelListLoaded(true);
            })
            .catch(err => console.log(err))
    }

    useEffect(() => {
        setBrandName(brand);
        fetchModels();
    }, [brand]);

    if (!modelListLoaded) {
        return (
            <div className={"Model Selector"}>
                <p>
                    Base Model SKU:
                </p>
                <p>
                    Base model list loading, please wait:
                </p>
            </div>
        );
    } else {
        if (!isModelSelected) {
            return (
                <div className={"Model Selector"}>
                    <p>
                        Base Model SKU:
                    </p>
                    <Dropdown
                        value={selectedModel}
                        onChange={(val) => {
                            if (val.value != '') {
                                setSelectedModel(val.value);
                                setModelSelected(true);
                            }
                        }}
                        options={modelList}
                    />
                </div>
            );
        } else {
            return (
                <div className={"Model Selector"}>
                    <p>
                        Base Model SKU:
                    </p>
                    <Dropdown
                        value={selectedModel}
                        onChange={(val) => {
                            if (val.value != '') {
                                setSelectedModel(val.value);
                                setModelSelected(true);
                            }
                        }}
                        options={modelList}
                    />
                    <AttrSelector brand={brandName} baseModel={selectedModel}/>
                </div>
            );
        }
    }
}