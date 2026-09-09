// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title VerityIdentityNFT v3 - Social Mechanics Edition
 * @dev Enhanced NFT contract with game mechanics
 *
 * New Social Features:
 * - Witness Protocol: 3 witnesses per identity
 * - Challenge System: Stake ETH to challenge others
 * - Reputation System: Earn/lose reputation based on actions
 * - Public Events Feed: All actions broadcast for social layer
 */
contract VerityIdentityNFT is ERC721, ERC721URIStorage, Ownable {
    // Token states
    enum VerityState {
        Affirmed,      // Minted and affirmed being Verity
        Denied,        // Was affirmed, then denied (contradiction)
        PureNO,        // Minted explicitly as denial (never affirmed)
        Contradicted   // Multiple contradictory statements
    }

    // Challenge states
    enum ChallengeState {
        Active,
        Accepted,
        Rejected,
        Expired
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
        address[3] witnesses;      // NEW: 3 witnesses
        uint256 witnessCount;      // NEW: How many witnesses signed
    }

    // Reputation structure
    struct Reputation {
        int256 score;              // Can be negative
        uint256 successfulChallenges;
        uint256 failedChallenges;
        uint256 timesContradicted;
        uint256 witnessedCorrectly;
        uint256 witnessedIncorrectly;
        uint256 lastUpdate;
    }

    // Challenge structure
    struct Challenge {
        uint256 challengeId;
        address challenger;
        address challenged;
        uint256 tokenId;
        uint256 stake;
        ChallengeState state;
        uint256 createdAt;
        uint256 expiresAt;
        string reason;
        bool challengerClaimed;
    }

    uint256 private _nextTokenId;
    uint256 private _nextChallengeId;

    // Pricing
    uint256 public affirmationPrice = 0.05 ether;
    uint256 public denialPrice = 0.08 ether;
    uint256 public minimumChallengeStake = 0.01 ether;
    uint256 public challengeDuration = 7 days;

    // Token metadata mapping
    mapping(uint256 => TokenMetadata) public tokenMetadata;

    // Verity Registry
    address[] public verityRegistry;
    mapping(address => bool) public isInVerityRegistry;
    mapping(address => uint256) public registryIndex;

    // Commitment tracking
    mapping(address => bytes32[]) public commitmentHistory;
    mapping(bytes32 => bool) public usedNullifiers;

    // Recognition system
    mapping(address => address[]) public recognizes;
    mapping(address => address[]) public recognizedBy;
    mapping(address => mapping(address => bool)) public hasRecognized;

    // Multiple tokens per address
    mapping(address => uint256[]) private _addressTokens;

    // NEW: Reputation system
    mapping(address => Reputation) public reputations;

    // NEW: Challenge system
    mapping(uint256 => Challenge) public challenges;
    mapping(address => uint256[]) public addressChallenges;
    uint256[] public activeChallenges;

    // NEW: Witness tracking
    mapping(address => uint256[]) public witnessedTokens;
    mapping(uint256 => mapping(address => bool)) public hasWitnessed;

    // Stats for census
    uint256 public totalAffirmations;
    uint256 public totalDenials;
    uint256 public totalContradictions;
    uint256 public totalChallenges;

    // Events for social feed
    event VerityIdentityCreated(
        address indexed minter,
        uint256 indexed tokenId,
        VerityState initialState,
        bytes32 commitmentHash,
        address[3] witnesses,
        uint256 timestamp
    );

    event StateTransformed(
        uint256 indexed tokenId,
        address indexed owner,
        VerityState oldState,
        VerityState newState,
        string reason,
        uint256 timestamp
    );

    event WitnessAdded(
        uint256 indexed tokenId,
        address indexed witness,
        address indexed subject,
        uint256 timestamp
    );

    event ChallengeCreated(
        uint256 indexed challengeId,
        address indexed challenger,
        address indexed challenged,
        uint256 tokenId,
        uint256 stake,
        string reason,
        uint256 timestamp
    );

    event ChallengeResolved(
        uint256 indexed challengeId,
        address indexed winner,
        address indexed loser,
        bool challengeSuccessful,
        uint256 payout,
        uint256 timestamp
    );

    event ReputationChanged(
        address indexed user,
        int256 oldScore,
        int256 newScore,
        string reason,
        uint256 timestamp
    );

    event VerityRecognized(
        address indexed recognizer,
        address indexed recognized,
        uint256 timestamp
    );

    event AddedToRegistry(address indexed verity, uint256 position, uint256 timestamp);
    event RemovedFromRegistry(address indexed verity, uint256 timestamp);

    constructor() ERC721("Are You Verity?", "VERITY") Ownable(msg.sender) {}

    /**
     * @dev Mint Verity identity with affirmation and witnesses
     */
    function mintWithAffirmation(
        string memory metadataURI,
        string memory imageURI,
        bytes32 commitmentHash,
        address[3] memory witnesses
    ) public payable returns (uint256) {
        require(msg.value >= affirmationPrice, "Insufficient payment");
        require(commitmentHash != bytes32(0), "Invalid commitment");
        _validateWitnesses(witnesses);

        uint256 tokenId = _createToken(
            metadataURI,
            imageURI,
            commitmentHash,
            VerityState.Affirmed,
            witnesses
        );

        _addToVerityRegistry(msg.sender);
        totalAffirmations++;

        return tokenId;
    }

    /**
     * @dev Mint explicit denial token with witnesses
     */
    function mintWithDenial(
        string memory metadataURI,
        string memory imageURI,
        bytes32 commitmentHash,
        address[3] memory witnesses
    ) public payable returns (uint256) {
        require(msg.value >= denialPrice, "Insufficient payment");
        require(commitmentHash != bytes32(0), "Invalid commitment");
        _validateWitnesses(witnesses);

        uint256 tokenId = _createToken(
            metadataURI,
            imageURI,
            commitmentHash,
            VerityState.PureNO,
            witnesses
        );

        totalDenials++;
        return tokenId;
    }

    /**
     * @dev Internal token creation with witnesses
     */
    function _createToken(
        string memory metadataURI,
        string memory imageURI,
        bytes32 commitmentHash,
        VerityState initialState,
        address[3] memory witnesses
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
            commitmentHash: commitmentHash,
            witnesses: witnesses,
            witnessCount: 0
        });

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, metadataURI);

        commitmentHistory[msg.sender].push(commitmentHash);

        // Record witnesses
        for (uint i = 0; i < 3; i++) {
            if (witnesses[i] != address(0)) {
                witnessedTokens[witnesses[i]].push(tokenId);
                hasWitnessed[tokenId][witnesses[i]] = true;
                emit WitnessAdded(tokenId, witnesses[i], msg.sender, block.timestamp);
            }
        }

        emit VerityIdentityCreated(
            msg.sender,
            tokenId,
            initialState,
            commitmentHash,
            witnesses,
            block.timestamp
        );

        return tokenId;
    }

    /**
     * @dev Validate witnesses are not duplicates or self
     */
    function _validateWitnesses(address[3] memory witnesses) internal view {
        for (uint i = 0; i < 3; i++) {
            if (witnesses[i] != address(0)) {
                require(witnesses[i] != msg.sender, "Cannot witness self");

                // Check for duplicates
                for (uint j = i + 1; j < 3; j++) {
                    require(witnesses[i] != witnesses[j], "Duplicate witnesses");
                }
            }
        }
    }

    /**
     * @dev Witness signs/confirms their witnessing
     */
    function confirmWitness(uint256 tokenId) public {
        require(hasWitnessed[tokenId][msg.sender], "Not a witness for this token");

        TokenMetadata storage meta = tokenMetadata[tokenId];
        meta.witnessCount++;

        // Increase reputation for witnessing
        _changeReputation(msg.sender, 10, "Confirmed witness");
    }

    /**
     * @dev Create challenge against another identity
     */
    function createChallenge(
        address challenged,
        uint256 tokenId,
        string memory reason
    ) public payable returns (uint256) {
        require(msg.value >= minimumChallengeStake, "Insufficient stake");
        require(ownerOf(tokenId) == challenged, "Token owner mismatch");
        require(msg.sender != challenged, "Cannot challenge self");

        // Reputation must be above -50 to challenge
        require(reputations[msg.sender].score > -50, "Reputation too low to challenge");

        uint256 challengeId = _nextChallengeId++;

        challenges[challengeId] = Challenge({
            challengeId: challengeId,
            challenger: msg.sender,
            challenged: challenged,
            tokenId: tokenId,
            stake: msg.value,
            state: ChallengeState.Active,
            createdAt: block.timestamp,
            expiresAt: block.timestamp + challengeDuration,
            reason: reason,
            challengerClaimed: false
        });

        addressChallenges[msg.sender].push(challengeId);
        addressChallenges[challenged].push(challengeId);
        activeChallenges.push(challengeId);
        totalChallenges++;

        emit ChallengeCreated(
            challengeId,
            msg.sender,
            challenged,
            tokenId,
            msg.value,
            reason,
            block.timestamp
        );

        return challengeId;
    }

    /**
     * @dev Accept challenge and reveal commitment
     *
     * KNOWN LIMITATION: tokenMetadata is a public mapping, so commitmentHash
     * is world-readable and any defender can pass this check by reading it.
     * The mechanic is social theatre unless commitments are stored privately
     * (e.g. only a hash of a secret revealed via ZK proof). Do not deploy
     * this as an economic game without redesigning that.
     */
    function acceptChallenge(uint256 challengeId, bytes32 revealedCommitment) public {
        Challenge storage challenge = challenges[challengeId];
        require(challenge.state == ChallengeState.Active, "Challenge not active");
        require(msg.sender == challenge.challenged, "Not the challenged party");
        require(block.timestamp < challenge.expiresAt, "Challenge expired");

        TokenMetadata storage meta = tokenMetadata[challenge.tokenId];

        // Check if commitment matches
        bool commitmentMatches = (meta.commitmentHash == revealedCommitment);

        if (commitmentMatches) {
            // Challenge failed - defender wins
            challenge.state = ChallengeState.Rejected;
            _removeActiveChallenge(challengeId);

            // Defender is awarded the challenger's stake
            (bool paidDefender, ) = payable(challenge.challenged).call{value: challenge.stake}("");
            require(paidDefender, "Payout failed");

            // Update reputations
            _changeReputation(challenge.challenged, 50, "Successfully defended challenge");
            _changeReputation(challenge.challenger, -30, "Failed challenge");

            reputations[challenge.challenged].successfulChallenges++;
            reputations[challenge.challenger].failedChallenges++;

            emit ChallengeResolved(
                challengeId,
                challenge.challenged,
                challenge.challenger,
                false,
                challenge.stake,
                block.timestamp
            );
        } else {
            // Challenge succeeded - challenger wins
            challenge.state = ChallengeState.Accepted;
            _removeActiveChallenge(challengeId);

            // Challenger's stake is returned
            (bool paidChallenger, ) = payable(challenge.challenger).call{value: challenge.stake}("");
            require(paidChallenger, "Payout failed");

            // Transform token to contradicted
            _transformToContradicted(challenge.tokenId, "Challenge revealed contradiction");

            // Update reputations
            _changeReputation(challenge.challenger, 100, "Successful challenge");
            _changeReputation(challenge.challenged, -100, "Caught in contradiction");

            // Punish witnesses
            _punishWitnesses(challenge.tokenId);

            reputations[challenge.challenger].successfulChallenges++;
            reputations[challenge.challenged].timesContradicted++;

            emit ChallengeResolved(
                challengeId,
                challenge.challenger,
                challenge.challenged,
                true,
                challenge.stake,
                block.timestamp
            );
        }
    }

    /**
     * @dev Reclaim stake from a challenge the challenged party never answered.
     *      Without this, an ignored challenge would strand the stake forever.
     */
    function reclaimExpiredChallenge(uint256 challengeId) public {
        Challenge storage challenge = challenges[challengeId];
        require(challenge.state == ChallengeState.Active, "Challenge not active");
        require(block.timestamp >= challenge.expiresAt, "Challenge not yet expired");
        require(msg.sender == challenge.challenger, "Not the challenger");
        require(!challenge.challengerClaimed, "Already claimed");

        challenge.state = ChallengeState.Expired;
        challenge.challengerClaimed = true;
        _removeActiveChallenge(challengeId);

        // Ignoring a challenge counts against the challenged party
        _changeReputation(challenge.challenged, -25, "Ignored challenge");

        (bool refunded, ) = payable(challenge.challenger).call{value: challenge.stake}("");
        require(refunded, "Refund failed");

        emit ChallengeResolved(
            challengeId,
            challenge.challenger,
            challenge.challenged,
            false,
            challenge.stake,
            block.timestamp
        );
    }

    /**
     * @dev Remove a challenge from the active list
     */
    function _removeActiveChallenge(uint256 challengeId) internal {
        for (uint256 i = 0; i < activeChallenges.length; i++) {
            if (activeChallenges[i] == challengeId) {
                activeChallenges[i] = activeChallenges[activeChallenges.length - 1];
                activeChallenges.pop();
                break;
            }
        }
    }

    /**
     * @dev Transform token to contradicted state
     */
    function _transformToContradicted(uint256 tokenId, string memory reason) internal {
        TokenMetadata storage meta = tokenMetadata[tokenId];
        VerityState oldState = meta.state;

        if (oldState == VerityState.Affirmed) {
            meta.state = VerityState.Denied;
            address tokenOwner = ownerOf(tokenId);
            if (!_holdsAffirmedToken(tokenOwner)) {
                _removeFromVerityRegistry(tokenOwner);
            }
        } else if (oldState == VerityState.Denied) {
            meta.state = VerityState.Contradicted;
        }

        meta.lastTransformed = block.timestamp;
        totalContradictions++;

        emit StateTransformed(
            tokenId,
            ownerOf(tokenId),
            oldState,
            meta.state,
            reason,
            block.timestamp
        );
    }

    /**
     * @dev Punish witnesses when contradiction revealed
     */
    function _punishWitnesses(uint256 tokenId) internal {
        TokenMetadata storage meta = tokenMetadata[tokenId];

        for (uint i = 0; i < 3; i++) {
            if (meta.witnesses[i] != address(0)) {
                _changeReputation(meta.witnesses[i], -20, "Witnessed contradiction");
                reputations[meta.witnesses[i]].witnessedIncorrectly++;
            }
        }
    }

    /**
     * @dev Change reputation with event
     */
    function _changeReputation(address user, int256 change, string memory reason) internal {
        Reputation storage rep = reputations[user];
        int256 oldScore = rep.score;
        rep.score += change;
        rep.lastUpdate = block.timestamp;

        emit ReputationChanged(user, oldScore, rep.score, reason, block.timestamp);
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

        // Small reputation boost for both
        _changeReputation(msg.sender, 5, "Recognized another Verity");
        _changeReputation(otherVerity, 5, "Recognized by another Verity");

        emit VerityRecognized(msg.sender, otherVerity, block.timestamp);
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

            emit AddedToRegistry(verity, position, block.timestamp);
        }
    }

    /**
     * @dev Remove address from Verity Registry
     */
    function _removeFromVerityRegistry(address verity) internal {
        if (isInVerityRegistry[verity]) {
            uint256 index = registryIndex[verity];
            uint256 lastIndex = verityRegistry.length - 1;

            if (index != lastIndex) {
                address lastVerity = verityRegistry[lastIndex];
                verityRegistry[index] = lastVerity;
                registryIndex[lastVerity] = index;
            }

            verityRegistry.pop();
            isInVerityRegistry[verity] = false;

            emit RemovedFromRegistry(verity, block.timestamp);
        }
    }

    // View functions

    function getVerityRegistry() public view returns (address[] memory) {
        return verityRegistry;
    }

    function getVerityCount() public view returns (uint256) {
        return verityRegistry.length;
    }

    function getReputation(address user) public view returns (Reputation memory) {
        return reputations[user];
    }

    function getChallenge(uint256 challengeId) public view returns (Challenge memory) {
        return challenges[challengeId];
    }

    function getActiveChallenges() public view returns (uint256[] memory) {
        return activeChallenges;
    }

    function getUserChallenges(address user) public view returns (uint256[] memory) {
        return addressChallenges[user];
    }

    function getWitnessedTokens(address witness) public view returns (uint256[] memory) {
        return witnessedTokens[witness];
    }

    function getTokensByAddress(address addr) public view returns (uint256[] memory) {
        return _addressTokens[addr];
    }

    function getTokenMetadata(uint256 tokenId) public view returns (TokenMetadata memory) {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        return tokenMetadata[tokenId];
    }

    function getCensusStats() public view returns (
        uint256 affirmed,
        uint256 denied,
        uint256 contradicted,
        uint256 totalTokens,
        uint256 challengeCount
    ) {
        return (
            totalAffirmations,
            totalDenials,
            totalContradictions,
            _nextTokenId,
            totalChallenges
        );
    }

    function isVerity(address addr) public view returns (bool) {
        return isInVerityRegistry[addr];
    }

    function getRecognizes(address addr) public view returns (address[] memory) {
        return recognizes[addr];
    }

    function getRecognizedBy(address addr) public view returns (address[] memory) {
        return recognizedBy[addr];
    }

    // Admin functions

    function setPrices(uint256 affirmPrice, uint256 denyPrice) public onlyOwner {
        affirmationPrice = affirmPrice;
        denialPrice = denyPrice;
    }

    function setChallengeParams(uint256 minStake, uint256 duration) public onlyOwner {
        minimumChallengeStake = minStake;
        challengeDuration = duration;
    }

    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdraw failed");
    }

    // Required overrides

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
