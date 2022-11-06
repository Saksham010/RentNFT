import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import UserContext from "../context/context";
import { useContext } from "react";
import "./navbar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { faUserCircle } from "@fortawesome/free-solid-svg-icons";
export default function Navbar(props){

    const[buttonData,setbuttonData] = useState('Connect wallet');
    const contextData = useContext(UserContext);
    const retrievedCookie = contextData.cookies.SignerData;
    useEffect(()=>{
        //Check if the user cookie exists
        if(retrievedCookie != null || retrievedCookie != undefined){
            setbuttonData("Disconnect wallet");
        }

    },[])
    // console.log(contextData.cookies.SignerData )

    function disconnectWallet(){
        contextData.removeCookie("SignerData");
        setbuttonData("Connect wallet"); //Set text back
    }


     return(
        <div className="nav-container">
            <div className="mainLogo">
                <Link to='/' className="homeIcon">

                    <h1>rentNFT</h1>
                </Link>
            </div>

            <div className="combineThree">

                <div className="combineTwo">
                    <div className="magnifying-container">
                        <FontAwesomeIcon icon={faMagnifyingGlass} className="magnifyingIcon"/>                    
                    </div>
                    <div className="input-container">
                        <input placeholder="Search by collection, NFT or user"/>
                    </div>

                </div>

                <div className="combineOne">
                    
                    {buttonData== 'Connect wallet'?<Link to="/connect"><div className="walletContainer">{buttonData}</div></Link>:<div className="walletContainer" onClick={disconnectWallet}>{buttonData}</div>}
                    
                    <div className="marketbox">
                        <Link to='/marketplace' className="market-text">
                                <span>Marketplace</span>
                        </Link>
                    </div>

                    <div className="marketbox">
                        <Link to='/mint' className="market-text">
                            <span>Mint</span>
                                
                        </Link>
                    </div>

                    <div className="userIcon">
                        <Link to='/profile' className="profile-icon">
                                <FontAwesomeIcon icon={faUserCircle} size="2x" className="mainUserIcon"></FontAwesomeIcon>
                        </Link>
                    </div>

                </div>
            </div>

        </div>
    );


}
