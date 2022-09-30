import { ethers } from "ethers"
import { useEffect, useState } from "react";
import ABI from "../ERC721ABI.json";
import { IconCheck } from '@tabler/icons';
import { showNotification, updateNotification } from '@mantine/notifications';
import {uploadJSONToIPFS} from "./pinata";
import EscrowABI from "../EscrowABI.json";

export default function ModalButton(props){
    const [Approved,setApproved] = useState(false);

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

  
    async function checkForApproval(){
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        let contract = new ethers.Contract(props.data.contractAddress,ABI, signer);

        const result = await contract.isApprovedForAll(props.data.ownerAddress, EscrowAddress);
        // console.log("Got this: ",result);
        setApproved(result);

    }

   useEffect(()=>{
        checkForApproval();

   },[]);


   async function CallForApprove(){
        showNotification({
            id: 'load-data',
            loading: true,
            title: 'Approving all your NFT',
            message: 'Waiting for you to confirm transaction 🤥',
            autoClose: false,
            disallowClose: true,
        });
        const provider = new ethers.providers.Web3Provider(window.ethereum);

        const signer = provider.getSigner();
        let contract = new ethers.Contract(props.data.contractAddress,ABI, signer);

        contract.setApprovalForAll(EscrowAddress, true).then((res)=>{
            console.log("Approval Response: ",res);
            updateNotification({
                id: 'load-data',
                color: 'teal',
                title: 'Successfully Approved',
                message: `You can confirm your listing now`,
                icon: <IconCheck size={16} />,
                autoClose: 2000,
            });

        });
        


   }

   

   console.log(Approved);

   console.log("Original Metadata",props.originalMetadata);


    function ListNFT(){
        showNotification({
            id: 'load-data',
            loading: true,
            title: 'Listing your NFT',
            message: 'Waiting for you to confirm transaction 🤥',
            autoClose: false,
            disallowClose: true,
          });


        let rentDuration = props.formData.rentDuration;
        let durationUnit = props.formData.durationUnit;
        let rentPrice = props.formData.rentPrice;
        const convertedRentPrice = ethers.utils.parseUnits(rentPrice,"ether");

        if(durationUnit == 'min'){
            rentDuration = Number(rentDuration) * 60;
        }
        else if(durationUnit == 'hr'){
            rentDuration = Number(rentDuration) * 60 * 60;
        }
        else{
            rentDuration = Number(rentDuration) * 24 * 60 * 60;
        }
// GNFT COLLECTION: 0x14B5d36B03861b95B5a279cf4150F0cB8FE12B1f

//Wrapper: 0x602d8F38cd04e39a5A1B5d3f45089bE7F8035898
//Escrow : 0xBC266ef1f2bf8aE5B2f16bf26ca9BE4622782467
        // console.log("Final Values: ",rentDuration,durationUnit,rentPrice);
        const modifiedMetadata = {
            ...props.originalMetadata,
            originalOwner:`${props.data.ownerAddress}`,
            originalContract:`${props.data.contractAddress}`,
            originalTokenId:`${props.data.tokenId}`,
            name:`Wrapped ${props.originalMetadata.name}`

        }

        // console.log("Modified Metadata",modifiedMetadata);
        console.log("Uploading To IPFS");

        uploadJSONToIPFS(modifiedMetadata).then((res)=>{
            console.log("This is the response",res.pinataURL);
            if(res.pinataURL == ''){
                console.log("Code alert red");
            }
            const modifiedURI = res.pinataURL;
            const provider = new ethers.providers.Web3Provider(window.ethereum);

            const signerLender = provider.getSigner();
            //Initializing a new contract instance
            const EscrowContract = new ethers.Contract(EscrowAddress,EscrowABI,signerLender);
            //Calling smart contract
            EscrowContract.listForRent(props.data.contractAddress,props.data.tokenId,rentDuration,props.originalTokenURI,modifiedURI,convertedRentPrice).then((res)=>{
                console.log("this is the contract response",res);
                console.log("NFT succesfully rented");
                updateNotification({
                    id: 'load-data',
                    color: 'teal',
                    title: 'Successfully Listed',
                    message: `Your NFT has been listed for renting`,
                    icon: <IconCheck size={16} />,
                    autoClose: 2500,
                });
                setTimeout(()=>{
                    // window.location.reload(false); 

                },3000);

            }).catch(e=>{
                console.log("ERROR: ",e)
            });

        

        }).catch((e)=>{
            console.log("Error: ",e);
        });

   }

    return(                            
    <div className="modalbtnCombined">

        <div className="modalbtn1">
            <button onClick={CallForApprove}  style={{cursor:`${Approved}?not-allowed:pointer`}}>Approve</button>
        </div>
        
        <div className="modalbtn2">
            <button onClick={ListNFT}>Confirm</button>

        </div>


    </div>


    )

    
}