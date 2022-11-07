import Navbar from "../navbar/navbar"; 
import axie from "./tile.jpeg";
import { useLocation, useParams } from 'react-router-dom';
import MarketplaceJSON from "./Marketplace.json";
import axios from "axios";
import { useState } from "react";
import "./nftpage.css";

export default function NFTPage (props) {

const [data, updateData] = useState({});
const [dataFetched, updateDataFetched] = useState(false);
const [message, updateMessage] = useState("");
const [currAddress, updateCurrAddress] = useState("0x");

async function getNFTData(tokenId) {
    const ethers = require("ethers");
    //After adding your Hardhat network to your metamask, this code will get providers and signers
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const addr = await signer.getAddress();
    //Pull the deployed contract instance
    let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer)
    //create an NFT Token
    const tokenURI = await contract.tokenURI(tokenId);
    const listedToken = await contract.getListedTokenForId(tokenId);
    let meta = await axios.get(tokenURI);
    meta = meta.data;
    console.log(listedToken);

    let item = {
        price: meta.price,
        tokenId: tokenId,
        seller: listedToken.owner,
        owner: listedToken.seller,
        image: meta.image,
        name: meta.name,
        description: meta.description,
    }
    console.log(item);
    updateData(item);
    updateDataFetched(true);
    console.log("address", addr)
    updateCurrAddress(addr);
}

async function buyNFT(tokenId) {
    try {
        const ethers = require("ethers");
        //After adding your Hardhat network to your metamask, this code will get providers and signers
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();

        //Pull the deployed contract instance
        let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer);
        const salePrice = ethers.utils.parseUnits(data.price, 'ether')
        updateMessage("Buying the NFT... Please Wait (Upto 5 mins)")
        //run the executeSale function
        let transaction = await contract.executeSale(tokenId, {value:salePrice});
        await transaction.wait();

        alert('You successfully bought the NFT!');
        updateMessage("");
    }
    catch(e) {
        alert("Upload Error"+e)
    }
}

    const params = useParams();
    const tokenId = params.id;
    console.log("Working: tokenId: ", tokenId);
    console.log("Current address: ",currAddress);

    if(!dataFetched)
        getNFTData(tokenId);


    return(
        <div>
            <Navbar/>
            <div className="nftpageContainer">
                <div className="externalContainer">
                    <div className="nftContainer">
                        <img src={data.image} alt="" className="w-2/5" />

                    </div>
                    <div className="informationContainer">
                        <div >
                            <span className="title">Name :</span> <span className="title-info">{data.name}</span>
                        </div>
                        <div>
                            <span className="title">Description :</span><span className="title-info">{data.description}</span>
                        </div>
                        <div>
                            <span className="title">Price :</span> <span className="title-info">{data.price + " ETH"}</span>
                        </div>
                        <div>
                            <span className="title">Owner :</span> <span className="title-info">{data.owner}</span>
                        </div>
                        <div>
                            <span className="title">Previous Owner :</span> <span className="title-info">{data.seller}</span>
                        </div>
                        <div className="buybtnContainer">
                        { currAddress == data.owner?<div className="ownertext">You are the owner of this NFT</div>:
                            <button className="buybtn" onClick={() => buyNFT(tokenId)}>Buy now</button>
                     
                        
                        }
                        
                        <div className="text-green text-center mt-3">{message}</div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}