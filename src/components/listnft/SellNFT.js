import Navbar from "../navbar/navbar";
import { useState } from "react";
import { uploadFileToIPFS, uploadJSONToIPFS } from "./pinata";
import Marketplace from './Marketplace.json';
import { useLocation } from "react-router";
import "./sellnft.css";
import { Alert } from "@mantine/core";

export default function SellNFT () {
    const [formParams, updateFormParams] = useState({ name: '', description: '', price: ''});
    const [fileURL, setFileURL] = useState(null);
    const ethers = require("ethers");
    const [message, updateMessage] = useState('');
    const location = useLocation();
    const [fileChoosen, setfileChoosen] = useState('No file selected');

    //This function uploads the NFT image to IPFS
    async function OnChangeFile(e) {
        var file = e.target.files[0];
        //Updating file name
        setfileChoosen(file.name);
        //check for file extension
        try {
            //upload the file to IPFS
            const response = await uploadFileToIPFS(file);
            if(response.success === true) {
                console.log("Uploaded image to Pinata: ", response.pinataURL)
                setFileURL(response.pinataURL);
            }
        }
        catch(e) {
            console.log("Error during file upload", e);
        }
    }

    //This function uploads the metadata to IPFS
    async function uploadMetadataToIPFS() {
        const {name, description, price} = formParams;
        //Make sure that none of the fields are empty
        if( name == '' || description =='' || price =='' || fileURL == '')
            return 'empty';

        const nftJSON = {
            name, description, price, image: fileURL
        }

        try {
            //upload the metadata JSON to IPFS
            const response = await uploadJSONToIPFS(nftJSON);
            if(response.success === true){
                console.log("Uploaded JSON to Pinata: ", response)
                return response.pinataURL;
            }
        }
        catch(e) {
            console.log("error uploading JSON metadata:", e);
            return 'jsonerror'
        }
    }

    async function listNFT(e) {
        e.preventDefault();

        //Upload data to IPFS
        try {
            uploadMetadataToIPFS().then((metadataURL)=>{

                // await metadataURL.wait();
    
                if(metadataURL == 'jsonerror' || metadataURL == 'empty'){
                    if(metadataURL == 'jsonerror'){
                        alert("Json Upload error. Try again");
                    }
                    else{
                        alert("Fill up the form completely");
                    }
                    return;
                }
                //After adding your Hardhat network to your metamask, this code will get providers and signers
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                updateMessage("Please wait.. uploading (upto 5 mins)")
    
                //Pull the deployed contract instance
                let contract = new ethers.Contract(Marketplace.address, Marketplace.abi, signer)
    
                //massage the params to be sent to the create NFT request
                const price = ethers.utils.parseUnits(formParams.price, 'ether')
                let listingPrice = contract.getListPrice().then((listingPrice)=>{
                    let finalPrice = listingPrice.toString();
                    // listingPrice = await listingPrice.toString()
        
                    //actually create the NFT
                    contract.createToken(metadataURL, price, { value: finalPrice }).then((transaction)=>{
                                    alert("Successfully listed your NFT!");
                                    updateMessage("");
                                    updateFormParams({ name: '', description: '', price: ''});
                                    window.location.replace("/")
                    })
                    // await transaction.wait()
                })
            });
        }
        catch(e) {
            alert( "Upload error"+e )
        }
    }

    console.log("Working", process.env);
    return (
        <div className="sellpage">
            <Navbar></Navbar>
            
            <div className="formcontainer" id="nftForm">
                <form >
                    <h3 >Upload your NFT to the marketplace</h3>
                    <div className="formtable" id="table1">
                        <label  htmlFor="name">NFT Name</label>
                        <input  id="name" type="text" placeholder="Axie#4563" onChange={e => updateFormParams({...formParams, name: e.target.value})} value={formParams.name}></input>
                    </div>
                    <div className="formtable">
                        <label htmlFor="description">NFT Description</label>
                        <textarea  cols="40" rows="5" id="description" type="text" placeholder="Axie Infinity Collection" value={formParams.description} onChange={e => updateFormParams({...formParams, description: e.target.value})}></textarea>
                    </div>
                    <div className="formtable">
                        <label htmlFor="price">Price (in MATIC)</label>
                        <input type="number" placeholder="Min 0.01 MATIC" step="0.01" value={formParams.price} onChange={e => updateFormParams({...formParams, price: e.target.value})}></input>
                    </div>
                    <div className="formtable">
                        <label  htmlFor="image">Upload Image</label>
                        <div className="fileselector">

                            <label for="listinput" className="fileinputWrapper">
                                Choose File
                                <input type={"file"} onChange={OnChangeFile} className="formfileinput" id="listinput"></input>
                            </label>
                            <label className="chooselabel">{fileChoosen}</label>
                        </div>
                    </div>
                    <br></br>
                    <div className="listupdate" >{message}</div>
                    <button onClick={listNFT} className="formbutton">
                        List NFT
                    </button>
                </form>
            </div>
        </div>
    )
}