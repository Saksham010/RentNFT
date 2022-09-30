import { type } from "@testing-library/user-event/dist/type";
import { BigNumber, ethers } from "ethers";
import EscrowABI from "../EscrowABI.json";
import { IconCheck } from '@tabler/icons';
import { showNotification, updateNotification } from "@mantine/notifications";
import { useNavigate } from "react-router-dom";

export default function ConfirmButton(props){
    // const EscrowAddress = '0x6400C98904E930021CAe2f7F45C7736bF19FaBaC';
    // const EscrowAddress = "0x97Cee8176B3A1F6097101fd7CD2f3AfBf8716463";


    // const EscrowAddress = "0xB014C5E5793De674dF1b9D8Da3645EDC14d3e866";
    // const Wrapper = "0xf0BBDaF9D0D24d26BaB64A8d6F5Ee1553472bAC9";


    // const Wrapper= "0x602d8F38cd04e39a5A1B5d3f45089bE7F8035898";
    // const EscrowAddress = "0xBC266ef1f2bf8aE5B2f16bf26ca9BE4622782467";


    // const EscrowAddress = "0xE00c565819F0b5A7f62CAC472371E0707eED6E0f";
    // const Wrapper = "0xe2F0f2ff0e58031cfbA9883dBFe838BDcc48b25E";

            

    const EscrowAddress = "0xd2d0BCF1032177524Ada4656879016cc8F5D948b";
    const Wrapper = "0x4474b062D70782BB14440EfdC8acebb286a5472a";
        


    const navigate = useNavigate();

    console.log("TOKEN URI: ",props.tokenURI);

    function acceptRent(){
        // console.log(props);
        showNotification({
            id: 'load-data',
            loading: true,
            title: 'Generation wrapped NFT',
            message: 'Waiting for you to confirm transaction 🤥',
            autoClose: false,
            disallowClose: true,
        });
        let price = Number(props.amount)* 1000000000000000000;
        let finalConvertedPrice = price.toString();
        console.log(finalConvertedPrice);

        const options = {value: finalConvertedPrice};

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        let contract = new ethers.Contract(EscrowAddress,EscrowABI, signer);
        

        //Calling the contract
        contract.acceptRent(props.contractAddress,props.tokenId,props.tokenURI,props.rentingTime,options).then((transaction)=>{
            console.log("Rent accepted, Transaction: ",transaction);
            updateNotification({
                id: 'load-data',
                color: 'teal',
                title: 'Successfully Borrowed',
                message: `Wrapped NFT successfully generated and distributed`,
                icon: <IconCheck size={16} />,
                autoClose: 2000,
            });
            setTimeout(() => {
                navigate('/profile');
                
            }, 2000);

        }).catch((e)=>{
            console.log("Error occured: ",e);
        });


    }

    return(
        <div className="confirm-btn">
            <button onClick={acceptRent} >Confirm</button>
        </div>
    )
}