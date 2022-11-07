import Navbar from "../navbar/navbar"
import NFTTile from "./NFTTile";
import MarketplaceJSON from "./Marketplace.json";
import axios from "axios";
import { useState } from "react";
import {ethers} from "ethers";
import { SimpleGrid } from "@mantine/core";


export default function Marketplace() {
    const sampleData = [
        {
            "name": "NFT#1",
            "description": "Marketplace First NFT",
            "website":"http://axieinfinity.io",
            "image":"https://gateway.pinata.cloud/ipfs/QmSLH2ScumiJEFUpXXFVbRbkViXMrftQ1hmR645swKr68b",
            "price":"0.04MATIC",
            "currentlySelling":"True",
            "address":"0xe81Bf5A757CB4f7F82a2F23b1e59bE45c33c5b13",
        },
        {
            "name": "NFT#2",
            "description": "Marketplace Second NFT",
            "website":"http://axieinfinity.io",
            "image":"https://gateway.pinata.cloud/ipfs/QmSLH2ScumiJEFUpXXFVbRbkViXMrftQ1hmR645swKr68b",
            "price":"0.03MATIC",
            "currentlySelling":"True",
            "address":"0xe81Bf5A757C4f7F82a2F23b1e59bE45c33c5b13",
        },
        {
            "name": "NFT#3",
            "description": "Marketplace Third NFT",
            "website":"http://axieinfinity.io",
            "image":"https://gateway.pinata.cloud/ipfs/QmZVx235ZpodnRMqH7xxiE7yMZ2kEnEWxojgxe2bW2dRjr",
            "price":"0.03MATIC",
            "currentlySelling":"True",
            "address":"0xe81Bf5A757C4f7F82a2F23b1e59bE45c33c5b13",
        },
    ];
    const [data, updateData] = useState(sampleData);
    const [dataFetched, updateFetched] = useState(false);

    async function getAllNFTs() {
        //After adding your Hardhat network to your metamask, this code will get providers and signers
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        //Pull the deployed contract instance
        let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer);
        //create an NFT Token
        let transaction = await contract.getAllNFTs()

        //Fetch all the details of every NFT from the contract and display
        const items = await Promise.all(transaction.map(async i => {
            const tokenURI = await contract.tokenURI(i.tokenId);
            let meta = await axios.get(tokenURI);
            meta = meta.data;

            console.log(" This is i: ",i);

            let price = ethers.utils.formatUnits(i.price.toString(), 'ether');
            let item = {
                price,
                tokenId: i.tokenId.toNumber(),
                seller: i.seller,
                owner: i.owner,
                image: meta.image,
                name: meta.name,
                description: meta.description,
            }
            return item;
        }))

        updateFetched(true);
        updateData(items);
    }

    if(!dataFetched){
        getAllNFTs();
    }

    return (
        <div>
            <div><Navbar/></div>
            {/* <div className="flex flex-col place-items-center mt-20">
                <div className="md:text-xl font-bold text-white">
                    Top NFTs
                </div>
                <div className="flex mt-5 justify-between flex-wrap max-w-screen-xl text-center">
                    {data.map((value, index) => {
                        return <NFTTile data={value} key={index}></NFTTile>;
                    })}
                </div>
            </div>             */}
            <div className="marketplaceContainer">
 
                    <div className="boxContainer" >
                        <div className="marketplaceHeader">
                            <h1>Top NFTs</h1>
                        </div>
                        <SimpleGrid cols={5} spacing={"xl"} breakpoints={[
                        { maxWidth: 1500, cols: 3, spacing: 'sm' },
                        { maxWidth: 1000, cols: 2, spacing: 'sm' },
                        { maxWidth: 600, cols: 1, spacing: 'sm' },
                        ]}>

                            {data.map((value, index) => {
                                return <NFTTile data={value} key={index}></NFTTile>;
                            })}

                        </SimpleGrid>

                    </div>
            </div>            
        </div>
    );
}
