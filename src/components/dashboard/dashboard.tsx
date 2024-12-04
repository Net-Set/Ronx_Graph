import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {useSmartContract}  from '@/components/SmartContract/SmartContractProvider';

import { useWallet } from '@/app/context/WalletContext';

interface StatCardProps {
  title: string;
  value: string;
  increase: string;
}

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

const StatCard: React.FC<StatCardProps> = ({ title, value, increase }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-4 text-white flex flex-col">
      <p className="text-lg font-medium">{title}</p>
      <h2 className="text-2xl font-semibold">{value}</h2>
      <p className="text-sm text-green-500">{increase}</p>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { userX3Matrix, users, getUserIdsWalletaddress, getTeamSizeData, 
    usersActiveX3Levels,usersActiveX4Levels, 
    getTotalCycles,getPartnerCount,  } = useSmartContract();
  const walletAddress = useWallet();
  
  // Access the `address` field within the object, or handle undefined
  const staticAddress = walletAddress ? walletAddress.walletAddress : '';
  const userWalletAddress = staticAddress;
  console.log("staticAddress #12:", userWalletAddress);
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId'); 
  const [currentPartner, setcurrentPartner] = useState<(number | null)[]>(Array(levels.length).fill(null));
  const [cyclesData, setCyclesData] = useState<(number | null)[]>(Array(levels.length).fill(null));
  const [partnersData, setPartnersData] = useState<number[]>(Array(levels.length).fill(0)); // Initialize with numbers
  const [partnerIds, setPartnerIds] = useState<(string | null)[][]>(Array(levels.length).fill([])); // State to hold partner IDs
  const [partnersDataX4, setPartnersDataX4] = useState<number[]>(Array(levels.length).fill(0)); // Initialize with numbers for x4
  const [cyclesDataX3, setCyclesDataX3] = useState<(number | null)[]>(Array(levels.length).fill(null)); // Initialize with null or default values
const [cyclesDataX4, setCyclesDataX4] = useState<(number | null)[]>(Array(levels.length).fill(null)); // Initialize for x4 similarly
const [loading, setLoading] = useState(true);
const [currentPartnerX3, setcurrentPartnerX3] = useState<(number | null)[]>(Array(levels.length).fill(null)); // Same for current partners in x3
const [currentPartnerX4, setcurrentPartnerX4] = useState<(number | null)[]>(Array(levels.length).fill(null)); // Same for x4
const [activeProgram, setActiveProgram] = useState<string | null>(null);
const [activeLevelsX3, setActiveLevelsX3] = useState<boolean[]>(Array(12).fill(false));
const [activeLevelsX4, setActiveLevelsX4] = useState<boolean[]>(Array(12).fill(false));
  
  const [userAddress, setUserAddress] = useState<string>(staticAddress || ''); // Initially static address, will set to fetched address
  const [userData, setUserData] = useState<{
    id: number;
    referrer: string;
    partnersCount: number;
    registrationTime: number;
  } | null>(null);
  const [teamSize, setTeamSize] = useState<string>(''); // Store team size
  const [error, setError] = useState<string | null>(null);

  // Fetch wallet address based on userId
  useEffect(() => {
    const fetchUserAddress = async () => {
      if (userId) {
        try {
          const walletAddress = await getUserIdsWalletaddress(Number(userId));
          if (walletAddress) {
            setUserAddress(staticAddress || 'null');
          }
        } catch (error) {
          console.error("Error fetching wallet address for userId:", error);
          if (staticAddress) {
            setUserAddress(staticAddress); // Fallback to static address if fetching fails
          }
        }
      }
    };

    fetchUserAddress();
  }, [userId, getUserIdsWalletaddress]);

  // Fetch team size data after fetching the user address
  useEffect(() => {
    const fetchTeamSize = async () => {
      if (userWalletAddress && userWalletAddress !== 'null') {
        try {
          const fetchedTeamSize = await getTeamSizeData(userWalletAddress || "null");
          setTeamSize(fetchedTeamSize?.toString() || '0'); // Fallback to 0 if data is unavailable
        } catch (error) {
          console.error("Error fetching team size data:", error);
          setTeamSize('0'); // Fallback to 0 if fetching fails
        }
      }
    };

    fetchTeamSize();
  }, [userWalletAddress, getTeamSizeData]);

  // Fetch user data
  const handleFetchUser = async () => {
    try {
      const data = await users(userWalletAddress || "null");
      if (data) {
        setUserData(data);
        setError(null); // Clear error if successful
      } else {
        setError(" ");
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError("Failed to fetch user data. Please try again.");
    }
  };
    //cyccle data fetch in component in display that will be update
  // Fetch active levels based on wallet address
  useEffect(() => {
    if (!userWalletAddress) return; // Wait for the userAddress to be set

    const fetchActiveLevels = async () => {
      setLoading(true); // Start loading
      try {
        // Fetch x3 levels for the current wallet address
        const levelsStatusX3 = await Promise.all(
          Array.from({ length: 12 }, (_, index) => usersActiveX3Levels(userWalletAddress, index + 1))
        );
        setActiveLevelsX3(levelsStatusX3.map(status => !!status)); // Set active levels for x3

        // Fetch x4 levels for the current wallet address
        const levelsStatusX4 = await Promise.all(
          Array.from({ length: 12 }, (_, index) => usersActiveX4Levels(userWalletAddress, index + 1))
        );
        setActiveLevelsX4(levelsStatusX4.map(status => !!status)); // Set active levels for x4
      } catch (error) {
        console.error('Error fetching active levels:', error);
      } finally {
        setLoading(false); // End loading
      }
    };

    fetchActiveLevels();
  }, [userWalletAddress, usersActiveX3Levels, usersActiveX4Levels]);

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
          const cycles = await getTotalCycles(userWalletAddress||'null', 1, level.level); // Matrix 1 for x3
          return cycles;
        })
      );

      const updatedPartnersX3 = await Promise.all(
        levels.map(async (level) => {
          const partnerCount = await getPartnerCount(userWalletAddress || 'null', 1, level.level); // Matrix 1 for x3
          return partnerCount || 0;
        })
      );

      // Fetch for matrix 2 (x4)
      const updatedCyclesX4 = await Promise.all(
        levels.map(async (level) => {
          const cycles = await getTotalCycles(userWalletAddress || 'null', 2, level.level); // Matrix 2 for x4
          return cycles;
        })
      );

      const updatedPartnersX4 = await Promise.all(
        levels.map(async (level) => {
          const partnerCount = await getPartnerCount(userWalletAddress || 'null', 2, level.level); // Matrix 2 for x4
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
          const partnersInfo = await userX3Matrix(userWalletAddress || 'null', level.level) as { [key: number]: any[] } | null; // Matrix 1 for x3

          if (partnersInfo && Array.isArray(partnersInfo[1])) {
            const partnerAddresses: string[] = partnersInfo[1];
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
          const partnersInfo = await userX3Matrix(userWalletAddress || 'null', level.level) as { [key: number]: any[] } | null; // Matrix 2 for x4

          if (partnersInfo && Array.isArray(partnersInfo[1])) {
            const partnerAddresses = partnersInfo[1];
            const partnerCount = partnerAddresses.length;
            console.log("partnerCount (x4):" + partnerCount);
            const userIds = await Promise.all(
              partnerAddresses.map(async (userWalletAddress) => {
                const userId = await fetchUserIdByAddress(userWalletAddress);
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
}, [getTotalCycles, userX3Matrix, getPartnerCount, userWalletAddress, users]);

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

const totalRevenue = totalRevenueX3 + totalRevenueX4;

const totalInvestmentX3 = levels.reduce((acc, level, index) => {
  return activeLevelsX3[index] ? acc + level.cost : acc;
}, 0);

const totalInvestmentX4 = levels.reduce((acc, level, index) => {
  return activeLevelsX4[index] ? acc + level.cost : acc;
}, 0);

const totalInvestment = totalInvestmentX3 + totalInvestmentX4;

const userEarningsRatio = totalInvestment > 0 
  ? ((totalRevenue / totalInvestment) * 100).toFixed(2) 
  : '0'; // Avoid division by zero


  useEffect(() => {
    handleFetchUser();
  }, [userWalletAddress, users]);

  return (
    <div className="my-9 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full mx-auto text-center items-center">
      {userData ? (
        <>
          <StatCard
            title="Partners"
            value={userData.partnersCount.toString()}
            increase="↑ 0"
          />
          <StatCard title="Team" value={teamSize} increase="↑ 0" />
          <StatCard title="Ratio" value={`${userEarningsRatio}%`} increase="↑ 0%" />
          <StatCard title="Profits" value={totalRevenue.toString()} increase="↑ 0" />
        </>
      ) : (
        <div>Loading user data...</div>
      )}
      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
};
export default Dashboard;
