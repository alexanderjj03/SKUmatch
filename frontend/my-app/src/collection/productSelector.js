import React, {useEffect, useState} from "react";
import './productSelector.css';

export function ProductSelector({productList}) {
    const [products, setProducts] = useState(productList);
    const [selectedProduct, setSelectedProduct] = useState({});
    const [productSelected, setProductSelected] = useState(false);
    const [buttonsDisabled, setButtonsDisabled] = useState(false);

    useEffect(() => {
        setProducts(productList);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [productList]);

    // Rendering the base model images, three per line (there's definitely a more efficient way to do this).
    // Requires a collection and product type to already be selected.
    const displayProductImages = () => {
        let displayArr = [];
        displayArr.push(
            <div key={1}>
                <p>
                    Multiple results found, select your product from the images below:
                </p>
            </div>
        );
        for (let index = 0; index < products.length; index+= 2) {
            if (products.length - index === 1) {
                displayArr.push(
                    <div className="Col-Desc-Selector" key={index}>
                        <div className="image-container">
                            <div className={"image"}>
                                <img src={products[index]["pictureLink"]} alt="Image"/>
                            </div>
                            <button className="button" onClick={() => {
                                setSelectedProduct(products[index]);
                                setProductSelected(true);
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
                                <img src={products[index]["pictureLink"]} alt="Image"/>
                            </div>
                            <button className="button" onClick={() => {
                                setSelectedProduct(products[index]);
                                setProductSelected(true);
                                setButtonsDisabled(true);
                                setTimeout(() => setButtonsDisabled(false), 1000);
                            }} disabled={buttonsDisabled}>Select
                            </button>
                        </div>
                        <div className="image-container">
                            <div className={"image"}>
                                <img src={products[index + 1]["pictureLink"]} alt="Image"/>
                            </div>
                            <button className="button" onClick={() => {
                                setSelectedProduct(products[index + 1]);
                                setProductSelected(true);
                                setButtonsDisabled(true);
                                setTimeout(() => setButtonsDisabled(false), 1000);
                            }} disabled={buttonsDisabled}>Select
                            </button>
                        </div>
                    </div>
                );
            }
        }
        return displayArr;
    }

    if (!productSelected) {
        return (
            <div className={"unimportant"}>
                {displayProductImages()}
            </div>
        );
    } else {
        return (
            <div className={"unimportant"}>
                {displayProductImages()}
                <p>
                    <b>Manufacturer Reference No</b>: {selectedProduct["referenceNo"]}
                </p>
                <p>
                    <b>Product Code</b>: {selectedProduct["uuidCode"]}
                </p>
                <p>
                    <button onClick={() => {
                        navigator.clipboard.writeText(selectedProduct["uuidCode"])
                    }}>
                        Copy product code
                    </button>
                </p>
            </div>
        );
    }
}