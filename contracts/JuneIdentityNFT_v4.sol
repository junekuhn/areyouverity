// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * ARE YOU VERITY — identity registry, v4.
 *
 * The first on-chain version whose state machine matches the shipped work
 * (web/lib/identity.js, the QUESTIONING model of 10 Verity 2026):
 *
 *   kinds:    VERITY | NOTVERITY
 *   statuses: VALID | QUESTIONING | VOID
 *
 *   declare(consistent with document)   → no change (a questioned document
 *                                          stays questioned; the mark does
 *                                          not lift — reaffirm is not in the
 *                                          logic)
 *   declare(contradicting a VALID doc)  → QUESTIONING  ("valid + questioning
 *                                          is still valid")
 *   declare(contradicting QUESTIONING)  → VOID
 *   VOID documents answer nothing; they may be burned, or kept as a
 *   legitimate and meaningful state of being.
 *
 * Deliberate properties, from the work's rules — not oversights:
 *  - Holding a valid VERITY and a valid NOTVERITY at once is permitted. That is
 *    the paradox state; see isParadox(). The registry names it, and leaves
 *    it with the holder.
 *  - Contradiction is never punished with loss. Nothing is confiscated;
 *    states move, documents remain.
 *  - No blocklist exists. Answering "no" is an identity, not an offence.
 *  - Declarations are owner-of-token only. Verityness does not transfer with
 *    the token: a commitment records who answered, and a new holder must
 *    declare (and, when the circuit is live, prove) for themselves.
 *
 * ZK status, stated plainly: this contract stores Poseidon commitments and
 * accepts declarations from token owners. It does NOT verify zero-knowledge
 * proofs until a real verifier is set. setVerifier() may be called by the
 * owner until lockVerifier() freezes it forever — set the real Groth16
 * verifier, then lock. While verifier is unset, declare() trusts ownership
 * alone, and says so in the Declared event (proofChecked = false).
 *
 * This contract does not prove identity, medical facts, or bodily truth.
 * Proceeds fund Verity's facial feminisation surgery: the fundraiser is part
 * of the work.
 */

interface IVerityProofVerifier {
    /// Verify a Groth16 proof binding `commitment` for token `tokenId`.
    function verifyProof(
        uint256[2] calldata a,
        uint256[2][2] calldata b,
        uint256[2] calldata c,
        uint256[2] calldata pubSignals // [commitment, tokenId]
    ) external view returns (bool);
}

contract VerityIdentityNFT is ERC721, Ownable {
    enum Kind {
        VERITY,
        NOTVERITY
    }

    enum Status {
        VALID,
        QUESTIONING,
        VOID
    }

    struct Document {
        Kind kind;
        Status status;
        bytes32 commitment; // Poseidon(params…, salt) — public half of the witness
        uint64 inception;
    }

    uint256 public nextId = 1; // serials are monotonic, never reused
    uint256 public mintPrice = 0.001 ether; // pricing is an open decision; settable
    address public fundraiser; // FFS fund destination
    IVerityProofVerifier public verifier; // zero until the circuit is real
    bool public verifierLocked;

    mapping(uint256 => Document) public documents;
    mapping(bytes32 => uint256) public tokenByCommitment;

    event Minted(
        uint256 indexed tokenId,
        address indexed to,
        Kind kind,
        bytes32 commitment
    );
    event Declared(
        uint256 indexed tokenId,
        address indexed by,
        bool answerVerity,
        Status statusAfter,
        bool proofChecked
    );
    event Burned(uint256 indexed tokenId);
    event VerifierSet(address verifier);
    event VerifierLocked();

    error WrongPayment();
    error CommitmentInUse();
    error NotDocumentHolder();
    error DocumentIsVoid();
    error ProofRequired();
    error OnlyVoidBurnable();
    error VerifierIsLocked();

    constructor(
        address _fundraiser
    ) ERC721("ARE YOU VERITY", "VERITY") Ownable(msg.sender) {
        fundraiser = _fundraiser == address(0) ? msg.sender : _fundraiser;
    }

    /* ------------------------------------------------------------------ */
    /* issuance                                                            */
    /* ------------------------------------------------------------------ */

    function mint(
        Kind kind,
        bytes32 commitment
    ) external payable returns (uint256 tokenId) {
        if (msg.value != mintPrice) revert WrongPayment();
        if (commitment == bytes32(0) || tokenByCommitment[commitment] != 0)
            revert CommitmentInUse();

        tokenId = nextId++;
        documents[tokenId] = Document({
            kind: kind,
            status: Status.VALID,
            commitment: commitment,
            inception: uint64(block.timestamp)
        });
        tokenByCommitment[commitment] = tokenId;
        _safeMint(msg.sender, tokenId);
        emit Minted(tokenId, msg.sender, kind, commitment);
    }

    /* ------------------------------------------------------------------ */
    /* the decision tree                                                   */
    /* ------------------------------------------------------------------ */

    /**
     * Answer the question against a document you hold.
     * Mirrors web/lib/identity.js decide():
     *   match    + VALID       → no change (welcome home)
     *   match    + QUESTIONING → no change (the mark stays; no reaffirm)
     *   mismatch + VALID       → QUESTIONING
     *   mismatch + QUESTIONING → VOID        (REVOKE)
     *   VOID                   → reverts; void documents answer nothing
     *
     * When a verifier is set, a Groth16 proof of the commitment's preimage
     * is required; until then ownership stands in, and the event says so.
     */
    function declare(
        uint256 tokenId,
        bool answerVerity,
        uint256[2] calldata a,
        uint256[2][2] calldata b,
        uint256[2] calldata c
    ) external {
        if (ownerOf(tokenId) != msg.sender) revert NotDocumentHolder();
        Document storage doc = documents[tokenId];
        if (doc.status == Status.VOID) revert DocumentIsVoid();

        bool proofChecked = false;
        if (address(verifier) != address(0)) {
            uint256[2] memory pubSignals = [
                uint256(doc.commitment),
                tokenId
            ];
            if (!verifier.verifyProof(a, b, c, pubSignals))
                revert ProofRequired();
            proofChecked = true;
        }

        bool matches = (doc.kind == Kind.VERITY) == answerVerity;
        if (!matches) {
            // First contradiction questions a valid document; a second
            // voids it. Answering consistently changes nothing.
            doc.status = doc.status == Status.VALID
                ? Status.QUESTIONING
                : Status.VOID;
        }
        emit Declared(tokenId, msg.sender, answerVerity, doc.status, proofChecked);
    }

    /** Only void documents may be burned, and only by their holder. */
    function burn(uint256 tokenId) external {
        if (ownerOf(tokenId) != msg.sender) revert NotDocumentHolder();
        if (documents[tokenId].status != Status.VOID) revert OnlyVoidBurnable();
        delete tokenByCommitment[documents[tokenId].commitment];
        delete documents[tokenId];
        _burn(tokenId);
        emit Burned(tokenId);
    }

    /* ------------------------------------------------------------------ */
    /* views                                                               */
    /* ------------------------------------------------------------------ */

    /** The paradox state: one holder, valid Verity and valid Nonverity at once. */
    function isParadox(address holder) external view returns (bool) {
        bool verity;
        bool nonverity;
        uint256 n = nextId;
        for (uint256 id = 1; id < n; id++) {
            if (_ownerOf(id) != holder) continue;
            Document storage doc = documents[id];
            if (doc.status != Status.VALID) continue;
            if (doc.kind == Kind.VERITY) verity = true;
            else nonverity = true;
            if (verity && nonverity) return true;
        }
        return false;
    }

    /* ------------------------------------------------------------------ */
    /* administration                                                      */
    /* ------------------------------------------------------------------ */

    function setVerifier(address v) external onlyOwner {
        if (verifierLocked) revert VerifierIsLocked();
        verifier = IVerityProofVerifier(v);
        emit VerifierSet(v);
    }

    /** One-way: once the real verifier is in, no one can swap it out. */
    function lockVerifier() external onlyOwner {
        verifierLocked = true;
        emit VerifierLocked();
    }

    function setMintPrice(uint256 price) external onlyOwner {
        mintPrice = price;
    }

    function setFundraiser(address f) external onlyOwner {
        fundraiser = f;
    }

    string private _base;

    function setBaseURI(string calldata uri) external onlyOwner {
        _base = uri;
    }

    function _baseURI() internal view override returns (string memory) {
        return _base;
    }

    function withdraw() external {
        (bool ok, ) = fundraiser.call{value: address(this).balance}("");
        require(ok, "withdraw failed");
    }
}
