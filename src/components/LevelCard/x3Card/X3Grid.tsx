'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSmartContract } from '@/components/SmartContract/SmartContractProvider';
import NotifyBot from '@/components/notifybot/notifybot';
import LevelCard from './x3LevelCard'; // Ensure the path is correct
import { useWallet } from '@/app/context/WalletContext';
import client from '@/lib/apolloClient';
import { ApolloQueryResult } from '@apollo/client';
import { getUserPlacesQuery } from '@/graphql/Grixdx3Level_Partner_and_Cycle_Count_and_Active_Level/queries';
import { x3Activelevelpartner } from '@/graphql/level_Ways_Partner_data_x3/queries';

const levelDataX3 = [
  { level: 1, cost: 0.0001 },
  { level: 2, cost: 0.0002 },
  { level: 3, cost: 0.0004 },
  { level: 4, cost: 0.0008 },
  { level: 5, cost: 0.0016 },
  { level: 6, cost: 0.0032 },
  { level: 7, cost: 0.0064 },
  { level: 8, cost: 0.0128 },
  { level: 9, cost: 0.0256 },
  { level: 10, cost: 0.0512 },
  { level: 11, cost: 0.1024 },
  { level: 12, cost: 0.2048 },
];

const X3Grid: React.FC = () => {
  const walletContext = useWallet();
  const staticAddress = walletContext ? walletContext.walletAddress : null;
  const userWalletAddress = staticAddress;

  const {
    getTotalCycles,
    getPartnerCount,
    getUserIdsWalletaddress,
  } = useSmartContract();

  const [cyclesData, setCyclesData] = useState<number[]>([]);
  const [partnersData, setPartnersData] = useState<number[]>([]);
  const [reminderData, setReminderData] = useState<number[]>([]);  // New state to store remainder data
  const [isLevelActive, setIsLevelActive] = useState<boolean[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  const [userAddress, setUserAddress] = useState<string>(staticAddress || '');

  // Fetch user wallet address if userId is provided
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

  // Fetch active levels and partner counts from both GraphQL APIs
  useEffect(() => {
    const fetchActiveLevelsAndPartnerCounts = async () => {
      try {
        setIsLoading(true);

        // Fetch active levels
        const activeLevelsResponse = await client.query({
          query: getUserPlacesQuery,
          variables: { walletAddress: userWalletAddress },
        });

        const activeLevels = new Array(12).fill(false);
        activeLevels[0] = true; // Ensure level 1 is always active

        if (activeLevelsResponse.data && activeLevelsResponse.data.upgrades) {
          activeLevelsResponse.data.upgrades.forEach((upgrade: { level: number }) => {
            if (upgrade.level >= 1 && upgrade.level <= 12) {
              activeLevels[upgrade.level - 1] = true;
            }
          });
        }

        // Fetch partners' data from x3Activelevelpartner query for all levels
        const partnersResponse = await Promise.all(
          levelDataX3.map((data) =>
            client.query({
              query: x3Activelevelpartner,
              variables: { walletAddress: userWalletAddress, level: data.level },
            })
          )
        );

        // Map partner counts based on the response for each level
        const partnerCounts = partnersResponse.map((response, index) => {
          const partnersAtLevel = response.data.newUserPlaces || [];
          return partnersAtLevel.length; // Count number of partners at this level
        });

        // Calculate cycles and remainder for each level
        const cycleData = partnerCounts.map((partnerCount) => {
          const fullCycles = Math.floor(partnerCount / 3);  // Full cycles
          const remainder = partnerCount % 3;  // Remaining partners that don't complete a full cycle
          return { fullCycles, remainder };
        });

        // Separate full cycles, remainders, and partner counts
        const updatedCycles = cycleData.map((data) => data.fullCycles);
        const updatedRemainders = cycleData.map((data) => data.remainder);

        setCyclesData(updatedCycles); // Store full cycles
        setReminderData(updatedRemainders); // Store remainder (extra partners)
        setPartnersData(partnerCounts); // Store the total partner counts
        setIsLevelActive(activeLevels);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      }
    };

    if (userAddress) {
      fetchActiveLevelsAndPartnerCounts();
    }
  }, [userAddress, userWalletAddress, getTotalCycles, getPartnerCount]);

  if (isLoading) {
    return <div className="text-center text-white">Loading levels...</div>;
  }

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
                partners={partnersData[index]} // Total partners count
                cycles={cyclesData[index]} // Full cycles
                partnersCount={reminderData[index]} // Remainder (extra partners)
                isActive={isLevelActive[index]} // Dynamically set based on fetched data
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
