// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

// Interface for SpendToken with mint function
interface ISpendToken is IERC20 {
    function mint(address to, uint256 amount) external returns (bool);
}

/**
 * @title SwipeFiCreditV3 - USDC Credit Card with SPND Rewards
 * @dev Enhanced credit card system with USDC integration, SPND rewards, and exponential cashback
 */
contract SwipeFiCreditV3 is ReentrancyGuard, Ownable {
    using Counters for Counters.Counter;

    // Token interfaces
    IERC20 public immutable usdcToken;
    ISpendToken public immutable spndToken;
    
    // Credit scoring thresholds
    uint256 public constant MIN_CREDIT_SCORE = 300;
    uint256 public constant MAX_CREDIT_SCORE = 850;
    uint256 public constant MIN_CREDIT_LIMIT = 100 * 10**6; // 100 USDC (6 decimals)
    uint256 public constant MAX_CREDIT_LIMIT = 100000 * 10**6; // 100k USDC
    
    // Interest and fees (basis points: 1 = 0.01%)
    uint256 public constant ANNUAL_INTEREST_RATE = 1500; // 15% APR
    uint256 public constant LATE_FEE_RATE = 500; // 5% late fee
    uint256 public constant MIN_PAYMENT_PERCENTAGE = 300; // 3% minimum payment
    
    // SPND Rewards (basis points: 1 = 0.01%)
    uint256 public constant BASE_SPND_REWARD_RATE = 100; // 1% base SPND reward
    uint256 public constant EXPONENTIAL_MULTIPLIER = 50; // 0.5% increase per tier
    uint256 public constant SPND_REWARD_TIER_SIZE = 1000 * 10**6; // 1000 USDC per tier
    
    // BTC Cashback (tracked in basis points)
    uint256 public constant BTC_CASHBACK_RATE = 25; // 0.25% BTC cashback
    
    // Repayment period
    uint256 public constant REPAYMENT_PERIOD_DAYS = 30;
    
    struct UserCredit {
        uint256 maxCreditLimit;
        uint256 availableCredit;
        uint256 outstandingBalance;
        uint256 creditScore;
        uint256 lastPaymentDate;
        uint256 lastSpendDate;
        bool isActive;
        uint256 totalSpent;
        uint256 totalRepaid;
        uint256 lateFeesAccrued;
        uint256 interestAccrued;
        uint256 spndRewardsEarned;
        uint256 btcCashbackEarned;
        uint256 spndRewardsClaimed;
        uint256 btcCashbackClaimed;
    }
    
    struct Transaction {
        uint256 id;
        address user;
        address merchant;
        uint256 amount;
        uint256 timestamp;
        string purpose;
        bool isRepayment;
        uint256 dueDate;
        bool isPaid;
        uint256 spndRewards;
        uint256 btcCashback;
    }
    
    struct Merchant {
        string name;
        string category;
        bool isWhitelisted;
        uint256 maxTransactionLimit;
        uint256 totalVolume;
    }
    
    struct CreditScoreFactors {
        uint256 transactionHistory;
        uint256 paymentHistory;
        uint256 creditUtilization;
        uint256 accountAge;
        uint256 onchainActivity;
    }

    // State variables
    mapping(address => UserCredit) public userCredits;
    mapping(uint256 => Transaction) public transactions;
    mapping(address => Merchant) public merchants;
    mapping(address => uint256[]) public userTransactionIds;
    mapping(address => CreditScoreFactors) public creditFactors;
    
    Counters.Counter private _transactionIds;
    
    // Events
    event CreditLimitSet(address indexed user, uint256 limit, uint256 creditScore);
    event CreditSpent(
        uint256 indexed transactionId,
        address indexed user, 
        address indexed merchant,
        uint256 amount, 
        string purpose,
        uint256 dueDate,
        uint256 spndRewards,
        uint256 btcCashback
    );
    event CreditRepaid(
        uint256 indexed transactionId,
        address indexed user, 
        uint256 amount, 
        uint256 newBalance
    );
    event SPNDRewardsEarned(address indexed user, uint256 amount, uint256 transactionId);
    event BTCCashbackEarned(address indexed user, uint256 amount, uint256 transactionId);
    event SPNDRewardsClaimed(address indexed user, uint256 amount);
    event BTCCashbackClaimed(address indexed user, uint256 amount);
    event LateFeeAccrued(address indexed user, uint256 amount, uint256 dueDate);
    event InterestAccrued(address indexed user, uint256 amount);
    event MerchantRegistered(address indexed merchant, string name, string category);
    event MerchantWhitelisted(address indexed merchant, bool status);
    event CreditScoreUpdated(address indexed user, uint256 newScore, uint256 factors);
    event Withdrawal(address indexed owner, uint256 amount);
    
    // Modifiers
    modifier onlyWhitelistedMerchant() {
        require(merchants[msg.sender].isWhitelisted, "Merchant not whitelisted");
        _;
    }
    
    modifier onlyActiveUser(address user) {
        require(userCredits[user].isActive, "User credit not active");
        _;
    }
    
    modifier validAmount(uint256 amount) {
        require(amount > 0, "Amount must be greater than 0");
        require(amount <= MAX_CREDIT_LIMIT, "Amount exceeds maximum limit");
        _;
    }

    constructor(address _usdcToken, address _spndToken) Ownable() {
        require(_usdcToken != address(0), "Invalid USDC address");
        require(_spndToken != address(0), "Invalid SPND address");
        usdcToken = IERC20(_usdcToken);
        spndToken = ISpendToken(_spndToken);
    }

    /**
     * @dev Calculate exponential SPND rewards based on spending tiers
     */
    function calculateSPNDRewards(uint256 amount, uint256 userTotalSpent) internal pure returns (uint256) {
        uint256 tier = userTotalSpent / SPND_REWARD_TIER_SIZE;
        uint256 exponentialRate = BASE_SPND_REWARD_RATE + (tier * EXPONENTIAL_MULTIPLIER);
        return (amount * exponentialRate) / 10000; // Convert basis points to percentage
    }

    /**
     * @dev Calculate BTC cashback
     */
    function calculateBTCCashback(uint256 amount) internal pure returns (uint256) {
        return (amount * BTC_CASHBACK_RATE) / 10000; // Convert basis points to percentage
    }

    /**
     * @dev Set up a user's credit profile with automated credit scoring
     */
    function setupUserCredit(
        address user, 
        uint256 requestedLimit,
        uint256 onchainActivity
    ) external onlyOwner {
        require(user != address(0), "Invalid user address");
        require(requestedLimit >= MIN_CREDIT_LIMIT, "Limit below minimum");
        require(requestedLimit <= MAX_CREDIT_LIMIT, "Limit above maximum");
        
        // Calculate credit score based on onchain activity
        uint256 creditScore = calculateCreditScore(user, onchainActivity);
        
        // Adjust limit based on credit score
        uint256 adjustedLimit = adjustLimitByScore(requestedLimit, creditScore);
        
        userCredits[user] = UserCredit({
            maxCreditLimit: adjustedLimit,
            availableCredit: adjustedLimit,
            outstandingBalance: 0,
            creditScore: creditScore,
            lastPaymentDate: block.timestamp,
            lastSpendDate: 0,
            isActive: true,
            totalSpent: 0,
            totalRepaid: 0,
            lateFeesAccrued: 0,
            interestAccrued: 0,
            spndRewardsEarned: 0,
            btcCashbackEarned: 0,
            spndRewardsClaimed: 0,
            btcCashbackClaimed: 0
        });
        
        emit CreditLimitSet(user, adjustedLimit, creditScore);
    }

    /**
     * @dev Spend credit with merchant validation, transaction metadata, and rewards
     */
    function spend(
        address user,
        uint256 amount,
        string calldata purpose
    ) external onlyWhitelistedMerchant onlyActiveUser(user) validAmount(amount) nonReentrant {
        UserCredit storage credit = userCredits[user];
        Merchant storage merchant = merchants[msg.sender];
        
        require(credit.availableCredit >= amount, "Insufficient credit");
        require(amount <= merchant.maxTransactionLimit, "Exceeds merchant limit");
        
        // Calculate rewards before updating total spent
        uint256 spndRewards = calculateSPNDRewards(amount, credit.totalSpent);
        uint256 btcCashback = calculateBTCCashback(amount);
        
        // Create transaction record
        _transactionIds.increment();
        uint256 transactionId = _transactionIds.current();
        uint256 dueDate = block.timestamp + (REPAYMENT_PERIOD_DAYS * 1 days);
        
        transactions[transactionId] = Transaction({
            id: transactionId,
            user: user,
            merchant: msg.sender,
            amount: amount,
            timestamp: block.timestamp,
            purpose: purpose,
            isRepayment: false,
            dueDate: dueDate,
            isPaid: false,
            spndRewards: spndRewards,
            btcCashback: btcCashback
        });
        
        userTransactionIds[user].push(transactionId);
        
        // Update credit state
        credit.availableCredit -= amount;
        credit.outstandingBalance += amount;
        credit.lastSpendDate = block.timestamp;
        credit.totalSpent += amount;
        credit.spndRewardsEarned += spndRewards;
        credit.btcCashbackEarned += btcCashback;
        
        // Update merchant stats
        merchant.totalVolume += amount;
        
        // Transfer USDC to merchant
        require(
            usdcToken.transferFrom(address(this), msg.sender, amount),
            "USDC transfer failed"
        );
        
        // Mint SPND rewards to user
        if (spndRewards > 0) {
            require(
                spndToken.mint(user, spndRewards),
                "SPND mint failed"
            );
            emit SPNDRewardsEarned(user, spndRewards, transactionId);
        }
        
        emit CreditSpent(transactionId, user, msg.sender, amount, purpose, dueDate, spndRewards, btcCashback);
    }

    /**
     * @dev Repay credit with USDC
     */
    function repay(uint256 amount) external validAmount(amount) nonReentrant {
        UserCredit storage credit = userCredits[msg.sender];
        require(credit.isActive, "Credit not active");
        require(credit.outstandingBalance >= amount, "Repay amount exceeds balance");
        
        // Calculate and apply any accrued interest/fees
        (uint256 interest, uint256 lateFees) = calculateAccruedCharges(msg.sender);
        uint256 totalAmount = amount + interest + lateFees;
        
        // Transfer USDC from user
        require(
            usdcToken.transferFrom(msg.sender, address(this), totalAmount),
            "USDC transfer failed"
        );
        
        // Create repayment transaction record
        _transactionIds.increment();
        uint256 transactionId = _transactionIds.current();
        
        transactions[transactionId] = Transaction({
            id: transactionId,
            user: msg.sender,
            merchant: address(0),
            amount: amount,
            timestamp: block.timestamp,
            purpose: "Credit Repayment",
            isRepayment: true,
            dueDate: 0,
            isPaid: true,
            spndRewards: 0,
            btcCashback: 0
        });
        
        userTransactionIds[msg.sender].push(transactionId);
        
        // Update credit state
        credit.outstandingBalance -= amount;
        credit.availableCredit += amount;
        credit.lastPaymentDate = block.timestamp;
        credit.totalRepaid += amount;
        credit.interestAccrued = 0;
        credit.lateFeesAccrued = 0;
        
        // Update credit score based on payment behavior
        updateCreditScore(msg.sender);
        
        emit CreditRepaid(transactionId, msg.sender, amount, credit.outstandingBalance);
    }

    /**
     * @dev Claim BTC cashback (converted to USDC for now)
     */
    function claimBTCCashback() external nonReentrant {
        UserCredit storage credit = userCredits[msg.sender];
        uint256 claimableAmount = credit.btcCashbackEarned - credit.btcCashbackClaimed;
        require(claimableAmount > 0, "No BTC cashback to claim");
        
        credit.btcCashbackClaimed += claimableAmount;
        
        // For now, pay out in USDC (in a real implementation, you'd use wBTC or bridge to BTC)
        require(
            usdcToken.transfer(msg.sender, claimableAmount),
            "USDC transfer failed"
        );
        
        emit BTCCashbackClaimed(msg.sender, claimableAmount);
    }

    /**
     * @dev Get user's reward summary
     */
    function getUserRewards(address user) external view returns (
        uint256 spndEarned,
        uint256 spndClaimed,
        uint256 btcEarned,
        uint256 btcClaimed,
        uint256 spndAvailable,
        uint256 btcAvailable
    ) {
        UserCredit storage credit = userCredits[user];
        return (
            credit.spndRewardsEarned,
            credit.spndRewardsClaimed,
            credit.btcCashbackEarned,
            credit.btcCashbackClaimed,
            credit.spndRewardsEarned - credit.spndRewardsClaimed,
            credit.btcCashbackEarned - credit.btcCashbackClaimed
        );
    }

    /**
     * @dev Register a new merchant
     */
    function registerMerchant(
        address merchant,
        string calldata name,
        string calldata category,
        uint256 maxTransactionLimit
    ) external onlyOwner {
        require(merchant != address(0), "Invalid merchant address");
        require(bytes(name).length > 0, "Merchant name required");
        
        merchants[merchant] = Merchant({
            name: name,
            category: category,
            isWhitelisted: false,
            maxTransactionLimit: maxTransactionLimit,
            totalVolume: 0
        });
        
        emit MerchantRegistered(merchant, name, category);
    }

    /**
     * @dev Whitelist/blacklist a merchant
     */
    function setMerchantWhitelist(address merchant, bool status) external onlyOwner {
        require(bytes(merchants[merchant].name).length > 0, "Merchant not registered");
        merchants[merchant].isWhitelisted = status;
        emit MerchantWhitelisted(merchant, status);
    }

    /**
     * @dev Calculate and apply accrued interest and late fees
     */
    function calculateAccruedCharges(address user) public view returns (uint256 interest, uint256 lateFees) {
        UserCredit storage credit = userCredits[user];
        if (credit.outstandingBalance == 0) return (0, 0);
        
        uint256 daysSinceLastPayment = (block.timestamp - credit.lastPaymentDate) / 1 days;
        
        // Calculate interest (daily rate)
        uint256 dailyInterestRate = ANNUAL_INTEREST_RATE / 365;
        interest = (credit.outstandingBalance * dailyInterestRate * daysSinceLastPayment) / 10000;
        
        // Calculate late fees for overdue transactions
        uint256[] memory userTxs = userTransactionIds[user];
        for (uint256 i = 0; i < userTxs.length; i++) {
            Transaction storage transaction = transactions[userTxs[i]];
            if (!transaction.isRepayment && !transaction.isPaid && block.timestamp > transaction.dueDate) {
                uint256 daysOverdue = (block.timestamp - transaction.dueDate) / 1 days;
                lateFees += (transaction.amount * LATE_FEE_RATE * daysOverdue) / 10000;
            }
        }
    }

    /**
     * @dev Calculate credit score based on onchain factors
     */
    function calculateCreditScore(address user, uint256 onchainActivity) internal view returns (uint256) {
        uint256 baseScore = 500; // Base score
        
        // Factor in onchain activity (wallet age, transaction volume, etc.)
        if (onchainActivity > 1000) baseScore += 200;
        else if (onchainActivity > 500) baseScore += 100;
        else if (onchainActivity > 100) baseScore += 50;
        
        // Factor in existing credit history
        UserCredit storage existingCredit = userCredits[user];
        if (existingCredit.totalSpent > 0) {
            uint256 paymentRatio = (existingCredit.totalRepaid * 100) / existingCredit.totalSpent;
            if (paymentRatio > 95) baseScore += 100;
            else if (paymentRatio > 80) baseScore += 50;
            else if (paymentRatio < 50) baseScore -= 100;
        }
        
        // Clamp between min and max
        if (baseScore < MIN_CREDIT_SCORE) baseScore = MIN_CREDIT_SCORE;
        if (baseScore > MAX_CREDIT_SCORE) baseScore = MAX_CREDIT_SCORE;
        
        return baseScore;
    }

    /**
     * @dev Adjust credit limit based on credit score
     */
    function adjustLimitByScore(uint256 requestedLimit, uint256 creditScore) internal pure returns (uint256) {
        if (creditScore >= 750) return requestedLimit; // Excellent
        if (creditScore >= 650) return (requestedLimit * 80) / 100; // Good
        if (creditScore >= 550) return (requestedLimit * 60) / 100; // Fair
        return (requestedLimit * 40) / 100; // Poor
    }

    /**
     * @dev Update user's credit score based on payment behavior
     */
    function updateCreditScore(address user) internal {
        UserCredit storage credit = userCredits[user];
        uint256 newScore = calculateCreditScore(user, credit.totalSpent);
        
        if (newScore != credit.creditScore) {
            credit.creditScore = newScore;
            emit CreditScoreUpdated(user, newScore, credit.totalSpent);
        }
    }

    /**
     * @dev Get user's transaction history
     */
    function getUserTransactions(address user) external view returns (uint256[] memory) {
        return userTransactionIds[user];
    }

    /**
     * @dev Get transaction details
     */
    function getTransaction(uint256 transactionId) external view returns (Transaction memory) {
        return transactions[transactionId];
    }

    /**
     * @dev Get user's complete credit profile
     */
    function getUserCreditProfile(address user) external view returns (
        UserCredit memory credit,
        uint256[] memory transactionIds,
        uint256 accruedInterest,
        uint256 accruedLateFees
    ) {
        (uint256 interest, uint256 lateFees) = calculateAccruedCharges(user);
        return (
            userCredits[user],
            userTransactionIds[user],
            interest,
            lateFees
        );
    }

    /**
     * @dev Withdraw accumulated USDC (owner only)
     */
    function withdraw() external onlyOwner {
        uint256 balance = usdcToken.balanceOf(address(this));
        require(balance > 0, "No USDC to withdraw");
        require(usdcToken.transfer(owner(), balance), "Withdrawal failed");
        emit Withdrawal(owner(), balance);
    }

    /**
     * @dev Emergency pause/unpause (owner only)
     */
    function setUserCreditStatus(address user, bool status) external onlyOwner {
        userCredits[user].isActive = status;
    }

    /**
     * @dev Get contract statistics
     */
    function getContractStats() external view returns (
        uint256 totalUsers,
        uint256 totalVolume,
        uint256 totalOutstanding,
        uint256 totalMerchants
    ) {
        // This would require additional state tracking for efficiency
        // For now, return basic stats
        return (0, 0, 0, 0);
    }
} 