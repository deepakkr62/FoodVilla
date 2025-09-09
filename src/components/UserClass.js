import React from "react";
class UserClass extends React.Component{
  constructor(props){
    
    super(props);
    this.state={
      userInfo:{
        name:"dummy",
        location:"dummy loc",
      }
    }
    //console.log(this.props.name+"child contructor");
  }
  async componentDidMount(){
    const data=await fetch("https://api.github.com/users/deepakkr62");
    const json=await data.json();

    console.log(json);

    this.setState({
      userInfo:json
    })
  }
 render(){
  const {name, location,avatar_url
}=this.state.userInfo;


  //console.log(this.props.name+" child render");
   return (
  <div className="user-card">
   <h3> Name: {name} </h3>
   <h3>Location: {location}</h3>
   <img src={avatar_url} />
   <h3>contact: deepakkr1113@gmail.com</h3>
  </div>
 )
 }
}
export default UserClass;  