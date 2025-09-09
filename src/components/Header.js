import {logo} from '../utils/constant.js';
import { useState,useEffect } from 'react';
import { Link } from 'react-router-dom';
import useOnlineStatus from '../utils/useOnlineStatus.js';

const Header=()=>{
  const[btnNameReact,setBtnNameReact]=useState("login");
  let onlineStatus=useOnlineStatus();
  
  useEffect(()=>{
    
  },[btnNameReact])
return <div className="header">
  <Title />
  <div className='nav-items' >
    <ul>
          <li>Online status: {onlineStatus?"🟢":"🔴"}</li>
          <li><Link to={"/grocery"}>Grocery</Link></li>
          <li><Link to={"/"}>Home</Link></li>
          <li><Link to={"/about"}>about</Link></li>
          <li><Link to={"/contact"}>contact</Link></li>
          <li>cart</li>
          <button className='login' onClick={()=>{
            btnNameReact==="login"?setBtnNameReact("logout"):setBtnNameReact("login");
          }}>{btnNameReact}</button>

     </ul>
  </div>
</div>
}

const Title=()=>{
        return (
        <a href='/'>
        <img className='logo' src={logo} alt='logo' />
        </a>)
}

export default Header;