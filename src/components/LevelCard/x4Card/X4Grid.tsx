'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSmartContract } from '@/components/SmartContract/SmartContractProvider';
import NotifyBot from '@/components/notifybot/notifybot';
import LevelCard from './x4LevelCard';
import { useWallet } from '@/app/context/WalletContext';

const levelDataX4 = [
  { level: 1, cost: 5 },
  { level: 2, cost: 10 },
  { level: 3, cost: 20 },
  { level: 4, cost: 40 },
  { level: 5, cost: 80 },
  { level: 6, cost: 160 },
  { level: 7, cost: 320 },
  { level: 8, cost: 640 },
  { level: 9, cost: 1250 },
  { level: 10, cost: 2500 },
  { level: 11, cost: 5000 },
  { level: 12, cost: 9900 },
];

const X4Grid: React.FC = () => {
  const { walletAddress } = useWallet();
  const {
    getTotalCycles,
    userX4Matrix,
    getPartnerCount,
    usersActiveX4Levels,
    getUserIdsWalletaddress,
  } = useSmartContract();

  const [cyclesData, setCyclesData] = useState<(number | null)[]>(Array(levelDataX4.length).fill(null));
  const [partnersData, setPartnersData] = useState<number[]>(Array(levelDataX4.length).fill(0));
  const [partnersLayer2Data, setPartnersLayer2Data] = useState<number[]>(Array(levelDataX4.length).fill(0));
  const [isActiveLevels, setIsActiveLevels] = useState<boolean[]>(Array(levelDataX4.length).fill(false));
  const [userAddress, setUserAddress] = useState<string>(walletAddress || '');

  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');

  useEffect(() => {
    const fetchUserAddress = async () => {
      if (userId) {
        try {
          const fetchedAddress = await getUserIdsWalletaddress(Number(userId));
          setUserAddress(String(fetchedAddress) || walletAddress || '');
        } catch (error) {
          console.error('Error fetching wallet address:', error);
        }
      }
    };
    fetchUserAddress();
  }, [userId, getUserIdsWalletaddress, walletAddress]);

  useEffect(() => {
    const fetchLevelData = async () => {
      if (!userAddress) return;

      try {
        const activeLevels = await Promise.all(
          levelDataX4.map((data) => usersActiveX4Levels(userAddress, data.level))
        );

        const cycles = await Promise.all(
          levelDataX4.map((data) => getTotalCycles(userAddress, 1, data.level))
        );

        const partners = await Promise.all(
          levelDataX4.map(async (data) => {
            const matrix = await userX4Matrix(userAddress, data.level);
            return matrix[1]?.length || 0;
          })
        );

        const partnersLayer2 = await Promise.all(
          levelDataX4.map((data) => getPartnerCount(userAddress, 1, data.level))
        );

        setIsActiveLevels(activeLevels.map(Boolean));
        setCyclesData(cycles.map((cycle) => cycle || 0));
        setPartnersData(partners);
        setPartnersLayer2Data(partnersLayer2.map((count) => count || 0));
      } catch (error) {
        console.error('Error fetching level data:', error);
      }
    };
    fetchLevelData();
  }, [userAddress, getTotalCycles, userX4Matrix, getPartnerCount, usersActiveX4Levels]);

  return (
    <Suspense fallback={<div className="text-center text-gray-400">Loading levels...</div>}>
      <div className="p-5 min-h-screen text-white">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-5">Ronx x4</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 p-4 rounded-lg border border-gray-700">
            {levelDataX4.map((data, index) => (
              <LevelCard
                key={data.level}
                level={data.level}
                cost={data.cost}
                partners={partnersData[index]}
                cycles={cyclesData[index]}
                partnersCount={partnersData[index]}
                partnersCountlayer2={partnersLayer2Data[index]}
                isActive={isActiveLevels[index]}
              />
            ))}
          </div>
        </div>
        <NotifyBot />
      </div>
    </Suspense>
  );
};

export default X4Grid;
