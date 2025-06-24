import { NextRequest, NextResponse } from 'next/server';

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
}

export interface CreditScore {
  score: number; // 300-850
  riskLevel: 'excellent' | 'good' | 'fair' | 'poor' | 'very_poor';
  availableCredit: number;
  maxCreditLimit: number;
  factors: {
    positive: string[];
    negative: string[];
  };
  recommendations: string[];
}

class CreditScoreCalculator {
  private static readonly BASE_CREDIT_LIMIT = 1000;
  private static readonly MAX_CREDIT_LIMIT = 50000;
  
  // Risk weights for different factors
  private static readonly WEIGHTS = {
    transactionVolume: 0.25,
    transactionFrequency: 0.20,
    accountAge: 0.15,
    successRate: 0.15,
    defiActivity: 0.10,
    lendingHistory: 0.10,
    gasEfficiency: 0.05
  };

  static calculateCreditScore(activity: WalletActivity): CreditScore {
    const score = this.calculateRawScore(activity);
    const riskLevel = this.getRiskLevel(score);
    const availableCredit = this.calculateAvailableCredit(score, activity);
    const factors = this.analyzeFactors(activity);
    const recommendations = this.generateRecommendations(activity, score);

    return {
      score: Math.round(score),
      riskLevel,
      availableCredit,
      maxCreditLimit: this.calculateMaxCreditLimit(score),
      factors,
      recommendations
    };
  }

  private static calculateRawScore(activity: WalletActivity): number {
    let score = 300; // Base score

    // Transaction Volume Score (0-150 points)
    const volumeScore = Math.min(150, (activity.totalVolume / 10000) * 150);
    score += volumeScore * this.WEIGHTS.transactionVolume;

    // Transaction Frequency Score (0-100 points)
    const txFrequency = activity.totalTransactions / Math.max(1, activity.daysSinceFirstTx);
    const frequencyScore = Math.min(100, txFrequency * 10);
    score += frequencyScore * this.WEIGHTS.transactionFrequency;

    // Account Age Score (0-100 points)
    const ageScore = Math.min(100, activity.daysSinceFirstTx * 0.5);
    score += ageScore * this.WEIGHTS.accountAge;

    // Success Rate Score (0-100 points)
    const successRate = activity.successfulTransactions / Math.max(1, activity.totalTransactions);
    const successScore = successRate * 100;
    score += successScore * this.WEIGHTS.successRate;

    // DeFi Activity Score (0-50 points)
    const defiScore = Math.min(50, activity.defiProtocols.length * 10);
    score += defiScore * this.WEIGHTS.defiActivity;

    // Lending History Score (0-100 points)
    const lendingScore = this.calculateLendingScore(activity.lendingHistory);
    score += lendingScore * this.WEIGHTS.lendingHistory;

    // Gas Efficiency Score (0-50 points)
    const gasEfficiency = activity.totalVolume / Math.max(1, activity.gasSpent);
    const gasScore = Math.min(50, gasEfficiency / 100);
    score += gasScore * this.WEIGHTS.gasEfficiency;

    // Penalties
    if (activity.lendingHistory.defaults > 0) {
      score -= activity.lendingHistory.defaults * 50;
    }

    if (activity.failedTransactions > activity.successfulTransactions * 0.3) {
      score -= 100;
    }

    return Math.max(300, Math.min(850, score));
  }

  private static calculateLendingScore(lendingHistory: WalletActivity['lendingHistory']): number {
    if (lendingHistory.borrowed === 0) return 50; // Neutral score for no lending history
    
    const repaymentRate = lendingHistory.repaid / Math.max(1, lendingHistory.borrowed);
    const defaultRate = lendingHistory.defaults / Math.max(1, lendingHistory.borrowed);
    
    let score = 50;
    score += repaymentRate * 50; // Up to 100 points for perfect repayment
    score -= defaultRate * 100; // Penalty for defaults
    
    return Math.max(0, Math.min(100, score));
  }

  private static getRiskLevel(score: number): CreditScore['riskLevel'] {
    if (score >= 750) return 'excellent';
    if (score >= 700) return 'good';
    if (score >= 650) return 'fair';
    if (score >= 600) return 'poor';
    return 'very_poor';
  }

  private static calculateAvailableCredit(score: number, activity: WalletActivity): number {
    const maxLimit = this.calculateMaxCreditLimit(score);
    const currentBalance = this.getCurrentBalance(activity);
    return Math.max(0, maxLimit - currentBalance);
  }

  private static calculateMaxCreditLimit(score: number): number {
    const multiplier = score / 850; // 0-1 scale
    return Math.round(this.BASE_CREDIT_LIMIT + (this.MAX_CREDIT_LIMIT - this.BASE_CREDIT_LIMIT) * multiplier);
  }

