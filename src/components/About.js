import React from "react";
import User from "./User"
import UserClass from "./UserClass"
class About extends React.Component{
 constructor(){
    //console.log("parent contructor");
    super()
  }
  componentDidMount(){
   //console.log("Parent component did mount");
  }
 render(){
  //console.log("parent render");
 return (
  <>
  <h1>About us page </h1>
  <h2>this is about us page of food villa </h2>
  
  <UserClass />
  </>
 );
 }

}


export default About; 