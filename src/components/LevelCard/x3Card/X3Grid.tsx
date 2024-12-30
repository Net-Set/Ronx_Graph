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
import levelDataX3  from '@/data/levelData/levelDataX3/data';



const X3Grid: React.FC = () => {
  const walletContext = useWallet();
  const staticAddress = walletContext?.walletAddress || '';
  const { getUserIdsWalletaddress } = useSmartContract();
  const searchParams = useSearchParams();
  const userId = searchParams ? searchParams.get('userId') : null;
  let checkOvertakeStatus: any;
  useEffect(() => {
    const fetchCheckOvertakeStatus = async () => {
      try {
        const module = await import('@/data/utils/overTakex3');
        checkOvertakeStatus = module.default;
      } catch (error) {
        console.error('Error loading overtake status module:', error);
      }
    };
    fetchCheckOvertakeStatus();
  }, []);
  const [userAddress, setUserAddress] = useState(staticAddress);
  const [cyclesData, setCyclesData] = useState<number[]>([]);
  const [partnersData, setPartnersData] = useState<number[]>([]);
  const [reminderData, setReminderData] = useState<number[]>([]);
  const [isLevelActive, setIsLevelActive] = useState<boolean[]>([]);
  const [isOverTake, setIsOverTake] = useState<boolean[]>(new Array(12).fill(false));
  const [isLoading, setIsLoading] = useState<boolean>(true);

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
          variables: { walletAddress: staticAddress },
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
          return matchingPartners.length;
        });

        const overtakeStatusCache: { [key: number]: boolean } = {};

        const overtakeStatus = await Promise.all(
          levelDataX3.map(async (data) => {
            if (overtakeStatusCache[data.level] !== undefined) {
              return overtakeStatusCache[data.level];
            }

            try {
       
                const res = await checkOvertakeStatus(staticAddress);

          

                const json = await res.json();
                const isOvertaken = json.message?.some((msg: string) => msg.includes(`Matrix 1, Level ${data.level}`));
                overtakeStatusCache[data.level] = isOvertaken;
                return isOvertaken;
            } catch (error) {
              return overtakeStatusCache[data.level] || false;
            }
          })
        );

        setIsLevelActive(activeLevels);
        setCyclesData(cycleData.map((data) => data.fullCycles));
        setReminderData(cycleData.map((data) => data.remainder));
        setPartnersData(actualPartnersData);

        // Merge new overtake status with existing state
        setIsOverTake((prevState) =>
          prevState.map((value, index) => overtakeStatus[index] || value)
        );

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
                isOverTake={isOverTake[index]}
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