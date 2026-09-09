// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title VerityIdentityNFT
 * @dev NFT contract for "Are You Verity?" - A system exploring deception, trust, and trans identity
 *
 * This contract implements a trust-based identity system where:
 * - Multiple people can be "Verity"
 * - Identity is commitment-based, not biologically determined
 * - Denying your identity has permanent consequences
 * - ZK proofs verify identity without revealing data
 */
contract VerityIdentityNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    // Price to mint an NFT (for fundraising facial feminisation surgery)
    uint256 public mintPrice = 0.001 ether;

    // Identity commitment hash for each token (ZK proof commitment)
    mapping(uint256 => bytes32) private _identityCommitments;

    // Mapping from token ID to image data URI
    mapping(uint256 => string) private _tokenImages;

    // Track if a token has been invalidated (owner denied being Verity)
    mapping(uint256 => bool) public tokenInvalidated;

    // Track addresses that are permanently blocked (non-owners who denied being Verity)
    mapping(address => bool) public permanentlyBlocked;

    // Track addresses that have created a Verity identity
    mapping(address => bool) public hasVerityIdentity;

    // Multiple identity support: address can have multiple tokens
    mapping(address => uint256[]) private _addressTokens;

    event NFTMinted(address indexed minter, uint256 indexed tokenId, string imageData, bytes32 identityCommitment);
    event IdentityDenied(uint256 indexed tokenId, address indexed owner);
    event PermanentlyBlocked(address indexed account);
    event IdentityVerified(uint256 indexed tokenId, address indexed verifier);

    constructor() ERC721("Are You Verity?", "VERITY") Ownable(msg.sender) {}

    /**
     * @dev Create a Verity identity and mint NFT
     * @param metadataURI URI pointing to the metadata (IPFS or data URI)
     * @param imageData Base64 encoded image data (distorted facial imagery)
     * @param identityCommitment ZK proof commitment hash for the identity
     */
    function createVerityIdentity(
        string memory metadataURI,
        string memory imageData,
        bytes32 identityCommitment
    ) public payable returns (uint256) {
        require(!permanentlyBlocked[msg.sender], "You are permanently blocked from becoming Verity");
        require(msg.value >= mintPrice, "Insufficient payment");
        require(identityCommitment != bytes32(0), "Invalid identity commitment");

        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, metadataURI);
        _tokenImages[tokenId] = imageData;
        _identityCommitments[tokenId] = identityCommitment;
        _addressTokens[msg.sender].push(tokenId);

        hasVerityIdentity[msg.sender] = true;

        emit NFTMinted(msg.sender, tokenId, imageData, identityCommitment);

        return tokenId;
    }

    /**
     * @dev Verify a Verity identity using ZK proof
     * @param tokenId The token ID to verify
     * @param proof The ZK proof data
     * @return bool indicating if verification succeeded
     */
    function verifyVerityIdentity(
        uint256 tokenId,
        bytes32 proof
    ) public view returns (bool) {
        require(!tokenInvalidated[tokenId], "This identity has been invalidated");
        require(ownerOf(tokenId) != address(0), "Token does not exist");

        // In a full implementation, this would verify a proper ZK proof
        // For now, we verify that the proof matches the commitment
        bytes32 commitment = _identityCommitments[tokenId];

        // Simple verification: proof should be derived from commitment
        // In production, use proper ZK proof verification (Groth16, PLONK, etc.)
        return keccak256(abi.encodePacked(proof)) == commitment;
    }

    /**
     * @dev Owner denies being Verity - permanently invalidates the token
     * Can only be called by token owner
     */
    function denyBeingVerity(uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender, "You don't own this token");
        require(!tokenInvalidated[tokenId], "Token already invalidated");

        tokenInvalidated[tokenId] = true;

        emit IdentityDenied(tokenId, msg.sender);
    }

    /**
     * @dev Non-owner denies being Verity - permanently blocked from ever becoming Verity
     * This is the consequence of saying "I am not Verity" when you don't own the identity
     */
    function permanentlyBlockSelf() public {
        require(!hasVerityIdentity[msg.sender], "You already have a Verity identity");

        permanentlyBlocked[msg.sender] = true;

        emit PermanentlyBlocked(msg.sender);
    }

    /**
     * @dev Check if an address owns any valid (non-invalidated) Verity tokens
     */
    function isVerity(address account) public view returns (bool) {
        uint256[] memory tokens = _addressTokens[account];

        for (uint256 i = 0; i < tokens.length; i++) {
            uint256 tokenId = tokens[i];
            if (ownerOf(tokenId) == account && !tokenInvalidated[tokenId]) {
                return true;
            }
        }

        return false;
    }

    /**
     * @dev Get all tokens owned by an address
     */
    function getTokensByAddress(address account) public view returns (uint256[] memory) {
        return _addressTokens[account];
    }

    /**
     * @dev Get the identity commitment for a token
     */
    function getIdentityCommitment(uint256 tokenId) public view returns (bytes32) {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        return _identityCommitments[tokenId];
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
     * @dev Withdraw contract balance for FFS fundraising (owner only)
     */
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        payable(owner()).transfer(balance);
    }

    /**
     * @dev Override transfer to update token ownership tracking
     */
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721)
        returns (address)
    {
        address from = super._update(to, tokenId, auth);

        // Update the _addressTokens mapping
        if (to != address(0) && to != from) {
            _addressTokens[to].push(tokenId);
            hasVerityIdentity[to] = true;
        }

        return from;
    }

    // Required overrides
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
