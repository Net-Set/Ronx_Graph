'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSmartContract } from '@/components/SmartContract/SmartContractProvider';
import NotifyBot from '@/components/notifybot/notifybot';
import LevelCard from './x3LevelCard';
import { useWallet } from '@/app/context/WalletContext';
import client from '@/lib/apolloClient';

import { getUserPlacesQuery } from '@/graphql/Grixdx3Level_Partner_and_Cycle_Count_and_Active_Level/queries';
import { x3Activelevelpartner, GET_REGISTRATIONS } from '@/graphql/level_Ways_Partner_data_x3/queries';


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

  const staticAddress = walletContext?.walletAddress || '';
  const { getUserIdsWalletaddress } = useSmartContract();
  const searchParams = useSearchParams();
  const userId = searchParams ? searchParams.get('userId') : null;

  const [userAddress, setUserAddress] = useState(staticAddress);
  const [cyclesData, setCyclesData] = useState<number[]>([]);
  const [partnersData, setPartnersData] = useState<number[]>([]);

  const [reminderData, setReminderData] = useState<number[]>([]);

  const [isLevelActive, setIsLevelActive] = useState<boolean[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserAddress = async () => {
      if (userId) {
        try {
          const fetchedAddress = await getUserIdsWalletaddress(Number(userId));

          setUserAddress(String(fetchedAddress) || staticAddress);

        } catch (error) {
          console.error('Error fetching wallet address:', error);
        }
      }
    };
    fetchUserAddress();
  }, [userId, getUserIdsWalletaddress, staticAddress]);


  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);


      try {
        const activeLevels = new Array(12).fill(false);
        activeLevels[0] = true;

        const activeLevelsResponse = await client.query({
          query: getUserPlacesQuery,
          variables: { walletAddress: userAddress },
        });

        activeLevelsResponse.data?.upgrades?.forEach(({ level }: { level: number }) => {
          if (level >= 1 && level <= 12) activeLevels[level - 1] = true;
        });

        const partnersResponses = await Promise.all(
          levelDataX3.map((data) =>
            client.query({
              query: x3Activelevelpartner,
              variables: { walletAddress: staticAddress, level: data.level },
            })
          )
        );

        const partnerCountsArray = partnersResponses.map((response) => {
          return response.data?.newUserPlaces?.length || 0;
        });

        const cycleData = partnerCountsArray.map((partnerCount) => {
          return {
            fullCycles: Math.floor(partnerCount / 3),
            remainder: partnerCount % 3,
          };
        });

        const directPartnersResponse = await client.query({
          query: GET_REGISTRATIONS,
          variables: { referrer: staticAddress },
        });


        const directPartners = directPartnersResponse.data?.registrations.map(
          ({ user }: { user: string }) => user
        ) || [];


        const actualPartnersData = partnersResponses.map((response, index) => {
          const levelPartners = response.data.newUserPlaces.map(
            (partner: { user: string }) => partner.user
          );
          const uniqueLevelPartners = Array.from(new Set(levelPartners)) as string[];
          const matchingPartners = uniqueLevelPartners.filter((partner: string) =>
            directPartners.includes(partner)
          );
          console.log(`Level ${index + 1} Actual Partners:`, matchingPartners.length);
          return matchingPartners.length;
        });
  
        setIsLevelActive(activeLevels);
        setCyclesData(cycleData.map((data) => data.fullCycles));
        setReminderData(cycleData.map((data) => data.remainder));
        setPartnersData(actualPartnersData);

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      }
    };


    if (userAddress) fetchData();
  }, [userAddress]);


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

                partners={partnersData[index]}
                cycles={cyclesData[index]}
                partnersCount={reminderData[index]}
                isActive={isLevelActive[index]}

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
