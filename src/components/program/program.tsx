'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSmartContract } from '@/components/SmartContract/SmartContractProvider';
import { useWallet } from '@/app/context/WalletContext';
import client from '@/lib/apolloClient';
import { x3ActiveLevel } from '@/graphql/x3LevelActiveWalletAddress/queries';
import { x4ActiveLevel } from '@/graphql/x4LevelActiveWalletAddress/queries';
import axios from 'axios';

const programs = [
  { name: 'x3', partners: 0, perCycle: '0 BUSD', color: 'bg-main-blue' },
  { name: 'x4', partners: 0, perCycle: '0 BUSD', color: 'bg-purple-500' },
];

const levels = [
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


// const fetchProfitData = async (referrer: string, program: 'x3' | 'x4') => {
//   const response = await fetch(`/api/${program}userProfit?referrer=${referrer}`);
//   if (!response.ok) {
//     console.error(`${program.toUpperCase()} Profit Data Error:`, await response.text());
//     return { totalRevenue: 0 }; // Return a default value or handle the error appropriately
//   }
//   const data = await response.json();
//   console.log(`${program.toUpperCase()} Profit Data:`, data);

//   // Calculate total revenue from levelProfits
//   const totalRevenue = data.levelProfits.reduce((acc: number, levelProfit: { profit: number }) => acc + levelProfit.profit, 0);

//   return { totalRevenue };
// };
const fetchProfitDataWithAxios = async (referrer: string, program: 'x3' | 'x4') => {
  try {
    const response = await axios.get(`/api/${program}userProfit`, {
      params: { referrer }
    });
    const data = response.data;
    console.log(`${program.toUpperCase()} Profit Data:`, data);

    // Calculate total revenue from levelProfits
    const totalRevenue = data.levelProfits.reduce((acc: number, levelProfit: { profit: number }) => acc + levelProfit.profit, 0);

    return { totalRevenue };
  } catch (error) {
    console.error(`${program.toUpperCase()} Profit Data Error:`, error);
    return { totalRevenue: 0 }; // Return a default value or handle the error appropriately
  }
};

const Program: React.FC = () => {
  const router = useRouter();
  const walletAddress = useWallet();
  console.log("address:", walletAddress);

  // Access the `address` field within the object, or handle undefined
  const staticAddress = walletAddress ? walletAddress.walletAddress : null;
  const userWalletAddress = staticAddress;

  const [x3TotalRevenue, setx3TotalRevenue] = useState(0);
  const [x4TotalRevenue, setx4TotalRevenue] = useState(0);


  console.log("staticAddress: #2", staticAddress);

  const [activeLevelsX3, setActiveLevelsX3] = useState<number[]>([1]); // Initialize with level 1 active
  const [activeLevelsX4, setActiveLevelsX4] = useState<number[]>([1]); // Initialize with level 1 active
  const [loading, setLoading] = useState(true);
  const [activeProgram, setActiveProgram] = useState<string | null>(null);

    //api data fetch 
    useEffect(() => {
      const fetchProfitDataForPrograms = async () => {
  
          const x3ProfitData = await fetchProfitDataWithAxios(staticAddress || '', 'x3');
          const x4ProfitData = await fetchProfitDataWithAxios(staticAddress || '', 'x4');
  
          console.log("x3ProfitData", x3ProfitData); 
          console.log("x4ProfitData", x4ProfitData);
  
          setx3TotalRevenue(x3ProfitData.totalRevenue);
          setx4TotalRevenue(x4ProfitData.totalRevenue);
  
      };
  
      fetchProfitDataForPrograms();
    }, []);
  

  // Fetch active levels from x3ActiveLevel and x4ActiveLevel GraphQL queries
  useEffect(() => {
    const fetchActiveLevels = async () => {
      try {
        setLoading(true);
        const { data: x3Data } = await client.query({ query: x3ActiveLevel, variables: { user: userWalletAddress } });
        const { data: x4Data } = await client.query({ query: x4ActiveLevel, variables: { user: userWalletAddress } });

        const activeLevelsX3 = [1, ...x3Data.upgrades.map((upgrade: { level: number }) => upgrade.level)];
        const activeLevelsX4 = [1, ...x4Data.upgrades.map((upgrade: { level: number }) => upgrade.level)];

        setActiveLevelsX3(activeLevelsX3);
        setActiveLevelsX4(activeLevelsX4);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching active levels:', error);
        setLoading(false);
      }
    };

    if (userWalletAddress) {
      fetchActiveLevels();
    }
  }, [userWalletAddress]);


  const renderGridItems = (activeLevels: number[], programName: string) => {
    function handleClick(programName: string): void {
      console.log(`Program ${programName} level clicked`);
      // Implement any additional logic here, such as navigating to a different page or displaying more details
    }

    return levels.map((level) => (
      <div
        key={level.level}
        className={`flex items-center justify-center h-12 mb-2 gap-2 rounded-md text-gray-700 border border-gray-300 dark:border-gray-600 ${activeLevels.includes(level.level) ? 'bg-blue-500' : 'bg-gray-300'}`}
        onClick={() => handleClick(programName)}
      >
        {level.level}
      </div>
    ));
  };

  const renderProgram = (program: typeof programs[number], activeLevels: number[], totalRevenue: number) => (
    <div className="flex-1 mb-8 p-6 rounded-lg" style={{ background: 'linear-gradient(to bottom, #000000, #753a88, #3a1c71)' }}>
      <a
        onClick={() => {
          setActiveProgram(program.name);
          handleRegisterBUSD(program.name);
        }} // Pass program name to handleRegisterBUSD
        style={{
          backgroundImage: `url(/assets/${program.name}-bg.jpg)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="flex justify-between w-full z-10">
          <span className="text-white text-lg sm:text-xl font-bold">{program.name}</span>
          <span className="text-white text-lg sm:text-xl font-bold text-right">{totalRevenue}</span>
        </div>
        <div className="flex flex-col h-full w-full">
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 mt-3">
            {renderGridItems(program.name === 'x3' ? activeLevelsX3 : activeLevelsX4, program.name)}
          </div>
          <div className="flex flex-col h-full justify-end mt-5">
            <button className={`flex justify-center items-center text-base font-bold text-white rounded sm:text-sm outline-none px-4 py-2 ${program.name === 'x3' ? 'bg-blue-500 hover:bg-hover-main-blue' : 'bg-purple-500 hover:bg-hover-main-blue'} w-full`}>
              <div className="flex flex-col space-y-1 items-start">
                <div className="flex items-center">
                  Preview
                  <svg className="ml-2 fill-current" width="16" height="16" fill="#fff" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M15.5 8a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Zm-4.646-2.854A.5.5 0 0 1 11 5.5v5a.5.5 0 0 1-1 0V6.707l-4.146 4.147a.5.5 0 0 1-.708-.708L9.293 6H5.5a.5.5 0 0 1 0-1h5c.138 0 .263.056.354.146Z"></path>
                  </svg>
                </div>
              </div>
            </button>
          </div>
        </div>
      </a>
    </div>
  );

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>; // Loading state
  }

  const handleRegisterBUSD = (programName: string) => {
    console.log(`Registering for program: ${programName}`);
    // Implement the registration logic here, such as calling a smart contract function or navigating to a registration page
    if (programName === 'x3') {
      router.push(`/retro/program/x3`); // Path for x3 program
    } else if (programName === 'x4') {
      router.push(`/retro/program/x4`); // Path for x4 program
    }
  };

  return (
    <div className="flex flex-col mt-5 items-center rounded-lg bg-gray-100 dark:bg-gray-900 p-3 sm:p-5">
      <div className="container mx-auto p-3 bg-slate-600 rounded-lg dark:bg-gray-800">
        <div className="flex flex-col sm:flex-row gap-8">

          {renderProgram(programs[0], activeLevelsX3, x3TotalRevenue)} {/* Replace 0 with actual total revenue for x3 */}
          {renderProgram(programs[1], activeLevelsX4, x4TotalRevenue)} {/* Replace 0 with actual total revenue for x4 */}

        </div>
      </div>
    </div>
  );
};

export default Program;
