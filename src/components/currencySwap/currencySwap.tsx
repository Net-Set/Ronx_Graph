'use client';

import { useState, useEffect } from 'react';
import Web3 from 'web3';
import { useWallet } from '@/app/context/WalletContext';
import Button from '@/components/ui/button/button';
import Input from '@/components/ui/forms/input';
import PANCAKE_ROUTER_ABI from '@/components/currencySwap/abi.json';
declare let window: any;

// PancakeSwap Router V2 (Testnet)
const PANCAKE_ROUTER_ADDRESS = '0xD99D1c33F9fC3444f8101754aBC46c52416550D1';
// BUSD Contract Address (Testnet)
const BUSD_CONTRACT_ADDRESS = '0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee';
// WBNB Contract Address (Testnet)
const WBNB_ADDRESS = '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd';





interface SwapComponentProps {
  onClose: () => void;
}

export default function SwapComponent({ onClose }: SwapComponentProps) {
  const { walletAddress } = useWallet();
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [amountBNB, setAmountBNB] = useState('');
  const [estimatedBUSD, setEstimatedBUSD] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Initialize Web3 instance
  useEffect(() => {
    if (window?.ethereum) {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);

      // Request account access if not already connected
      window.ethereum.request({ method: 'eth_requestAccounts' });
    }
  }, []);

  // Get the estimated BUSD based on the input BNB amount
  const getEstimatedBUSD = async (bnbAmount: string) => {
    if (!web3) return;

    const routerContract = new web3.eth.Contract(PANCAKE_ROUTER_ABI, PANCAKE_ROUTER_ADDRESS);
    const amountIn = web3.utils.toWei(bnbAmount, 'ether');
    const path = [WBNB_ADDRESS, BUSD_CONTRACT_ADDRESS];

    try {
      const amountsOut = await routerContract.methods.getAmountsOut(amountIn, path).call();
      console.log('Amounts Out:', amountsOut);
      const estimatedBUSD = web3.utils.fromWei((amountsOut as string[])[1], 'ether');
      console.log('Estimated BUSD:', estimatedBUSD);
      setEstimatedBUSD(estimatedBUSD);
    } catch (error) {
      console.error('Error fetching estimated BUSD:', error);
      setEstimatedBUSD(null);
    }
  };

  // Real-time update of estimated BUSD as BNB amount changes
  const handleBNBChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const bnbAmount = e.target.value;
    setAmountBNB(bnbAmount);
    getEstimatedBUSD(bnbAmount);
  };

  // Handle BNB to BUSD Swap
  const handleSwap = async () => {
    if (!web3 || !walletAddress || !amountBNB) {
      alert('Please connect your wallet and enter a valid amount.');
      return;
    }

    const routerContract = new web3.eth.Contract(PANCAKE_ROUTER_ABI, PANCAKE_ROUTER_ADDRESS);
    const path = [WBNB_ADDRESS, BUSD_CONTRACT_ADDRESS];
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from now
    const value = web3.utils.toWei(amountBNB, 'ether');

    setLoading(true);

    try {
      // Estimate gas
      let gasEstimate;
      try {
        gasEstimate = await routerContract.methods
          .swapExactETHForTokensSupportingFeeOnTransferTokens(0, path, walletAddress, deadline)
          .estimateGas({ from: walletAddress, value });
      } catch (gasError) {
        console.warn('Gas estimation failed, using default gas limit.');
        gasEstimate = 300000; // Fallback gas limit
      }

      console.log('Gas estimate:', gasEstimate);

      // Execute the swap
      const tx = await routerContract.methods
        .swapExactETHForTokensSupportingFeeOnTransferTokens(0, path, walletAddress, deadline)
        .send({ from: walletAddress, value, gas: gasEstimate.toString() });

      console.log('Swap successful:', tx);
      alert('Swap successful!');
      onClose();
    } catch (error: any) {
      console.error('Swap error:', error);
      if (error?.message) {
        alert(`Swap failed: ${error.message}`);
      } else {
        alert('Swap failed. Check the console for details.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Background Overlay */}
      <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>

      {/* Popup Container */}
      <div className="relative bg-gray-900 text-white p-8 rounded-lg shadow-lg max-w-md w-full z-50">
        {/* Close Button */}
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-white focus:outline-none"
          onClick={onClose}
        >
          ✖
        </button>

        {/* Swap Title */}
        <h2 className="text-xl font-bold mb-6 text-center">Swap BNB to BUSD</h2>

        {/* Input Amount BNB */}
        <div className="mb-4 p-4 bg-gray-800 rounded-lg flex justify-between items-center">
          <label className="text-sm">From</label>
          <div className="text-lg flex items-center space-x-2">
            <span className="text-yellow-400">tBNB</span>
            <Input
              type="text"
              placeholder="0.0"
              value={amountBNB}
              onChange={handleBNBChange} // Real-time update on input change
              inputClassName="focus:!ring-0 placeholder:text-gray-500 bg-gray-800 border-none text-white"
            />
          </div>
        </div>

        {/* Estimated BUSD Output */}
        <div className="mb-6 p-4 bg-gray-800 rounded-lg flex justify-between items-center">
          <label className="text-sm">To</label>
          <div className="text-lg flex items-center space-x-2">
            <span className="text-yellow-400">BUSD</span>
            <span className="text-white">{estimatedBUSD ? estimatedBUSD : '0.0'}</span>
          </div>
        </div>

        {/* Swap Button */}
        <Button
          onClick={handleSwap}
          disabled={loading || !amountBNB || !estimatedBUSD}
          className="w-full bg-green-600 hover:bg-green-700 transition-colors"
        >
          {loading ? 'Swapping...' : 'Swap BNB to BUSD'}
        </Button>
      </div>
    </div>
  );
}
