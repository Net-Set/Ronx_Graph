// src/components/LevelCard/LevelCard.tsx
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useWallet } from '@/app/context/WalletContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSmartContract } from '@/components/SmartContract/SmartContractProvider';

interface LevelCardProps {
  level: number;
  cost: number;
  partners: number;
  cycles: number | null; // Allow cycles to be null initially
  partnersCount: number; // Number of partners for level
  isActive: boolean; // Indicates if the level is active
}

const LevelCard: React.FC<LevelCardProps> = ({ level, cost, partners, cycles, partnersCount, isActive }) => {
  const router = useRouter();
  const walletAddress = useWallet();
  const staticAddress = walletAddress ? walletAddress.walletAddress : null;
  const userWalletAddress = staticAddress;

  const { getUserIdsWalletaddress } = useSmartContract();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  const [userAddress, setUserAddress] = useState<string>('');

  // Fetch user wallet address if userId is provided, else use static address
  useEffect(() => {
    const fetchUserAddress = async () => {
      if (userId) {
        try {
          const fetchedAddress = await getUserIdsWalletaddress(Number(userId));
          setUserAddress(String(fetchedAddress) || userWalletAddress || 'null');
        } catch (error) {
          console.error("Error fetching wallet address for userId:", error);
          setUserAddress(userWalletAddress || 'null');
        }
      } else {
        setUserAddress(userWalletAddress || 'null');
      }
    };

    fetchUserAddress();
  }, [userId, getUserIdsWalletaddress, userWalletAddress]);

  const handleClick = () => {
    if (isActive) {
      const userIdParam = userId ? `&userId=${userId}` : '';
      router.push(`/retro/levelslider/x3slider?level=${level}&cost=${cost}&partners=${partners}&cycles=${cycles}${userIdParam}`);
    } else {
      alert('This level is inactive. Please activate it first!');
    }
  };

  const renderPartnerCircles = () => {
    const circles = [];

    for (let i = 0; i < 3; i++) {
      circles.push(
        <div
          key={i}
          className={`w-10 h-10 rounded-full ${i < partnersCount ? 'bg-blue-600' : 'bg-gray-400'}`}
        ></div>
      );
    }

    return circles;
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div
        className={`bg-blue-700 p-4 rounded-lg text-center border border-gray-600 relative cursor-pointer ${
          isActive ? '' : 'opacity-50 pointer-events-none'
        }`}
        onClick={handleClick}
      >
        <div className="flex justify-between mb-4">
          <div className="text-xl font-bold">Lvl {level}</div>
          <div className="text-lg">{cost} BUSD</div>
        </div>
        <div className="flex gap-4 justify-center space-x-210 my-10">
          {renderPartnerCircles()}
        </div>
        <div className="flex justify-between mb-4">
          <div className="flex items-center">
            <span className="mr-2">👥</span> {partners}
          </div>
          <div className="flex items-center">
            <span className="mr-2">🔄</span> {cycles !== null ? cycles : 'Loading...'}
          </div>
        </div>
        {!isActive && (
          <div className="absolute inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center text-white text-lg font-bold">
            Inactive
          </div>
        )}
      </div>
    </Suspense>
  );
};

export default LevelCard;
