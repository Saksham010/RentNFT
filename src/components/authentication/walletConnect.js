import React from "react";
import walletConnectIcon from "../walletConnect.svg";
// import WalletConnect from "@walletconnect/client";
// import QRCodeModal from "@walletconnect/qrcode-modal";

export default function WallectConnect(){

    function connectToWalletConnect(){
        alert("Left to implement, Buffer error");
    }

    return(
        <>
            <button className="login-button" id="walletConnect" onClick={connectToWalletConnect}>
                <img src={walletConnectIcon}/>
                <h3><span>WalletConnect</span></h3>
            </button>
        </>
    )

}