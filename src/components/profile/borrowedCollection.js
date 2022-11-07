import { SimpleGrid } from "@mantine/core";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import WrapperABI from "../WrapperABI.json";
import { showNotification,updateNotification } from "@mantine/notifications";
import { IconCheck, IconCrossOff} from '@tabler/icons';
import { IconX } from '@tabler/icons';


export default function BorrowedCollection(props){
    console.log("From borrowedComponent",props.data);
    // console.log(props.borrowerAddress)

    // const EscrowAddress = "0xB014C5E5793De674dF1b9D8Da3645EDC14d3e866";
    // const Wrapper = "0xf0BBDaF9D0D24d26BaB64A8d6F5Ee1553472bAC9";


    // const Wrapper= "0x602d8F38cd04e39a5A1B5d3f45089bE7F8035898";
    // const EscrowAddress = "0xBC266ef1f2bf8aE5B2f16bf26ca9BE4622782467";

    // const EscrowAddress = "0xE00c565819F0b5A7f62CAC472371E0707eED6E0f";
    // const Wrapper = "0xe2F0f2ff0e58031cfbA9883dBFe838BDcc48b25E";
        

    const EscrowAddress = "0xd2d0BCF1032177524Ada4656879016cc8F5D948b";
    const Wrapper = "0x4474b062D70782BB14440EfdC8acebb286a5472a";


    const content = props.data.map((item,i)=>{
        if(item.contractAddress != ''){

            //Time calculation to display
            let timeDifference = item.rentingTime - item.timeLeft;
            //Function to return NFT
            function returnNFTcall(){

                
                if(timeDifference <= 0){

                    showNotification({
                        id: 'load-data',
                        loading: true,
                        title: 'Returning NFT',
                        message: 'Burning your wrapped NFT 🤥',
                        autoClose: false,
                        disallowClose: true,
                    });
    
                    //Interacting with contract
                    const provider = new ethers.providers.Web3Provider(window.ethereum);
                    const signer = provider.getSigner();
                    let contract = new ethers.Contract(Wrapper,WrapperABI, signer);
                    console.log("This is iteem",item.tokenId);
                    //Calling the contract to return the NFT
                    contract.returnNFT(item.contractAddress, item.tokenId,props.borrowerAddress).then((transaction)=>{
                        console.log("Transaction succeded", transaction);
                        updateNotification({
                            id: 'load-data',
                            color: 'teal',
                            title: 'Successfully Returned',
                            message: `Wrapped NFT successfully burned and original NFT has been returned`,
                            icon: <IconCheck size={16} />,
                            autoClose: 2000,
                        });

                    }).catch((e)=>{
                        console.log("Transaction failed: ",e);
                    })
                }
                else{

                    // Most used notification props
                    showNotification({
                        id: 'hello-there',
                        disallowClose: true,
                        onClose: () => console.log('unmounted'),
                        onOpen: () => console.log('mounted'),
                        autoClose: 5000,
                        title: "Contract breach attempt",
                        message: 'You cannot return before the agreed time',
                        color: 'red',
                        // icon: <IconCrossOff size={16} />,
                        className: 'my-notification-class',
                        style: { backgroundColor: '#222528' },
                        sx: { backgroundColor: 'red' },
                        loading: false,
                    });

                }


            }
            
            
            return(
            <div>
                <div className="box" key={i}>

                    <div className="image" style={{backgroundImage:`url(${item.image})`, width:"100%", height:"26vh", backgroundRepeat:"no-repeat", backgroundPosition:"center", objectFit:"contain"}}>
                        <button onClick={returnNFTcall}>Return now</button>

                    </div>


                    <div className="box-content">
                        <p id="upper-para">{item.collectionName.split(" ")} # {item.tokenId} </p>
                        <h3>{item.collectionName}</h3>
                        {/* <p> {parsedMetadata.description } </p> */}
                
                    </div>
                    <div className="grey-container">
                        <div className="greyinner-container">
                            <p>Status</p>
                            <h5>True</h5>
                        </div>
                        <div className="greyinner-container" id="greyinnerSecond">
                            <p>Time Left</p>
                            <h5>{timeDifference>0?new Date(timeDifference * 1000).toISOString().slice(11, 19):"Expired"}</h5>
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

    return(
        <div className="profileContainer">
            <div className="boxContainer" >
                <SimpleGrid cols={5} spacing={"xl"} breakpoints={[
                { maxWidth: 1500, cols: 3, spacing: 'sm' },
                { maxWidth: 1000, cols: 2, spacing: 'sm' },
                { maxWidth: 600, cols: 1, spacing: 'sm' },
            ]}>

                    {content}
                </SimpleGrid>

            </div>
        </div>
    )


}