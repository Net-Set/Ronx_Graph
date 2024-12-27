'use client';

import { useEffect, useState, Suspense } from 'react';

declare global {
  interface Window {
    ethereum: any;
  }
}
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
  isOverTake: boolean;  
}

const LevelCard: React.FC<LevelCardProps> = ({
  level,
  cost,
  partners,
  cycles,
  partnersCount,
  partnersCountlayer2,
  isActive,
  isOverTake
}) => {
  const router = useRouter();
  const { walletAddress } = useWallet();
  const { getUserIdsWalletaddress,transferTokens } = useSmartContract();
  const searchParams = useSearchParams();

  const userId = searchParams ? searchParams.get('userId') : '';
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

  const handleActivate = async () => {
    try {
      const provider = new Web3Provider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);



     
      // Transfer tokens if needed before activation
      const tokenVerification = await transferTokens(CONTRACT_ADDRESS, cost.toString());
      console.log('Token Verification:', tokenVerification);

      const tx = await contract.buyNewLevel(2, level);
      await tx.wait();

      console.log('Level activated successfully:', tx);
      alert(`Level ${level} activated successfully! Transaction Hash: ${tx.hash}`);

      router.push(`/retro/levelslider/x4slider?level=${level}&cost=${cost}&partners=${partners}&cycles=${cycles || 0}`);
      router.refresh();
    } catch (error) {
      console.error('Error activating level:', error);
    }
  };

  const handleActiveCard = () => {
    router.push(`/retro/levelslider/x4slider?level=${level}&cost=${cost}&partners=${partners}&cycles=${cycles || 0}`);
  };

  const renderPartnerCircles = () => (
    <div className="flex flex-col items-center space-y-2">
      <div className="flex space-x-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={`top-${i}`}
            className={`w-10 h-10 rounded-full ${i < partnersCount ? 'bg-blue-500' : 'bg-gray-400'}`}
          />
        ))}
      </div>
      <div className="flex space-x-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={`bottom-${i}`}
            className={`w-10 h-10 rounded-full ${i < partnersCountlayer2 ? 'bg-blue-500' : 'bg-gray-400'}`}
          />
        ))}
      </div>
    </div>
  );

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div
        className={`relative p-4 rounded-lg text-white text-center border shadow-lg ${
          isActive ? 'cursor-pointer hover:shadow-xl' : 'cursor-not-allowed opacity-50' 
        } ${isOverTake ? 'bg-red-600' : 'bg-blue-600'} transition-shadow duration-300`}
        onClick={isActive ? handleActiveCard : handleActivate}
      >
        {!isActive && (
          <button
        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={(e) => {
          e.stopPropagation();
          handleActivate();
        }}
          >
        InActivate
          </button>
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