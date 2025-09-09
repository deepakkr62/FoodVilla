import ResturantCard from "./ResturantCard";
import Shimmer from "./shimmer.js";
import rest from "../utils/mockdata.js";
import { useState,useEffect } from "react";
import { Link } from "react-router-dom";
import useOnlineStatus from "../utils/useOnlineStatus.js";


const Body=()=>{
      const [resturantlist, setResturantlist]=useState([]);
      const [filterResturants,setFilterResturants]=useState([]);
      const [searchText, setSearchText]=useState("");

    let onlineStatus=useOnlineStatus();
      useEffect(()=>{
          fetchdata();
      },[])

      const fetchdata=async()=>{
        const data=await fetch("https://www.swiggy.com/dapi/restaurants/list/v5?lat=12.9966135&lng=77.5920581&is-seo-homepage-enabled=true&page_type=DESKTOP_WEB_LISTING");
          const json= await data.json();
        setResturantlist(json?.data?.cards[4]?.card?.card?.gridElements?.infoWithStyle?.restaurants);
        setFilterResturants(json?.data?.cards[4]?.card?.card?.gridElements?.infoWithStyle?.restaurants);
          
      };
      console.log(onlineStatus);
      if(onlineStatus===false){
        return (<h1> Look like you are offline. Please check your internet connection</h1>)
      }
      //conditional rendering
        return resturantlist.length === 0 ? (
        <Shimmer />
      ) : (
        <>
        <div className="fliter">
          <div className="search">
            <input className="search-box" type="text" value={searchText} onChange={(e)=>{
              setSearchText(e.target.value);
            }} />
            <button className="search-btn" onClick={()=>{
              console.log({searchText});
              const filterResturant=resturantlist.filter((res)=>
                res.info.name.toLowerCase().includes(searchText.toLowerCase())
                
              );
              setFilterResturants(filterResturant);
            }}>search</button>
          </div>
          <button className="fliter-btn" onClick={()=>{
            let filterdata=resturantlist.filter((res)=>res.info.avgRatingString>=4)
            
            setResturantlist(filterdata);
            
          }}>search filter button</button>
        </div>
        <div className="resturant">
        {
          filterResturants.map((restaurant)=>{
            return <Link key={restaurant.info.id} to={"/resturants/"+restaurant.info.id}><ResturantCard resdata={restaurant} /></Link>
          })
        }
        
        
        </div>
        </>
        );
}
export default Body;