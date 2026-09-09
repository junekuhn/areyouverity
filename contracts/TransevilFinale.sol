// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title TransevilFinale
 * @notice TRANSEVIL: Zero-knowledge constrained crypto-art
 *
 * This contract does NOT prove identity, medical facts, or bodily truth.
 * Zero-knowledge proofs are used poetically and ethically:
 * to enforce constraint without disclosure.
 *
 * What ZK proves:
 * - Artist: that a committed outcome exists and was selected (finale)
 * - Collectors: that a private ritual/encounter occurred (witnessing)
 *
 * What ZK does NOT prove:
 * - which outcome occurred
 * - whether surgery happened
 * - any biometric or identity data
 *
 * Trust is not eliminated. Trust is formalised without surveillance.
 */

interface IMerkleProofVerifier {
    function verifyProof(
        uint[2] calldata _pA,
        uint[2][2] calldata _pB,
        uint[2] calldata _pC,
        uint[1] calldata _pubSignals
    ) external view returns (bool);
}

interface IWitnessProofVerifier {
    // Public signals from witness_proof.circom, in snarkjs order
    // (outputs first): [nullifier, commitment, tokenId]
    function verifyProof(
        uint[2] calldata _pA,
        uint[2][2] calldata _pB,
        uint[2] calldata _pC,
        uint[3] calldata _pubSignals
    ) external view returns (bool);
}

