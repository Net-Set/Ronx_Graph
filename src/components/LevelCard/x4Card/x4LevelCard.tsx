'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaUsers, FaSyncAlt, FaCoins } from 'react-icons/fa';
import { useSmartContract } from '@/components/SmartContract/SmartContractProvider';
import { useWallet } from '@/app/context/WalletContext';
import CONTRACT_ABI from '@/components/SmartContract/abi.json';
import { ethers } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';
import { CONTRACT_ADDRESS } from '@/config/constants';


interface LevelCardProps {
  level: number;
  cost: number;
  partners: number;
  cycles: number | null;
  partnersCount: number;
  partnersCountlayer2: number;
  isActive: boolean;
}

const LevelCard: React.FC<LevelCardProps> = ({ level, cost, partners, cycles, partnersCount, partnersCountlayer2, isActive }) => {
  const router = useRouter();
  const { walletAddress } = useWallet();
  const { getUserIdsWalletaddress } = useSmartContract();
  const searchParams = useSearchParams();

  const userId = searchParams.get('userId');
  const [userAddress, setUserAddress] = useState<string>(walletAddress || '');

  useEffect(() => {
    if (userId) {
      const fetchAddress = async () => {
        const fetchedAddress = await getUserIdsWalletaddress(Number(userId));
        setUserAddress(String(fetchedAddress) || walletAddress || '');
      };
      fetchAddress();
    }
  }, [userId, getUserIdsWalletaddress, walletAddress]);


  const handleActivate = async (clickedLevel: number) => {
    try {
      const provider = new Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []); // Request account access
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

     

      // Call the contract to activate the level
      const tx = await contract.buyNewLevel(2, clickedLevel);
      await tx.wait(); // Wait for the transaction to complete
      console.log('Level activated successfully:', tx);
      alert(`Level ${clickedLevel} activated successfully! Transaction Hash: ${tx.hash}`);

      // Optional: Refresh the page or data
      router.refresh();
    } catch (error) {
      console.error("Error activating level:", error);
    }
  };

  const renderPartnerCircles = () => (
    <div className="flex flex-col items-center space-y-2">
      <div className="flex space-x-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={`top-${i}`} className={`w-10 h-10 rounded-full ${i < partnersCount ? 'bg-blue-500' : 'bg-gray-400'}`} />
        ))}
      </div>
      <div className="flex space-x-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={`bottom-${i}`} className={`w-10 h-10 rounded-full ${i < partnersCountlayer2 ? 'bg-blue-500' : 'bg-gray-400'}`} />
        ))}
      </div>
    </div>
  );

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div
        className={`relative bg-blue-600 p-4 rounded-lg text-white text-center border border-blue-500 shadow-lg cursor-pointer hover:shadow-xl transition-shadow duration-300 ${
          isActive ? 'opacity-100' : 'opacity-50'
        }`}
        onClick={() => handleActivate(level)}
      >
        {!isActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-2xl font-bold">
            Inactive
          </div>
        )}
        <div className="absolute top-2 right-2 text-yellow-300">
          <FaCoins className="inline mr-1" /> {cost}
        </div>
        <div className="text-lg font-semibold mb-4">Lvl {level}</div>
        {renderPartnerCircles()}
        <div className="flex justify-between text-sm mt-6">
          <div className="flex items-center">
            <FaUsers className="mr-2" /> {partners}
          </div>
          <div className="flex items-center">
            <FaSyncAlt className="mr-2" /> {cycles !== null ? cycles : 'Loading...'}
          </div>
        </div>
      </div>
    </Suspense>
  );
};

export default LevelCard;
