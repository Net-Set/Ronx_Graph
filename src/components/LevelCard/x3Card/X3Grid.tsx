'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSmartContract } from '@/components/SmartContract/SmartContractProvider';
import NotifyBot from '@/components/notifybot/notifybot';
import LevelCard from './x3LevelCard'; // Ensure the path is correct
import { useWallet } from '@/app/context/WalletContext';

const levelDataX3 = [
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

const X3Grid: React.FC = () => {
  const walletContext = useWallet();
  const staticAddress = walletContext ? walletContext.walletAddress : null;
  const { getTotalCycles, userX3Matrix, usersActiveX3Levels, getPartnerCount, getUserIdsWalletaddress } = useSmartContract();

  const [cyclesData, setCyclesData] = useState<number[]>(Array(levelDataX3.length).fill(0));
  const [partnersData, setPartnersData] = useState<number[]>(Array(levelDataX3.length).fill(0));
  const [partnerNew, setPartnerNew] = useState<number[]>(Array(levelDataX3.length).fill(0));
  const [isLevelActive, setIsLevelActive] = useState<boolean[]>(Array(levelDataX3.length).fill(false));

  const searchParams = useSearchParams();
  const userId = searchParams.get('userId'); // Extract userId from query parameters
  const [userAddress, setUserAddress] = useState<string>(staticAddress || '');

  // Fetch user wallet address if userId is provided, else use static address
  useEffect(() => {
    const fetchUserAddress = async () => {
      if (userId) {
        try {
          const fetchedAddress = await getUserIdsWalletaddress(Number(userId));
          setUserAddress(String(fetchedAddress) || staticAddress || '');
        } catch (error) {
          console.error('Error fetching wallet address for userId:', error);
          setUserAddress(staticAddress || '');
        }
      } else {
        setUserAddress(staticAddress || '');
      }
    };
    fetchUserAddress();
  }, [userId, getUserIdsWalletaddress, staticAddress]);

  // Fetch active levels, cycles, and partner data
  useEffect(() => {
    if (!userAddress) return;

    const fetchData = async () => {
      try {
        const activeLevels = await Promise.all(
          levelDataX3.map((data) => usersActiveX3Levels(userAddress, data.level))
        );

        const updatedCycles = await Promise.all(
          levelDataX3.map((data) => getTotalCycles(userAddress, 1, data.level))
        );

        const updatedPartners = await Promise.all(
          levelDataX3.map(async (data) => {
            const partnersInfo = await userX3Matrix(userAddress, data.level);
            return Array.isArray(partnersInfo) && partnersInfo[1] ? partnersInfo[1].length : 0;
          })
        );

        const partnersCount = await Promise.all(
          levelDataX3.map(async (data) => {
            const count = await getPartnerCount(userAddress, 1, data.level);
            return count !== null ? count : 0;
          })
        );

        setPartnerNew(partnersCount.map(count => count !== null ? count : 0));
        setCyclesData(updatedCycles.map((cycles) => cycles || 0));
        setPartnersData(updatedPartners);
        setPartnerNew(partnersCount);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [userAddress, usersActiveX3Levels, getTotalCycles, userX3Matrix, getPartnerCount]);

  return (
    <div className="p-5 min-h-screen text-white">
      <Suspense fallback={<div>Loading...</div>}>
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-5">Ronx x3</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 p-4 rounded-lg border border-gray-700">
            {levelDataX3.map((data, index) => (
              <LevelCard
                key={data.level}
                level={data.level}
                cost={data.cost}
                partners={partnerNew[index]}
                cycles={cyclesData[index]}
                partnersCount={partnersData[index]}
                isActive={isLevelActive[index]} // Pass activity status to LevelCard
              />
            ))}
          </div>
        </div>
        <NotifyBot />
      </Suspense>
    </div>
  );
};

export default X3Grid;
