// Client-side only API for SwipeFi Web3 Credit Card
'use client';

import { ethers } from "ethers";
import SwipeFiCreditV2Abi from '../../artifacts/contracts/SwipeFiCreditV2.sol/SwipeFiCreditV2.json';
import SwipeFiCreditV3Abi from '../../artifacts/contracts/SwipeFiCreditV3.sol/SwipeFiCreditV3.json';
import SpendTokenAbi from '../../artifacts/contracts/SpendToken.sol/SpendToken.json';

// Type definitions
export interface WalletActivity {
  address: string;
  totalTransactions: number;
  totalVolume: number;
  avgTransactionSize: number;
  daysSinceFirstTx: number;
  daysSinceLastTx: number;
  uniqueContracts: number;
  failedTransactions: number;
  successfulTransactions: number;
  gasSpent: number;
  tokensHeld: number;
  nftCount: number;
  defiProtocols: string[];
  lendingHistory: {
    borrowed: number;
    repaid: number;
    defaults: number;
  };
  riskFactors: {
    highRisk: string[];
    mediumRisk: string[];
    lowRisk: string[];
  };
  riskScore: number; // 0-100, higher = more risky
}

export interface CreditScore {
  score: number; // 300-850 credit score
  riskLevel: 'excellent' | 'good' | 'fair' | 'poor' | 'very_poor';
  availableCredit: number;
  maxCreditLimit: number;
  factors: {
    positive: string[];
    negative: string[];
  };
  recommendations: string[];
}

export interface Transaction {
  id: string;
  walletAddress: string;
  amount: number;
  type: 'spend' | 'repay';
  date: Date;
  dueDate?: Date;
  status: 'pending' | 'repaid' | 'overdue';
}

export interface UserRewards {
  spndEarned: number;
  spndClaimed: number;
  btcEarned: number;
  btcClaimed: number;
  spndAvailable: number;
  btcAvailable: number;
}

// Environment configuration
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || process.env.CONTRACT_ADDRESS || '0x51AB215fEB13536ea680bC558452B8F9B1B72596';
const RPC_URL = process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL || process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org';
const VALIDATED_CONTRACT_ADDRESS = ethers.getAddress(CONTRACT_ADDRESS);

// Provider and contract instances (lazy loaded)
let provider: any = null;
let contract: any = null;
let spndContract: ethers.Contract | null = null;

// Provider management
function getProvider() {
  if (typeof window === 'undefined') return null;
  if (!provider) {
    provider = new ethers.JsonRpcProvider(RPC_URL);
  }
  return provider;
}

// Contract management
function getContract() {
  if (typeof window === 'undefined') return null;
  if (!contract) {
    contract = new ethers.Contract(VALIDATED_CONTRACT_ADDRESS, SwipeFiCreditV3Abi.abi, getProvider());
  }
  return contract;
}

function getContractWithSigner(signer: any) {
  if (typeof window === 'undefined') return null;
  return new ethers.Contract(VALIDATED_CONTRACT_ADDRESS, SwipeFiCreditV3Abi.abi, signer);
}

function getSpndContract() {
  if (typeof window === 'undefined') return null;
  if (!spndContract) {
    const SPND_ADDRESS = "0x5168900d3Fa83A186B61a3D7c94381Bf30402C1e";
    spndContract = new ethers.Contract(SPND_ADDRESS, SpendTokenAbi.abi, getProvider());
  }
  return spndContract;
}