contract TransevilFinale is ERC721, ERC721URIStorage, Ownable {
    using Strings for uint256;

    // ============ Constants ============

    uint256 public constant MAX_SUPPLY = 250;
    uint256 public constant RELIC_TOKEN_ID = 1000001;

    // ============ State ============

    string public baseURI;
    uint256 public totalMinted;

    // Mapping from token ID to image data URI (IPFS)
    mapping(uint256 => string) private _tokenImages;

    // Minting price
    uint256 public mintPrice = 0.001 ether;

    // Events
    event NFTMinted(address indexed minter, uint256 indexed tokenId, string imageData);

    // Artist finale: Merkle root of possible end-states
    uint256 public endStateRoot;
    bool public resolved;

    // Collector witnessing
    mapping(uint256 => bool) public witnessed;
    mapping(bytes32 => bool) public usedNullifiers;
    uint256 public witnessCount;

    // Verifier contracts
    IMerkleProofVerifier public merkleVerifier;
    IWitnessProofVerifier public witnessVerifier;

    // ============ Events ============

    /// @notice Artist has finalized the work
    event Finalized(uint256 timestamp);

    /// @notice A token has been witnessed
    event Witnessed(uint256 indexed tokenId, uint256 witnessCount);

    // Note: MetadataUpdate and BatchMetadataUpdate events are inherited from ERC721URIStorage

    // ============ Constructor ============

    constructor(
        string memory _name,
        string memory _symbol,
        string memory _baseURI,
        uint256 _endStateRoot,
        address _merkleVerifier,
        address _witnessVerifier
    ) ERC721(_name, _symbol) Ownable(msg.sender) {
        baseURI = _baseURI;
        endStateRoot = _endStateRoot;
        merkleVerifier = IMerkleProofVerifier(_merkleVerifier);
        witnessVerifier = IWitnessProofVerifier(_witnessVerifier);

        // Mint RELIC to contract (non-transferrable)
        _safeMint(address(this), RELIC_TOKEN_ID);
    }

    // ============ Minting ============

    /**
     * @notice Mint tokens to collectors (owner distribution path)
     * @dev Unpaid mints must stay owner-only or anyone could exhaust
     *      MAX_SUPPLY for free and starve the paid mintNFT path.
     * @param to Recipient address
     * @param amount Number of tokens to mint
     */
    function mint(address to, uint256 amount) external onlyOwner {
        require(totalMinted + amount <= MAX_SUPPLY, "Exceeds max supply");

        for (uint256 i = 0; i < amount; i++) {
            uint256 tokenId = totalMinted + 1;
            _safeMint(to, tokenId);
            totalMinted++;
        }
    }

    /**
     * @notice Mint NFT with metadata (for IPFS integration)
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
        require(totalMinted < MAX_SUPPLY, "Exceeds max supply");

        uint256 tokenId = totalMinted + 1;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, metadataURI);
        _tokenImages[tokenId] = imageData;
        totalMinted++;

        emit NFTMinted(to, tokenId, imageData);

        return tokenId;
    }

    /**
     * @notice Get the image data for a token
     */
    function getTokenImage(uint256 tokenId) public view returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return _tokenImages[tokenId];
    }

    /**
     * @notice Set the mint price (owner only)
     */
    function setMintPrice(uint256 newPrice) public onlyOwner {
        mintPrice = newPrice;
    }

    /**
     * @notice Withdraw contract balance (owner only)
     */
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdraw failed");
    }

    // ============ Artist Finale ============

    /**
     * @notice Finalize the work by proving knowledge of an end-state
     * @dev Verifies ZK proof of Merkle membership without revealing which leaf
     *
     * This proves: "I selected one outcome from a pre-committed set."
     * This does NOT prove: which outcome, or any bodily/medical fact.
     *
     * @param pA ZK proof component A
     * @param pB ZK proof component B
     * @param pC ZK proof component C
     * @param pubSignals Public signals [root]
     */
    function finalize(
        uint[2] calldata pA,
        uint[2][2] calldata pB,
        uint[2] calldata pC,
        uint[1] calldata pubSignals
    ) external onlyOwner {
        require(!resolved, "Already finalized");
        require(pubSignals[0] == endStateRoot, "Invalid root");

        bool isValid = merkleVerifier.verifyProof(pA, pB, pC, pubSignals);
        require(isValid, "Invalid proof");

        resolved = true;

        emit Finalized(block.timestamp);

        // EIP-4906: All token metadata has changed
        emit BatchMetadataUpdate(1, MAX_SUPPLY);

        // EIP-4906: Relic metadata has changed
        emit MetadataUpdate(RELIC_TOKEN_ID);
    }

    // ============ Collector Witnessing ============

    /**
     * @notice Submit a witness proof for a token
     * @dev Proves possession of a valid credential without revealing it
     *
     * This proves: "I personally encountered a sealed state under the system's rules."
     * This does NOT prove: what was witnessed, or any objective truth.
     *
     * @param tokenId Token being witnessed
     * @param pA ZK proof component A
     * @param pB ZK proof component B
     * @param pC ZK proof component C
     * @param pubSignals Public signals [nullifier, commitment, tokenId]
     */
    function submitWitness(
        uint256 tokenId,
        uint[2] calldata pA,
        uint[2][2] calldata pB,
        uint[2] calldata pC,
        uint[3] calldata pubSignals
    ) external {
        require(_ownerOf(tokenId) == msg.sender, "Not token owner");
        require(!witnessed[tokenId], "Already witnessed");
        require(pubSignals[2] == tokenId, "Invalid token ID");

        bytes32 nullifier = bytes32(pubSignals[0]);
        require(!usedNullifiers[nullifier], "Credential already used");

        // Verify the ZK proof
        bool isValid = witnessVerifier.verifyProof(pA, pB, pC, pubSignals);
        require(isValid, "Invalid proof");

        // Mark as witnessed and burn the credential's nullifier
        witnessed[tokenId] = true;
        usedNullifiers[nullifier] = true;
        witnessCount++;

        emit Witnessed(tokenId, witnessCount);

        // EIP-4906: Token metadata has changed
        emit MetadataUpdate(tokenId);

        // EIP-4906: Relic metadata evolves with each witness
        emit MetadataUpdate(RELIC_TOKEN_ID);
    }

    // ============ RELIC (Non-transferrable) ============

    /**
     * @notice Override transfer to make RELIC non-transferrable
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal virtual override returns (address) {
        if (tokenId == RELIC_TOKEN_ID) {
            require(
                to == address(this) || to == address(0),
                "RELIC is non-transferrable"
            );
        }
        return super._update(to, tokenId, auth);
    }

    // ============ Metadata ============

    /**
     * @notice Set base URI for metadata
     */
    function setBaseURI(string memory _baseURI) external onlyOwner {
        baseURI = _baseURI;
    }

    /**
     * @notice Get token URI (overrides both ERC721 and ERC721URIStorage)
     */
    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");

        // First try to get the URI from ERC721URIStorage (for IPFS minted tokens)
        string memory uri = super.tokenURI(tokenId);
        if (bytes(uri).length > 0) {
            return uri;
        }

        // Fall back to baseURI for regular minted tokens
        return
            bytes(baseURI).length > 0
                ? string(abi.encodePacked(baseURI, tokenId.toString(), ".json"))
                : "";
    }

    /**
     * @notice Get metadata for a token (for off-chain queries)
     */
    function getTokenMetadata(uint256 tokenId)
        external
        view
        returns (
            bool isWitnessed,
            bool isResolved,
            uint256 currentWitnessCount,
            bool isRelic
        )
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");

        return (
            witnessed[tokenId],
            resolved,
            witnessCount,
            tokenId == RELIC_TOKEN_ID
        );
    }

    // ============ ERC165 ============

    /**
     * @notice Check interface support (includes EIP-4906)
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return
            interfaceId == bytes4(0x49064906) || // EIP-4906
            super.supportsInterface(interfaceId);
    }
}
