// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title CLAW99Escrow
 * @notice Escrow contract for CLAW99 AI agent contest marketplace
 * @dev Handles deposits, winner payouts, and refunds for contests
 */
contract CLAW99Escrow is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Platform fee: 5% (500 basis points)
    uint256 public constant PLATFORM_FEE_BPS = 500;
    uint256 public constant BPS_DENOMINATOR = 10000;

    // Platform wallet for fee collection
    address public platformWallet;

    // Supported tokens (address(0) = native ETH)
    mapping(address => bool) public supportedTokens;

    // Contest status
    enum ContestStatus {
        Active,
        Completed,
        Refunded,
        Cancelled
    }

    // Contest struct
    struct Contest {
        address buyer;
        address token; // address(0) for ETH
        uint256 amount;
        uint256 deadline;
        ContestStatus status;
        address winner;
    }

    // contestId => Contest
    mapping(bytes32 => Contest) public contests;

    // Events
    event ContestFunded(
        bytes32 indexed contestId,
        address indexed buyer,
        address token,
        uint256 amount,
        uint256 deadline
    );
    event WinnerSelected(
        bytes32 indexed contestId,
        address indexed winner,
        uint256 winnerPayout,
        uint256 platformFee
    );
    event ContestRefunded(
        bytes32 indexed contestId,
        address indexed buyer,
        uint256 amount
    );
    event ContestCancelled(bytes32 indexed contestId);
    event TokenSupportUpdated(address indexed token, bool supported);
    event PlatformWalletUpdated(address indexed newWallet);

    constructor(address _platformWallet) Ownable(msg.sender) {
        require(_platformWallet != address(0), "Invalid platform wallet");
        platformWallet = _platformWallet;

        // ETH is always supported (represented as address(0))
        supportedTokens[address(0)] = true;
    }

    /**
     * @notice Fund a contest with ETH
     * @param contestId Unique identifier for the contest (from backend)
     * @param deadline Unix timestamp when contest ends
     */
    function fundContestETH(
        bytes32 contestId,
        uint256 deadline
    ) external payable nonReentrant {
        require(msg.value > 0, "Must send ETH");
        require(deadline > block.timestamp, "Deadline must be in future");
        require(contests[contestId].buyer == address(0), "Contest already exists");

        contests[contestId] = Contest({
            buyer: msg.sender,
            token: address(0),
            amount: msg.value,
            deadline: deadline,
            status: ContestStatus.Active,
            winner: address(0)
        });

        emit ContestFunded(contestId, msg.sender, address(0), msg.value, deadline);
    }

    /**
     * @notice Fund a contest with ERC20 token (USDC, CLAW99, etc.)
     * @param contestId Unique identifier for the contest
     * @param token Address of the ERC20 token
     * @param amount Amount to deposit
     * @param deadline Unix timestamp when contest ends
     */
    function fundContestToken(
        bytes32 contestId,
        address token,
        uint256 amount,
        uint256 deadline
    ) external nonReentrant {
        require(supportedTokens[token], "Token not supported");
        require(amount > 0, "Amount must be positive");
        require(deadline > block.timestamp, "Deadline must be in future");
        require(contests[contestId].buyer == address(0), "Contest already exists");

        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);

        contests[contestId] = Contest({
            buyer: msg.sender,
            token: token,
            amount: amount,
            deadline: deadline,
            status: ContestStatus.Active,
            winner: address(0)
        });

        emit ContestFunded(contestId, msg.sender, token, amount, deadline);
    }

    /**
     * @notice Select winner and release funds
     * @param contestId Contest identifier
     * @param winner Address of the winning agent's owner
     */
    function selectWinner(
        bytes32 contestId,
        address winner
    ) external nonReentrant {
        Contest storage contest = contests[contestId];

        require(contest.buyer == msg.sender, "Only buyer can select winner");
        require(contest.status == ContestStatus.Active, "Contest not active");
        require(winner != address(0), "Invalid winner address");

        contest.status = ContestStatus.Completed;
        contest.winner = winner;

        // Calculate payouts
        uint256 platformFee = (contest.amount * PLATFORM_FEE_BPS) / BPS_DENOMINATOR;
        uint256 winnerPayout = contest.amount - platformFee;

        // Transfer funds
        if (contest.token == address(0)) {
            // ETH
            (bool winnerSuccess, ) = winner.call{value: winnerPayout}("");
            require(winnerSuccess, "Winner transfer failed");

            (bool feeSuccess, ) = platformWallet.call{value: platformFee}("");
            require(feeSuccess, "Fee transfer failed");
        } else {
            // ERC20
            IERC20(contest.token).safeTransfer(winner, winnerPayout);
            IERC20(contest.token).safeTransfer(platformWallet, platformFee);
        }

        emit WinnerSelected(contestId, winner, winnerPayout, platformFee);
    }

    /**
     * @notice Refund buyer if no winner selected after deadline + grace period
     * @param contestId Contest identifier
     */
    function refund(bytes32 contestId) external nonReentrant {
        Contest storage contest = contests[contestId];

        require(contest.buyer != address(0), "Contest does not exist");
        require(contest.status == ContestStatus.Active, "Contest not active");
        // 7 day grace period after deadline for review
        require(block.timestamp > contest.deadline + 7 days, "Review period not over");

        contest.status = ContestStatus.Refunded;

        // Refund full amount to buyer
        if (contest.token == address(0)) {
            (bool success, ) = contest.buyer.call{value: contest.amount}("");
            require(success, "Refund transfer failed");
        } else {
            IERC20(contest.token).safeTransfer(contest.buyer, contest.amount);
        }

        emit ContestRefunded(contestId, contest.buyer, contest.amount);
    }

    /**
     * @notice Cancel contest before any submissions (buyer only, full refund)
     * @param contestId Contest identifier
     */
    function cancelContest(bytes32 contestId) external nonReentrant {
        Contest storage contest = contests[contestId];

        require(contest.buyer == msg.sender, "Only buyer can cancel");
        require(contest.status == ContestStatus.Active, "Contest not active");

        contest.status = ContestStatus.Cancelled;

        // Full refund to buyer
        if (contest.token == address(0)) {
            (bool success, ) = contest.buyer.call{value: contest.amount}("");
            require(success, "Refund transfer failed");
        } else {
            IERC20(contest.token).safeTransfer(contest.buyer, contest.amount);
        }

        emit ContestCancelled(contestId);
    }

    // Admin functions

    /**
     * @notice Add or remove supported token
     * @param token Token address
     * @param supported Whether token is supported
     */
    function setTokenSupport(address token, bool supported) external onlyOwner {
        supportedTokens[token] = supported;
        emit TokenSupportUpdated(token, supported);
    }

    /**
     * @notice Update platform wallet
     * @param newWallet New platform wallet address
     */
    function setPlatformWallet(address newWallet) external onlyOwner {
        require(newWallet != address(0), "Invalid address");
        platformWallet = newWallet;
        emit PlatformWalletUpdated(newWallet);
    }

    // View functions

    /**
     * @notice Get contest details
     * @param contestId Contest identifier
     */
    function getContest(bytes32 contestId) external view returns (
        address buyer,
        address token,
        uint256 amount,
        uint256 deadline,
        ContestStatus status,
        address winner
    ) {
        Contest storage contest = contests[contestId];
        return (
            contest.buyer,
            contest.token,
            contest.amount,
            contest.deadline,
            contest.status,
            contest.winner
        );
    }

    /**
     * @notice Check if contest is active and accepting submissions
     * @param contestId Contest identifier
     */
    function isContestActive(bytes32 contestId) external view returns (bool) {
        Contest storage contest = contests[contestId];
        return contest.status == ContestStatus.Active &&
               block.timestamp <= contest.deadline;
    }

    // Allow contract to receive ETH
    receive() external payable {}
}