// Enhanced wallet activity analysis
export async function analyzeWalletActivity(walletAddress: string): Promise<WalletActivity> {
  if (typeof window === 'undefined') {
    return {
      address: walletAddress,
      totalTransactions: 0,
      totalVolume: 0,
      avgTransactionSize: 0,
      daysSinceFirstTx: 0,
      daysSinceLastTx: 0,
      uniqueContracts: 0,
      failedTransactions: 0,
      successfulTransactions: 0,
      gasSpent: 0,
      tokensHeld: 0,
      nftCount: 0,
      defiProtocols: [],
      lendingHistory: { borrowed: 0, repaid: 0, defaults: 0 },
      riskFactors: { highRisk: [], mediumRisk: [], lowRisk: [] },
      riskScore: 50
    };
  }

  try {
    const provider = getProvider();
    if (!provider) throw new Error('Provider not initialized');

    const address = ethers.getAddress(walletAddress);
    
    // Get current block number
    const currentBlock = await provider.getBlockNumber();
    
    // Get recent transactions (last 100 blocks)
    const transactions = [];
    const blockRange = Math.min(100, currentBlock);
    
    for (let i = 0; i < blockRange; i++) {
      try {
        const block = await provider.getBlock(currentBlock - i, true);
        if (block && block.transactions) {
          const walletTxs = block.transactions.filter((tx: any) => 
            tx.from?.toLowerCase() === address.toLowerCase() || 
            tx.to?.toLowerCase() === address.toLowerCase()
          );
          transactions.push(...walletTxs);
        }
      } catch (e) {
        // Skip blocks that can't be fetched
        continue;
      }
    }
    
    const now = Math.floor(Date.now() / 1000);
    const firstTx = transactions.length > 0 ? transactions[0].timestamp || now : now;
    const lastTx = transactions.length > 0 ? transactions[transactions.length - 1].timestamp || now : now;
    
    let totalVolume = 0;
    let gasSpent = 0;
    let failedTxs = 0;
    let uniqueContracts = new Set<string>();
    let defiProtocols = new Set<string>();
    
    // Analyze each transaction (limit to first 50 for performance)
    for (let i = 0; i < Math.min(transactions.length, 50); i++) {
      const tx = transactions[i];
      
      if (tx.value) {
        const valueInEth = Number(ethers.formatEther(tx.value));
        totalVolume += valueInEth;
      }
      
      if (tx.gasLimit && tx.gasPrice) {
        const gasCost = Number(ethers.formatEther(tx.gasLimit * tx.gasPrice));
        gasSpent += gasCost;
      }
      
      if (tx.to) {
        uniqueContracts.add(tx.to);
        
        // Detect DeFi protocols
        if (tx.to.toLowerCase().includes('uniswap') || 
            tx.to.toLowerCase().includes('aave') ||
            tx.to.toLowerCase().includes('compound')) {
          defiProtocols.add('DeFi Protocol');
        }
      }
      
      // Check transaction status
      try {
        const receipt = await provider.getTransactionReceipt(tx.hash);
        if (receipt && receipt.status === 0) {
          failedTxs++;
        }
      } catch (e) {
        // Transaction might be pending
        failedTxs++;
      }
    }
    
    const successfulTxs = transactions.length - failedTxs;
    const avgTransactionSize = transactions.length > 0 ? totalVolume / transactions.length : 0;
    const daysSinceFirstTx = Math.floor((now - firstTx) / 86400);
    const daysSinceLastTx = Math.floor((now - lastTx) / 86400);
    
    // Calculate risk factors
    const riskFactors = {
      highRisk: [] as string[],
      mediumRisk: [] as string[],
      lowRisk: [] as string[]
    };
    
    if (failedTxs > transactions.length * 0.1) {
      riskFactors.highRisk.push('High failed transaction rate');
    }
    if (daysSinceLastTx > 30) {
      riskFactors.mediumRisk.push('Inactive wallet');
    }
    if (totalVolume > 100) {
      riskFactors.lowRisk.push('High transaction volume');
    }
    if (defiProtocols.size > 0) {
      riskFactors.lowRisk.push('DeFi protocol usage');
    }
    
    // Calculate risk score (0-100, higher = more risky)
    let riskScore = 50; // Base score
    
    // Adjust based on factors
    if (failedTxs > 0) riskScore += (failedTxs / transactions.length) * 30;
    if (daysSinceLastTx > 30) riskScore += 15;
    if (totalVolume < 1) riskScore += 10;
    if (defiProtocols.size > 0) riskScore -= 10;
    if (uniqueContracts.size > 5) riskScore -= 5;
    
    riskScore = Math.max(0, Math.min(100, riskScore));
    
    return {
      address: walletAddress,
      totalTransactions: transactions.length,
      totalVolume,
      avgTransactionSize,
      daysSinceFirstTx,
      daysSinceLastTx,
      uniqueContracts: uniqueContracts.size,
      failedTransactions: failedTxs,
      successfulTransactions: successfulTxs,
      gasSpent,
      tokensHeld: 0, // Would need additional API calls to get token balances
      nftCount: 0,   // Would need additional API calls to get NFT count
      defiProtocols: Array.from(defiProtocols),
      lendingHistory: { borrowed: 0, repaid: 0, defaults: 0 },
      riskFactors,
      riskScore
    };
    
  } catch (error) {
    console.error('Error analyzing wallet activity:', error);
    throw new Error('Failed to analyze wallet activity');
  }
}

