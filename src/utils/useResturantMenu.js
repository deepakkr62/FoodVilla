import {useState, useEffect} from 'react';
import {menu_API} from "../utils/constant"
const useResturantMenu =(resId)=>{
const[resInfo, setResInfo]=useState(null);
useEffect(()=>{
 fetchMenu();
})
const fetchMenu=async()=>{
 const data=await fetch(menu_API+resId);
 const json=await data.json();

 setResInfo(json);
}
return resInfo;
}
export default useResturantMenu;