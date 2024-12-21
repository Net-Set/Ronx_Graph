'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSmartContract } from '@/components/SmartContract/SmartContractProvider';
import { useWallet } from '@/app/context/WalletContext';
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

const Program: React.FC = () => {
  const router = useRouter();
  const walletAddress = useWallet();
  console.log("address:", walletAddress);

  
  // Access the `address` field within the object, or handle undefined
  const staticAddress = walletAddress ? walletAddress.walletAddress : null;
  const userWalletAddress = staticAddress;
  
  console.log("staticAddress: #2", staticAddress);

  const searchParams = useSearchParams();
  const userId = searchParams.get('userId'); // Extract userId from query parameters

  const { getTotalCycles, getPartnerCount, userX3Matrix, userX4Matrix, usersActiveX3Levels, usersActiveX4Levels, getUserIdsWalletaddress, users } = useSmartContract();
  const [activeProgram, setActiveProgram] = useState<string | null>(null);
  const [activeLevelsX3, setActiveLevelsX3] = useState<boolean[]>(Array(12).fill(false));
  const [activeLevelsX4, setActiveLevelsX4] = useState<boolean[]>(Array(12).fill(false));
  const [loading, setLoading] = useState(true);
  const [userAddress, setUserAddress] = useState<string>(''); // Initially empty, will set to static or fetched address

  const matrix = 1; // Assuming a static matrix ID, adjust if needed
  const [currentPartner, setcurrentPartner] = useState<(number | null)[]>(Array(levels.length).fill(null));
  const [cyclesData, setCyclesData] = useState<(number | null)[]>(Array(levels.length).fill(null));
  const [partnersData, setPartnersData] = useState<number[]>(Array(levels.length).fill(0)); // Initialize with numbers
  const [partnerIds, setPartnerIds] = useState<(string | null)[][]>(Array(levels.length).fill([])); // State to hold partner IDs
  const [partnersDataX4, setPartnersDataX4] = useState<number[]>(Array(levels.length).fill(0)); // Initialize with numbers for x4
  const [cyclesDataX3, setCyclesDataX3] = useState<(number | null)[]>(Array(levels.length).fill(null)); // Initialize with null or default values
const [cyclesDataX4, setCyclesDataX4] = useState<(number | null)[]>(Array(levels.length).fill(null)); // Initialize for x4 similarly

const [currentPartnerX3, setcurrentPartnerX3] = useState<(number | null)[]>(Array(levels.length).fill(null)); // Same for current partners in x3
const [currentPartnerX4, setcurrentPartnerX4] = useState<(number | null)[]>(Array(levels.length).fill(null)); // Same for x4

 
 
  // Fetch user wallet address if userId is provided, else use static address
  useEffect(() => {
    const fetchUserAddress = async () => {
      if (userId) {
        try {
          const walletAddress = await getUserIdsWalletaddress(Number(userId)); // Ensure userId is treated as a number
          if (walletAddress) {
            console.log("Fetched wallet address:", walletAddress); // Log the fetched address for debugging
            setUserAddress(userWalletAddress || 'null'); // Set the fetched wallet address
          }
        } catch (error) {
          console.error("Error fetching wallet address for userId:", error);
          setUserAddress(userWalletAddress  || "null"); // Use static address if fetching fails
        }
      } else {
        // If no userId, use static wallet address
        setUserAddress(userWalletAddress || "null");
      }
    };

    fetchUserAddress();
  }, [userId, getUserIdsWalletaddress]);
  const handleRegisterBUSD = (name: string) => {
    const userIdParam = userId ? `?userId=${userId}` : ''; // Append userId if it exists
    if (name === 'x3') {
      router.push(`/retro/program/x3${userIdParam}`); // Path for x3 program
    } else if (name === 'x4') {
      router.push(`/retro/program/x4${userIdParam}`); // Path for x4 program
    }
  };
  //cyccle data fetch in component in display that will be update
  // Fetch active levels based on wallet address
  useEffect(() => {
    if (!userAddress) return; // Wait for the userAddress to be set

    const fetchActiveLevels = async () => {
      setLoading(true); // Start loading
      try {
        // Fetch x3 levels for the current wallet address
        const levelsStatusX3 = await Promise.all(
          Array.from({ length: 12 }, (_, index) => usersActiveX3Levels(userAddress, index + 1))
        );
        setActiveLevelsX3(levelsStatusX3.map(status => !!status)); // Set active levels for x3
        console.log("Active levels for x3:", levelsStatusX3);
        // Fetch x4 levels for the current wallet address
        const levelsStatusX4 = await Promise.all(
          Array.from({ length: 12 }, (_, index) => usersActiveX4Levels(userAddress, index + 1))
        );
        setActiveLevelsX4(levelsStatusX4.map(status => !!status)); // Set active levels for x4
        console.log("Active levels for x4:", levelsStatusX4);
      } catch (error) {
        console.error('Error fetching active levels:', error);
      } finally {
        setLoading(false); // End loading
      }
    };

    fetchActiveLevels();
  }, [userAddress, usersActiveX3Levels, usersActiveX4Levels]);

  const handleClick = (name: string) => {
    setActiveProgram(name);
  };

    // Fetch cycles and partner data for both matrices (matrix 1 for x3 and matrix 2 for x4)
useEffect(() => {
  const fetchCyclesAndPartnersData = async () => {
    try {
      // Fetch for matrix 1 (x3)
      const updatedCyclesX3 = await Promise.all(
        levels.map(async (level) => {
          const cycles = await getTotalCycles(userAddress, 1, level.level); // Matrix 1 for x3
          return cycles;
        })
      );

      const updatedPartnersX3 = await Promise.all(
        levels.map(async (level) => {
          const partnerCount = await getPartnerCount(userAddress, 1, level.level); // Matrix 1 for x3
          return partnerCount || 0;
        })
      );

      // Fetch for matrix 2 (x4)
      const updatedCyclesX4 = await Promise.all(
        levels.map(async (level) => {
          const cycles = await getTotalCycles(userAddress, 2, level.level); // Matrix 2 for x4
          return cycles;
        })
      );

      const updatedPartnersX4 = await Promise.all(
        levels.map(async (level) => {
          const partnerCount = await getPartnerCount(userAddress, 2, level.level); // Matrix 2 for x4
          return partnerCount || 0;
        })
      );

      const fetchUserIdByAddress = async (partnerAddress: string) => {
        try {
          const userInfo = await users(partnerAddress);
          if (userInfo) {
            return userInfo.id;
          }
          return null;
        } catch (error) {
          console.error(`Error fetching user ID for address ${partnerAddress}:`, error);
          return null;
        }
      };

      // Fetch partner data for matrix 1 (x3)
      const currentDataX3 = await Promise.all(
        levels.map(async (level) => {
          const partnersInfo = await userX3Matrix(userAddress, level.level) as [number, string[]] | null; // Matrix 1 for x3

          if (partnersInfo && Array.isArray(partnersInfo) && Array.isArray(partnersInfo[1])) {
            const partnerAddresses = partnersInfo[1];
            const partnerCount = partnerAddresses.length;
            console.log("partnerCount (x3):" + partnerCount);
            const userIds = await Promise.all(
              partnerAddresses.map(async (address) => {
                const userId = await fetchUserIdByAddress(address);
                return userId;
              })
            );

            setPartnerIds((prev) => {
              const newPartnerIds = [...prev];
              newPartnerIds[level.level - 1] = userIds.map(id => id !== null ? id.toString() : null);
              return newPartnerIds;
            });

            return partnerCount;
          }

          return 0;
        })
      );

      // Fetch partner data for matrix 2 (x4)
      const currentDataX4 = await Promise.all(
        levels.map(async (level) => {
          const partnersInfo = await userX4Matrix(userAddress, level.level) as [number, string[]] | null; // Matrix 2 for x4

          if (partnersInfo && Array.isArray(partnersInfo[1])) {
            const partnerAddresses = partnersInfo[1] as string[];
            const partnerCount = partnerAddresses.length;
            console.log("partnerCount (x4):" + partnerCount);
            const userIds = await Promise.all(
              partnerAddresses.map(async (address) => {
                const userId = await fetchUserIdByAddress(address);
                return userId !== null ? userId.toString() : null;
              })
            );

            setPartnerIds((prev) => {
              const newPartnerIds = [...prev];
              newPartnerIds[level.level - 1] = userIds;
              return newPartnerIds;
            });

            return partnerCount;
          }

          return 0;
        })
      );

      setcurrentPartnerX3(currentDataX3); // Set data for x3
      setcurrentPartnerX4(currentDataX4); // Set data for x4
      setCyclesDataX3(updatedCyclesX3); // Set cycles for x3
      setCyclesDataX4(updatedCyclesX4); // Set cycles for x4
      setPartnersData(updatedPartnersX3); // Set partners for x3
      setPartnersDataX4(updatedPartnersX4); // Set partners for x4
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  fetchCyclesAndPartnersData();
}, [getTotalCycles, userX3Matrix, getPartnerCount, userAddress, users]);

// Store all level TotalRevenue in DataTotalRevenue for both x3 and x4
const DataTotalRevenueX3 = levels.map((level, index) => {
  const cyclesContribution = cyclesDataX3[index] ? cyclesDataX3[index] * 2 * level.cost : 0; // Calculate cycles contribution for x3
  const partnerContribution = currentPartnerX3[index] ? currentPartnerX3[index] * level.cost : 0; // Calculate partner contribution for x3
  const totalRevenue = cyclesContribution + partnerContribution; // Total revenue for the current level
  return totalRevenue; // Store the total revenue for x3
});

const DataTotalRevenueX4 = levels.map((level, index) => {
  const cyclesContribution = cyclesDataX4[index] ? cyclesDataX4[index] * 2 * level.cost : 0; // Calculate cycles contribution for x4
  const partnerContribution = currentPartnerX4[index] ? currentPartnerX4[index] * level.cost : 0; // Calculate partner contribution for x4
  const totalRevenue = cyclesContribution + partnerContribution; // Total revenue for the current level
  return totalRevenue; // Store the total revenue for x4
});

// Calculate total revenue for x3 and x4
const totalRevenueX3 = levels.reduce((acc, level, index) => {
  const cyclesContribution = cyclesDataX3[index] ? cyclesDataX3[index] * 2 * level.cost : 0;
  const partnerContribution = currentPartnerX3[index] ? currentPartnerX3[index] * level.cost : 0;
  return acc + cyclesContribution + partnerContribution;
}, 0);
console.log("Total revenue for x3 (matrix 1):", totalRevenueX3);

const totalRevenueX4 = levels.reduce((acc, level, index) => {
  const cyclesContribution = cyclesDataX4[index] ? cyclesDataX4[index] * 2 * level.cost : 0;
  const partnerContribution = currentPartnerX4[index] ? currentPartnerX4[index] * level.cost : 0;
  return acc + cyclesContribution + partnerContribution;
}, 0);
console.log("Total revenue for x4 (matrix 2):", totalRevenueX4);





// Log the overall total revenue

  const renderGridItems = (activeLevels: boolean[], programName: string) => {
    return activeLevels.map((isActive, index) => (
      <div
        key={index + 1}
        className={`flex items-center justify-center h-12 mb-2 gap-2 rounded-md text-gray-700 border border-gray-300 dark:border-gray-600 ${isActive ? 'bg-blue-500' : 'bg-gray-300'}`}
        onClick={() => handleClick(programName)}
      >
        {index + 1}
      </div>
    ));
  };

  const renderProgram = (program: typeof programs[number], activeLevels: boolean[], totalRevenue: number) => (
    <div className="flex-1 mb-8 p-6 rounded-lg" style={{ background: 'linear-gradient(to bottom, #000000, #753a88, #3a1c71)' }}>
      <a
        className={`relative flex flex-col p-4 sm:p-6 w-full rounded z-10 overflow-hidden justify-between min-h-36 ${activeProgram === program.name ? 'border-white' : 'border-transparent'} cursor-pointer`}
        onClick={() => handleRegisterBUSD(program.name)} // Pass program name to handleRegisterBUSD
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

  return (
    <div className="flex flex-col mt-5 items-center rounded-lg bg-gray-100 dark:bg-gray-900 p-3 sm:p-5">
      <div className="container mx-auto p-3 bg-slate-600 rounded-lg dark:bg-gray-800">
        <div className="flex flex-col sm:flex-row gap-8">
          {renderProgram(programs[0], activeLevelsX3, totalRevenueX3)}
          {renderProgram(programs[1], activeLevelsX4, totalRevenueX4)} 

        </div>
      </div>
    </div>
  );
};

export default Program;