// Credit Score API (onchain)
export async function getCreditScore(walletAddress: string) {
  if (typeof window === 'undefined') {
    // Return default values during SSR
    return {
      creditScore: {
        score: 650,
        riskLevel: 'good' as const,
        availableCredit: 5000,
        maxCreditLimit: 10000,
        factors: { positive: [], negative: [] },
        recommendations: [],
      },
      walletActivity: {
        address: walletAddress,
        totalTransactions: 0,
        totalVolume: 0,
        avgTransactionSize: 0,
        daysSinceFirstTx: 0,
        daysSinceLastTx: 0,
        uniqueContracts: 0,
        failedTransactions: 0,
        successfulTransactions: 0,
        gasSpent: 0,
        tokensHeld: 0,
        nftCount: 0,
        defiProtocols: [],
        lendingHistory: { borrowed: 0, repaid: 0, defaults: 0 },
        riskFactors: { highRisk: [], mediumRisk: [], lowRisk: [] },
        riskScore: 50
      },
    };
  }

  try {
    const contract = getContract();
    if (!contract) throw new Error('Contract not initialized');
    
    // Get wallet activity analysis
    const walletActivity = await analyzeWalletActivity(walletAddress);
    
    // Get onchain credit data
    const credit = await contract.getUserCredit(walletAddress);
    
    // Calculate credit score based on risk score (inverse relationship)
    const baseScore = 300; // Minimum credit score
    const maxScore = 850; // Maximum credit score
    const riskAdjustment = (100 - walletActivity.riskScore) * 5.5; // Convert risk to credit score
    const calculatedScore = Math.max(baseScore, Math.min(maxScore, baseScore + riskAdjustment));
    
    // Determine risk level
    let riskLevel: 'excellent' | 'good' | 'fair' | 'poor' | 'very_poor';
    if (calculatedScore >= 750) riskLevel = 'excellent';
    else if (calculatedScore >= 700) riskLevel = 'good';
    else if (calculatedScore >= 650) riskLevel = 'fair';
    else if (calculatedScore >= 600) riskLevel = 'poor';
    else riskLevel = 'very_poor';
    
    // Calculate credit limits based on score
    const maxCreditLimit = calculatedScore >= 750 ? 50000 : 
                          calculatedScore >= 700 ? 25000 :
                          calculatedScore >= 650 ? 15000 :
                          calculatedScore >= 600 ? 10000 : 5000;
    
    const availableCredit = Math.max(0, Number(ethers.formatUnits(credit.availableCredit, 18)));
    
    // Generate factors and recommendations
    const factors = {
      positive: walletActivity.riskFactors.lowRisk,
      negative: [...walletActivity.riskFactors.highRisk, ...walletActivity.riskFactors.mediumRisk]
    };
    
    const recommendations = [
      'Maintain consistent transaction patterns',
      'Keep transaction failure rate below 5%',
      'Build longer transaction history',
      'Diversify DeFi protocol usage'
    ];
    
    return {
      creditScore: {
        score: Math.round(calculatedScore),
        riskLevel,
        availableCredit,
        maxCreditLimit,
        factors,
        recommendations,
      },
      walletActivity,
    };
  } catch (error) {
    console.error('Error getting credit score:', error);
    // Return default values if contract call fails
    return {
      creditScore: {
        score: 650,
        riskLevel: 'good' as const,
        availableCredit: 5000,
        maxCreditLimit: 10000,
        factors: { positive: [], negative: [] },
        recommendations: [],
      },
      walletActivity: {
        address: walletAddress,
        totalTransactions: 0,
        totalVolume: 0,
        avgTransactionSize: 0,
        daysSinceFirstTx: 0,
        daysSinceLastTx: 0,
        uniqueContracts: 0,
        failedTransactions: 0,
        successfulTransactions: 0,
        gasSpent: 0,
        tokensHeld: 0,
        nftCount: 0,
        defiProtocols: [],
        lendingHistory: { borrowed: 0, repaid: 0, defaults: 0 },
        riskFactors: { highRisk: [], mediumRisk: [], lowRisk: [] },
        riskScore: 50
      },
    };
  }
}

