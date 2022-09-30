//SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol"; //Reciver implementation

// 1st import as follows
import "hardhat/console.sol";

interface IMINTER{
    function mintNFT(address borrower,string memory wrappedTokenURI,address lender,address _nftContractAddress,uint256 _tokenId) external;
}

contract Escrow is IERC721Receiver{
    //Escrow contract address
    // address payable EscrowAddress = payable(address(this));

    //Interface for making a call to wrapped minter
    IMINTER public _wrappedTokenMinter;
    address minterAddress;

    address deployer;

    constructor (address _wrappedMinterAddress) payable{
        minterAddress = _wrappedMinterAddress;
        _wrappedTokenMinter = IMINTER(_wrappedMinterAddress);
        deployer = msg.sender;
    } 

    function deposit() payable public returns(bool){
        return true;
    } 

    function setMinterAddress(address _addr) public {
        require(msg.sender==deployer,"Only owner can call this function");
        minterAddress = _addr;
    }


    //Structure
    struct Staker{
        address nftContractAddress;
        uint256 nftTokenId;
        uint256 timestamp;
        string tokenURI;
        string wrappedTokenURI;
        uint256 cost;
        uint256 rentingTimeinSecond;
    }

    mapping(address => Staker[]) public StakeInfo;

    //Function to get all nft listing of the caller
    function getNftListedData() public view returns(Staker[] memory){
        return StakeInfo[msg.sender];
    } 

    //Get the no of items listed
    function getnftListedNo() public view returns(uint){
        return StakeInfo[msg.sender].length;
    }

    //Mapping : Contract Address -> tokenId -> previousOwner
    mapping(address=>mapping(uint256=>address)) originalOwnerTracker;
   

    //Function to stake 
    function listForRent(address _nftContractAddress,uint256 _tokenId, uint256 _time, string memory _tokenURI, string memory _modifiedTokenUri, uint256 price) public {
        //Define interface for contract to do a cross contract call
        IERC721 ContractName;
        ContractName = IERC721(_nftContractAddress); 

        //Cross Contract call to transfer NFT from the parentNFT contract to this contract
        ContractName.safeTransferFrom(msg.sender,address(this),_tokenId);

        //Recording the user
        Staker memory information = Staker(_nftContractAddress,_tokenId,block.timestamp,_tokenURI,_modifiedTokenUri,price,_time);
        StakeInfo[msg.sender].push(information);
        //Trackeing the original owner
        originalOwnerTracker[_nftContractAddress][_tokenId] = msg.sender;


    }

    struct Borrower{
        address borrowerAddress;
        uint256 timestamp;
        address borrowedNFTContract;
        uint256 borrowedTokenId;
        bool lendStatus;
    }
    mapping(address=>Borrower[]) public LenderToBorrower;

    //Get address -> Stake[] -> index
    function getStakedIndex(address mainOwner, address nftContract, uint256 tokenId) public view returns(uint256 index){
        for(uint i =0; i < StakeInfo[mainOwner].length; i++){
            if(StakeInfo[mainOwner][i].nftContractAddress == nftContract && StakeInfo[mainOwner][i].nftTokenId == tokenId){
                return i;
            }
        }

    }

    //Get address-> Borrower[] -> index
    function getBorrowedIndex(address mainOwner, address nftContract, uint256 tokenId) public view returns(uint256 index){
        for(uint i=0; i < LenderToBorrower[mainOwner].length; i++){
            if(LenderToBorrower[mainOwner][i].borrowedNFTContract == nftContract && LenderToBorrower[mainOwner][i].borrowedTokenId == tokenId){
                return i;
            }
        }

    }

    function acceptRent(address _nftContractAddress, uint256 _tokenId) payable public{

        address mainOwner = originalOwnerTracker[_nftContractAddress][_tokenId];
    
        // uint256 StakerIndex = getStakedIndex(mainOwner, _nftContractAddress, _tokenId);
        uint256 StakerIndex = 0;

        console.log(StakerIndex, "This is staker index");

        uint256 agreedPrice = StakeInfo[mainOwner][StakerIndex].cost;

        //Checking if the owner is accepting the rent
        require(mainOwner != msg.sender,"The lender and the borrower cannot be the same");

        //Checking if the borrower has sent enough ETH or not
        require(msg.value >= agreedPrice, "Not enough ethers to accept the rent");

        //CrossContract Call to the wrapped Minter Contract
        string memory wrappedURI = StakeInfo[mainOwner][StakerIndex].wrappedTokenURI;
        _wrappedTokenMinter.mintNFT(msg.sender,wrappedURI ,mainOwner,_nftContractAddress,_tokenId); //Will be modified per need
        
        LenderToBorrower[mainOwner].push(Borrower(msg.sender, block.timestamp,_nftContractAddress,_tokenId,true)); //Registering lender to borrower

    }

    //Check for blocktimestamp
    function getTimeDifference(address _ownerAddress, address nftContract, uint256 tokenId) public view returns(uint256){
        uint256 BorrowerIndex = getBorrowedIndex(_ownerAddress, nftContract, tokenId);

        return block.timestamp - LenderToBorrower[_ownerAddress][BorrowerIndex].timestamp;
    }



    //Renting Over
    function settleRent(address _rmNftContractAddress, address _rmMainOwner,uint256 _rmtokenId) public {
        uint256 BorrowerIndex = getBorrowedIndex(_rmMainOwner, _rmNftContractAddress, _rmtokenId);
        //Ensure if the caller is the minterContract
        require((msg.sender == minterAddress) || (LenderToBorrower[msg.sender][BorrowerIndex].lendStatus == true), "Only the minting contract or the lender can call the method");
        require(LenderToBorrower[_rmMainOwner][BorrowerIndex].timestamp < block.timestamp,"Cant call without borrowing"); 

        uint256 currentStamp = block.timestamp;
        uint256 difference = currentStamp - LenderToBorrower[_rmMainOwner][BorrowerIndex].timestamp; 

        uint StakeInfoIndex =  getStakedIndex(_rmMainOwner, _rmNftContractAddress, _rmtokenId);
        require(StakeInfo[_rmMainOwner][StakeInfoIndex].rentingTimeinSecond <= difference, "You cant withdraw before the agreed rental time period"); //Issue


        IERC721 ContractName;
        ContractName = IERC721(_rmNftContractAddress);
        //Returing NFT back to the user
        ContractName.safeTransferFrom(address(this),_rmMainOwner,_rmtokenId); 

        //Paying lender money
        uint256 amount =  StakeInfo[_rmMainOwner][StakeInfoIndex].cost;
    
        payable(_rmMainOwner).transfer(amount);  //Transferring token from the smartcontract to the lender

        //Deleting data
        delete StakeInfo[_rmMainOwner][StakeInfoIndex];
        delete LenderToBorrower[_rmMainOwner][BorrowerIndex];
        delete originalOwnerTracker[_rmNftContractAddress][_rmtokenId];
    }

    //Event when NFT is received
    event NFTReceived(address indexed operator, address indexed from, uint256 indexed _tokenId);

    function onERC721Received(address operator,address from,uint256 _tokenId,bytes memory data) public virtual override returns (bytes4) {

        //Emitting Data
        emit NFTReceived(operator,from,_tokenId);
        return this.onERC721Received.selector;
    }
}

