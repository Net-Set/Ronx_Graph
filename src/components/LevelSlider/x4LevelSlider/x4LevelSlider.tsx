"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import NotifyBot from "@/components/notifybot/notifybot";
import LevelHeader from "@/components/levelheader/x4levelheader/x4levelheader";
import LevelTransection from "@/components/level_transection/level_transection";
import { useWallet } from '@/app/context/WalletContext';

import client from "@/lib/apolloClient";
import { ApolloQueryResult } from '@apollo/client';

import { getUserPlacesQuery } from "@/graphql/Grixdx4Level_Partner_and_Cycle_Count_and_Active_Level/queries";
import { x4Activelevelpartner, GET_REGISTRATIONS } from "@/graphql/level_Ways_Partner_data_x4/queries";
import { GET_WALLET_ADDRESS_TO_ID } from '@/graphql/WalletAddress_To_Id/queries';
import { GET_WALLET_ADDRESS_TO_UPLINE_ID } from '@/graphql/WalletAddress_To_UplineId/queries';

const levelDataX4 = [
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

const LevelSliderx4: React.FC = () => {
  const walletAddress = useWallet();
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [cyclesData, setCyclesData] = useState<number[]>(Array(levelDataX4.length).fill(0));
  const [partnersData, setPartnersData] = useState<number[]>(Array(levelDataX4.length).fill(0));
  const [layerOneData, setLayerOneData] = useState<number[]>(Array(levelDataX4.length).fill(0));
  const [layerTwoData, setLayerTwoData] = useState<number[]>(Array(levelDataX4.length).fill(0));
  const [isActiveLevels, setIsActiveLevels] = useState<boolean[]>(Array(levelDataX4.length).fill(false));
  const [userId, setUserId] = useState<string | null>(null);
  const [uplineId, setUplineId] = useState<number | null>(null);
  const staticAddress = walletAddress ? walletAddress.walletAddress : null;
  const [actualPartnersPerLevel, setActualPartnersPerLevel] = useState<number[]>([]);

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

  //staticAddress to uplineId fetch through graphql query
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
        setUserId(null);
      }
    };  
    fetchUplineId();
  }, [staticAddress]);

  useEffect(() => {
    const fetchLevelData = async () => {
      try {
        // Fetch active levels
        const activeLevelsResponse = await client.query({
          query: getUserPlacesQuery,
          variables: { walletAddress: staticAddress },
        });
  
        const activeLevels = Array(12).fill(false);
        activeLevels[0] = true; // Ensure level 1 is always active
  
        if (activeLevelsResponse.data?.upgrades) {
          activeLevelsResponse.data.upgrades.forEach((upgrade: { level: number }) => {
            if (upgrade.level >= 1 && upgrade.level <= 12) {
              activeLevels[upgrade.level - 1] = true;
            }
          });
        }
  
        // Fetch partners data for each level
        const partnersResponse = await Promise.all(
          levelDataX4.map((data) =>
            client.query({
              query: x4Activelevelpartner,
              variables: { walletAddress: staticAddress, level: data.level },
            })
          )
        );
  
        const partnerCounts = partnersResponse.map(
          (response) => response.data.newUserPlaces?.length || 0
        );
        console.log("Partner Counts:", partnerCounts);
  
        // Calculate cycles and layer data
        const updatedCycles = partnerCounts.map((count) => Math.floor(count / 6));
        const updatedLayerOne = partnerCounts.map((count) => Math.min(count, 2));
        const updatedLayerTwo = partnerCounts.map((count) => Math.max(0, count - 2));
  
        setCyclesData(updatedCycles);
        setLayerOneData(updatedLayerOne);
        setLayerTwoData(updatedLayerTwo);
        setPartnersData(partnerCounts);
        setIsActiveLevels(activeLevels);
  
        // Now, let's compare each level's partners to direct partners
        const { data: directPartnersData } = await client.query({
          query: GET_REGISTRATIONS,
          variables: { referrer: staticAddress },
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
  
      } catch (error) {
        console.error("Error fetching level data:", error);
      }
    };
  
    fetchLevelData();
  }, [staticAddress]);
  

  const nextLevel = () => {
    setCurrentLevel((prev) => (prev < levelDataX4.length ? prev + 1 : prev));
  };

  const previousLevel = () => {
    setCurrentLevel((prev) => (prev > 1 ? prev - 1 : prev));
  };

  const handleActivate = (level: number) => {
    // Toggle activation state
    const updatedActiveLevels = [...isActiveLevels];
    updatedActiveLevels[level - 1] = !updatedActiveLevels[level - 1];
    setIsActiveLevels(updatedActiveLevels);
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LevelHeader userid={userId || ''} level={currentLevel} uplineId={uplineId?.toString() || ''} />
      <div className="flex items-center justify-center text-white p-4 mx-auto max-w-screen-lg">
        <button
          onClick={previousLevel}
          className={`p-4 rounded-3xl h-20 lg:h-24 transition-all duration-200 ease-in-out ${currentLevel === 1 ? "bg-gray-600 cursor-not-allowed" : "bg-gray-700 hover:bg-gray-600"}`}
          disabled={currentLevel === 1}
        >
          {currentLevel > 1 ? currentLevel - 1 : ""}
        </button>
        <div className="flex-grow mx-4">
          <div className="bg-blue-700 rounded-lg text-center border border-gray-600 relative">
            <div className="p-9">
              <div className="flex justify-between items-center mb-6">
                <div className="text-xl font-bold">Lvl {currentLevel}</div>
                <div className="text-xl font-bold">ID: {userId}</div>
                <div className="text-lg">{levelDataX4[currentLevel - 1]?.cost} BUSD</div>
              </div>

              {/* First Layer of Partner Circles */}
              <div className="flex justify-center items-center mb-6 gap-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div
                      className={`relative w-24 h-24 rounded-full ${i < layerOneData[currentLevel - 1] ? "bg-blue-300" : "bg-gray-400"}`}
                    >
                      <span className="absolute inset-0 flex items-center justify-center font-bold text-lg"> </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Second Layer of Partner Circles */}
              <div className="flex justify-center items-center mb-6 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div
                      className={`relative w-24 h-24 rounded-full ${i < layerTwoData[currentLevel - 1] ? "bg-blue-300" : "bg-gray-400"}`}
                    >
                      <span className="absolute inset-0 flex items-center justify-center font-bold text-lg"> </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                    <span className="mr-2">👥</span> {actualPartnersPerLevel[currentLevel - 1]}
                </div>
                <div className="flex items-center">
                  <span className="mr-2">🔄</span> {cyclesData[currentLevel - 1]}
                </div>
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={nextLevel}
          className={`p-4 rounded-3xl h-20 lg:h-24 transition-all duration-200 ease-in-out ${currentLevel === levelDataX4.length ? "bg-gray-600 cursor-not-allowed" : "bg-gray-700 hover:bg-gray-600"}`}
          disabled={currentLevel === levelDataX4.length}
        >
          {currentLevel < levelDataX4.length ? currentLevel + 1 : ""}
        </button>
      </div>

      {/* NotifyBot Component */}
      <NotifyBot />
      {/* Level Transaction History */}
      <LevelTransection matrix={2} currentLevel={currentLevel} />
    </Suspense>
  );
};

export default LevelSliderx4;
