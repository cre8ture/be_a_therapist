import React, { useState } from 'react';

const SearchBar = ({setTerm}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState('');

  const handleSearchTermChange = (event) => {
    setSearchTerm(event.target.value);
    if (event.target.value) {
      // filter options based on searchTerm
      setOptions(['Aaron T. Beck', 'Carl Jung', 'Fritz Perls', 'Milton H. Erickson', 'Sigmund Freud', 'Virginia Satir'].filter(option => option.includes(event.target.value)));
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
        console.log(event.target.value);
      }
    }
  };
  
  

  return (
    <div style={{
        marginLeft:'12px',
    }}>
      {selectedOption && <label>Pick a therapist to talk to</label>}
      <div>
    <datalist id="suggestions">
        <option>Aaron T. Beck</option>
        <option>Carl Jung</option>
        <option>Fritz Perls</option>
        <option>Milton H. Erickson</option>
        <option>Sigmund Freud</option>
        <option>Virginia Satir</option>
    </datalist>
    <input onInput={handleOptionSelect} onKeyDown={handleOptionSelect} autoComplete="on" list="suggestions" placeholder="Search"/> 
</div>
    </div>
  );
};

export default SearchBar;
