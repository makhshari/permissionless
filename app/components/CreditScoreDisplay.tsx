'use client';

import { useState, useEffect } from 'react';
import { getCreditScore, CreditScore, WalletActivity } from '../lib/api';

interface CreditScoreDisplayProps {
  walletAddress?: string;
  onCreditScoreUpdate?: (creditScore: CreditScore) => void;
}

export default function CreditScoreDisplay({ walletAddress, onCreditScoreUpdate }: CreditScoreDisplayProps) {
  const [creditScore, setCreditScore] = useState<CreditScore | null>(null);
  const [walletActivity, setWalletActivity] = useState<WalletActivity | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (walletAddress) {
      loadCreditScore();
    }
  }, [walletAddress]);

  const loadCreditScore = async () => {
    if (!walletAddress) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await getCreditScore(walletAddress);
      setCreditScore(result.creditScore);
      setWalletActivity(result.walletActivity);
      
      if (onCreditScoreUpdate) {
        onCreditScoreUpdate(result.creditScore);
      }
    } catch (error) {
      console.error('Error loading credit score:', error);
      setError('Unable to analyze wallet activity');
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'excellent': return 'text-green-400';
      case 'good': return 'text-blue-400';
      case 'fair': return 'text-yellow-400';
      case 'poor': return 'text-orange-400';
      case 'very_poor': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getRiskLevelIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'excellent': return '🟢';
      case 'good': return '🔵';
      case 'fair': return '🟡';
      case 'poor': return '🟠';
      case 'very_poor': return '🔴';
      default: return '⚪';
    }
  };

  if (!walletAddress) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="text-center">
          <p className="text-gray-400">Connect your wallet to view your USDC credit score</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          <span className="ml-3 text-gray-400">Analyzing wallet activity...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="text-center">
          <p className="text-red-400 mb-2">{error}</p>
          <button
            onClick={loadCreditScore}
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!creditScore) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="text-center">
          <p className="text-gray-400">No credit data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <span className="mr-2">💎</span>
          USDC Credit Score
        </h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">Stablecoin Credit</span>
          <div className="px-2 py-1 bg-blue-600 rounded-full text-xs font-medium">
            USDC
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Credit Score */}
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-300">Credit Score</h3>
            <span className={`text-sm font-medium ${getRiskLevelColor(creditScore.riskLevel)}`}>
              {getRiskLevelIcon(creditScore.riskLevel)} {creditScore.riskLevel.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          <p className="text-2xl font-bold text-white">{creditScore.score}</p>
          <p className="text-xs text-gray-400 mt-1">Based on onchain activity</p>
        </div>

        {/* Available Credit */}
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-2">Available USDC Credit</h3>
          <p className="text-2xl font-bold text-green-400">{creditScore.availableCredit.toLocaleString()} USDC</p>
          <p className="text-xs text-gray-400 mt-1">Ready to spend</p>
        </div>

        {/* Max Credit Limit */}
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-2">Max USDC Limit</h3>
          <p className="text-2xl font-bold text-blue-400">{creditScore.maxCreditLimit.toLocaleString()} USDC</p>
          <p className="text-xs text-gray-400 mt-1">Total credit line</p>
        </div>
      </div>

      {/* Credit Factors */}
      {creditScore.factors.positive.length > 0 || creditScore.factors.negative.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-white mb-4">Credit Factors</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {creditScore.factors.positive.length > 0 && (
              <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
                <h4 className="text-sm font-medium text-green-400 mb-2 flex items-center">
                  <span className="mr-1">✅</span>
                  Positive Factors
                </h4>
                <ul className="text-sm text-green-300 space-y-1">
                  {creditScore.factors.positive.map((factor: string, index: number) => (
                    <li key={index}>• {factor}</li>
                  ))}
                </ul>
              </div>
            )}
            {creditScore.factors.negative.length > 0 && (
              <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
                <h4 className="text-sm font-medium text-red-400 mb-2 flex items-center">
                  <span className="mr-1">⚠️</span>
                  Areas for Improvement
                </h4>
                <ul className="text-sm text-red-300 space-y-1">
                  {creditScore.factors.negative.map((factor: string, index: number) => (
                    <li key={index}>• {factor}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {creditScore.recommendations.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-white mb-4">Recommendations</h3>
          <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
            <ul className="text-sm text-blue-300 space-y-2">
              {creditScore.recommendations.map((recommendation: string, index: number) => (
                <li key={index} className="flex items-start">
                  <span className="mr-2 mt-0.5">💡</span>
                  {recommendation}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Stablecoin Benefits */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-700/50 rounded-lg">
        <div className="flex items-center justify-center text-sm text-blue-300">
          <span className="mr-2">🔒</span>
          <span>USDC Credit: Stable 1:1 USD Peg • No Volatility • Instant Blockchain Settlements</span>
        </div>
      </div>
    </div>
  );
} 