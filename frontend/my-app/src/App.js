import React, {useEffect, useState} from 'react';
import {BaseModelSelector} from "./baseModelSelector";
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
  const [selectedBrand, setSelectedBrand] = useState('');
  const [isSelected, setSelected] = useState(false);

  const fetchBrands = () => {
    return fetch(getBrandsUrl)
        .then((res) =>res.json())
        .then((data) => {
          setBrandList(data.result);
          setBrandListLoaded(true);

          let dispList = [];
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
              <>
                <h1>Get Product Code via Attributes</h1>
                <p>
                  Brand Name:
                </p>
                <Dropdown
                    value={rawSelect}
                    onChange={(val) => {
                      if (val.value != '') {
                        setRawSelect(val.value);
                        const realBrand = val.value.toUpperCase();
                        setSelected(true);
                        setSelectedBrand(realBrand);
                      }
                    }}
                    options={displayList}
                />
              </>
            </header>
          </div>
      );
    } else {
      return (
          <div className="App">
            <header className="App-header">
              <>
                <h1>Get Product Code via Attributes</h1>
                <p>
                  Brand Name:
                </p>
                <div>
                  <Dropdown
                      value={rawSelect}
                      onChange={(val) => {
                        if (val.value != '') {
                          setRawSelect(val.value);
                          const realBrand = val.value.toUpperCase();
                          setSelected(true);
                          setSelectedBrand(realBrand);
                        }
                      }}
                      options={displayList}
                  />
                </div>
                <div>
                  <BaseModelSelector brand = {selectedBrand} />
                </div>
              </>
            </header>
          </div>
      );
    }
  }
}

export default App;
