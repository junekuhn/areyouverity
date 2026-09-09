// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title VerityIdentityNFT v2
 * @dev Enhanced NFT contract for "Are You Verity?" with proper state management
 *
 * New Features:
 * - Token state system (Affirmed, Denied, PureNO, Contradicted)
 * - Verity Registry (public list of all affirmed Veritys)
 * - Commitment tracking with cryptographic proofs
 * - Recognition system (Veritys can recognize other Veritys)
 * - Dynamic pricing based on token type
 * - State transition history
 */
contract VerityIdentityNFT is ERC721, ERC721URIStorage, Ownable {
    // Token states
    enum VerityState {
        Affirmed,      // Minted and affirmed being Verity
        Denied,        // Was affirmed, then denied (contradiction)
        PureNO,        // Minted explicitly as denial (never affirmed)
        Contradicted   // Multiple contradictory statements
    }

    // Token metadata structure
    struct TokenMetadata {
        VerityState state;
        uint256 createdAt;
        uint256 lastTransformed;
        uint256 affirmationCount;
        uint256 denialCount;
        string imageURI;
        string glitchedImageURI;
        bytes32 commitmentHash;
    }

    // Commitment proof structure
    struct CommitmentProof {
        bytes32 nullifier;
        bytes32 commitmentHash;
        uint256 timestamp;
        bool isAffirmation; // true = YES, false = NO
    }

    uint256 private _nextTokenId;

    // Pricing for different mint types
    uint256 public affirmationPrice = 0.05 ether;  // Standard Verity identity
    uint256 public denialPrice = 0.08 ether;       // Pure NO (rarer)

    // Token metadata mapping
    mapping(uint256 => TokenMetadata) public tokenMetadata;

    // Verity Registry - public list of all affirmed Veritys
    address[] public verityRegistry;
    mapping(address => bool) public isInVerityRegistry;
    mapping(address => uint256) public registryIndex;

    // Commitment tracking
    mapping(address => CommitmentProof[]) public commitments;
    mapping(bytes32 => bool) public usedNullifiers; // Prevent double-commitment

    // Recognition system - Veritys recognizing other Veritys
    mapping(address => address[]) public recognizes;     // Who I recognize
    mapping(address => address[]) public recognizedBy;   // Who recognizes me
    mapping(address => mapping(address => bool)) public hasRecognized;

    // Affirmation tracking
    mapping(address => bool) public hasAffirmedVerity;
    mapping(address => uint256) public affirmationCount;

    // Multiple tokens per address
    mapping(address => uint256[]) private _addressTokens;

    // Events
    event VerityIdentityCreated(
        address indexed minter,
        uint256 indexed tokenId,
        VerityState initialState,
        bytes32 commitmentHash
    );

    event StateTransformed(
        uint256 indexed tokenId,
        address indexed owner,
        VerityState oldState,
        VerityState newState,
        string reason,
        uint256 timestamp
    );

    event CommitmentSubmitted(
        address indexed submitter,
        bytes32 indexed nullifier,
        bytes32 commitmentHash,
        bool isAffirmation
    );

    event VerityAffirmed(address indexed affirmer, uint256 count);
    event VerityRecognized(address indexed recognizer, address indexed recognized);
    event AddedToRegistry(address indexed verity, uint256 position);
    event RemovedFromRegistry(address indexed verity);

    constructor() ERC721("Are You Verity?", "VERITY") Ownable(msg.sender) {}

    /**
     * @dev Mint Verity identity with affirmation (YES path)
     */
    function mintWithAffirmation(
        string memory metadataURI,
        string memory imageURI,
        bytes32 commitmentHash
    ) public payable returns (uint256) {
        require(msg.value >= affirmationPrice, "Insufficient payment");
        require(commitmentHash != bytes32(0), "Invalid commitment");

        uint256 tokenId = _createToken(
            metadataURI,
            imageURI,
            commitmentHash,
            VerityState.Affirmed
        );

        // Add to Verity Registry
        _addToVerityRegistry(msg.sender);

        return tokenId;
    }

    /**
     * @dev Mint explicit denial token (Pure NO path)
     */
    function mintWithDenial(
        string memory metadataURI,
        string memory imageURI,
        bytes32 commitmentHash
    ) public payable returns (uint256) {
        require(msg.value >= denialPrice, "Insufficient payment");
        require(commitmentHash != bytes32(0), "Invalid commitment");

        return _createToken(
            metadataURI,
            imageURI,
            commitmentHash,
            VerityState.PureNO
        );
    }

    /**
     * @dev Internal token creation
     */
    function _createToken(
        string memory metadataURI,
        string memory imageURI,
        bytes32 commitmentHash,
        VerityState initialState
    ) internal returns (uint256) {
        uint256 tokenId = _nextTokenId++;

        // Metadata must be written before _safeMint: _update() runs during
        // minting and reads tokenMetadata[tokenId].state to decide registry
        // membership. Writing it after would register every minter (including
        // deniers) as Verity, since the zero-default state is Affirmed.
        tokenMetadata[tokenId] = TokenMetadata({
            state: initialState,
            createdAt: block.timestamp,
            lastTransformed: block.timestamp,
            affirmationCount: initialState == VerityState.Affirmed ? 1 : 0,
            denialCount: initialState == VerityState.PureNO ? 1 : 0,
            imageURI: imageURI,
            glitchedImageURI: "",
            commitmentHash: commitmentHash
        });

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, metadataURI);

        emit VerityIdentityCreated(msg.sender, tokenId, initialState, commitmentHash);

        return tokenId;
    }

    /**
     * @dev Submit cryptographic commitment proof
     * @dev The transaction itself authenticates the submitter (msg.sender);
     *      an extra self-signed signature would add no security.
     * @param nullifier Unique nullifier (prevents double-commit)
     * @param commitmentHash Hash of the commitment
     * @param isAffirmation true for YES, false for NO
     */
    function submitCommitment(
        bytes32 nullifier,
        bytes32 commitmentHash,
        bool isAffirmation
    ) public {
        require(!usedNullifiers[nullifier], "Nullifier already used");
        require(balanceOf(msg.sender) > 0, "Must own Verity token");

        // Mark nullifier as used
        usedNullifiers[nullifier] = true;

        // Store commitment
        commitments[msg.sender].push(CommitmentProof({
            nullifier: nullifier,
            commitmentHash: commitmentHash,
            timestamp: block.timestamp,
            isAffirmation: isAffirmation
        }));

        // Update affirmation tracking
        if (isAffirmation) {
            if (!hasAffirmedVerity[msg.sender]) {
                hasAffirmedVerity[msg.sender] = true;
            }
            affirmationCount[msg.sender]++;

            emit VerityAffirmed(msg.sender, affirmationCount[msg.sender]);
        }

        emit CommitmentSubmitted(msg.sender, nullifier, commitmentHash, isAffirmation);
    }

    /**
     * @dev Transform token state (e.g., Affirmed -> Denied)
     * @param tokenId Token to transform
     * @param newGlitchedURI New glitched image URI
     * @param reason Reason for transformation
     */
    function transformToContradiction(
        uint256 tokenId,
        string memory newGlitchedURI,
        string memory reason
    ) public {
        require(ownerOf(tokenId) == msg.sender, "Not token owner");

        TokenMetadata storage meta = tokenMetadata[tokenId];
        VerityState oldState = meta.state;

        // Transform based on current state
        if (oldState == VerityState.Affirmed) {
            meta.state = VerityState.Denied;
            meta.denialCount++;
        } else if (oldState == VerityState.Denied) {
            meta.state = VerityState.Contradicted;
        }

        meta.glitchedImageURI = newGlitchedURI;
        meta.lastTransformed = block.timestamp;

        // Remove from Verity Registry only if no other affirmed token remains
        if (oldState == VerityState.Affirmed && !_holdsAffirmedToken(msg.sender)) {
            _removeFromVerityRegistry(msg.sender);
        }

        emit StateTransformed(tokenId, msg.sender, oldState, meta.state, reason, block.timestamp);
    }

    /**
     * @dev Recognize another address as Verity
     */
    function recognizeAsVerity(address otherVerity) public {
        require(balanceOf(msg.sender) > 0, "Must own Verity token");
        require(balanceOf(otherVerity) > 0, "They must own Verity token");
        require(!hasRecognized[msg.sender][otherVerity], "Already recognized");
        require(msg.sender != otherVerity, "Cannot recognize self");

        recognizes[msg.sender].push(otherVerity);
        recognizedBy[otherVerity].push(msg.sender);
        hasRecognized[msg.sender][otherVerity] = true;

        emit VerityRecognized(msg.sender, otherVerity);
    }

    /**
     * @dev Add address to Verity Registry
     */
    function _addToVerityRegistry(address verity) internal {
        if (!isInVerityRegistry[verity]) {
            uint256 position = verityRegistry.length;
            verityRegistry.push(verity);
            isInVerityRegistry[verity] = true;
            registryIndex[verity] = position;

            emit AddedToRegistry(verity, position);
        }
    }

    /**
     * @dev Remove address from Verity Registry
     */
    function _removeFromVerityRegistry(address verity) internal {
        if (isInVerityRegistry[verity]) {
            uint256 index = registryIndex[verity];
            uint256 lastIndex = verityRegistry.length - 1;

            // Swap with last element
            if (index != lastIndex) {
                address lastVerity = verityRegistry[lastIndex];
                verityRegistry[index] = lastVerity;
                registryIndex[lastVerity] = index;
            }

            verityRegistry.pop();
            isInVerityRegistry[verity] = false;

            emit RemovedFromRegistry(verity);
        }
    }

    /**
     * @dev Get Verity Registry (all affirmed Veritys)
     */
    function getVerityRegistry() public view returns (address[] memory) {
        return verityRegistry;
    }

    /**
     * @dev Get Verity count
     */
    function getVerityCount() public view returns (uint256) {
        return verityRegistry.length;
    }

    /**
     * @dev Get all commitments by an address
     */
    function getCommitments(address addr) public view returns (CommitmentProof[] memory) {
        return commitments[addr];
    }

    /**
     * @dev Get who an address recognizes
     */
    function getRecognizes(address addr) public view returns (address[] memory) {
        return recognizes[addr];
    }

    /**
     * @dev Get who recognizes an address
     */
    function getRecognizedBy(address addr) public view returns (address[] memory) {
        return recognizedBy[addr];
    }

    /**
     * @dev Get all tokens owned by address
     */
    function getTokensByAddress(address addr) public view returns (uint256[] memory) {
        return _addressTokens[addr];
    }

    /**
     * @dev Get token metadata
     */
    function getTokenMetadata(uint256 tokenId) public view returns (TokenMetadata memory) {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        return tokenMetadata[tokenId];
    }

    /**
     * @dev Check if address has valid affirmed identity
     */
    function isVerity(address addr) public view returns (bool) {
        return isInVerityRegistry[addr];
    }

    /**
     * @dev Set mint prices (owner only)
     */
    function setPrices(uint256 affirmPrice, uint256 denyPrice) public onlyOwner {
        affirmationPrice = affirmPrice;
        denialPrice = denyPrice;
    }

    /**
     * @dev Withdraw for FFS fundraising (owner only)
     */
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdraw failed");
    }

    /**
     * @dev Update token ownership tracking on transfer
     */
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721)
        returns (address)
    {
        address from = super._update(to, tokenId, auth);

        if (from != address(0) && from != to) {
            _removeAddressToken(from, tokenId);

            // Drop registry membership only when no affirmed token remains
            if (tokenMetadata[tokenId].state == VerityState.Affirmed && !_holdsAffirmedToken(from)) {
                _removeFromVerityRegistry(from);
            }
        }

        if (to != address(0) && to != from) {
            _addressTokens[to].push(tokenId);

            if (tokenMetadata[tokenId].state == VerityState.Affirmed) {
                _addToVerityRegistry(to);
            }
        }

        return from;
    }

    /**
     * @dev Remove a token from an address's tracked list
     */
    function _removeAddressToken(address addr, uint256 tokenId) internal {
        uint256[] storage tokens = _addressTokens[addr];
        for (uint256 i = 0; i < tokens.length; i++) {
            if (tokens[i] == tokenId) {
                tokens[i] = tokens[tokens.length - 1];
                tokens.pop();
                break;
            }
        }
    }

    /**
     * @dev Whether an address still holds at least one Affirmed token
     */
    function _holdsAffirmedToken(address addr) internal view returns (bool) {
        uint256[] storage tokens = _addressTokens[addr];
        for (uint256 i = 0; i < tokens.length; i++) {
            if (tokenMetadata[tokens[i]].state == VerityState.Affirmed) {
                return true;
            }
        }
        return false;
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
