import React, {useEffect, useState} from 'react';
import {BaseModelSelector} from "./baseModelSelector";
import Combobox from "react-widgets/Combobox";
import Dropdown from 'react-dropdown'; // Source: https://www.npmjs.com/package/react-dropdown?activeTab=readme
import 'react-dropdown/style.css';
import './App.css';

const localHost = "http://localhost:3500";

// Sets up the entire app, provides the user the first dropdown menu to select the product's brand name.
function App() {
  const [getBrandsUrl, setBrandsUrl] = useState(localHost + "/data");
  const [brandListLoaded, setBrandListLoaded] = useState(false);
  const [brandList, setBrandList] = useState(['']);
  const [dispListLoaded, setDispListLoaded] = useState(false);
  const [displayList, setDisplayList] = useState(['']);
  const [rawSelect, setRawSelect] = useState('');
  const [enteredBrand, setEnteredBrand] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [isSelected, setSelected] = useState(false);

  const fetchBrands = () => {
    return fetch(getBrandsUrl)
        .then((res) =>res.json())
        .then((data) => {
          setBrandList(data.result.sort());
          setBrandListLoaded(true);

          let dispList = ['Select...']; // blank option
          for (const brand of data.result) {
            dispList.push(brand.substring(0, 1) + brand.substring(1).toLowerCase());
          }

          setDisplayList(dispList);
          setDispListLoaded(true);
        })
        .catch(err => console.log(err))
  }

  useEffect(() => {
    fetchBrands();
  }, []);

  useEffect(() => {
      let options = brandList.filter((brand) =>
          brand.startsWith(enteredBrand.toUpperCase())
      );

      let dispList = ['Select...'];
      for (const brand of options) {
          dispList.push(brand.substring(0, 1) + brand.substring(1).toLowerCase());
      }
      setDisplayList(dispList);
  }, [enteredBrand])

  if (!dispListLoaded) {
    return (
        <div className="App">
          <header className="App-header">
            <p>
              Data loading, please wait:
            </p>
          </header>
        </div>
    );
  } else {
    if (!isSelected) {
      return (
          <div className="App">
              <header className="App-header">
                  <h1>Get your Product's Code using its Attributes</h1>
                  <div className="Brand-Selector">
                      Brand Name: &nbsp;
                      <textarea
                          placeholder="Start typing your product's brand name, then select an option
                          from the dropdown"
                          value={enteredBrand}
                          rows={3}
                          cols={30}
                          onChange={e => {
                              setEnteredBrand(e.target.value.trim());
                          }}
                      />
                      &nbsp;
                      <Dropdown
                          value={rawSelect}
                          onChange={val => {
                              setRawSelect(val.value);
                              if (val.value !== 'Select...') {
                                  const realBrand = val.value.toUpperCase();
                                  setSelected(true);
                                  setSelectedBrand(realBrand);
                              } else {
                                  setSelectedBrand('Select...');
                              }
                          }}
                          options={displayList}
                      />
                      <span>
                          &nbsp; ({displayList.length - 1} options)
                      </span>
                  </div>
              </header>
          </div>
      );
    } else {
        return (
            <div className="App">
                <header className="App-header">
                    <h1>Get your Product's Code using its Attributes</h1>
                    <p>
                        <button onClick={() => {
                            setSelectedBrand('Select...')
                            setRawSelect('Select...');
                            setEnteredBrand('');
                            setSelected(false);
                        }}>
                            Clear all entries
                        </button>
                    </p>
                    <div className="Brand-Selector">
                        Brand Name: &nbsp;
                        <textarea
                            placeholder="Start typing your product's brand name, then select an option
                            from the dropdown"
                            value={enteredBrand}
                            rows={3}
                            cols={30}
                            onChange={e => {
                                setEnteredBrand(e.target.value.trim());
                            }}
                        />
                        &nbsp;
                        <Dropdown
                            value={rawSelect}
                            onChange={val => {
                                setRawSelect(val.value);
                                if (val.value !== 'Select...') {
                                    const realBrand = val.value.toUpperCase();
                                    setSelected(true);
                                    setSelectedBrand(realBrand);
                                } else {
                                    setSelectedBrand('Select...');
                                }
                            }}
                            options={displayList}
                        />
                        <span>
                            &nbsp; ({displayList.length - 1} options)
                        </span>
                    </div>
                    <BaseModelSelector brand={selectedBrand}/>
                </header>
            </div>
        );
    }
  }
}

export default App;
