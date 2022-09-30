import {Link} from "react-router-dom";
import Navbar from "../navbar/navbar";
import { ethers, utils } from "ethers"
import EscrowABI from "../EscrowABI.json";
import { useEffect, useState } from "react";
import { parse } from "@ethersproject/transactions";
import { SimpleGrid } from "@mantine/core";
import "./homepage.css";
import { Modal,Tabs,Input,Select} from "@mantine/core";
// import { IconClock,IconClockOff,IconCash} from '@tabler/icons';
import ConfirmButton from "./confirmButton";



// const Wrapper ='0xa5b2fEAf02AA420333a8f409E5a39DDa8181FC14';
// // const EscrowAddress = '0x00cE1A52bF34057A600CA2C76F32f7d3440a6fDb';
// const EscrowAddress = "0x97Cee8176B3A1F6097101fd7CD2f3AfBf8716463";

// const EscrowAddress = "0xB014C5E5793De674dF1b9D8Da3645EDC14d3e866";
// const Wrapper = "0xf0BBDaF9D0D24d26BaB64A8d6F5Ee1553472bAC9";


// const Wrapper= "0x602d8F38cd04e39a5A1B5d3f45089bE7F8035898";
// const EscrowAddress = "0xBC266ef1f2bf8aE5B2f16bf26ca9BE4622782467";


// const EscrowAddress = "0xE00c565819F0b5A7f62CAC472371E0707eED6E0f";
// const Wrapper = "0xe2F0f2ff0e58031cfbA9883dBFe838BDcc48b25E";
    
        

const EscrowAddress = "0xd2d0BCF1032177524Ada4656879016cc8F5D948b";
const Wrapper = "0x4474b062D70782BB14440EfdC8acebb286a5472a";



