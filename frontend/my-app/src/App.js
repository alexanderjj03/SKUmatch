import React, {useEffect, useState} from 'react';
import Dropdown from 'react-dropdown'; // Source: https://www.npmjs.com/package/react-dropdown?activeTab=readme
import 'react-dropdown/style.css';
import './App.css';
import {SearchTypeHandler} from "./searchTypeHandler";
import Combobox from "react-widgets/Combobox";

export const localHost = "http://localhost:3500";

// Sets up the entire app, provides the user the first dropdown menu to select the product's brand name.
function App() {
  const [getBrandsUrl] = useState(localHost + "/data");
  const [brandList, setBrandList] = useState(['']);
  const [dispListLoaded, setDispListLoaded] = useState(false);
  const [displayList, setDisplayList] = useState([[''], ['']]);
  const [rawInput, setRawInput] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [isSelected, setSelected] = useState(false);
  const [errMessage, setMessage] = useState("");
  const [disableDropdown, setDisableDropdown] = useState(false);

  useEffect(() => {
      const fetchBrands = () => {
          return fetch(getBrandsUrl)
              .then((res) =>res.json())
              .then((data) => {
                  let sorted = data.result.sort();
                  setBrandList(sorted);

                  setupBrandList(sorted, '');
              })
              .catch(err => {
                  setMessage(err);
              })
      }

      fetchBrands();
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setupBrandList = (fullList, prefix) => {
      let options = [];
      if (prefix === '') {
          options = fullList;
      } else {
          options = fullList.filter(brand => brand.toUpperCase().startsWith(prefix.toUpperCase()));
      }

      let dispList = [[], []];
      for (const brand of options) {
          dispList[0].push(brand); // real brand name (usually all caps)
          dispList[1].push(brand.substring(0, 1) + brand.substring(1).toLowerCase()); // Displayed brand name
      }
      setDisplayList(dispList);
      setDispListLoaded(true);
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
                                  setSelectedBrand('')
                                  setRawInput('');
                                  setSelected(false);
                                  setDispListLoaded(false);
                                  setupBrandList(brandList, '');
                              }}>
                          Clear all entries
                      </button>
                  </p>
                  <div className="Brand-Selector">
                      Brand Name: &nbsp;
                      <Combobox
                          placeholder={"Start typing..."}
                          value={rawInput}
                          disabled={disableDropdown}
                          data={displayList[1]}
                          onChange={(enteredVal) => {
                              setRawInput(enteredVal);
                          }}
                          onSelect={(option) => {
                              setDisableDropdown(true);
                              setTimeout(() => setDisableDropdown(false), 1000);

                              const realBrand = displayList[0][displayList[1].indexOf(option)];
                              setSelectedBrand(realBrand);
                              setSelected(true);
                          }}
                      />
                  </div>
                  <SearchTypeHandler brand={selectedBrand}/>
              </header>
          </div>
      );
  }
}

export default App;
