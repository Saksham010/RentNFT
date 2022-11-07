import { ethers } from "ethers";
import { useState, useEffect } from "react";
export default async function NetworkCheck(){

    const[isChainCorrect, setIsChainCorrect] = useState(true);

    useEffect(()=>{
        if(isChainCorrect == false){
            alert("Wrong chain. Switch to polygon mumbai testnet and refresh");
            // window.location.reload(true);
        }


    },[isChainCorrect])
    
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const {chainId} = await provider.getNetwork();
    console.log("Chain ID YO HO HAI: ",chainId);
    if(chainId != 80001){
        setIsChainCorrect(false);
    }

}