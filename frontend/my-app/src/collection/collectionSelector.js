import React, {useEffect, useState} from "react";
import Dropdown from 'react-dropdown'; // Source: https://www.npmjs.com/package/react-dropdown?activeTab=readme
import 'react-dropdown/style.css';
import {AttrSelector} from "./attrSelector";
import './collectionSelector.css';
import {localHost} from "../App";

// Allows the user to select the brand's collection, product type, and eventually base model.
export function CollectionSelector({brand}) {
    const [getColsUrl] = useState(localHost + `/table/`);
    const [brandName, setBrandName] = useState(brand);
    const [colsInfo, setColsInfo] = useState([]);
    const [colsDesc, setColsDesc] = useState([[], []]);
    const [dispColsList, setDispColsList] = useState(['']);
    const [dispTypeList, setDispTypeList] = useState(['']);
    const [dispLoaded, setDispLoaded] = useState(false);
    const [selectedCol, setSelectedCol] = useState('Select an option...');
    const [colSelected, setColSelected] = useState(false);
    const [selectedType, setSelectedType] = useState('Select an option...');
    const [selectedModel, setSelectedModel] = useState('Select an option...');
    const [errMessage, setMessage] = useState("");
    const [buttonsDisabled, setButtonsDisabled] = useState(false);

    useEffect(() => {
        const fetchCols = () => {
            setDispLoaded(false);
            setColSelected(false);
            setSelectedCol('Select an option...');
            setSelectedType('Select an option...');
            setSelectedModel('Select an option...');
            return fetch(getColsUrl + brand)
                .then((res) => res.json())
                .then((data) => {
                    setColsInfo(data.result);
                    setColsDesc([data.result.map((info) => info["colCode"]),
                        data.result.map((info) => info["colDesc"])]);
                    setDispLoaded(true);

                    let dispDesc = ['Select an option...'];
                    dispDesc = dispDesc.concat(removeDuplicates(data.result.map((info) => info["colDesc"])));
                    setDispColsList(dispDesc);
                    setDispLoaded(true);
                })
                .catch(err => {
                    setMessage(err);
                })
        }

        if (brand !== '') {
            setBrandName(brand);
            fetchCols();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [brand]);

    // Returns all unique elements in a string arr.
    function removeDuplicates(arr){
        const counts = {};
        for (const str of arr) {
            counts[str] = counts[str] ? counts[str] + 1 : 1;
        }

        return Object.keys(counts);
    }

    // Rendering the base model images, three per line (there's definitely a more efficient way to do this).
    // Requires a collection and product type to already be selected.
    const displayModelImages = () => {
        let displayArr = [];
        if ((selectedCol !== 'Select an option...') && (selectedType !== 'Select an option...')) {
            displayArr.push(
                <div key={1}>
                    <p>
                        Select the image that most resembles your product (attribute entry will follow):
                    </p>
                </div>
            );
            let colCode = colsDesc[0][colsDesc[1].indexOf(selectedCol)];
            let options = colsInfo.filter((modelInfo) =>
                (modelInfo["colCode"] === colCode) && (modelInfo["productType"] === selectedType));
            for (let index = 0; index < options.length; index+= 3) {
                if (options.length - index === 2) {
                    displayArr.push(
                        <div className="Col-Desc-Selector" key={index}>
                            <div className="image-container">
                                <div className={"image"}>
                                    <img src={options[index]["imageUrl"]} alt="Image"/>
                                </div>
                                <button className="button" onClick={() => {
                                    setSelectedModel(options[index]["baseModelCode"]);
                                    setButtonsDisabled(true);
                                    setTimeout(() => setButtonsDisabled(false), 1000);
                                }} disabled={buttonsDisabled}>Select
                                </button>
                            </div>
                            <div className="image-container">
                                <div className={"image"}>
                                    <img src={options[index + 1]["imageUrl"]} alt="Image"/>
                                </div>
                                <button className="button" onClick={() => {
                                    setSelectedModel(options[index + 1]["baseModelCode"]);
                                    setButtonsDisabled(true);
                                    setTimeout(() => setButtonsDisabled(false), 1000);
                                }} disabled={buttonsDisabled}>Select
                                </button>
                            </div>
                        </div>
                    );
                } else if (options.length - index === 1) {
                    displayArr.push(
                        <div className="Col-Desc-Selector" key={index}>
                            <div className="image-container">
                                <div className={"image"}>
                                    <img src={options[index]["imageUrl"]} alt="Image"/>
                                </div>
                                <button className="button" onClick={() => {
                                    setSelectedModel(options[index]["baseModelCode"]);
                                    setButtonsDisabled(true);
                                    setTimeout(() => setButtonsDisabled(false), 1000);
                                }} disabled={buttonsDisabled}>Select
                                </button>
                            </div>
                        </div>
                    );
                } else {
                    displayArr.push(
                        <div className="Col-Desc-Selector" key={index}>
                            <div className="image-container">
                                <div className={"image"}>
                                    <img src={options[index]["imageUrl"]} alt="Image"/>
                                </div>
                                <button className="button" onClick={() => {
                                    setSelectedModel(options[index]["baseModelCode"]);
                                    setButtonsDisabled(true);
                                    setTimeout(() => setButtonsDisabled(false), 1000);
                                }} disabled={buttonsDisabled}>Select
                                </button>
                            </div>
                            <div className="image-container">
                                <div className={"image"}>
                                    <img src={options[index + 1]["imageUrl"]} alt="Image"/>
                                </div>
                                <button className="button" onClick={() => {
                                    setSelectedModel(options[index + 1]["baseModelCode"]);
                                    setButtonsDisabled(true);
                                    setTimeout(() => setButtonsDisabled(false), 1000);
                                }} disabled={buttonsDisabled}>Select
                                </button>
                            </div>
                            <div className="image-container">
                                <div className={"image"}>
                                    <img src={options[index + 2]["imageUrl"]} alt="Image"/>
                                </div>
                                <button className="button" onClick={() => {
                                    setSelectedModel(options[index + 2]["baseModelCode"]);
                                    setButtonsDisabled(true);
                                    setTimeout(() => setButtonsDisabled(false), 1000);
                                }} disabled={buttonsDisabled}>Select
                                </button>
                            </div>
                        </div>
                    );
                }
            }
        }
        return displayArr;
    }

    if (brand === '') {
        return (
            <div></div>
        );
    } else if (!dispLoaded) {
        if (errMessage === "") {
            return (
                <div className={"Col-Selector"}>
                    <p>
                        Collection list loading, please wait:
                    </p>
                </div>
            );
        } else {
            return (
                <div className={"Col-Selector"}>
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
    } else if (!colSelected) {
        return (
            <div className={"Col-Desc-Selector"}>
                <span>
                    Collection:&nbsp;
                </span>
                <Dropdown
                    placeholder='Select an option...'
                    value={selectedCol}
                    onChange={(val) => {
                        setSelectedCol(val.value);
                        setSelectedModel('Select an option...');
                        if (val.value !== 'Select an option...') {
                            // Find corresponding collection code, obtain list of potential product types.
                            let colCode = colsDesc[0][colsDesc[1].indexOf(val.value)];
                            let colModels = colsInfo.filter((modelInfo) =>
                                modelInfo["colCode"] === colCode);
                            let availableTypes = removeDuplicates(colModels.map((modelInfo1) =>
                                modelInfo1["productType"]));
                            let dispTypes = ['Select an option...'];
                            dispTypes = dispTypes.concat(availableTypes);
                            setDispTypeList(dispTypes);

                            setColSelected(true);
                        }
                    }}
                    options={dispColsList}
                />
                <span>
                    &nbsp; ({dispColsList.length - 1} options)
                </span>
            </div>
        );
    } else {
        return (
            <div className={"Col-Selector"}>
                <div className={"Col-Desc-Selector"}>
                    <span>
                        Collection:&nbsp;
                    </span>
                    <Dropdown
                        placeholder='Select an option...'
                        value={selectedCol}
                        onChange={(val) => {
                            setSelectedCol(val.value);
                            setSelectedType('Select an option...');
                            setSelectedModel('Select an option...');
                            if (val.value !== 'Select an option...') {
                                let colCode = colsDesc[0][colsDesc[1].indexOf(val.value)];
                                let colModels = colsInfo.filter((modelInfo) =>
                                    modelInfo["colCode"] === colCode);
                                let availableTypes = removeDuplicates(colModels.map((modelInfo1) =>
                                    modelInfo1["productType"]));
                                let dispTypes = ['Select an option...'];
                                dispTypes = dispTypes.concat(availableTypes);
                                setDispTypeList(dispTypes);
                            } else {
                                setColSelected(false);
                            }
                        }}
                        options={dispColsList}
                    />
                    <span>
                        &nbsp; ({dispColsList.length - 1} options)
                    </span>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <span>
                        Product Type:&nbsp;
                    </span>
                    <Dropdown
                        placeholder='Select an option...'
                        value={selectedType}
                        onChange={(val) => {
                            setSelectedModel('Select an option...');
                            setSelectedType(val.value);
                        }}
                        options={dispTypeList}
                    />
                    <span>
                        &nbsp; ({dispTypeList.length - 1} options)
                    </span>
                </div>
                <div className={"Attri-Selector"}>
                    <div className={"unimportant"}>
                        {displayModelImages()}
                    </div> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <AttrSelector brand={brandName} baseModel={selectedModel}/>
                </div>
            </div>
        )
    }
}