// Transactions API (onchain events)
export async function getTransactions(walletAddress: string): Promise<Transaction[]> {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const contract = getContract();
    const provider = getProvider();
    if (!contract || !provider) throw new Error('Contract or provider not initialized');
    
    const address = ethers.getAddress(walletAddress);
    // Query CreditSpent and CreditRepaid events
    const spendFilter = contract.filters.CreditSpent(null, address);
    const repayFilter = contract.filters.CreditRepaid(null, address);
    const spendEvents = await contract.queryFilter(spendFilter, -10000); // last 10k blocks
    const repayEvents = await contract.queryFilter(repayFilter, -10000);
    const txs: Transaction[] = [];
    for (const e of spendEvents) {
      // Type assertion for event log args
      const args = (e as any).args;
      const block = await provider.getBlock(e.blockNumber);
      txs.push({
        id: e.transactionHash,
        walletAddress: address,
        amount: Number(ethers.formatUnits(args.amount, 18)),
        type: 'spend',
        date: block ? new Date(block.timestamp * 1000) : new Date(),
        status: 'pending',
      });
    }
    for (const e of repayEvents) {
      const args = (e as any).args;
      const block = await provider.getBlock(e.blockNumber);
      txs.push({
        id: e.transactionHash,
        walletAddress: address,
        amount: Number(ethers.formatUnits(args.amount, 18)),
        type: 'repay',
        date: block ? new Date(block.timestamp * 1000) : new Date(),
        status: 'repaid',
      });
    }
    // Sort by date desc
    txs.sort((a, b) => b.date.getTime() - a.date.getTime());
    return txs;
  } catch (error) {
    console.error('Error getting transactions:', error);
    return [];
  }
}

// Wallet-based transaction functions
export async function spendCredit(amount: number, signer: any): Promise<string> {
  if (typeof window === 'undefined') {
    throw new Error('Cannot execute transactions during SSR');
  }
  
  const contract = getContractWithSigner(signer);
  if (!contract) throw new Error('Contract not initialized');
  
  const amountWei = ethers.parseUnits(amount.toString(), 18);
  const tx = await contract.spend(amountWei);
  const receipt = await tx.wait();
  return receipt.hash;
}

export async function repayCredit(amount: number, signer: any): Promise<string> {
  if (typeof window === 'undefined') {
    throw new Error('Cannot execute transactions during SSR');
  }
  
  const contract = getContractWithSigner(signer);
  if (!contract) throw new Error('Contract not initialized');
  
  const amountWei = ethers.parseUnits(amount.toString(), 18);
  const tx = await contract.repay(amountWei);
  const receipt = await tx.wait();
  return receipt.hash;
}

// Add new functions for V3 features
export async function getUserRewards(userAddress: string): Promise<UserRewards | null> {
  try {
    const contract = getContract();
    if (!contract) return null;

    const rewards = await contract.getUserRewards(userAddress);
    
    return {
      spndEarned: parseFloat(ethers.formatUnits(rewards[0], 18)), // SPND has 18 decimals
      spndClaimed: parseFloat(ethers.formatUnits(rewards[1], 18)),
      btcEarned: parseFloat(ethers.formatUnits(rewards[2], 6)), // BTC cashback in USDC (6 decimals)
      btcClaimed: parseFloat(ethers.formatUnits(rewards[3], 6)),
      spndAvailable: parseFloat(ethers.formatUnits(rewards[4], 18)),
      btcAvailable: parseFloat(ethers.formatUnits(rewards[5], 6))
    };
  } catch (error) {
    console.error('Error getting user rewards:', error);
    return null;
  }
}

export async function getSpndBalance(userAddress: string): Promise<number> {
  try {
    const contract = getSpndContract();
    if (!contract) return 0;

    const balance = await contract.balanceOf(userAddress);
    return parseFloat(ethers.formatUnits(balance, 18));
  } catch (error) {
    console.error('Error getting SPND balance:', error);
    return 0;
  }
}

export async function claimBTCCashback(signer: any): Promise<boolean> {
  try {
    const contract = getContractWithSigner(signer);
    if (!contract) return false;

    const tx = await contract.claimBTCCashback();
    await tx.wait();
    return true;
  } catch (error) {
    console.error('Error claiming BTC cashback:', error);
    return false;
  }
} 