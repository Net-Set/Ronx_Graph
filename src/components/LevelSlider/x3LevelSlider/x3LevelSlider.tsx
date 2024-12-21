'use client'; // Ensure client-side rendering

import React, { useEffect, useState } from 'react';
import { useWallet } from '@/app/context/WalletContext';
import LevelHeader from '@/components/levelheader/x3levelheader/x3levelheader';
import NotifyBot from '@/components/notifybot/notifybot';
import LevelTransection from '@/components/level_transection/level_transection';
import client from '@/lib/apolloClient';
import { ApolloQueryResult } from '@apollo/client';
import { getUserPlacesQuery } from '@/graphql/Grixdx3Level_Partner_and_Cycle_Count_and_Active_Level/queries';
import { x3Activelevelpartner, GET_REGISTRATIONS } from '@/graphql/level_Ways_Partner_data_x3/queries';
import { GET_WALLET_ADDRESS_TO_ID } from '@/graphql/WalletAddress_To_Id/queries';
import { GET_WALLET_ADDRESS_TO_UPLINE_ID } from '@/graphql/WalletAddress_To_UplineId/queries';

const levels = [
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

const fetchProfitData = async (referrer: string, level: number) => {
  const response = await fetch(`/api/x3userProfit?referrer=${referrer}&level=${level}`);
  const data = await response.json();
  return data.levelProfit;
};

const LevelSliderx3: React.FC = () => {
  const walletAddress = useWallet();
  const [currentLevel, setCurrentLevel] = useState(1);
  const [activeLevels, setActiveLevels] = useState<boolean[]>(new Array(12).fill(false));
  const [partnerCounts, setPartnerCounts] = useState<number[]>(new Array(12).fill(0));
  const [cyclesData, setCyclesData] = useState<number[]>(new Array(12).fill(0));
  const [reminderData, setReminderData] = useState<number[]>(new Array(12).fill(0));
  const [totalRevenue, setTotalRevenue] = useState<number>(0);

  const [userId, setUserId] = useState<string | null>(null);
  const staticAddress = walletAddress ? walletAddress.walletAddress : null;
  const [uplineId, setUplineId] = useState<string | null>(null);
  const [actualPartnersPerLevel, setActualPartnersPerLevel] = useState<number[]>([]);
  const [cycleWalletAddresses, setCycleWalletAddresses] = useState<string[][][]>(new Array(12).fill([]));
  const [levelProfits, setLevelProfits] = useState<number[]>(new Array(12).fill(0));

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const { data } = await client.query({
          query: GET_WALLET_ADDRESS_TO_ID,
          variables: { wallet: staticAddress },
        }) as ApolloQueryResult<any>;

        if (data?.registrations?.length > 0) {
          setUserId(data.registrations[0].userId);
        } else {
          setUserId(null);
        }
      } catch (error) {
        console.error('Error fetching user ID:', error);
        setUserId(null);
      }
    };

    fetchUserId();
  }, [staticAddress]);

  //staticaddress to uplineid fetch data throgh graphql api
  useEffect(() => {
    const fetchUplineId = async () => {
      try {
        const { data } = await client.query({
          query: GET_WALLET_ADDRESS_TO_UPLINE_ID,
          variables: { walletAddress: staticAddress },
        }) as ApolloQueryResult<any>;

        if (data?.registrations?.length > 0) {
          setUplineId(data.registrations[0].referrerId);
        } else {
          setUplineId(null);
        }
      } catch (error) {
        console.error('Error fetching upline ID:', error);
        setUplineId(null);
      }
    };
    fetchUplineId();
  }, [staticAddress]);

  useEffect(() => {
    const fetchData = async () => {
      if (!staticAddress) return;

      const activeLevelsResponse = await client.query({
        query: getUserPlacesQuery,
        variables: { walletAddress: staticAddress },
      });

      const activeLevelsArray = new Array(12).fill(false);
      activeLevelsArray[0] = true; // Ensure level 1 is always active

      if (activeLevelsResponse.data && activeLevelsResponse.data.upgrades) {
        activeLevelsResponse.data.upgrades.forEach((upgrade: { level: number }) => {
          if (upgrade.level >= 1 && upgrade.level <= 12) {
            activeLevelsArray[upgrade.level - 1] = true;
          }
        });
      }

      const partnersResponse = await Promise.all(
        levels.map((level) =>
          client.query({
            query: x3Activelevelpartner,
            variables: { walletAddress: "0xD733B8fDcFaFf240c602203D574c05De12ae358C", level: level.level },
          })
        )
      );

      const partnerCountsArray = partnersResponse.map((response, index) => {
        const partnersAtLevel = response.data.newUserPlaces || [];
        
        // Log the user addresses and place values for each partner at this level
        const userPlaces = partnersAtLevel.map((partner: { user: string; place: number }) => ({
          user: partner.user,
          place: partner.place,
        }));
        console.log(`Level ${index + 1} User Places:`, userPlaces);
      
        // Group users into cycles
        const cycles = [];
        for (let i = 0; i < userPlaces.length; i += 3) {
          const cycle = userPlaces.slice(i, i + 3);
          cycles.push(cycle);
        }
      
        // Log the cycles
        cycles.forEach((cycle, cycleIndex) => {
          console.log(`Cycle ${cycleIndex + 1}`);
            cycle.forEach((partner: { user: string }, partnerIndex: number) => {
            console.log(`User ${partnerIndex + 1} Wallet Address: ${partner.user}`);
            });
        });
      
        return partnersAtLevel.length;
      });

      const cycleData = partnerCountsArray.map((partnerCount, index) => {
        const fullCycles = Math.floor(partnerCount / 3);
        const remainder = partnerCount % 3;

        // Log wallet addresses involved in the cycle way
        const levelPartners = partnersResponse[index].data.newUserPlaces.map(
          (partner: { user: string }) => partner.user
        );
        console.log(`Level ${index + 1} Cycle Wallet Addresses:`, levelPartners);

        // Group users into cycles
        const cycles = [];
        for (let i = 0; i < levelPartners.length; i += 3) {
          const cycle = levelPartners.slice(i, i + 3);
          cycles.push(cycle);
        }

        // Log the cycles
        cycles.forEach((cycle, cycleIndex) => {
          console.log(`Cycle ${cycleIndex + 1}`);
            cycle.forEach((partner: string, partnerIndex: number) => {
            console.log(`User ${partnerIndex + 1} Wallet Address: ${partner}`);
            });
        });

        return { fullCycles, remainder, cycles };
      });

      setCyclesData(cycleData.map((data) => data.fullCycles));
      setReminderData(cycleData.map((data) => data.remainder));
      setPartnerCounts(partnerCountsArray);
      setActiveLevels(activeLevelsArray);
      setCycleWalletAddresses(cycleData.map((data) => data.cycles));

      // Now, let's compare each level's partners to direct partners
      const { data: directPartnersData } = await client.query({
        query: GET_REGISTRATIONS,
        variables: { referrer: "0xD733B8fDcFaFf240c602203D574c05De12ae358C" },
      });

      const directPartners = directPartnersData.registrations.map(
        (registration: { user: string }) => registration.user
      );
      console.log("Direct Partners:", directPartners);

      // Check each level's partners against direct partners
      const actualPartnersPerLevel = partnerCounts.map((_, index) => {
        const levelPartners = partnersResponse[index].data.newUserPlaces.map(
          (partner: { user: string }) => partner.user
        );
        const uniqueLevelPartners = Array.from(new Set(levelPartners)) as string[];
        const matchingPartners: string[] = uniqueLevelPartners.filter((partner: string) =>
          directPartners.includes(partner)
        );
        console.log(`Level ${index + 1} Actual Partners:`, matchingPartners.length);
        return matchingPartners.length;
      });

      setActualPartnersPerLevel(actualPartnersPerLevel);
    };

    fetchData();
  }, [staticAddress]);

  useEffect(() => {
    const fetchLevelProfits = async () => {
      const profits = await Promise.all(
        levels.map(async (level) => {
          const profit = await fetchProfitData(staticAddress || '',level.level);
          return profit;
        })
      );

      setLevelProfits(profits);
      setTotalRevenue(profits.reduce((acc, profit) => acc + profit, 0));
    };

    fetchLevelProfits();
  }, []);

  const handleLevelChange = (direction: 'prev' | 'next') => {
    setCurrentLevel((prevLevel) =>
      direction === 'prev' ? Math.max(prevLevel - 1, 1) : Math.min(prevLevel + 1, 12)
    );
  };

  return (
    <>
      <LevelHeader userid={userId || ''} level={currentLevel} uplineId={uplineId ? parseInt(uplineId) : 0} />

      <div className="flex items-center justify-center text-white p-4 mx-auto max-w-screen-lg">
        {/* Previous Level Button */}
        <button
          onClick={() => handleLevelChange('prev')}
          className={`p-4 rounded-3xl h-20 lg:h-24 transition-all duration-200 ease-in-out ${
            currentLevel === 1 ? 'bg-gray-600 cursor-not-allowed' : 'bg-gray-700 hover:bg-gray-600'
          }`}
          disabled={currentLevel === 1}
        >
          {currentLevel > 1 ? currentLevel - 1 : ''}
        </button>

        {/* Level Card */}
        <div className="flex-grow mx-4 relative">
            {levels && (
            <div className="bg-blue-700 rounded-lg text-center border border-gray-600 relative">
              <div className="p-9">
              <div className="flex justify-between items-center mb-6">
                <div className="text-xl font-bold">Lvl {currentLevel}</div>
                <div className="text-xl font-bold">ID: {userId || 'Loading...'}</div>
                <div className="text-lg">{levels[currentLevel - 1].cost} BUSD</div>
              </div>

              {/* Partner Indicators */}
              <div className="flex justify-center items-center mb-6 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div
                  className={`relative w-24 h-24 rounded-full ${activeLevels[currentLevel - 1] && i < reminderData[currentLevel - 1]
                    ? 'bg-blue-600'
                    : 'bg-gray-400'
                    }`}
                  >
                  {i < partnerCounts[currentLevel - 1] && (
                    <span className="absolute inset-0 flex justify-center items-center text-sm text-white">
                    {i + 1}
                    </span>
                  )}
                  </div>
                </div>
                ))}
              </div>

              {/* Level Stats */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                <span className="mr-2">👥</span> {actualPartnersPerLevel[currentLevel - 1]}
                </div>
                <div className="flex items-center">
                <span className="mr-2">🔄</span> {cyclesData[currentLevel - 1]} 
                </div>
              </div>

              {/* Total Revenue */}
              <div className="flex justify-center items-center">
                <span className="mr-2">💰</span>
                {totalRevenue.toFixed(4)} BUSD
              </div>

              {/* Current Level Profit */}
              <div className="mt-4">
                <div className="flex justify-between items-center">
                <span>Level {currentLevel} Profit:</span>
                <span>{levelProfits[currentLevel - 1].toFixed(4)} BUSD</span>
                </div>
              </div>
              </div>

              {/* Inactive Overlay */}
              {!activeLevels[currentLevel - 1] && (
              <div className="absolute inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center text-white text-lg font-bold">
                <button className="px-6 py-2 rounded text-xl">Inactive</button>
              </div>
              )}
            </div>
            )}
        </div>

        {/* Next Level Button */}
        <button
          onClick={() => handleLevelChange('next')}
          className={`p-4 rounded-3xl h-20 lg:h-24 transition-all duration-200 ease-in-out ${
            currentLevel === 12 ? 'bg-gray-600 cursor-not-allowed' : 'bg-gray-700 hover:bg-gray-600'
          }`}
          disabled={currentLevel === 12}
        >
          {currentLevel < 12 ? currentLevel + 1 : ''}
        </button>
      </div>

      {/* NotifyBot and Level Transactions */}
      <div className="my-9">
        <NotifyBot />
        <LevelTransection matrix={1} currentLevel={currentLevel} />
      </div>
    </>
  );
};

export default LevelSliderx3;
