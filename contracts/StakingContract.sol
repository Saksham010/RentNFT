//SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol"; //Reciver implementation

contract Escrow is IERC721Receiver{

    // address public NFTContract;
    IERC721 public parentNFT;

    constructor (address clientContractAddress) payable{
        // NFTContract = clientContractAddress;
        parentNFT = IERC721(clientContractAddress);
    } 

    function deposit() payable public returns(bool){
        return true;
    } 

    struct Stake{
        uint256 tokenId;
        // uint256 amount;
        uint256 timestamp;
        uint256 timeToStakeFor;//Time till the nft has to be staked
    }
    //Address of the owner/staker of the NFT who wants to stake
    mapping(address=> Stake) public stakes;

    //For storing data from which contract the NFT is being escrowed
    struct escrowDetail{
        address _fromContractAddress;
        uint256 _tokenId;
        address trueOwner; //Time till the nft has to be staked
    }
    uint256 counter=0;
    mapping(uint256=>escrowDetail) ReceivedDetails;


    // mapping(address=>uint256) public stakingTime; //Time till the nft has to be staked

    //Function to stake 
    function stake(uint256 _tokenId, uint256 time) public {
        //Updating the stakers list
        stakes[msg.sender] = Stake(_tokenId,block.timestamp, time);   

        //Cross Contract call to transfer NFT from the parentNFT contract to this contract
        parentNFT.safeTransferFrom(msg.sender,address(this),_tokenId);
    }

    //Function to unstake
    function unstake(uint256 _tokenId) public{
        //Transferring back to the owner
        uint256 stakedTime = block.timestamp - stakes[msg.sender].timestamp;
        // require(stakedTime >= stakes[msg.sender].timeToStakeFor,"You cannot withdaw the NFT until the renting period has ended");

        parentNFT.safeTransferFrom(address(this),msg.sender,_tokenId);
        //If the renting period has ended then transfer the NFT back to the owner

        //Deleting stakes
        delete stakes[msg.sender];

    }

    //Event when NFT is received
    event NFTReceived(address indexed operator, address indexed from, uint256 indexed _tokenId);

    function onERC721Received(address operator,address from,uint256 _tokenId,bytes memory data) public virtual override returns (bytes4) {
        counter++;
        //Saving Details 
        ReceivedDetails[counter] = escrowDetail(from,_tokenId,operator); 
        //Emitting Data
        emit NFTReceived(operator,from,_tokenId);
        return this.onERC721Received.selector;
    }
}

