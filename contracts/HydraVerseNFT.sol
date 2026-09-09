// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title HydraVerseNFT
 * @dev ERC721 NFT contract for minting Hydra visual art - Verse compatible
 */
contract HydraVerseNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    // Minting manager address (for Verse integration)
    address public mintingManager;

    // Mapping from token ID to image data URI
    mapping(uint256 => string) private _tokenImages;

    // Price to mint an NFT
    uint256 public mintPrice = 0.001 ether;

    event NFTMinted(address indexed minter, uint256 indexed tokenId, string imageData);
    event MintingManagerUpdated(address indexed oldManager, address indexed newManager);

    modifier onlyMinter() {
        require(
            msg.sender == mintingManager || msg.sender == owner(),
            "Only minting manager or owner can mint"
        );
        _;
    }

    constructor() ERC721("Hydra Verse Art", "HYDRAV") Ownable(msg.sender) {
        // Initially set owner as minting manager
        mintingManager = msg.sender;
    }

    /**
     * @dev Set the minting manager (Verse wallet address)
     */
    function setMintingManager(address _mintingManager) external onlyOwner {
        address oldManager = mintingManager;
        mintingManager = _mintingManager;
        emit MintingManagerUpdated(oldManager, _mintingManager);
    }

    /**
     * @dev Mint a single NFT (Verse-compatible interface)
     * @param to Address to mint the NFT to
     * @param tokenId Token ID to mint
     */
    function mint(address to, uint256 tokenId) external onlyMinter {
        _safeMint(to, tokenId);
    }

    /**
     * @dev Mint batch NFTs (Verse-compatible interface)
     * @param to Array of addresses to mint NFTs to
     * @param tokenIds Array of token IDs to mint
     */
    function mintBatch(
        address[] memory to,
        uint256[] memory tokenIds
    ) external onlyMinter {
        require(to.length == tokenIds.length, "Arrays length mismatch");
        for (uint256 i = 0; i < to.length; i++) {
            _safeMint(to[i], tokenIds[i]);
        }
    }

    /**
     * @dev Mint NFT with metadata (public minting)
     * @param to Address to mint the NFT to
     * @param metadataURI URI pointing to the metadata (IPFS)
     * @param imageData IPFS URI for image
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
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
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
