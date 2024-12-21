"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import NotifyBot from '@/components/notifybot/notifybot';
import LevelCard from './x4LevelCard';
import { useWallet } from '@/app/context/WalletContext';
import client from '@/lib/apolloClient';
import { getUserPlacesQuery } from '@/graphql/Grixdx4Level_Partner_and_Cycle_Count_and_Active_Level/queries';
import { x4Activelevelpartner } from '@/graphql/level_Ways_Partner_data_x4/queries';

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

const X4Grid: React.FC = () => {
  const { walletAddress } = useWallet();
  const [cyclesData, setCyclesData] = useState<number[]>(Array(levelDataX4.length).fill(0));
  const [partnersData, setPartnersData] = useState<number[]>(Array(levelDataX4.length).fill(0));
  const [layerOneData, setLayerOneData] = useState<number[]>(Array(levelDataX4.length).fill(0));
  const [layerTwoData, setLayerTwoData] = useState<number[]>(Array(levelDataX4.length).fill(0));
  const [isActiveLevels, setIsActiveLevels] = useState<boolean[]>(Array(levelDataX4.length).fill(false));
  const [userAddress, setUserAddress] = useState<string>(walletAddress || '');

  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');

  useEffect(() => {
    const fetchUserAddress = async () => {
      if (userId) {
        try {
          const { data } = await client.query({
            query: getUserPlacesQuery,
            variables: { userId: Number(userId) },
          });
          setUserAddress(data?.userPlaces?.walletAddress || walletAddress || '');
        } catch (error) {
          console.error('Error fetching wallet address:', error);
        }
      }
    };
    fetchUserAddress();
  }, [userId, walletAddress]);

  useEffect(() => {
    const fetchLevelData = async () => {
      if (!userAddress) return;

      try {
        // Fetch active levels
        const activeLevelsResponse = await client.query({
          query: getUserPlacesQuery,
          variables: { walletAddress: userAddress },
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

        // Fetch partners data from x4Activelevelpartner query for all levels
        const partnersResponse = await Promise.all(
          levelDataX4.map((data) =>
            client.query({
              query: x4Activelevelpartner,
              variables: { walletAddress:userAddress , level: data.level },
            })
          )
        );

        const partnerCounts = partnersResponse.map((response) => response.data.newUserPlaces?.length || 0);

        // Calculate cycles and layer data
        const updatedCycles = partnerCounts.map((count) => Math.floor(count / 6));
        const updatedLayerOne = partnerCounts.map((count) => Math.min(count, 2));
        const updatedLayerTwo = partnerCounts.map((count) => Math.max(0, count - 2));

        setCyclesData(updatedCycles);
        setLayerOneData(updatedLayerOne);
        setLayerTwoData(updatedLayerTwo);
        setPartnersData(partnerCounts);
        setIsActiveLevels(activeLevels);
      } catch (error) {
        console.error('Error fetching level data:', error);
      }
    };

    fetchLevelData();
  }, [userAddress]);

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
                partnersCount={layerOneData[index]}
                partnersCountlayer2={layerTwoData[index]}
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
