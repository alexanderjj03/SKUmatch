import React, {useEffect, useState} from 'react';
import {BaseModelSelector} from "./baseModelSelector";
import Dropdown from 'react-dropdown'; // Source: https://www.npmjs.com/package/react-dropdown?activeTab=readme
import 'react-dropdown/style.css';
import './App.css';
import {BrandSelectionHandler} from "./brandSelectionHandler";

export const localHost = "http://localhost:3500";

// Sets up the entire app, provides the user the first dropdown menu to select the product's brand name.
function App() {
  const [getBrandsUrl, setBrandsUrl] = useState(localHost + "/data");
  const [brandListLoaded, setBrandListLoaded] = useState(false);
  const [brandList, setBrandList] = useState(['']);
  const [dispListLoaded, setDispListLoaded] = useState(false);
  const [displayList, setDisplayList] = useState([[''], ['']]);
  const [rawSelect, setRawSelect] = useState('');
  const [enteredBrand, setEnteredBrand] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('Select an option...');
  const [isSelected, setSelected] = useState(false);
  const [canFilterBrands, setCanFilterBrands] = useState(false);
  const [errMessage, setMessage] = useState("");

  const fetchBrands = () => {
    return fetch(getBrandsUrl)
        .then((res) =>res.json())
        .then((data) => {
          let sorted = data.result.sort();
          setBrandList(sorted);
          setBrandListLoaded(true);

          filterBrandList(sorted, '');
        })
        .catch(err => {
            setMessage(err);
        })
  }

  useEffect(() => {
    fetchBrands();
  }, []);

  const filterBrandList = (fullList, prefix) => {
      let options = [];
      if (prefix === '') {
          options = fullList;
      } else {
          options = fullList.filter(brand => brand.toUpperCase().startsWith(prefix.toUpperCase()));
      }

      let dispList = [['Select an option...'], ['Select an option...']];
      for (const brand of options) {
          dispList[0].push(brand); // real brand name (usually all caps)
          dispList[1].push(brand.substring(0, 1) + brand.substring(1).toLowerCase()); // Displayed brand name
      }
      setDisplayList(dispList);
      setDispListLoaded(true);
      setCanFilterBrands(false);
  }

  if (!dispListLoaded) {
    if (errMessage === "") {
        return (
            <div className="App">
                <header className="App-header">
                    <h1>Get your Product's Code using its Attributes</h1>
                    <p>
                        Data loading, please wait:
                    </p>
                </header>
            </div>
        );
    } else {
        return (
            <div className="App">
                <header className="App-header">
                    <h1>Get your Product's Code using its Attributes</h1>
                    <p>
                        Error: {errMessage}
                    </p>
                    <p>
                        Please refresh the page. If issues persist, please reach out to [placeholder]
                    </p>
                </header>
            </div>
        );
    }
  } else {
      return (
          <div className="App">
              <header className="App-header">
              <h1>Get your Product's Code using its Attributes</h1>
                  <p>
                      <button disabled={!isSelected}
                              onClick={() => {
                                  setSelectedBrand('Select an option...')
                                  setRawSelect('Select an option...');
                                  setEnteredBrand('');
                                  setSelected(false);
                                  filterBrandList(brandList, '');
                              }}>
                          Clear all entries
                      </button>
                  </p>
                  <div className="Brand-Selector">
                      Brand Name: &nbsp;
                      <textarea
                          placeholder="Start typing your product's brand, then select
                            an option from the dropdown"
                          value={enteredBrand}
                          rows={3}
                          cols={35}
                          onChange={e => {
                              setEnteredBrand(e.target.value.trim());
                              filterBrandList(brandList, e.target.value.trim());
                          }}
                      />
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                      <Dropdown
                          placeholder='Select an option...'
                          value={rawSelect}
                          onChange={val => {
                              setRawSelect(val.value);
                              if ((val.value !== 'Select an option...') && displayList[1].indexOf(val.value) !== -1) {
                                  const realBrand = displayList[0][displayList[1].indexOf(val.value)];
                                  setSelectedBrand(realBrand);
                                  setSelected(true);
                              } else if (val.value === 'Select an option...') {
                                  setSelectedBrand('Select an option...');
                                  setSelected(false);
                              }
                          }}
                          options={displayList[1]}
                      />
                      <span>
                            &nbsp; ({displayList[1].length - 1} options)
                      </span>
                  </div>
                  <BrandSelectionHandler brand={selectedBrand}/>
              </header>
          </div>
      );
  }
}

export default App;
