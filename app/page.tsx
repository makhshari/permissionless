'use client';

import { useState, useEffect } from 'react';
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownLink,
  WalletDropdownDisconnect,
} from '@coinbase/onchainkit/wallet';
import {
  Address,
  Avatar,
  Name,
  Identity,
  EthBalance,
} from '@coinbase/onchainkit/identity';
import CreditScoreDisplay from './components/CreditScoreDisplay';
import WalletAnalytics from './components/WalletAnalytics';
import RewardsDisplay from './components/RewardsDisplay';
import { getTransactions, spendCredit, repayCredit, CreditScore, Transaction } from '@/app/lib/api';
import { useWalletConnection } from './hooks/useWalletConnection';

export default function CreditCardApp() {
  const { wallet, isConnected, walletAddress, connectWallet } = useWalletConnection();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [spendAmount, setSpendAmount] = useState('');
  const [repayAmount, setRepayAmount] = useState('');
  const [showSpendModal, setShowSpendModal] = useState(false);
  const [showRepayModal, setShowRepayModal] = useState(false);
  const [currentCreditScore, setCurrentCreditScore] = useState<CreditScore | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txLoading, setTxLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);

  // Load transactions when wallet connects
  useEffect(() => {
    if (walletAddress) {
      loadTransactions();
    }
  }, [walletAddress]);

  const loadTransactions = async () => {
    if (!walletAddress) return;
    
    setLoading(true);
    try {
      const userTransactions = await getTransactions(walletAddress);
      setTransactions(userTransactions);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectWallet = async () => {
    setConnecting(true);
    setError(null);
    try {
      await connectWallet();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to connect wallet');
    } finally {
      setConnecting(false);
    }
  };

  // Calculate totals
  const totalSpent = transactions
    .filter(t => t.type === 'spend' && t.status !== 'repaid')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalRepaid = transactions
    .filter(t => t.type === 'repay')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const outstandingBalance = totalSpent - totalRepaid;
  
  // Use dynamic credit limit from credit score
  const maxCreditLimit = currentCreditScore?.maxCreditLimit || 10000;
  const availableCredit = Math.max(0, maxCreditLimit - outstandingBalance);

  const handleSpend = async () => {
    if (!wallet || !walletAddress) {
      setError('Please connect your wallet first');
      return;
    }

    const amount = parseFloat(spendAmount);
    if (amount > 0 && amount <= availableCredit) {
      setTxLoading(true);
      try {
        const signer = await wallet.getSigner();
        const txHash = await spendCredit(amount, signer);
        
        setError(`Transaction submitted! Hash: ${txHash.substring(0, 10)}...`);
        await loadTransactions();
        setSpendAmount('');
        setShowSpendModal(false);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to spend credit');
      } finally {
        setTxLoading(false);
      }
    }
  };

  const handleRepay = async () => {
    if (!wallet || !walletAddress) {
      setError('Please connect your wallet first');
      return;
    }

    const amount = parseFloat(repayAmount);
    if (amount > 0 && amount <= outstandingBalance) {
      setTxLoading(true);
      try {
        const signer = await wallet.getSigner();
        const txHash = await repayCredit(amount, signer);
        
        setError(`Transaction submitted! Hash: ${txHash.substring(0, 10)}...`);
        await loadTransactions();
        setRepayAmount('');
        setShowRepayModal(false);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to repay credit');
      } finally {
        setTxLoading(false);
      }
    }
  };

  const handleCreditScoreUpdate = (creditScore: CreditScore) => {
    setCurrentCreditScore(creditScore);
  };

  // Mock data for recent payments
  const recentPayments = [
    { id: 1, merchant: 'Starbucks', amount: 8.50, category: '☕', date: '2 hours ago', type: 'spend' },
    { id: 2, merchant: '$BTC Cashback', amount: 0.0025, category: '₿', date: '1 day ago', type: 'reward' },
    { id: 3, merchant: 'Uber', amount: 24.30, category: '🚗', date: '1 day ago', type: 'spend' },
    { id: 4, merchant: '$SPND Rewards', amount: 45.20, category: '💎', date: '2 days ago', type: 'reward' },
    { id: 5, merchant: 'Amazon', amount: 156.78, category: '📦', date: '2 days ago', type: 'spend' },
    { id: 6, merchant: 'Netflix', amount: 15.99, category: '📺', date: '3 days ago', type: 'spend' },
  ];

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      'Retail': '🛍️',
      'Food': '🍽️',
      'Transport': '🚗',
      'Entertainment': '🎬',
      'default': '💳'
    };
    return icons[category] || icons.default;
  };

  // Convert BTC to USDC (mock conversion rate)
  const btcToUsdc = (btcAmount: number) => {
    return btcAmount * 45000; // Mock BTC price of $45,000
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-white font-inter">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-20 w-96 h-96 bg-[#3b82f6]/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#8b5cf6]/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#3b82f6]/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
      </div>

      {/* Hero Banner */}
      <section className="relative z-10 min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0d1117] via-[#1e293b]/30 to-[#0d1117]">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#3b82f6]/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#8b5cf6]/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
          {/* Main Headline */}
          <div className="mb-20">
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-light font-space-grotesk mb-12 leading-none tracking-tight">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                SwipeFi
              </span>
            </h1>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-light text-gray-400 mb-8 font-inter tracking-wide">
              Credit meets DeFi
            </h2>
            <p className="text-base md:text-lg text-gray-500 max-w-2xl mx-auto font-inter leading-relaxed tracking-wide">
              Earn <span className="text-white">$BTC</span> and <span className="text-white">$SPND</span> rewards. 
              Build wealth through automated DeFi deposits.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-24">
            <button className="bg-white text-black px-12 py-4 rounded-full font-medium text-sm tracking-wide hover:bg-gray-100 transition-all duration-300">
              Get Started
            </button>
            <button className="text-gray-400 hover:text-white px-12 py-4 rounded-full font-medium text-sm tracking-wide border border-gray-700 hover:border-gray-600 transition-all duration-300">
              Learn More
            </button>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-20">
            <div className="text-center">
              <div className="text-3xl mb-4">₿</div>
              <h3 className="text-sm font-medium text-white mb-2 tracking-wide">2% BTC Cashback</h3>
              <p className="text-xs text-gray-500 tracking-wide">Instant Bitcoin rewards</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-4">🏦</div>
              <h3 className="text-sm font-medium text-white mb-2 tracking-wide">Auto Savings</h3>
              <p className="text-xs text-gray-500 tracking-wide">DeFi yield generation</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-4">⚡</div>
              <h3 className="text-sm font-medium text-white mb-2 tracking-wide">Instant Approval</h3>
              <p className="text-xs text-gray-500 tracking-wide">No credit checks</p>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="animate-pulse">
            <div className="w-px h-12 bg-gray-600 mx-auto"></div>
            <p className="text-xs text-gray-500 mt-4 tracking-widest uppercase">Scroll</p>
          </div>
        </div>
      </section>

      {/* Header with Wallet Connection */}
      <header className="relative z-10 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-sm">₿</span>
              </div>
              <h1 className="text-lg font-medium text-white font-space-grotesk tracking-wide">
                SwipeFi
              </h1>
            </div>
            
            <div className="wallet-container">
              {isConnected ? (
                <Wallet>
                  <ConnectWallet>
                    <div className="flex items-center space-x-3 bg-white/5 backdrop-blur-sm rounded-full px-4 py-2.5 border border-white/10 hover:border-white/20 transition-all duration-300">
                      <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
                        <span className="text-green-400 text-sm">✓</span>
                      </div>
                      <div className="flex flex-col">
                        <Name className="text-xs font-medium text-white" />
                        <Address className="text-xs text-gray-400" />
                      </div>
                    </div>
                  </ConnectWallet>
                  <WalletDropdown>
                    <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                      <Avatar />
                      <Name />
                      <Address />
                      <EthBalance />
                    </Identity>
                    <WalletDropdownLink
                      icon="wallet"
                      href="https://keys.coinbase.com"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Wallet
                    </WalletDropdownLink>
                    <WalletDropdownDisconnect />
                  </WalletDropdown>
                </Wallet>
              ) : (
                <button
                  onClick={handleConnectWallet}
                  disabled={connecting}
                  className="flex items-center space-x-2 bg-white/5 backdrop-blur-sm text-white px-4 py-2.5 rounded-full font-medium text-sm tracking-wide border border-white/10 hover:border-white/20 transition-all duration-300"
                >
                  <span className="text-lg">👛</span>
                  {connecting ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                      <span>Connecting...</span>
                    </div>
                  ) : (
                    <span>Connect Wallet</span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
        {/* Error Display */}
        {error && (
          <div className="mb-8 bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
            <div className="flex justify-between items-center">
              <p className="text-red-200 text-sm">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-red-300 hover:text-red-100 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Credit Score */}
        <div className="mb-12">
          <CreditScoreDisplay 
            walletAddress={walletAddress || undefined}
            onCreditScoreUpdate={handleCreditScoreUpdate}
          />
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - Credit Limit, Activity & Actions */}
          <div className="lg:col-span-3 space-y-8">
            {/* Credit Limit Card */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-medium text-white tracking-wide">Credit Limit</h2>
                <div className="w-8 h-6 bg-white/10 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs font-medium">USDC</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-2 tracking-wide uppercase">Total Credit</p>
                  <p className="text-2xl font-light text-white">{maxCreditLimit.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-2 tracking-wide uppercase">Available</p>
                  <p className="text-2xl font-light text-green-400">{availableCredit.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-2 tracking-wide uppercase">Used</p>
                  <p className="text-2xl font-light text-red-400">{outstandingBalance.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="bg-black/20 rounded-xl p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs text-gray-400 tracking-wide uppercase">Credit Utilization</span>
                  <span className="text-xs text-white font-medium">
                    {((outstandingBalance / maxCreditLimit) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1">
                  <div 
                    className="bg-white h-1 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((outstandingBalance / maxCreditLimit) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <h2 className="text-lg font-medium text-white mb-8 tracking-wide">Recent Activity</h2>
              <div className="space-y-4">
                {recentPayments.map((payment) => (
                  <div key={payment.id} className={`flex items-center justify-between p-4 rounded-xl border border-white/10 ${
                    payment.type === 'reward' 
                      ? 'bg-green-500/5' 
                      : 'bg-red-500/5'
                  }`}>
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        payment.type === 'reward' 
                          ? payment.category === '₿'
                            ? 'bg-orange-500/20'
                            : 'bg-green-500/20'
                          : 'bg-white/10'
                      }`}>
                        <span className={`text-lg ${payment.category === '₿' ? 'text-orange-400' : ''}`}>{payment.category}</span>
                      </div>
                      <div>
                        <p className="font-medium text-white text-sm">{payment.merchant}</p>
                        <p className="text-xs text-gray-400">{payment.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium text-sm ${
                        payment.type === 'reward' 
                          ? payment.category === '₿'
                            ? 'text-orange-400'
                            : 'text-green-400'
                          : 'text-red-400'
                      }`}>
                        {payment.type === 'reward' ? '+' : '-'}
                        {payment.category === '₿' ? btcToUsdc(payment.amount).toFixed(2) : payment.amount.toFixed(2)} USDC
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <h3 className="text-lg font-medium text-white mb-6 tracking-wide">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setShowSpendModal(true)}
                  disabled={availableCredit <= 0 || !isConnected}
                  className="w-full bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] text-white py-4 px-6 rounded-xl font-medium text-sm tracking-wide disabled:opacity-50 disabled:cursor-not-allowed hover:from-[#2563eb] hover:to-[#7c3aed] transition-all duration-300"
                >
                  💳 Spend
                </button>
                <button
                  onClick={() => setShowRepayModal(true)}
                  disabled={outstandingBalance <= 0 || !isConnected}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-xl font-medium text-sm tracking-wide disabled:opacity-50 disabled:cursor-not-allowed hover:from-green-700 hover:to-emerald-700 transition-all duration-300"
                >
                  💰 Repay
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-8">
            {/* Loyalty Tier Sidebar */}
            {isConnected && (
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                <h2 className="text-lg font-medium text-white mb-8 tracking-wide">Loyalty Tier</h2>
                <WalletAnalytics walletAddress={walletAddress || undefined} />
              </div>
            )}

            {/* Rewards Panel */}
            {isConnected && (
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                <h2 className="text-lg font-medium text-white mb-8 tracking-wide">Rewards</h2>
                <RewardsDisplay />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      {showSpendModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 w-full max-w-md border border-white/20">
            <h3 className="text-lg font-medium text-white mb-6 tracking-wide">
              Make a Purchase
            </h3>
            <div className="mb-6">
              <label className="block text-xs text-gray-400 mb-2 tracking-wide uppercase">
                Amount (USDC)
              </label>
              <input
                type="number"
                value={spendAmount}
                onChange={(e) => setSpendAmount(e.target.value)}
                placeholder="Enter USDC amount"
                className="w-full px-4 py-3 border border-white/20 rounded-xl bg-white/5 text-white backdrop-blur-sm focus:outline-none focus:border-white/40"
                min="0"
                max={availableCredit}
              />
              <p className="text-xs text-gray-400 mt-2">
                Available credit: {availableCredit.toLocaleString()} USDC
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSpendModal(false)}
                disabled={txLoading}
                className="flex-1 px-4 py-3 text-gray-300 border border-white/20 rounded-xl hover:bg-white/5 disabled:opacity-50 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSpend}
                disabled={!spendAmount || parseFloat(spendAmount) <= 0 || parseFloat(spendAmount) > availableCredit || txLoading}
                className="flex-1 px-4 py-3 bg-white text-black rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-all duration-300"
              >
                {txLoading ? 'Processing...' : 'Spend USDC'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showRepayModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 w-full max-w-md border border-white/20">
            <h3 className="text-lg font-medium text-white mb-6 tracking-wide">
              Make a Repayment
            </h3>
            <div className="mb-6">
              <label className="block text-xs text-gray-400 mb-2 tracking-wide uppercase">
                Amount (USDC)
              </label>
              <input
                type="number"
                value={repayAmount}
                onChange={(e) => setRepayAmount(e.target.value)}
                placeholder="Enter USDC amount"
                className="w-full px-4 py-3 border border-white/20 rounded-xl bg-white/5 text-white backdrop-blur-sm focus:outline-none focus:border-white/40"
                min="0"
                max={outstandingBalance}
              />
              <p className="text-xs text-gray-400 mt-2">
                Outstanding balance: {outstandingBalance.toLocaleString()} USDC
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRepayModal(false)}
                disabled={txLoading}
                className="flex-1 px-4 py-3 text-gray-300 border border-white/20 rounded-xl hover:bg-white/5 disabled:opacity-50 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleRepay}
                disabled={!repayAmount || parseFloat(repayAmount) <= 0 || parseFloat(repayAmount) > outstandingBalance || txLoading}
                className="flex-1 px-4 py-3 bg-white text-black rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-all duration-300"
              >
                {txLoading ? 'Processing...' : 'Repay USDC'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
