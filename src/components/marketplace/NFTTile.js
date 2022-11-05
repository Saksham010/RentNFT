import axie from "./tile.jpeg";
import {
    BrowserRouter as Router,
    Link,
  } from "react-router-dom";

import "./marketplace.css";

function NFTTile (data) {
    const newTo = {
        pathname:"/nftPage/"+data.data.tokenId
    }

    console.log("Data detail: ",data.data);


        if(data.data.name != ''){

            return(
                <div className="marketplaceContainer">
    
                    <div className="box" >
    
                        <div className="image" style={{backgroundImage:`url(${data.data.image})`, width:"100%", height:"26vh", backgroundRepeat:"no-repeat", backgroundPosition:"center", backgroundSize:"cover" }} >
                            <button>Buy now</button>
                        </div>
                        <div className="box-content">
                            <p id="upper-para">{data.data.name.split(" ")} #  </p>
                            <h3>{data.data.name}</h3>
                            
                        </div>
                        <div className="grey-container">
                            <div className="greyinner-container">
                                <p>Status</p>
                                <h5>True</h5>
                            </div>
                            <div className="greyinner-container" id="greyinnerSecond">
                                <p>Price</p>
                                <h5>For sale</h5>
                            </div>
    
                        </div>
                        <style jsx>{`
                                    .box{
                                        opacity:1;
                                        transition:opacity 0.2;
    
                                    }
                                    .box:hover{
                                        opacity:1;
                                    }
                                    .box .image{
                                        opacity:1;
                                        transition: opacity 1s;
                                    }
                                    .box:hover .image{
                                        opacity:0.74;
                                    }
                                `   
                                }
                        </style>
    
                    </div>
                </div>
    
            )
        }
        




    
//     return (
//         <>
        
//         {/* <Link to={newTo}> 
//         <div className="border-2 ml-12 mt-5 mb-12 flex flex-col items-center rounded-lg w-48 md:w-72 shadow-2xl">
//             <img src={data.data.image} alt="" className="w-72 h-80 rounded-lg object-cover" />
//             <div className= "text-white w-full p-2 bg-gradient-to-t from-[#454545] to-transparent rounded-lg pt-5 -mt-20">
//                 <strong className="text-xl">{data.data.name}</strong>
//                 <p className="display-inline">
//                     {data.data.description}
//                 </p>
//             </div>
//         </div> */}
//         <Link to={newTo}>
//             <div className="marketCard" style={{backgroundImage:`url(${data.data.image})`, backgroundSize:"cover", backgroundRepeat:"no-repeat", backgroundPosition:"center"}}>
//                 {/* <img src={data.data.image} alt="" className="w-72 h-80 rounded-lg object-cover"></img> */}
//                 <div className="cardData">
//                     <strong className="text-xl">{data.data.name}</strong>
//                     <p className="display-inline">
//                         {data.data.description}
//                     </p>
//                 </div>
//             </div>
//         </Link>
// {/* 
//         </Link> */}
        
//         </>
//     )
}

export default NFTTile;