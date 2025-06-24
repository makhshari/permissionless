'use client';

import { useState, useEffect } from 'react';

export function useWalletConnection() {
  const [wallet, setWallet] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  useEffect(() => {
    // Check if wallet is connected on mount
    const checkWalletConnection = async () => {
      try {
        // Check if Coinbase Wallet is available
        if (typeof window !== 'undefined' && window.ethereum) {
          // Request account access
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts && accounts.length > 0) {
            const address = accounts[0];
            const provider = window.ethereum;
            
            const walletInstance = {
              address,
              getSigner: async () => {
                // Create a signer from the provider
                const { ethers } = await import('ethers');
                return new ethers.BrowserProvider(provider).getSigner();
              }
            };
            
            setWallet(walletInstance);
            setIsConnected(true);
            setWalletAddress(address);
          }
        }
      } catch (error) {
        console.log('No wallet connected:', error);
      }
    };

    checkWalletConnection();

    // Listen for account changes
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          const address = accounts[0];
          const provider = window.ethereum;
          
          const walletInstance = {
            address,
            getSigner: async () => {
              const { ethers } = await import('ethers');
              return new ethers.BrowserProvider(provider).getSigner();
            }
          };
          
          setWallet(walletInstance);
          setIsConnected(true);
          setWalletAddress(address);
        } else {
          setWallet(null);
          setIsConnected(false);
          setWalletAddress(null);
        }
      });
    }
  }, []);

  const connectWallet = async () => {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts && accounts.length > 0) {
          const address = accounts[0];
          const provider = window.ethereum;
          
          const walletInstance = {
            address,
            getSigner: async () => {
              const { ethers } = await import('ethers');
              return new ethers.BrowserProvider(provider).getSigner();
            }
          };
          
          setWallet(walletInstance);
          setIsConnected(true);
          setWalletAddress(address);
        }
      } else {
        throw new Error('No wallet provider found. Please install Coinbase Wallet.');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  };

  const disconnectWallet = () => {
    setWallet(null);
    setIsConnected(false);
    setWalletAddress(null);
  };

  return {
    wallet,
    isConnected,
    walletAddress,
    connectWallet,
    disconnectWallet,
  };
} 