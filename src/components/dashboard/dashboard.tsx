import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useWallet } from '@/app/context/WalletContext';
import client from '@/lib/apolloClient';
import { ApolloQueryResult } from '@apollo/client';
import { GET_TOTAL_PARTNER } from '@/graphql/TotalPartner/queries';
import { GET_DIRECT_REFERRALS } from '@/graphql/GetTeamSize_Through_WalletAddress/queries';

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

const Dashboard: React.FC = () => {
  const walletAddress = useWallet();
  const staticAddress = walletAddress ? walletAddress.walletAddress : '';
  const userWalletAddress = staticAddress;
  console.log('staticAddress #12:', userWalletAddress);

  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');

  const [currentPartner, setcurrentPartner] = useState<(number | null)[]>(Array(levels.length).fill(null));
  const [cyclesData, setCyclesData] = useState<(number | null)[]>(Array(levels.length).fill(null));
  const [partnersData, setPartnersData] = useState<number>(0);
  const [teamSize, setTeamSize] = useState<number>(0); // Add state to store Team Size count

  const [userAddress, setUserAddress] = useState<string>(staticAddress || '');
  const [userData, setUserData] = useState<{
    id: number;
    referrer: string;
    partnersCount: number;
    registrationTime: number;
  } | null>(null);

  const [error, setError] = useState<string | null>(null);

  // Recursive function to fetch all team referrals
  const fetchAllReferrals = async (referrer: string, visited = new Set()): Promise<string[]> => {
    if (visited.has(referrer)) return [];
    visited.add(referrer);

    try {
      const { data } = await client.query({
        query: GET_DIRECT_REFERRALS,
        variables: { referrer },
      });

      const directReferrals = data?.registrations?.map((reg: any) => reg.user) || [];
      console.log(`Direct referrals of ${referrer}:`, directReferrals);

      let teamList = [...directReferrals];
      for (const referral of directReferrals) {
        const subTeam = await fetchAllReferrals(referral, visited);
        teamList = teamList.concat(subTeam);
      }
      return teamList;
    } catch (err) {
      console.error(`Error fetching referrals for ${referrer}:`, err);
      return [];
    }
  };

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
        setError('Failed to fetch total partner data.');
      }
    };

    if (userWalletAddress) {
      fetchTotalPartner();
    }
  }, [userWalletAddress]);

  // Fetch Team Size using recursion
  useEffect(() => {
    const fetchTeamSize = async () => {
      try {
        const teamList = await fetchAllReferrals(userWalletAddress || '');
        console.log('Complete Team List:', teamList);
        setTeamSize(teamList.length);
      } catch (err) {
        console.error('Error fetching team size:', err);
        setError('Failed to fetch team size data.');
      }
    };

    if (userWalletAddress) {
      fetchTeamSize();
    }
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
        <StatCard title="Ratio" value={`2%`} increase="↑ 0%" />
        <StatCard title="Profits" value={`3`} increase="↑ 0" />
      </>
      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
};

export default Dashboard;
