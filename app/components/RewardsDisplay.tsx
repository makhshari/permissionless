'use client';

import { useState, useEffect } from 'react';
import { getUserRewards, getSpndBalance, claimBTCCashback } from '../lib/api';
import { useAccount, useWalletClient } from 'wagmi';

interface UserRewards {
  spndEarned: number;
  spndClaimed: number;
  btcEarned: number;
  btcClaimed: number;
  spndAvailable: number;
  btcAvailable: number;
}

export default function RewardsDisplay() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [rewards, setRewards] = useState<UserRewards | null>(null);
  const [spndBalance, setSpndBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  useEffect(() => {
    if (address) {
      loadRewards();
    }
  }, [address]);

  const loadRewards = async () => {
    if (!address) return;
    
    setIsLoading(true);
    try {
      const [rewardsData, balance] = await Promise.all([
        getUserRewards(address),
        getSpndBalance(address)
      ]);
      
      setRewards(rewardsData);
      setSpndBalance(balance);
    } catch (error) {
      console.error('Error loading rewards:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimBTC = async () => {
    if (!walletClient || !address) return;
    
    setIsClaiming(true);
    try {
      const success = await claimBTCCashback(walletClient);
      if (success) {
        await loadRewards(); // Refresh data
        alert('BTC cashback claimed successfully!');
      }
    } catch (error) {
      console.error('Error claiming BTC cashback:', error);
      alert('Failed to claim BTC cashback');
    } finally {
      setIsClaiming(false);
    }
  };

  if (!address) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">Connect your wallet to view rewards</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="text-gray-400 mt-2">Loading rewards...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* SPND Rewards Card */}
      <div className="bg-gradient-to-r from-purple-600/20 to-purple-800/20 backdrop-blur-sm rounded-xl p-4 border border-purple-500/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">$</span>
            </div>
            <div>
              <h4 className="text-white font-semibold">$SPND</h4>
              <p className="text-purple-200 text-xs">Rewards</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">
              {spndBalance.toFixed(2)}
            </p>
            <p className="text-purple-200 text-xs">Available</p>
          </div>
        </div>
        
        {rewards && (
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-purple-500/20 rounded-lg p-2">
              <p className="text-purple-200">Earned</p>
              <p className="text-white font-semibold">{rewards.spndEarned.toFixed(2)}</p>
            </div>
            <div className="bg-purple-500/20 rounded-lg p-2">
              <p className="text-purple-200">Claimed</p>
              <p className="text-white font-semibold">{rewards.spndClaimed.toFixed(2)}</p>
            </div>
          </div>
        )}
      </div>

      {/* BTC Cashback Card */}
      <div className="bg-gradient-to-r from-orange-600/20 to-orange-800/20 backdrop-blur-sm rounded-xl p-4 border border-orange-500/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">₿</span>
            </div>
            <div>
              <h4 className="text-white font-semibold">$BTC</h4>
              <p className="text-orange-200 text-xs">Cashback</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">
              {rewards?.btcAvailable.toFixed(2) || '0.00'}
            </p>
            <p className="text-orange-200 text-xs">USDC</p>
          </div>
        </div>
        
        {rewards && rewards.btcAvailable > 0 && (
          <button
            onClick={handleClaimBTC}
            disabled={isClaiming}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-orange-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:transform-none"
          >
            {isClaiming ? 'Claiming...' : 'Claim $BTC'}
          </button>
        )}
      </div>

      {/* Reward Stats */}
      {rewards && (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
          <h4 className="text-white font-semibold mb-3 text-sm">📊 Stats</h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-white/5 rounded-lg p-2">
              <p className="text-gray-400">$SPND Earned</p>
              <p className="text-white font-semibold">{rewards.spndEarned.toFixed(2)}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-2">
              <p className="text-gray-400">$SPND Claimed</p>
              <p className="text-white font-semibold">{rewards.spndClaimed.toFixed(2)}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-2">
              <p className="text-gray-400">$BTC Earned</p>
              <p className="text-white font-semibold">${rewards.btcEarned.toFixed(2)}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-2">
              <p className="text-gray-400">$BTC Claimed</p>
              <p className="text-white font-semibold">${rewards.btcClaimed.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 