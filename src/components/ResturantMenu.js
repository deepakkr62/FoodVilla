import {useState, useEffect } from "react";
import Shimmer from "./shimmer";
import { useParams } from "react-router-dom";

import useResturantMenu from "../utils/useResturantMenu";
const ResturantMenu=()=>{

 const { resId } =useParams();

 const resInfo=useResturantMenu(resId);
 
 
 if(resInfo===null){
  return <Shimmer />;
 }
const {name,cuisines,costForTwoMessage}=resInfo?.data?.cards[2]?.card?.card?.info;

const itemcards = resInfo?.data?.cards[4]?.groupedCard?.cardGroupMap?.REGULAR?.cards[2]?.card?.card?.itemCards ||[];
console.log(itemcards);
//console.log(resInfo?.data?.cards[4]?.groupedCard?.cardGroupMap?.REGULAR?.cards[2]?.card?.card?.itemCards[0]?.card?.info?.name);
 return  (
 <div className="menu">
  <h1>{name}</h1>
  <h3>{cuisines.join(',')} -{costForTwoMessage}</h3>
  <h2>Menu</h2>
  <ul>
   {itemcards.map((item)=><li key={item.card?.info?.id}>{item.card?.info?.name} - ₹{(item.card?.info?.price || item.card?.info?.defaultPrice)/100}</li>)}
   
  </ul>
 </div>
 )
}
export default ResturantMenu;