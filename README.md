# 🚀 SwipeFi - The Future of Credit is Decentralized

> **The world's first Web3 credit card with on-chain rewards, forced savings, and DeFi integration**

[![Next.js](https://img.shields.io/badge/Next.js-15.3.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-363636?style=for-the-badge&logo=solidity)](https://soliditylang.org/)
[![Base](https://img.shields.io/badge/Base-Sepolia-0052FF?style=for-the-badge&logo=base)](https://base.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

<div align="center">
  <img src="https://img.shields.io/badge/Status-Production%20Ready-brightgreen?style=for-the-badge" alt="Production Ready" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="MIT License" />
  <img src="https://img.shields.io/badge/PRs-Welcome-brightgreen?style=for-the-badge" alt="PRs Welcome" />
</div>

---

## 🌟 What is SwipeFi?

SwipeFi revolutionizes traditional credit cards by bringing them on-chain. Built on Base Sepolia, it offers:

- **💳 Instant Credit**: Get credit based on your on-chain wallet activity
- **🎁 Automatic Rewards**: Earn $SPND and $BTC cashback on every purchase
- **💰 Forced Savings**: Built-in DeFi protocol integration for automatic yield generation
- **🔒 Self-Custody**: Your funds, your control - no centralized intermediaries
- **⚡ Real-time Analytics**: Live credit scoring and transaction tracking
- **🎯 Tiered Loyalty**: Bronze, Silver, Gold tiers with exclusive benefits

## ✨ Key Features

### 🎯 **Smart Credit Scoring**
- Real-time wallet activity analysis
- Dynamic credit limits based on on-chain behavior
- Risk assessment using DeFi protocol interactions
- NFT holdings and transaction history evaluation

### 💎 **Dual Token Rewards System**
- **$SPND**: Native governance token with staking benefits
- **$BTC**: Bitcoin cashback converted to USDC for instant liquidity
- Automatic claim mechanisms with gas optimization

### 🏆 **Tiered Loyalty Program**
- **Bronze**: Basic rewards and credit access
- **Silver**: Enhanced cashback rates and higher limits
- **Gold**: Premium benefits, exclusive NFT badges, and VIP features

### 🔄 **DeFi Integration**
- Automatic yield farming on repayments
- Protocol integration with major DeFi platforms
- Forced savings mechanism for financial discipline

### 🎨 **Premium UX/UI**
- Glassmorphism design with neon accents
- Smooth animations and micro-interactions
- Responsive design optimized for all devices
- Dark mode with luxury Web3 aesthetics

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Smart         │    │   Base Sepolia  │
│   (Next.js)     │◄──►│   Contracts     │◄──►│   Blockchain    │
│                 │    │   (Solidity)    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Coinbase      │    │   $SPND Token   │    │   USDC Token    │
│   Wallet        │    │   (ERC-20)      │    │   (ERC-20)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Tech Stack**
- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Smart Contracts**: Solidity 0.8.20, OpenZeppelin
- **Blockchain**: Base Sepolia (Ethereum L2)
- **Wallet**: Coinbase Wallet integration
- **Styling**: Custom glassmorphism design system
- **State Management**: React hooks + ethers.js

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Coinbase Wallet browser extension
- Base Sepolia testnet ETH for gas fees

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/swipefi.git
   cd swipefi
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure your `.env.local`:
   ```env
   NEXT_PUBLIC_CONTRACT_ADDRESS=0x51AB215fEB13536ea680bC558452B8F9B1B72596
   NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
   NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME=swipefi
   NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_api_key_here
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 How to Use

### 1. **Connect Your Wallet**
- Click the wallet button in the top-right corner
- Approve the connection in your Coinbase Wallet
- Your wallet address will be displayed with a green checkmark

### 2. **View Your Credit Profile**
- The app automatically analyzes your wallet activity
- View your credit score, available limit, and tier status
- Check your risk factors and recommendations

### 3. **Make a Purchase**
- Click the **"Spend"** button with the blue gradient
- Enter the amount you want to spend (in USDC)
- Confirm the transaction in your wallet
- Earn automatic $SPND and $BTC rewards

### 4. **Repay Your Balance**
- Click the **"Repay"** button with the green gradient
- Enter the amount you want to repay
- Confirm the transaction in your wallet
- Your balance updates immediately

### 5. **Claim Rewards**
- View your earned $SPND and $BTC in the rewards panel
- Click **"Claim"** to receive your rewards
- $BTC is automatically converted to USDC for liquidity

## 🔧 Smart Contracts

### **SwipeFiCreditV3** - Main Credit Contract
```solidity
// Key Functions
function spendCredit(uint256 amount) external
function repayCredit(uint256 amount) external
function claimBTCCashback() external
function getUserCreditScore(address user) external view returns (uint256)
function getTierStatus(address user) external view returns (uint8)
```

### **SpendToken ($SPND)** - Governance Token
```solidity
// Key Functions
function mint(address to, uint256 amount) external
function stake(uint256 amount) external
function unstake(uint256 amount) external
function claimRewards() external
```

### **Contract Addresses**
- **SwipeFiCreditV3**: `0x51AB215fEB13536ea680bC558452B8F9B1B72596`
- **SpendToken ($SPND)**: `0x5168900d3Fa83A186B61a3D7c94381Bf30402C1e`
- **USDC**: `0x036CbD53842c5426634e7929541eC2318f3dCF7c`

## 🎨 UI Components

### **Core Components**
- `CreditScoreDisplay`: Real-time credit analysis and tier status
- `WalletAnalytics`: Compact wallet activity insights
- `RewardsDisplay`: $SPND and $BTC rewards management
- `TransactionHistory`: Complete spend/repay audit trail

### **Design System**
- **Colors**: `#0d1117`, `#1e293b`, `#3b82f6`, `#8b5cf6`
- **Fonts**: Inter, Space Grotesk, Satoshi
- **Effects**: Glassmorphism, neon glows, smooth animations
- **Layout**: Responsive grid with sidebar panels

## 🔒 Security Features

### **On-Chain Security**
- All transactions require wallet signature
- Smart contract access controls and reentrancy protection
- Environment variable protection for sensitive data
- No backend dependencies - pure Web3 architecture

### **User Protection**
- Credit limit enforcement
- Automatic due date tracking
- Overdue balance monitoring
- Transaction verification on-chain

## 📊 Credit Scoring Algorithm

The credit score (300-850) is calculated using:

```typescript
interface CreditFactors {
  totalVolume: number;           // Transaction volume
  transactionFrequency: number;  // Activity consistency
  defiUsage: number;            // DeFi protocol interactions
  nftHoldings: number;          // NFT portfolio value
  gasEfficiency: number;        // Gas optimization
  lendingHistory: number;       // Borrowing/repayment history
  riskFactors: string[];        // High-risk behaviors
}
```

## 🏆 Tier System

| Tier | Requirements | Benefits | NFT Badge |
|------|-------------|----------|-----------|
| **Bronze** | Default | Basic rewards, 1% cashback | 🥉 |
| **Silver** | 1000+ $SPND staked | 2% cashback, higher limits | 🥈 |
| **Gold** | 5000+ $SPND staked | 3% cashback, exclusive features | 🥇 |

## 🚀 Deployment

### **Local Development**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
```

### **Vercel Deployment**
1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### **Smart Contract Deployment**
```bash
npx hardhat compile
npx hardhat run scripts/deployV3.ts --network base-sepolia
```

## 🐛 Troubleshooting

### **Common Issues**

**Wallet Connection Fails**
```bash
# Ensure Coinbase Wallet is installed and unlocked
# Check network is set to Base Sepolia
# Try refreshing the page
```

**Transaction Fails**
```bash
# Verify sufficient Base Sepolia ETH for gas
# Check amount is within credit limit
# Ensure contract address is correct
```

**Credit Score Not Loading**
```bash
# Check RPC URL accessibility
# Verify contract deployment
# Check browser console for errors
```

### **Debug Mode**
Enable debug logging:
```env
NEXT_PUBLIC_DEBUG=true
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md).

### **Development Workflow**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### **Code Style**
- TypeScript for type safety
- ESLint + Prettier for code formatting
- Conventional commits for commit messages
- Comprehensive testing for smart contracts

## 📈 Roadmap

### **Phase 1: Core Features** ✅
- [x] Credit scoring algorithm
- [x] Spend/repay functionality
- [x] Dual token rewards system
- [x] Tiered loyalty program

### **Phase 2: DeFi Integration** 🚧
- [ ] Automated yield farming
- [ ] Cross-chain bridge integration
- [ ] Advanced DeFi protocol partnerships
- [ ] Liquidity mining programs

### **Phase 3: Ecosystem Expansion** 📋
- [ ] Mobile app development
- [ ] Merchant integration API
- [ ] Advanced analytics dashboard
- [ ] Governance token utility expansion

### **Phase 4: Enterprise Features** 📋
- [ ] Business credit accounts
- [ ] Multi-signature support
- [ ] Advanced compliance tools
- [ ] Institutional partnerships

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### **Community**
- **Discord**: [Join our community](https://discord.gg/swipefi)
- **Twitter**: [@SwipeFi](https://twitter.com/SwipeFi)
- **Telegram**: [SwipeFi Community](https://t.me/SwipeFi)

### **Documentation**
- **API Docs**: [docs.swipefi.com](https://docs.swipefi.com)
- **Smart Contract Docs**: [contracts.swipefi.com](https://contracts.swipefi.com)
- **Tutorials**: [learn.swipefi.com](https://learn.swipefi.com)

### **Bug Reports**
Please use our [Issue Tracker](https://github.com/yourusername/swipefi/issues) for bug reports and feature requests.

---

<div align="center">
  <p><strong>Built with ❤️ by the SwipeFi Team</strong></p>
  <p>Empowering financial freedom through decentralized credit</p>
  
  [![GitHub stars](https://img.shields.io/github/stars/yourusername/swipefi?style=social)](https://github.com/yourusername/swipefi/stargazers)
  [![GitHub forks](https://img.shields.io/github/forks/yourusername/swipefi?style=social)](https://github.com/yourusername/swipefi/network)
  [![GitHub issues](https://img.shields.io/github/issues/yourusername/swipefi)](https://github.com/yourusername/swipefi/issues)
  [![GitHub pull requests](https://img.shields.io/github/issues-pr/yourusername/swipefi)](https://github.com/yourusername/swipefi/pulls)
</div>
