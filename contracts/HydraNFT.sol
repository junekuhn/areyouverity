// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title HydraNFT
 * @dev ERC721 NFT contract for minting Hydra visual art
 */
contract HydraNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    // Mapping from token ID to image data URI (for local storage)
    mapping(uint256 => string) private _tokenImages;

    // Price to mint an NFT (0.001 ETH on Sepolia)
    uint256 public mintPrice = 0.001 ether;

    event NFTMinted(address indexed minter, uint256 indexed tokenId, string imageData);

    constructor() ERC721("Hydra Visual Art", "HYDRA") Ownable(msg.sender) {}

    /**
     * @dev Mint a new NFT with metadata
     * @param to Address to mint the NFT to
     * @param metadataURI URI pointing to the metadata (IPFS or data URI)
     * @param imageData Base64 encoded image data for local storage
     */
    function mintNFT(
        address to,
        string memory metadataURI,
        string memory imageData
    ) public payable returns (uint256) {
        require(msg.value >= mintPrice, "Insufficient payment");

        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, metadataURI);
        _tokenImages[tokenId] = imageData;

        emit NFTMinted(to, tokenId, imageData);

        return tokenId;
    }

    /**
     * @dev Get the image data for a token
     */
    function getTokenImage(uint256 tokenId) public view returns (string memory) {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        return _tokenImages[tokenId];
    }

    /**
     * @dev Set the mint price (owner only)
     */
    function setMintPrice(uint256 newPrice) public onlyOwner {
        mintPrice = newPrice;
    }

    /**
     * @dev Withdraw contract balance (owner only)
     */
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        payable(owner()).transfer(balance);
    }

    // The following functions are overrides required by Solidity.
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
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
