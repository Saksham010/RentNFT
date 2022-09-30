//SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

interface IREC{
    function settleRent(address _rmNftContractAddress, address _rmMainOwner,uint256 _rmtokenId) external;

}


contract WrapperContract is  Ownable, ERC721URIStorage, ERC721Enumerable{

    uint256 private _tokenIds;
    address public rentContractAddress;
    address deployer;
    constructor() payable ERC721("Wrapper","RWRP"){
        // rentContractAddress = EscrowAddress;
        deployer = msg.sender;
    }

    function deposit() payable public returns(bool){
        return true;
    }

    function setRentContract(address _rentAddress)public{
        require(msg.sender == deployer,"Only the owner can set the rent contract Address");
        rentContractAddress = _rentAddress;
    }

    //Override
        function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    //Main minting contract


    //Function to generate hash
    // function generateHash(address owner, address _nftContractAddress, uint256 _tokenId) public returns(uint256){

    //     //Generating a hash
    //     bytes32 senderHash = keccak256(abi.encodePacked(owner));
    //     bytes32 contractHash  = keccak256(abi.encodePacked(_nftContractAddress));
    //     bytes32 idHash = keccak256(abi.encodePacked(_tokenId));
    //     uint256 combinedHash = uint256(senderHash) + uint256(contractHash) + uint256(idHash);

    //     return combinedHash;
    // }
    

    struct LenderInfo{
        uint256 wrappedTokenId;
        string wrappedTokenURI;
        address lender;
        address _nftContractAddress;
        uint256 originalTokenId;
        bool isRented;
    }

    // mapping(uint256=>LenderInfo) lended; 

    mapping(address => LenderInfo[]) lended;

    function mintNFT(address borrower,string memory wrappedTokenURI,address lender,address _nftContractAddress,uint256 _tokenId) external{
        require(msg.sender == rentContractAddress, "Only the escrow contract mint wrapped tokens");

        //Minting and sending the NFT
        _tokenIds++;
        uint256 newItemId = _tokenIds;
        _safeMint(borrower,newItemId);
        _setTokenURI(newItemId,wrappedTokenURI);

        // uint256 combinedHash = generateHash(borrower, _nftContractAddress, _tokenId);

        //Storing data
        lended[borrower].push(LenderInfo(newItemId,wrappedTokenURI,lender,_nftContractAddress,_tokenId,true));
    }


    //Senario: If the owner forcefully gets back the NFT, and after some time the borrower returns the NFT
    // (Left to implement increases complexity)

    function getLenderIndex(address borrower, uint256 tokenId)public returns(uint){

        for(uint256 i =0; i < lended[borrower].length;i++){
            if(lended[borrower][i].wrappedTokenId == tokenId){ //WrappedToken ID 
                return i;
            } 

        }

    }

    function returnNFT(address _nftContractAddress, uint256 _tokenId) public{
        // uint256 combinedHash = generateHash(msg.sender, _nftContractAddress, _tokenId);
        uint LenderIndex = getLenderIndex(msg.sender,_tokenId); //Wrapped token id
        require(lended[msg.sender][LenderIndex].isRented == true, "You do not have wrapped tokens to rent");

        //Burining NFT
        _burn(lended[msg.sender][LenderIndex].wrappedTokenId);

        //Cross Contract Call
        IREC rentContract = IREC(rentContractAddress); 
        rentContract.settleRent(lended[msg.sender][LenderIndex]._nftContractAddress,lended[msg.sender][LenderIndex].lender,lended[msg.sender][LenderIndex].originalTokenId); //Cross Contract Call
        delete lended[msg.sender][LenderIndex];

    }

}

