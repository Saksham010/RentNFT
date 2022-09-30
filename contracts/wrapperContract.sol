//SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";


interface IREC{
    function settleRent(address _rmNftContractAddress, address _rmMainOwner,uint256 _rmtokenId) external;

}

contract Wrapper is  Ownable, ERC721URIStorage, ERC721Enumerable{

    uint256 private _tokenIds;
    address public rentContractAddress;
    address deployer;
    constructor() payable ERC721("SVGNFT","RNFT"){
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
    struct LenderInfo{
        uint256 wrappedTokenId;
        string wrappedTokenURI;
        address lender;
        address _nftContractAddress;
        uint256 originalTokenId;
        bool isRented;
    }

    mapping(address=>LenderInfo) lended; 

    function mintNFT(address borrower,string memory wrappedTokenURI,address lender,address _nftContractAddress,uint256 _tokenId) public{
        require(msg.sender == rentContractAddress, "Only the escrow contract mint wrapped tokens");

        //Minting and sending the NFT
        _tokenIds++;
        uint256 newItemId = _tokenIds;
        _safeMint(borrower,newItemId);
        _setTokenURI(newItemId,wrappedTokenURI);

        //Storing data
        lended[borrower] = LenderInfo(newItemId,wrappedTokenURI,lender,_nftContractAddress,_tokenId,true);
    }


    //Senario: If the owner forcefully gets back the NFT, and after some time the borrower returns the NFT
    // (Left to implement increases complexity)

    function returnNFT() public{
        require(lended[msg.sender].isRented == true, "You do not have wrapped tokens to rent");

        //Burining NFT
        _burn(lended[msg.sender].wrappedTokenId);

        //Cross Contract Call
        IREC rentContract = IREC(rentContractAddress); 
        rentContract.settleRent(lended[msg.sender]._nftContractAddress,lended[msg.sender].lender,lended[msg.sender].originalTokenId); //Cross Contract Call
        delete lended[msg.sender];

    }

}

