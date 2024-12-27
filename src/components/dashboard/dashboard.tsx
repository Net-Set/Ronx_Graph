import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useWallet } from '@/app/context/WalletContext';
import client from '@/lib/apolloClient';
import { ApolloQueryResult } from '@apollo/client';
import { GET_TOTAL_PARTNER } from '@/graphql/TotalPartner/queries';
import { GET_DIRECT_REFERRALS } from '@/graphql/GetTeamSize_Through_WalletAddress/queries';
import axios from 'axios';
import { x3ActiveLevel } from '@/graphql/x3LevelActiveWalletAddress/queries';
import { x4ActiveLevel } from '@/graphql/x4LevelActiveWalletAddress/queries';
import SimpleTeamCalculator from '@/pages/api/teamSize';

interface StatCardProps {
  title: string;
  value: string;
  increase: string;
}

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

const StatCard: React.FC<StatCardProps> = ({ title, value, increase }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-4 text-white flex flex-col">
      <p className="text-lg font-medium">{title}</p>
      <h2 className="text-2xl font-semibold">{value}</h2>
      <p className="text-sm text-green-500">{increase}</p>
    </div>
  );
};

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
const Dashboard: React.FC = () => {
  const walletAddress = useWallet();
  const staticAddress = walletAddress ? walletAddress.walletAddress : '';
  const userWalletAddress = staticAddress;
  console.log('staticAddress #12:', userWalletAddress);

  const searchParams = useSearchParams();
  const userId = searchParams ? searchParams.get('userId') : null;

  const [currentPartner, setcurrentPartner] = useState<(number | null)[]>(Array(levels.length).fill(null));
  const [cyclesData, setCyclesData] = useState<(number | null)[]>(Array(levels.length).fill(null));
  const [partnersData, setPartnersData] = useState<number>(0);
  const [teamSize, setTeamSize] = useState<number>(0); // Add state to store Team Size count
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [totalInvestment, setTotalInvestment] = useState<number>(0);
  const [userAddress, setUserAddress] = useState<string>(staticAddress || '');
  const [userData, setUserData] = useState<{
    id: number;
    referrer: string;
    partnersCount: number;
    registrationTime: number;
  } | null>(null);

  const [error, setError] = useState<string | null>(null);
  const fetchx3andx4ActiveLevel = async () => {
    try {
      const x3ActiveLevelData = await client.query({
        query: x3ActiveLevel,
        variables: { user: userWalletAddress },
      });

      const x4ActiveLevelData = await client.query({
        query: x4ActiveLevel,
        variables: { user: userWalletAddress },
      });

      const x3Levels = [1, ...x3ActiveLevelData.data.upgrades.map((upgrade: { level: number }) => upgrade.level)];
      const x4Levels = [1, ...x4ActiveLevelData.data.upgrades.map((upgrade: { level: number }) => upgrade.level)];

      console.log('x3ActiveLevelData:', x3Levels);
      console.log('x4ActiveLevelData:', x4Levels);

      // Calculate total investment
      const totalInvestment = [...x3Levels, ...x4Levels].reduce((acc, level) => {
        const levelCost = levels.find(l => l.level === level)?.cost || 0;
        return acc + levelCost;
      }, 0);

      console.log('Total Investment:', totalInvestment);
      setTotalInvestment(totalInvestment);
    } catch (error) {
      console.error('Error fetching x3 and x4 active level:', error);
    }
  }

  useEffect(() => {
    fetchx3andx4ActiveLevel();
  }, [userWalletAddress]);

//ratio calculation 
  // const ratio = (totalRevenue / totoalinvestment) * 100;

      useEffect(() => {
        const fetchProfitDataForPrograms = async () => {
    
            const x3ProfitData = await fetchProfitDataWithAxios(staticAddress || '', 'x3');
            const x4ProfitData = await fetchProfitDataWithAxios(staticAddress || '', 'x4');
    
            console.log("x3ProfitData", x3ProfitData); 
            console.log("x4ProfitData", x4ProfitData);

            setTotalRevenue(parseFloat((x3ProfitData.totalRevenue + x4ProfitData.totalRevenue).toFixed(4)));
      
        };
    
        fetchProfitDataForPrograms();
      }, []);
    
      const ratio = (totalRevenue / totalInvestment) * 100;

  // Recursive function to fetch all team referrals

  // Fetch Total Partner data (Wallet Address passed)
  useEffect(() => {
    const fetchTotalPartner = async () => {
      try {
        const { data } = (await client.query({
          query: GET_TOTAL_PARTNER,
          variables: { referrer: userWalletAddress },
        })) as ApolloQueryResult<any>;
        if (data) {
          console.log('test data:', data);
          const totalPartner = data.registrations.length;
          setPartnersData(totalPartner);
        }
      } catch (error) {
        console.error('Error fetching total partner:', error);

      }
    };

    if (userWalletAddress) {
      fetchTotalPartner();
    }
  }, [userWalletAddress]);

  // Fetch Team Size using recursion
  useEffect(() => {
    if (!userWalletAddress) return;

    const fetchTeamSize = async () => {
 
      try {
        const calculator = new SimpleTeamCalculator();
        const teamMembers = await calculator.calculateTeamSize(userWalletAddress);
        setTeamSize(teamMembers.length);
      } catch (error) {
        console.error('Error calculating team size:', error);
        setTeamSize(0);
      } finally {
          console.log('team size:', teamSize);
      } 
    };

    fetchTeamSize();
  }, [userWalletAddress]);

  return (
    <div className="my-9 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full mx-auto text-center items-center">
      <>
        <StatCard
          title="Partners"
          value={partnersData.toString()}
          increase="↑ 0"
        />
        <StatCard
          title="Team"
          value={teamSize.toString()} // Display Team Size count
          increase="↑ 0"
        />
        <StatCard title="Ratio" value={ratio.toFixed(2) + "%"} increase="↑ 0%" />
        <StatCard title="Profits" value={String(totalRevenue)} increase="↑ 0" />
      </>
      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
};

export default Dashboard;