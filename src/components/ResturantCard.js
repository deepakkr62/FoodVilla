
import {img} from '../utils/constant.js';

const ResturantCard=(props)=>{
        const {resdata}=props;
        const {cloudinaryImageId,name,cuisines,avgRatingString,costForTwo}=resdata?.info;
        return(

                <div className="card" >
                <img src={img+cloudinaryImageId}alt="img" />
                <h3>{name}</h3>
                <h5>{cuisines.join(", ")}</h5>
                <h5>{avgRatingString} ratings</h5>
                <h5>{costForTwo}</h5>
                </div>
        )
}
export default ResturantCard;