  private static getCurrentBalance(activity: WalletActivity): number {
    // This would typically come from blockchain data
    // For now, we'll estimate based on recent activity
    return Math.min(activity.totalVolume * 0.1, 10000);
  }

  private static analyzeFactors(activity: WalletActivity): { positive: string[]; negative: string[] } {
    const positive: string[] = [];
    const negative: string[] = [];

    // Positive factors
    if (activity.totalVolume > 10000) {
      positive.push('High transaction volume');
    }
    if (activity.daysSinceFirstTx > 365) {
      positive.push('Long account history');
    }
    if (activity.successfulTransactions / Math.max(1, activity.totalTransactions) > 0.9) {
      positive.push('Excellent transaction success rate');
    }
    if (activity.defiProtocols.length > 2) {
      positive.push('Active DeFi user');
    }
    if (activity.lendingHistory.repaid > activity.lendingHistory.borrowed) {
      positive.push('Good lending repayment history');
    }

    // Negative factors
    if (activity.lendingHistory.defaults > 0) {
      negative.push(`${activity.lendingHistory.defaults} lending default(s)`);
    }
    if (activity.failedTransactions > activity.successfulTransactions * 0.3) {
      negative.push('High transaction failure rate');
    }
    if (activity.daysSinceLastTx > 30) {
      negative.push('Inactive account (30+ days)');
    }
    if (activity.totalVolume < 1000) {
      negative.push('Low transaction volume');
    }

    return { positive, negative };
  }

  private static generateRecommendations(activity: WalletActivity, score: number): string[] {
    const recommendations: string[] = [];

    if (score < 600) {
      recommendations.push('Build transaction history with regular activity');
      recommendations.push('Improve transaction success rate');
    }

    if (activity.totalVolume < 5000) {
      recommendations.push('Increase transaction volume to improve credit score');
    }

    if (activity.daysSinceLastTx > 7) {
      recommendations.push('Maintain regular wallet activity');
    }

    if (activity.defiProtocols.length === 0) {
      recommendations.push('Engage with DeFi protocols to demonstrate financial literacy');
    }

    if (activity.lendingHistory.defaults > 0) {
      recommendations.push('Avoid future lending defaults to improve credit score');
    }

    return recommendations;
  }

  // Mock function to simulate wallet activity analysis
  static async analyzeWalletActivity(address: string): Promise<WalletActivity> {
    // In a real implementation, this would fetch data from blockchain APIs
    // For now, we'll generate realistic mock data
    
    const mockActivity: WalletActivity = {
      address,
      totalTransactions: Math.floor(Math.random() * 1000) + 50,
      totalVolume: Math.floor(Math.random() * 100000) + 5000,
      avgTransactionSize: Math.floor(Math.random() * 500) + 50,
      daysSinceFirstTx: Math.floor(Math.random() * 1000) + 100,
      daysSinceLastTx: Math.floor(Math.random() * 7) + 1,
      uniqueContracts: Math.floor(Math.random() * 50) + 5,
      failedTransactions: Math.floor(Math.random() * 20),
      successfulTransactions: Math.floor(Math.random() * 800) + 100,
      gasSpent: Math.floor(Math.random() * 10) + 1,
      tokensHeld: Math.floor(Math.random() * 20) + 1,
      nftCount: Math.floor(Math.random() * 10),
      defiProtocols: this.getRandomDefiProtocols(),
      lendingHistory: {
        borrowed: Math.floor(Math.random() * 5000),
        repaid: Math.floor(Math.random() * 5000),
        defaults: Math.floor(Math.random() * 2)
      }
    };

    // Ensure successful transactions >= total transactions
    mockActivity.successfulTransactions = Math.max(
      mockActivity.successfulTransactions,
      mockActivity.totalTransactions - mockActivity.failedTransactions
    );

    return mockActivity;
  }

  private static getRandomDefiProtocols(): string[] {
    const protocols = [
      'Uniswap', 'Aave', 'Compound', 'Curve', 'SushiSwap',
      'Yearn Finance', 'MakerDAO', 'Balancer', '1inch', 'Synthetix'
    ];
    
    const count = Math.floor(Math.random() * 5);
    const selected: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const protocol = protocols[Math.floor(Math.random() * protocols.length)];
      if (!selected.includes(protocol)) {
        selected.push(protocol);
      }
    }
    
    return selected;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json(
      { error: 'Wallet address is required' },
      { status: 400 }
    );
  }

  try {
    const activity = await CreditScoreCalculator.analyzeWalletActivity(address);
    const creditScore = CreditScoreCalculator.calculateCreditScore(activity);

    return NextResponse.json({
      success: true,
      data: {
        creditScore,
        walletActivity: activity
      }
    });
  } catch (error) {
    console.error('Error calculating credit score:', error);
    return NextResponse.json(
      { error: 'Failed to calculate credit score' },
      { status: 500 }
    );
  }
} 