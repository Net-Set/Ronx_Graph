'use client';

import { useEffect, useState, Suspense } from 'react';
import { useWallet } from '@/app/context/WalletContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSmartContract } from '@/components/SmartContract/SmartContractProvider';
import CONTRACT_ABI from '@/components/SmartContract/abi.json';
import { ethers } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';
import { CONTRACT_ADDRESS } from '@/config/constants';

interface LevelCardProps {
  level: number;
  cost: number;
  partners: number;
  cycles: number | null; // Allow cycles to be null initially
  partnersCount: number; // Number of partners for level
  isActive: boolean; // Indicates if the level is active
  isOverTake: boolean; // Indicates if the level is overtaken
}

const LevelCard: React.FC<LevelCardProps> = ({ level, cost, partners, cycles, partnersCount, isActive, isOverTake }) => {
  const router = useRouter();
  const walletContext = useWallet();
  const userWalletAddress = walletContext?.walletAddress || null;

  const { getUserIdsWalletaddress, transferTokens } = useSmartContract();
  const searchParams = useSearchParams();
  const userId = searchParams ? searchParams.get('userId') : null;
  const [userAddress, setUserAddress] = useState<string>(userWalletAddress || 'null');

  // Fetch user wallet address based on userId or default to the wallet context address
  useEffect(() => {
    const fetchUserAddress = async () => {
      if (userId) {
        try {
          const fetchedAddress = await getUserIdsWalletaddress(Number(userId));
          setUserAddress(String(fetchedAddress) || userWalletAddress || 'null');
        } catch (error) {
          console.error('Error fetching wallet address for userId:', error);
          setUserAddress(userWalletAddress || 'null');
        }
      } else {
        setUserAddress(userWalletAddress || 'null');
      }
    };
    fetchUserAddress();
  }, [userId, getUserIdsWalletaddress, userWalletAddress]);

  // Handle card click for active levels
  const handleActiveCardClick = () => {
    if (isActive) {
      alert("Level is active");
      const queryParams = userId ? `&userId=${userId}` : '';
      router.push(`/retro/levelslider/x3slider?level=${level}&cost=${cost}&partners=${partners}&cycles=${cycles || 0}${queryParams}`);
    } else {
      // alert('Please activate the level first!');
    }
  };

  // Handle activation of an inactive level
  const handleActivateLevel = async () => {
    try {
      const provider = new Web3Provider(window.ethereum);
      await provider.send('eth_requestAccounts', []); // Request account access
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      // Transfer tokens if needed before activation
      const tokenVerification = await transferTokens(CONTRACT_ADDRESS, cost.toString());
      console.log('Token Verification:', tokenVerification);

      // Activate the level via the smart contract
      const tx = await contract.buyNewLevel(1, level); // Replace 1 with the appropriate userId if needed
      await tx.wait(); // Wait for the transaction to be mined
      console.log('Level activated successfully:', tx);

      alert(`Level ${level} activated successfully! Transaction Hash: ${tx.hash}`);
      router.refresh(); // Refresh the page or data
    } catch (error) {
      console.error('Error activating level:', error);
    }
  };

  const renderPartnerCircles = () => {
    return Array.from({ length: 3 }, (_, i) => (
      <div
        key={i}
        className={`w-10 h-10 rounded-full ${i < partnersCount ? 'bg-blue-600' : 'bg-gray-400'}`}
      ></div>
    ));
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
    
      <div
      className={`p-4 rounded-lg text-center border border-gray-600 relative cursor-pointer ${isActive ? '' : 'opacity-50'} ${isOverTake ? 'bg-red-600' : 'bg-blue-700'}`}
      onClick={isActive ? handleActiveCardClick : handleActivateLevel}
      >
      <div className="flex justify-between mb-4">
      <div className={`text-xl font-bold `}>Lvl {level}</div>
      <div className="text-lg">{cost} BUSD</div>
      </div>
      <div className="flex gap-4 justify-center space-x-210 my-10">{renderPartnerCircles()}</div>
      <div className="flex justify-between mb-4">
      <div className="flex items-center">
      <span className="mr-2">👥</span> {partners}
      </div>
      <div className="flex items-center">
      <span className="mr-2">🔄</span> {cycles !== null ? cycles : 'Loading...'}
      </div>
      </div>
      {!isActive && !isOverTake && (
      <div
      className="absolute inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center text-white text-lg font-bold"
      >
      <button><h4>InActivate</h4></button>
      </div>
      )}
      {isOverTake && (
      <div
      className="absolute inset-0 bg-red-500 bg-opacity-75 flex items-center justify-center text-white text-lg font-bold"
      >
      Overtaken
      </div>
      )}
      </div>
    </Suspense>
  );
};

export default LevelCard;