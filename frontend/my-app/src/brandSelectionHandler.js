import React, {useEffect, useState} from "react";
import 'react-dropdown/style.css';
import './baseModelSelector.css';
import {BaseModelSelector} from "./baseModelSelector";
import {ManuRefSelector} from "./manuRefSelector";

// Gives the user to search for a product by base model code or manufacturer reference number.
export function BrandSelectionHandler({brand}) {
    const [brandName, setBrandName] = useState(brand);
    const [manuRefChosen, setManuRefChosen] = useState(true);
    const [button1Disabled, setButton1Disabled] = useState(false);
    const [button2Disabled, setButton2Disabled] = useState(false);

    useEffect(() => {
        if (brand !== 'Select an option...') {
            setBrandName(brand);
            setManuRefChosen(true);
        }
    }, [brand]);

    if (brand === "Select an option..."){
        return (
            <div></div>
        );
    } else if (manuRefChosen) {
        return (
            <div className={"Choice-Handler"}>
                <p>
                    <button onClick={() => {
                        setManuRefChosen(false);
                        setButton2Disabled(true);
                        setTimeout(() => setButton2Disabled(false), 1000);
                        // to prevent server request spam
                    }} disabled={button1Disabled}>
                        Search by Base Model Code & Attributes
                    </button>
                </p>
                <ManuRefSelector brand={brandName}/>
            </div>
        );
    } else {
        return (
            <div className={"Choice-Handler"}>
                <p>
                    <button onClick={() => {
                        setManuRefChosen(true);
                        setButton1Disabled(true);
                        setTimeout(() => setButton1Disabled(false), 1000);
                        // to prevent server request spam
                    }} disabled={button2Disabled}>
                        Search by Manufacturer Reference Number
                    </button>
                </p>
                <BaseModelSelector brand={brandName}/>
            </div>
        );
    }
}