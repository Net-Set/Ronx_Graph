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

const API_URL = "https://api.studio.thegraph.com/query/98082/test1/version/latest";
const API_KEY = "57a0da610aba88df199b239c85d04a46";

interface UserPlace {
  user: string;
  place: number;
  referrer: string;
}

interface Cycle {
  user: string;
  spot: number;
  place: number;
}

const fetchProfitData = async (referrer: string) => {
  const response = await fetch(`/api/x4userProfit?referrer=${referrer}`);
  const data = await response.json();
  console.log("Profit Data:", data);
  return data;
};

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
  const [levelProfits, setLevelProfits] = useState<number[]>(new Array(12).fill(0));
  const [totalRevenue, setTotalRevenue] = useState<number>(0);




  const [referrer, setReferrer] = useState("0xD733B8fDcFaFf240c602203D574c05De12ae358C");
  const [matrix, setMatrix] = useState(2);
  const [level, setLevel] = useState(1);
  const [cycles, setCycles] = useState<Cycle[][]>([]);
  const [currentCycleIndex, setCurrentCycleIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const fetchGraphQL = async (query: string, variables: Record<string, any>) => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      body: JSON.stringify({ query, variables }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  };

  const GET_USER_PLACES = `
    query GetUserPlaces($referrer: String!, $matrix: Int!, $level: Int!) {
      newUserPlaces(
        where: { referrer: $referrer, matrix: $matrix, level: $level }
        orderBy: blockTimestamp
        orderDirection: asc
      ) {
        user
        place
        referrer
      }
    }
  `;



  const calculateCycles = async (level: number) => {
    try {
      setError(null);
      const data = await fetchGraphQL(GET_USER_PLACES, { referrer, matrix, level });
      const userPlaces: UserPlace[] = data.data.newUserPlaces;
      const cycleSize = matrix === 1 ? 3 : 6;
      const calculatedCycles: Cycle[][] = [];
      const currentCycle: Cycle[] = [];
      const spotTracker = new Set<number>();

      userPlaces.forEach((entry) => {
        let actualSpot = entry.place;
        while (spotTracker.has(actualSpot)) {
          actualSpot++;
          if (actualSpot > cycleSize) actualSpot = 1;
        }
        currentCycle.push({ user: entry.user, spot: actualSpot, place: entry.place });
        spotTracker.add(actualSpot);

        if (currentCycle.length === cycleSize) {
          calculatedCycles.push([...currentCycle]);
          currentCycle.length = 0;
          spotTracker.clear();
        }
      });

      if (currentCycle.length > 0) {
        calculatedCycles.push([...currentCycle]);
      }

      setCycles(calculatedCycles);
      setCurrentCycleIndex(0);
    } catch (error: any) {
      setError(error.message);
    }
  };

    
  const handleCycleChange = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentCycleIndex > 0) {
      setCurrentCycleIndex(currentCycleIndex - 1);
    } else if (direction === 'next' && currentCycleIndex < cycles.length - 1) {
      setCurrentCycleIndex(currentCycleIndex + 1);
    }
  };

   useEffect(() => {
      calculateCycles(currentLevel); // Initial call to calculateCycles
    }, [currentLevel]);
  

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
  
    useEffect(() => {
      const fetchLevelProfits = async () => {
        const profits = await fetchProfitData( '0xD733B8fDcFaFf240c602203D574c05De12ae358C');
        const validProfits = levelDataX4.map((level) => {
          const levelProfit = profits.levelProfits.find((profit: { level: number }) => profit.level === level.level);
          return levelProfit ? levelProfit.profit : 0;
        });

        setLevelProfits(validProfits);
        setTotalRevenue(validProfits.reduce((acc, profit) => acc + profit, 0));
      };

      fetchLevelProfits();
    }, [staticAddress, currentLevel]);

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
                {/* Partner Indicators */}
                <div className="flex justify-center items-center mt-8 mb-6 gap-4">
                  {/* <button onClick={calculateCycles}>Calculate Cycles</button> */}
                  {/* {error && <p style={{ color: 'red' }}>Error: {error}</p>} */}

                  {cycles.length > 0 && (
                    <div>
                   
                      <div className="flex items-center justify-center gap-4">
                        <button
                          onClick={() => handleCycleChange('prev')}
                          className={`p-2 rounded-full transition-all duration-200 ease-in-out ${currentCycleIndex === 0 ? 'bg-gray-600 cursor-not-allowed' : 'bg-gray-700 hover:bg-gray-600'}`}
                          disabled={currentCycleIndex === 0}
                        >
                          ←
                        </button>
                        <div className="flex flex-col items-center gap-4">
                            <div className="flex justify-center gap-4 mb-4">
                            {Array.from({ length: 2 }).map((_, i) => {
                            const entry = cycles[currentCycleIndex].find(e => e.spot === i + 1);
                            return (
                            <div key={i} className={`relative w-24 h-24 rounded-full ${entry ? 'bg-blue-600' : 'bg-gray-600'}`}>
                              <span className="absolute inset-0 flex justify-center items-center text-sm text-white">
                              {entry ? entry.user.slice(-4) : 'N/A'}
                              </span>
                            </div>
                            );
                            })}
                            </div>
                            <div className="flex justify-center gap-4">
                            {Array.from({ length: 4 }).map((_, i) => {
                            const entry = cycles[currentCycleIndex].find(e => e.spot === i + 3);
                            return (
                            <div key={i} className={`relative w-24 h-24 rounded-full ${entry ? 'bg-blue-600' : 'bg-gray-600'}`}>
                              <span className="absolute inset-0 flex justify-center items-center text-sm text-white">
                              {entry ? entry.user.slice(-4) : 'N/A'}
                              </span>
                            </div>
                            );
                            })}
                            </div>
                        </div>
                        <button
                          onClick={() => handleCycleChange('next')}
                          className={`p-2 rounded-full transition-all duration-200 ease-in-out ${currentCycleIndex === cycles.length - 1 ? 'bg-gray-600 cursor-not-allowed' : 'bg-gray-700 hover:bg-gray-600'}`}
                          disabled={currentCycleIndex === cycles.length - 1}
                        >
                          →
                        </button>
                      </div>
                      <h3 className='mt-5'>Cycle {currentCycleIndex + 1} of {cycles.length}</h3>
                    </div>
                  )}
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
                <div className="flex justify-center items-center">
                <span className="mr-2">💰</span>
                {totalRevenue.toFixed(4)} BUSD
                </div>

              {/* Current Level Profit */}
              <div className="mt-4">
                <div className="flex justify-between items-center">
                <span>Level {currentLevel} Profit:</span>
                <span>{levelProfits[currentLevel - 1] !== undefined ? levelProfits[currentLevel - 1].toFixed(4) : '0.0000'} BUSD</span>
                </div>
              </div>
                
              {!isActiveLevels[currentLevel - 1] && (
              <div className="absolute inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center text-white text-lg font-bold">
                <button className="px-6 py-2 rounded text-xl">Inactive</button>
              </div>
              )}

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
