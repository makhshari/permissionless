'use client';

import { useState, useEffect } from 'react';

interface LoyaltyTier {
  name: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
  minStake: number;
  cashbackRate: number;
  benefits: string[];
  nftBadge: string;
}

interface WalletAnalyticsProps {
  walletAddress?: string;
}

export default function WalletAnalytics({ walletAddress }: WalletAnalyticsProps) {
  const [currentTier, setCurrentTier] = useState<string>('Silver');
  const [userStake, setUserStake] = useState<number>(2500);
  const [loading, setLoading] = useState(false);

  const tiers: { [key: string]: LoyaltyTier } = {
    Bronze: {
      name: 'Bronze',
      color: 'text-amber-600',
      bgColor: 'bg-gradient-to-r from-amber-600/20 to-yellow-600/20',
      borderColor: 'border-amber-500/30',
      icon: '🥉',
      minStake: 0,
      cashbackRate: 1.5,
      benefits: ['1.5% SPND rewards', '0.5% BTC cashback', 'Basic support'],
      nftBadge: 'Bronze Member NFT'
    },
    Silver: {
      name: 'Silver',
      color: 'text-gray-400',
      bgColor: 'bg-gradient-to-r from-gray-400/20 to-slate-400/20',
      borderColor: 'border-gray-400/30',
      icon: '🥈',
      minStake: 1000,
      cashbackRate: 2.5,
      benefits: ['2.5% SPND rewards', '1% BTC cashback', 'Priority support', 'Lower interest rates'],
      nftBadge: 'Silver Member NFT'
    },
    Gold: {
      name: 'Gold',
      color: 'text-yellow-500',
      bgColor: 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20',
      borderColor: 'border-yellow-500/30',
      icon: '🥇',
      minStake: 5000,
      cashbackRate: 4.0,
      benefits: ['4% SPND rewards', '2% BTC cashback', 'VIP support', 'Zero interest rates', 'Partner discounts'],
      nftBadge: 'Gold Member NFT'
    }
  };

  const currentTierData = tiers[currentTier];
  const nextTier = currentTier === 'Bronze' ? 'Silver' : currentTier === 'Silver' ? 'Gold' : null;
  const nextTierData = nextTier ? tiers[nextTier] : null;

  const getProgressToNextTier = () => {
    if (!nextTierData) return 100;
    const currentMin = currentTierData.minStake;
    const nextMin = nextTierData.minStake;
    const progress = ((userStake - currentMin) / (nextMin - currentMin)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  const getUserPositionOnSpectrum = () => {
    // Calculate position on the full spectrum (0% = Bronze, 50% = Silver, 100% = Gold)
    if (userStake >= 5000) return 100; // Gold tier
    if (userStake >= 1000) {
      // Between Silver and Gold (50% to 100%)
      const progress = ((userStake - 1000) / (5000 - 1000)) * 50;
      return 50 + progress;
    } else {
      // Between Bronze and Silver (0% to 50%)
      const progress = (userStake / 1000) * 50;
      return progress;
    }
  };

  if (!walletAddress) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#3b82f6]"></div>
        <span className="ml-2 text-sm text-gray-400">Loading tier...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tier Spectrum */}
      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
        <h4 className="text-xs font-medium text-white mb-3">Tier Spectrum</h4>
        <div className="relative">
          {/* Spectrum Bar */}
          <div className="w-full h-3 bg-gradient-to-r from-amber-600 via-gray-400 to-yellow-500 rounded-full relative">
            {/* User Position Indicator */}
            <div 
              className="absolute top-0 w-2 h-3 bg-white rounded-full shadow-lg transform -translate-x-1"
              style={{ 
                left: `${getProgressToNextTier()}%`,
                zIndex: 10
              }}
            ></div>
            {/* Tier Labels */}
            <div className="absolute -bottom-6 left-0 flex items-center space-x-1">
              <span className="text-xs text-amber-400">🥉</span>
              <span className="text-xs text-amber-400">Bronze</span>
            </div>
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 flex items-center space-x-1">
              <span className="text-xs text-gray-400">🥈</span>
              <span className="text-xs text-gray-400">Silver</span>
            </div>
            <div className="absolute -bottom-6 right-0 flex items-center space-x-1">
              <span className="text-xs text-yellow-400">🥇</span>
              <span className="text-xs text-yellow-400">Gold</span>
            </div>
          </div>
          
          {/* Stake Requirements */}
          <div className="flex justify-between text-xs text-gray-400 mt-8">
            <span>0 USDC</span>
            <span>1,000 USDC</span>
            <span>5,000 USDC</span>
          </div>
        </div>
      </div>

      {/* Current Tier Display */}
      <div className={`${currentTierData.bgColor} ${currentTierData.borderColor} border rounded-xl p-4`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{currentTierData.icon}</span>
            <div>
              <h3 className={`font-bold ${currentTierData.color}`}>{currentTierData.name} Tier</h3>
              <p className="text-xs text-gray-400">On-Chain Status</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-white">{currentTierData.cashbackRate}%</div>
            <div className="text-xs text-gray-400">Cashback</div>
          </div>
        </div>
        
        {/* NFT Badge */}
        <div className="bg-white/10 rounded-lg p-2 mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-sm">🎖️</span>
            <span className="text-xs text-white">{currentTierData.nftBadge}</span>
          </div>
        </div>

        {/* Current Stake */}
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-400">Staked USDC:</span>
          <span className="text-sm font-medium text-white">{userStake.toLocaleString()} USDC</span>
        </div>
      </div>

      {/* Progress to Next Tier */}
      {nextTierData && (
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-400">Progress to {nextTierData.name}</span>
            <span className="text-xs text-white">{getProgressToNextTier().toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1.5 mb-2">
            <div 
              className="bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${getProgressToNextTier()}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-400">
            Stake {nextTierData.minStake - userStake} more USDC for {nextTierData.name}
          </p>
        </div>
      )}

      {/* Benefits */}
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-white">Current Benefits:</h4>
        {currentTierData.benefits.map((benefit, index) => (
          <div key={index} className="flex items-center space-x-2">
            <span className="text-green-400 text-xs">✓</span>
            <span className="text-xs text-gray-300">{benefit}</span>
          </div>
        ))}
      </div>
    </div>
  );
} 