export default function HomePage(){

    const [cardData,setCardData] = useState([{
        name:'',
        description:'',
        image:'',
        contractAddress:'',
        tokenId:'',
        rentingTime:'',
        originalTokenURI:'',
        wrappedTokenURI:'',
        price:'',
        hexprice:''
    }]);
    console.log("CARD DATA: ",cardData);
    //Modal
    const[modalOpened,setModalOpened] = useState(false);
    const [modalData,setModalData] = useState({
        contractAddress:'',
        tokenId:'',
        ownerAddress:'',
        collectionName:'',
        description:'',
        image:'',
        price:'',
        rentingTime:'',
        tokenURI:'',
        properties:{},
        hexprice:''
    });

    console.log("Modal data: ",modalData);
    
    useEffect(()=>{
        //Emptying the state changes so that there is no extra data
        setCardData(temparr=>{
            return[{
                name:'',
                description:'',
                image:'',
                contractAddress:'',
                tokenId:'',
                rentingTime:'',
                originalTokenURI:'',
                wrappedTokenURI:'',
                price:''
            }];
        })

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        let contract = new ethers.Contract(EscrowAddress,EscrowABI, signer);

        //Calling function
        contract.getListedNFTArray().then((result)=>{
            console.log(result);
            result.map((item)=>{
                if(item[0] != '0x0000000000000000000000000000000000000000'){
                    //First fetch image url from original token id
                    fetch(item.tokenURI).then((response)=>{
                        let responsePromise = response.json();
                        responsePromise.then((data)=>{
                            // console.log("URL",data.image);
                            console.log("This is running time count");

                            let parsedTokenId = parseInt(item.nftTokenId, 16);
                            // let parsedPrice = parseInt(item.cost,16);
                            // let rentingTime = parseInt(item.rentingTimeinSecond,16);
                            let parsedPrice =  String(item.cost);
                            console.log(parsedPrice)
                            // let finalParsedPrice = ethers.utils.formatEther(parsedPrice);
                            let finalParsedPrice = ethers.utils.formatUnits(parsedPrice, "ether");
                            let parsedRentingTime = item.rentingTimeinSecond.toNumber();
                            //Playground
                            console.log("ETHER converted",parsedRentingTime);

                            setCardData(arr=>{
                                let modifiedObj = {
                                    
                                    name:data.name,
                                    description:data.description,
                                    image:data.image,
                                    contractAddress:item.nftContractAddress,
                                    tokenId:parsedTokenId,
                                    rentingTime:parsedRentingTime,
                                    originalTokenURI:item.tokenURI,
                                    wrappedTokenURI:item.wrappedTokenURI,
                                    price:finalParsedPrice,
                                    hexprice:item.cost

                                };
                                return [...arr, modifiedObj];

                            })                            


                        }).catch((e)=>{console.log("Err:",e)})
                    })
                }
            })
        
        }).catch((e)=>{
            console.log("error: ",e);
        })

    },[])


    const elements = cardData.map((obj, i)=>{

        if(obj.name != ''){

            return(
                <div>
    
                    <div className="box" key={i}>
    
                        <div className="image" style={{backgroundImage:`url(${obj.image})`, width:"100%", height:"26vh", backgroundRepeat:"no-repeat", backgroundPosition:"center", objectFit:"contain" }} >
                            <button onClick={()=>{
                                setModalOpened(true);
                                //Setting modal Data
                                setModalData((currentObj)=>{
                                    return{
                                        ...currentObj,
                                        contractAddress:obj.contractAddress,
                                        tokenId:obj.tokenId,
                                        ownerAddress:"Random Address",
                                        collectionName:obj.name,
                                        description:obj.description,
                                        image:obj.image,
                                        price:obj.price,
                                        rentingTime:obj.rentingTime,
                                        tokenURI:obj.originalTokenURI,
                                        hexprice:obj.hexprice
                                    }
                                })
                            }}>Borrow now</button>
                        </div>
                        <div className="box-content">
                            <p id="upper-para">{obj.name.split(" ")} # {obj.tokenId} </p>
                            <h3>{obj.name}</h3>
                            
                        </div>
                        <div className="grey-container">
                            <div className="greyinner-container">
                                <p>Status</p>
                                <h5>True</h5>
                            </div>
                            <div className="greyinner-container" id="greyinnerSecond">
                                <p>Price</p>
                                <h5>Not for sale</h5>
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
        


    })


    console.log("MOdalDATA: ",modalData.rentingTime);




    return(
        <div className="homeContainer">
            <div>
                <Navbar />
            </div>

            <div  className="boxContainer">
                <SimpleGrid cols={5} spacing={"xl"} breakpoints={[
                { maxWidth: 1500, cols: 3, spacing: 'sm' },
                { maxWidth: 1000, cols: 2, spacing: 'sm' },
                { maxWidth: 600, cols: 1, spacing: 'sm' },
            ]}>

                    {elements}
                </SimpleGrid>

            </div>


            <Modal 
                opened={modalOpened}
                onClose={()=> {setModalOpened(false)}}
                title="Rent NFT"
                transition="pop"
                transitionDuration={400}
                transitionTimingFunction="ease"
                centered
                size="60%"
                radius={14}
                padding={45}
                
            >
                <div className="modalWrapper">

                    <div className="modalOneContainer">
                        <div className="modal-image" style={{backgroundImage:`url(${modalData.image})`}}>
                            
                        </div>

                        <div className="modalTab">
                            <Tabs radius="xs"  color="teal" defaultValue="description">
                                <div className="modalTabContainer">

                                    <Tabs.List>
                                        <Tabs.Tab value="description"><span>Description</span></Tabs.Tab>
                                        <Tabs.Tab value="properties"><span>Properties</span></Tabs.Tab>

                                    </Tabs.List>

                                </div>

                                <Tabs.Panel value="description" pt="xs">
                                    <p>{modalData.description}</p>
                                </Tabs.Panel>


                                <Tabs.Panel value="properties" pt="xs">
                                    <p>No attributes found</p>
                                </Tabs.Panel>

                            </Tabs>
                        </div>
                    </div>

                    <div className="modalTwoContainer">

                        <p>{modalData.contractAddress}</p>
                        <h3>{modalData.collectionName}</h3>
                        <p className="smallText">#{modalData.tokenId} <span> -__- </span>  ERC721</p>

                        <div className="modalBox">
                                                    
                            <h3>Price:  {modalData.price} ETH</h3>
                            <h3>Time : {modalData.rentingTime/60 } min</h3>
                            <h3>Token URI: <p>{modalData.tokenURI.slice(0, 54)}...</p></h3>

                        </div>
                        <ConfirmButton tokenId= {modalData.tokenId} contractAddress={modalData.contractAddress} amount={modalData.price} rentingTime={modalData.rentingTime} tokenURI={modalData.tokenURI}/>

                    </div>

                </div>


            </Modal>



            

            {/* <h2>Hello World</h2> */}
        </div>

    )


}