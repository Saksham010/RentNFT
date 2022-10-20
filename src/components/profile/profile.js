import { useState,useEffect,useContext} from "react";
import "./profile.css";
import Navbar from "../navbar/navbar";
import UserContext from "../context/context";
import { useNavigate } from "react-router-dom";
import { Modal,Tabs,Input,Select} from "@mantine/core";
import Collection from "./collection";
import Rentals from "./rentals";
import "./modal.css";
import { IconClock,IconClockOff,IconCash} from '@tabler/icons';
import { ethers } from "ethers";
import ModalButton from "./modalButton";
import EscrowABI from "../EscrowABI.json";
import BorrowedCollection from "./borrowedCollection";


export default function Profile(props){

    // const EscrowAddress = "0xB014C5E5793De674dF1b9D8Da3645EDC14d3e866";
    // const Wrapper = "0xf0BBDaF9D0D24d26BaB64A8d6F5Ee1553472bAC9";


    // const Wrapper= "0x602d8F38cd04e39a5A1B5d3f45089bE7F8035898";
    // const EscrowAddress = "0xBC266ef1f2bf8aE5B2f16bf26ca9BE4622782467";

    // const EscrowAddress = "0xE00c565819F0b5A7f62CAC472371E0707eED6E0f";
    // const Wrapper = "0xe2F0f2ff0e58031cfbA9883dBFe838BDcc48b25E";
        

    const EscrowAddress = "0xd2d0BCF1032177524Ada4656879016cc8F5D948b";
    const Wrapper = "0x4474b062D70782BB14440EfdC8acebb286a5472a";     


    const [mainBorrowerAddress, setMainBorrowerAddress] = useState("");

    const [nftData,setNftData] = useState([]);
    console.log("Fetched NFT data",nftData);
    const contextData =useContext(UserContext);
    const navigate = useNavigate();
    const [walletAddress,setWalletAddress] = useState("");
    const [modalOpened,setModalOpened] = useState(false); //Modal state
    const [modalData,setModalData] = useState({
        contractAddress:'',
        tokenId:'',
        ownerAddress:'',
        collectionName:'',
        description:'',
        image:'',
        properties:{}
    });
    const [originalMetadata,setoriginalMetadata] = useState({});

    const [formData, setformData] = useState({
        rentDuration:'',
        durationUnit:'',
        rentPrice:''

    })
    const [tokenURI,setTokenURI] = useState('');

    //For Borrowed Collection
    const[borrowedData,setBorrowedData] = useState([{
        contractAddress:'',
        tokenId:'',
        collectionName:'',
        description:'',
        image:'',
        rentingTime:'',
        timestamp:'',
        timeLeft:''
        
    }]);

    console.log(borrowedData);
    // console.log("hleoo form data",formData);

    // const userAddress = props.userData.address;

    function fetchNFT(){        
        const userAddress = contextData.cookies.SignerData.address;
        setWalletAddress(userAddress);
        const options = {method: 'GET', headers: {accept: 'application/json', 'X-API-Key': 'b3U2FA6SQwVkU1FbzVnR5ZJlBPC8KR9V404EuVDoaHHYp3Z1PpCKX5tIjV1YtJwF'}};
        fetch(`https://deep-index.moralis.io/api/v2/${userAddress}/nft?chain=mumbai`, options)
        .then(response => response.json())
        .then((response) => {
            // console.log(response);
            setNftData(response.result);
        })
        .catch(err => console.error(err));
    }

    // console.log(nftData);
    useEffect(()=>{
        //Flushing borrowed Data
        setBorrowedData([{        
            contractAddress:'',
            tokenId:'',
            collectionName:'',
            description:'',
            image:'',
            rentingTime:'',
            timestamp:''
        }]);


        if(contextData.cookies.SignerData == undefined || contextData.cookies.SignerData == undefined){
            alert("Wallet not connected");
            navigate("/connect");
        }else{

            fetchNFT();

            //Fetching data for Borrowed Collection
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            let contract = new ethers.Contract(EscrowAddress,EscrowABI, signer);

            let borrowerAddress = contextData.cookies.SignerData.address;

            contract.getBorrowedArray().then((response)=>{
                response.map(itemArray=>{
                    let tokenURI = itemArray.tokenURI;
                    

                    
                    if(itemArray.borrowerAddress.toLowerCase() == borrowerAddress.toLowerCase()){     
                        setMainBorrowerAddress(itemArray.borrowerAddress);                   
                        //Fetching data from token URI   
                        fetch(tokenURI).then((res)=>{
                            res.json().then((finalData)=>{
                                let parsedTokenID = parseInt(itemArray.borrowedTokenId._hex,16);
                                let parsedTimestamp = itemArray.timestamp.toNumber();
                                let parsedRentingTime = itemArray.rentingTime.toNumber();

                                //Time calculation 
                                const provider = new ethers.providers.Web3Provider(window.ethereum);
                                provider.getBlock().then((blockobj)=>{
                                    // console.log(blockobj.timestamp);
                                    let currentTime = blockobj.timestamp;
                                    let timeRemaining = currentTime - parsedTimestamp;
                                    // console.log("Date time: ", Date.now());
                                    console.log("Time left: ", timeRemaining);
                                    
                
                                    let borrowedObj = {
                                        contractAddress:itemArray.borrowedNFTContract,
                                        tokenId:parsedTokenID,
                                        collectionName:finalData.name,
                                        description:finalData.description,
                                        image:finalData.image,
                                        rentingTime:parsedRentingTime,
                                        timestamp:parsedTimestamp,
                                        timeLeft:timeRemaining
                                    };
    
                                    setBorrowedData(arr=>{
    
                                        return [...arr,borrowedObj];
                                    })
                                    
                                }).catch((e)=>{
                                    console.log("Time fetch error, ",e);
                                })


                                
    
                            })
                        }).catch((e)=>{
                            console.log("Error : ",e);
                        })
                    }
                })
            }).catch((e)=>{
                console.log("Error: ",e);
            })

        }

    },[])


    //Function to setModal data and show modal
    function setModal(dataObj){
        //Updating modal data
        setModalData(prev=>{
            return {
                ...prev,
                ...dataObj
            }
        });

        //Displaying modal
        setModalOpened(true);
    }


    const elements = nftData.map((items,i)=>{
        if(items.metadata != null || undefined){
            // console.log("This is item: ",items);
            const parsedMetadata = JSON.parse(items.metadata); 
            console.log("Metadata",parsedMetadata);

            const modalObj = {
                contractAddress:`${items.token_address}`,
                tokenId:`${items.token_id}`,
                ownerAddress:`${items.owner_of}`,
                collectionName:`${parsedMetadata.name}`,
                description:`${parsedMetadata.description}`,
                image:`${parsedMetadata.image}`,

                
            }
            console.log("PARSED IMAGE: ",parsedMetadata.image);
            return (
                <div key={i}>
                    <div className="box">

                        <div className="image" style={{backgroundImage:`url(${parsedMetadata.image})`, width:"100%", height:"26vh", backgroundRepeat:"no-repeat", backgroundPosition:"center", objectFit:"contain"}}>
                            <button onClick={()=>{
                                setModal(modalObj);
                                setoriginalMetadata(parsedMetadata);
                                setTokenURI(items.token_uri);
                            }}>Rent now</button>

                        </div>

                        {/* <h2>Contract Address: {items.token_address}</h2> */}
                        {/* <h2>Token id: {items.token_id}</h2> */}
                        {/* <h2>Owner: {items.owner_of}</h2> */}

                        <div className="box-content">
                            <p id="upper-para">{items.name.split(" ")} # {items.token_id} </p>
                            <h3>{parsedMetadata.name}</h3>
                            {/* <p> {parsedMetadata.description } </p> */}
                    
                        </div>
                        <div className="grey-container">
                            <div className="greyinner-container">
                                <p>Status</p>
                                <h5>False</h5>
                            </div>
                            <div className="greyinner-container" id="greyinnerSecond">
                                <p>Price</p>
                                <h5>Not for sale</h5>
                            </div>

                        </div>
                        <style jsx="true">{`
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
 
    // console.log("This is modalDAta",modalData);
    return(
        <div className="profileContainer">
            <div>
                <Navbar />
            </div>

            <div className="profileCover">

                <div className="profileCircle">
                    <p className="ellipsis"> {walletAddress}</p>

                </div>

            </div>

            <div className="tabContainer">
                <Tabs radius="xs" color="teal" defaultValue="collections">
                    <div className="tabListContainer">
                        <Tabs.List>
                            <Tabs.Tab value="collections"><span>Collections</span></Tabs.Tab>
                            <Tabs.Tab value="borrowed"><span>Borrowed Collections</span></Tabs.Tab>

                        </Tabs.List>
                    </div>
                    

                    <Tabs.Panel value="collections" pt="xs">
                        <Collection elements={elements} modalOpened={modalOpened} />
                    </Tabs.Panel>


                    <Tabs.Panel value="borrowed" pt="xs">
                        <BorrowedCollection data={borrowedData} borrowerAddress={mainBorrowerAddress}/>
                    </Tabs.Panel>


                </Tabs>
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
                        

                        <div className="modalLowerBox">
                            <h5>Rent Duration</h5>

                            <div>
                                <Input onChange={(e)=>{
                                    let value = e.target.value;
                                    //Setting the form data
                                    setformData(obj=>{
                                        return{
                                            ...obj,
                                            rentDuration: value
                                        }
                                    })
                                }} icon={<IconClock/>} iconWidth={25} placeholder="Rent Duration"/>
                            </div>

                            <h5>Select time unit</h5>

                            <div>
                                <Select onChange={(e)=>{
                                    // console.log("select ko: ",e);
                                    //Updating the formData
                                    setformData(obj=>{
                                        return{
                                            ...obj,
                                            durationUnit:e
                                        }
                                    })
                                }} icon={<IconClockOff/>} iconWidth={25} placeholder="Pick one" 
                                    data={[
                                        {value:'min', label:'Minute'},
                                        {value:'hr', label: 'Hour'},
                                        {value:'day',label:'Day'},
                                    ]} />
                            </div>

                            <h5>Listing price</h5>
                            <div>
                                <Input onChange={(e)=>{
                                    let value = e.target.value;
                                    //Setting form data
                                    setformData(obj=>{
                                        return{
                                            ...obj,
                                            rentPrice:value
                                        }
                                    })
                                }} icon={<IconCash/>} iconWidth={25} placeholder="Price" />
                            </div>

                            <ModalButton data = {modalData} originalMetadata = {originalMetadata} formData={formData} originalTokenURI={tokenURI}/>
                        </div>
                    </div>

                </div>


            </Modal>


            

            
        </div>
    )

}
