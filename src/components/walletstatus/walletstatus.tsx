'use client';

import { useEffect, useState } from 'react';
import Web3 from 'web3';
import { useWallet } from '@/app/context/WalletContext';
import { ConnectIcon } from '@/components/icons/ConnectIcon';
import { DisconnectIcon } from '@/components/icons/DisconnectedIcon';
import { BUSD_CONTRACT_ADDRESS } from '@/config/constants';
declare let window: any;

interface WalletStatusProps { 
  isConnected: boolean;
  networkConnected: boolean;
  registrationAvailable: boolean;
  balance: {
    BUSD: number;   
    BNB: number;
  };
  approvedBUSD?: boolean;
}

// Replace with your actual BUSD contract address
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
    } else {
      setWalletStatus({
        isConnected: false,
        networkConnected: false,
        registrationAvailable: false,
        balance: { BUSD: 0, BNB: 0 },
      });
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

  // BlankIcon component
  const BlankIcon = () => (
    <div className="w-6 h-6 flex-shrink-0 stroke-current undefined border rounded-full border-line-gray"></div>
  );

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
        approvedBUSD: busdBalance >= 12, // Assuming approval is based on balance for this example
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

  // Determine the network color and icon based on the network ID
  const networkName = getNetworkName(networkId);
  const networkColor = walletStatus.networkConnected ? 'text-green-500' : 'text-red-500';
  const networkIcon = walletStatus.networkConnected ? <ConnectIcon /> : <DisconnectIcon />;

  // UI rendering
  return (
    <div className="mt-8 p-6 bg-gray-800 rounded-lg shadow-md text-white">
      <h2 className="mb-6 text-lg font-semibold">Wallet & Network Status</h2>
      <div className="space-y-4">
        {/* Wallet Connection Status */}
        <div className="flex flex-col items-start">
          <div className="flex transition-all duration-300 ease-in-out">
            {walletStatus.isConnected ? <ConnectIcon /> : <DisconnectIcon />}
            <div
              className={`flex flex-wrap items-center ml-2.5 leading-5 text-base whitespace-nowrap ${
                walletStatus.isConnected ? "text-green-500" : "text-red-500"
              }`}
            >
              <span className="mr-1.5">
                <span>Wallet</span>
                <span>:</span>
              </span>
              <span>{walletStatus.isConnected ? "Connected" : "Disconnected"}</span>
            </div>
          </div>
        </div>

        {/* Network Connection Status */}
        <div className="flex flex-col items-start">
          <div className="flex transition-all duration-300 ease-in-out">
            {walletStatus.isConnected ? (
              walletStatus.networkConnected ? (
                networkIcon
              ) : (
                <DisconnectIcon />
              )
            ) : (
              <BlankIcon />
            )}
            <div
              className={`flex flex-wrap items-center ml-2.5 leading-5 text-base whitespace-nowrap ${
                walletStatus.isConnected
                  ? walletStatus.networkConnected
                    ? "text-green-500"
                    : "text-red-500"
                  : "text-gray-500"
              }`}
            >
              <span className="mr-1.5">
                <span>Network</span>
                <span>:</span>
              </span>
              <span>
                {walletStatus.isConnected
                  ? walletStatus.networkConnected
                    ? networkName
                    : "Disconnected"
                  : ""}
              </span>
            </div>
          </div>
        </div>
  
        {/* Registration Availability */}
        <div className="flex flex-col items-start">
          <div className="flex transition-all duration-300 ease-in-out">
            {walletStatus.isConnected && walletStatus.networkConnected ? (
              walletStatus.registrationAvailable ? (
                <ConnectIcon />
              ) : (
                <DisconnectIcon />
              )
            ) : (
              <BlankIcon />
            )}
            <div
              className={`flex flex-wrap items-center ml-2.5 leading-5 text-base whitespace-nowrap ${
                walletStatus.isConnected && walletStatus.networkConnected
                  ? walletStatus.registrationAvailable
                    ? "text-green-500"
                    : "text-red-500"
                  : "text-gray-500"
              }`}
            >
              <span className="mr-1.5">
                <span>Registration</span>
                <span>:</span>
              </span>
              <span>
                {walletStatus.isConnected && walletStatus.networkConnected
                  ? walletStatus.registrationAvailable
                    ? "Available"
                    : "Not Available"
                  : ""}
              </span>
            </div>
          </div>
        </div>
  
        {/* Balance Display */}
        <div className="flex flex-col items-start">
          <div className="flex transition-all duration-300 ease-in-out">
            {walletStatus.isConnected &&
            walletStatus.networkConnected &&
            walletStatus.registrationAvailable ? (
              walletStatus.balance.BUSD >= 12 ? (
                <ConnectIcon />
              ) : (
                <DisconnectIcon />
              )
            ) : (
              <BlankIcon />
            )}
            <div
              className={`flex flex-wrap items-center ml-2.5 leading-5 text-base whitespace-nowrap ${
                walletStatus.isConnected &&
                walletStatus.networkConnected &&
                walletStatus.registrationAvailable
                  ? walletStatus.balance.BUSD >= 12
                    ? "text-green-500"
                    : "text-red-500"
                  : "text-gray-500"
              }`}
            >
              <span className="mr-1.5">
                <span>Balance</span>
                <span>:</span>
              </span>
              <span>
                {walletStatus.isConnected &&
                walletStatus.networkConnected &&
                walletStatus.registrationAvailable
                  ? walletStatus.balance.BUSD >= 12
                    ? `${walletStatus.balance.BUSD.toFixed(2)} BUSD / ${walletStatus.balance.BNB.toFixed(
                        4
                      )} BNB`
                    : "Insufficient Balance"
                  : ""}
              </span>
            </div>
          </div>
        </div>
  
        {/* Approved BUSD */}
        <div className="flex flex-col items-start">
          <div className="flex transition-all duration-300 ease-in-out">
            {walletStatus.isConnected &&
            walletStatus.networkConnected &&
            walletStatus.registrationAvailable ? (
              walletStatus.approvedBUSD ? (
                <ConnectIcon />
              ) : (
                <DisconnectIcon />
              )
            ) : (
              <BlankIcon />
            )}
            <div
              className={`flex flex-wrap items-center ml-2.5 leading-5 text-base whitespace-nowrap ${
                walletStatus.isConnected &&
                walletStatus.networkConnected &&
                walletStatus.registrationAvailable
                  ? walletStatus.approvedBUSD
                    ? "text-green-500"
                    : "text-red-500"
                  : "text-gray-500"
              }`}
            >
              <span className="mr-1.5">
                <span>Approve BUSD</span>
                <span>:</span>
              </span>
              <span>
                {walletStatus.isConnected &&
                walletStatus.networkConnected &&
                walletStatus.registrationAvailable
                  ? walletStatus.approvedBUSD
                    ? "Approved"
                    : "Not Approved"
                  : ""}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
