import { ethers } from "ethers";
import { showNotification, updateNotification } from '@mantine/notifications';
import { IconCheck } from '@tabler/icons';
import metamaskIcon from "../metamask.svg";
// import walletConnectIcon from "../walletConnect.svg";
import "./authentication.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserContext from "../context/context";
import { useContext } from "react";
import WallectConnect from "./walletConnect";
export default function Authentication(props){
    let coinbaseIcon = "data:image/svg+xml;base64,PHN2ZyBmaWxsPSJub25lIiBoZWlnaHQ9IjMyIiB2aWV3Qm94PSIwIDAgMjQgMjQiIHdpZHRoPSIzMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Im0yMSAxMmMwIDQuOTcwNi00LjAyOTQgOS05IDktNC45NzA1NiAwLTktNC4wMjk0LTktOSAwLTQuOTcwNTYgNC4wMjk0NC05IDktOSA0Ljk3MDYgMCA5IDQuMDI5NDQgOSA5em0tMy43NSAwYzAgMi44OTk1LTIuMzUwNSA1LjI1LTUuMjUgNS4yNXMtNS4yNS0yLjM1MDUtNS4yNS01LjI1IDIuMzUwNS01LjI1IDUuMjUtNS4yNSA1LjI1IDIuMzUwNSA1LjI1IDUuMjV6bS01LjkzNzUtMS42ODc1Yy0uNTUyMyAwLTEgLjQ0NzctMSAxdjEuMzc1YzAgLjU1MjMuNDQ3NyAxIDEgMWgxLjM3NWMuNTUyMyAwIDEtLjQ0NzcgMS0xdi0xLjM3NWMwLS41NTIzLS40NDc3LTEtMS0xeiIgZmlsbD0iIzJkNjVmOCIgZmlsbC1ydWxlPSJldmVub2RkIi8+PC9zdmc+";

    const[isRouteReady,setisRouteReady] = useState(false);
    const navigate = useNavigate();
    const contextData= useContext(UserContext);
    console.log("Context:",contextData);


    if(typeof window.ethereum == 'undefined'){
        alert("No wallet detected");
    }

    function triggerNotification(address){
        showNotification({
            id: 'load-data',
            loading: true,
            title: 'Logging your data',
            message: 'Waiting for you to connect 🤥',
            autoClose: false,
            disallowClose: true,
          });

          setTimeout(() => {
            updateNotification({
              id: 'load-data',
              color: 'teal',
              title: 'Welcome to RentNFT',
              message: `Hey there ${address}`,
              icon: <IconCheck size={16} />,
              autoClose: 2000,
            });
          }, 3000);

    }

    async function connectToMetamask(){
        const provider = new ethers.providers.Web3Provider(window.ethereum);

        //Notification start
        showNotification({
            id: 'load-data',
            loading: true,
            title: 'Connecting 🧐',
            message: 'Waiting for you to connect 🤥',
            autoClose: false,
            disallowClose: true,
          });

        //Notification

        const accounts = await provider.send("eth_requestAccounts",[]);
        const balance = await provider.getBalance(accounts[0]);
        const formattedBalance = ethers.utils.formatEther(balance) + 'ETH';
        const {chainId} = await provider.getNetwork();
        const signer = await provider.getSigner();
        const signedMessage = await signer.signMessage("Rent NFT");
          
        // triggerNotification(accounts[0]);
        
        //Logging User Data
        props.setData(obj=>{
            console.log("This is signer", signer);
            return {
                ...obj,
                address:accounts[0],
                balance:formattedBalance,
                chainId:chainId,
                signedMessage:signedMessage,
            }
        })

        props.setWalletSigner(obj=>{
          return {
            ...signer
          }
        })

        
        //Notification update
        setTimeout(() => {
            updateNotification({
              id: 'load-data',
              color: 'teal',
              title: 'Welcome to RentNFT',
              message: `Hey there ${accounts[0]}`,
              icon: <IconCheck size={16} />,
              autoClose: 2000,
            });

          }, 1000);




          setTimeout(()=>{
            
            navigate('/profile');
          },3500)

    }
    
    useEffect(()=>{
      console.log("USERADDRE", props.userData.address);
      if(props.userData.address != "" || props.userData.address != undefined || props.userData.address == null){
        //Using Context to Store cookie
        contextData.setCookie('SignerData',props.userData,{path:'/'});
      }
    },[props.userData])


    
    return(
        <div className="loginContainer">
            <div className="loginInnerContainer">

              <h1>Connect wallet</h1>
              <p>Choose how you want to connect. There are several wallet providers.</p>

              <button className="login-button" onClick={connectToMetamask}>
                <img src={metamaskIcon}/>
                <h3><span>Metamask</span></h3>

              </button>
              <WallectConnect/>
              <button className="login-button" onClick={connectToMetamask}>
                <img src={coinbaseIcon}/>
                <h3><span>Coinbase Wallet</span></h3>

              </button>
            </div>
        
        </div>
    );


}