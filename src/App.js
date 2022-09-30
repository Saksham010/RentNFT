import './App.css';
import {ethers} from "ethers";
import {useState} from "react";
import Authentication from './components/authentication/authentication';
import Navbar from "./components/navbar/navbar";
import Profile from './components/profile/profile';
import {Route, Routes} from "react-router-dom"; 
import HomePage from './components/homepage.js/homepage';
import {useCookies} from "react-cookie";
import UserContext from "./components/context/context";
import "./App.css";

function App() {

  //Cookie to temporarily store data
  const [cookies,setCookie,removeCookie] = useCookies(['SignerData']);
  

  //Sign in data
  const[walletSigner,setWalletSigner] = useState({});
  const[userData, setUserData] = useState({
    address:'',
    balance:Number(''),
    chainId:'',
    signedMessage:'',
  });

  console.log("Signer chaliracha",walletSigner);
  //Paths

  return (
    <div className="App">
      <UserContext.Provider value={{cookies:cookies, setCookie:setCookie,removeCookie:removeCookie }}>

        <Routes>

          <Route path='/' element={<HomePage/>} />        
          <Route path='/connect' element={<Authentication userData={userData} setData={setUserData} setWalletSigner={setWalletSigner}/>} />        
          <Route path='/profile' element={<Profile userData={userData} walletSigner={walletSigner}/>}/>

        </Routes>
      </UserContext.Provider>

    

    </div>
  );
}

export default App;
