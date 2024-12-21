'use client';

import { useEffect, useState } from 'react';
import Web3 from 'web3';
import { useWallet } from '@/app/context/WalletContext';

declare let window: any;

interface WalletStatusProps {
  isConnected: boolean;
  networkConnected: boolean;
  registrationAvailable: boolean;
  balance: {
    BUSD: number;
    BNB: number;
  };
}

const BUSD_CONTRACT_ADDRESS = '0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee'; // Replace with your actual BUSD contract address
const BUSD_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
];

export default function WalletStatus() {
  const { walletAddress, disconnect, networkId } = useWallet();
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [walletStatus, setWalletStatus] = useState<WalletStatusProps>({
    isConnected: false,
    networkConnected: false,
    registrationAvailable: false,
    balance: { BUSD: 0, BNB: 0 },
  });

  // Initialize Web3 instance
  useEffect(() => {
    if (window?.ethereum) {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
    }
  }, []);

  // Update wallet status when address or Web3 instance changes
  useEffect(() => {
    if (walletAddress && web3) {
      updateWalletStatus(walletAddress);
    }
  }, [walletAddress, web3]);

  // Helper function to get the network name
  const getNetworkName = (networkId: number | null) => {
    switch (networkId) {
      case 1:
        return 'Ethereum Mainnet';
      case 56:
        return 'BSC Mainnet';
      case 97:
        return 'BSC Testnet';
      default:
        return 'Unknown Network';
    }
  };

  // Fetch wallet status and balances
  const updateWalletStatus = async (address: string) => {
    if (!web3) return;

    try {
      // Check network ID
      const networkId = await web3.eth.net.getId();
      const isNetworkConnected = [56, 97].includes(Number(networkId));

      // Fetch BNB balance
      const balanceBNB = await web3.eth.getBalance(address);
      const formattedBNB = parseFloat(web3.utils.fromWei(balanceBNB, 'ether'));

      // Fetch BUSD balance
      const busdBalance = await getBUSDBalance(address);

      // Update wallet status
      setWalletStatus({
        isConnected: !!address,
        networkConnected: isNetworkConnected,
        registrationAvailable: busdBalance >= 12,
        balance: {
          BUSD: busdBalance,
          BNB: formattedBNB,
        },
      });
    } catch (error) {
      console.error('Error updating wallet status:', error);
    }
  };

  // Fetch BUSD balance using the contract
  const getBUSDBalance = async (account: string): Promise<number> => {
    if (!web3) return 0;

    try {
      const contract = new web3.eth.Contract(BUSD_ABI, BUSD_CONTRACT_ADDRESS);
      const balance: string = await contract.methods.balanceOf(account).call();
      return parseFloat(web3.utils.fromWei(balance, 'ether'));
    } catch (error) {
      console.error('Error fetching BUSD balance:', error);
      return 0;
    }
  };

  // Determine the network color based on the network ID
  const networkName = getNetworkName(networkId);
  const networkColor = networkName === 'Unknown Network' ? 'text-red-500' : 'text-green-500';

  // UI rendering
  return (
    <div className="mt-8 p-6 bg-gray-800 rounded-lg shadow-md text-white">
      <h2 className="mb-6 text-lg font-semibold">Wallet & Network Status</h2>
      <div className="space-y-4">
        {/* Wallet Connection Status */}
        <div className="flex items-center justify-between">
          <span>Wallet:</span>
          <span className={walletStatus.isConnected ? 'text-green-500' : 'text-red-500'}>
            {walletStatus.isConnected ? 'Connected' : 'Not Connected'}
          </span>
        </div>

        {/* Network Connection Status */}
        <div className="flex items-center justify-between">
          <span>Network:</span>
          <span className={networkColor}>{networkName}</span>
        </div>

        {/* Registration Availability */}
        <div className="flex items-center justify-between">
          <span>Registration:</span>
          <span className={walletStatus.registrationAvailable ? 'text-green-500' : 'text-red-500'}>
            {walletStatus.registrationAvailable ? 'Available' : 'Unavailable'}
          </span>
        </div>

        {/* Balance Display */}
        {walletStatus.isConnected && (
          <div className="flex items-center justify-between">
            <span>Balance:</span>
            <span>
              {walletStatus.balance.BUSD < 12
                ? 'Min 12 BUSD required'
                : `${walletStatus.balance.BUSD.toFixed(2)} BUSD / ${walletStatus.balance.BNB.toFixed(4)} BNB`}
            </span>
          </div>
        )}
      </div>

     
    </div>
  );
}
