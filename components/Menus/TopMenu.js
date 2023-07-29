import {useState, useEffect} from 'react';
import Background from './background3'
import Dropdown from '../Dropdown/DropdownSearch'
import Description from '../Descriptions/Description'
import Wiki from '../Descriptions/Wiki_Sum'





const TopMenu = () => {
const [term, setTerm] = useState('')

  return (
 
    <div style={{ display: 'flex', border: '1px solid lightblue', margin: 'auto', padding: '5px' }}>
      <div style={{ flex: 2,padding: '5px'  }}>
        <Description/>
        {/* <p>Read more about {"person"}</p> */}
        <Wiki term={term}/>
        <br />
        <Dropdown setTerm={setTerm} />
      </div>
      <div style={{ marginRight:'5px', marginTop:'5px',marginLeft:'15px', flex: 1, padding: '15px' }}>
      <Background/>

      </div>
    </div>
  );
};

export default TopMenu;
