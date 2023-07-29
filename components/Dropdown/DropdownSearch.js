import React, { useState } from 'react';
import styles from "./Dropdown.module.css"

const SearchBar = ({setTerm, setPerson, setIsPersonChanged}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState("Sigmund Freud");

  const handleSearchTermChange = (event) => {
    setSearchTerm(event.target.value);
    if (event.target.value) {
      // filter options based on searchTerm
      setOptions(['Aaron T. Beck', 'Carl Jung','Kobi Kambon', 'Mamie Phipps Clark', 'Fritz Perls','Inez Beverly Prosser', 'Milton H. Erickson', 'Sigmund Freud',  'Virginia Satir','BF Skinner','Ruth Westheimer',].filter(option => option.includes(event.target.value)));
    } else {
      setOptions([]);
    }
  };

  const handleOptionSelect = (event) => {
    if (event.key === 'Enter' || event.type === 'input') {
      const words = event.target.value.split(' ');
      if (words.length >= 2 && event.target.value.length >= 5) {
        setSelectedOption(event.target.value);
        setTerm(event.target.value);
        setPerson(event.target.value)
        setIsPersonChanged(true)
        console.log(event.target.value);
      }
    }
  };
  
  

  return (
    <div style={{
        marginLeft:'12px',
    }}>
      {selectedOption && <label>Input a therapist to talk to</label>}
      <div>
    <datalist id="suggestions">
        <option>Aaron T. Beck</option>
        <option>Mamie Phipps Clark</option>
        <option>Carl Jung</option>
        <option>Fritz Perls</option>
        <option>Milton H. Erickson</option>
        <option>Sigmund Freud</option>
        <option>Kobi Kambon </option>
        <option>Inez Beverly Prosser</option>
        <option>Virginia Satir</option>
        <option>BF Skinner</option>
        <option>Ruth Westheimer</option>

    </datalist>
    {/* <input onInput={handleOptionSelect} onKeyDown={handleOptionSelect} autoComplete="on" list="suggestions" placeholder="Search"/>  */}
    <input
  onInput={handleOptionSelect}
  onKeyDown={handleOptionSelect}
  autoComplete="off"
  list="suggestions"
  placeholder="Sigmund Freud"
  style={{
    /* Remove the default arrow */
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    appearance: 'none',
    /* Add custom arrow */
    backgroundImage: `url('data:image/svg+xml;utf8,<svg fill="black" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>')`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right'
  }}
/>

</div>
    </div>
  );
};

export default SearchBar;
