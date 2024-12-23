import React, { useEffect, useState } from 'react';
import Image from '@/components/ui/image';
import BannerSecond from '@/assets/images/BannerSecond.png';
import client from '@/lib/apolloClient';
import { GET_USERS } from '@/graphql/PlatformRecentActivity/queries';
import { GET_ACTIVE_USER } from '@/graphql/GetTotalNumberActive/queries';
import { ApolloQueryResult } from '@apollo/client';
import { GET_WALLET_ADDRESS_TO_ID } from '@/graphql/WalletAddress_To_Id/queries';



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



const ActivitySection: React.FC = () => {
  const [totalUser, setTotalUser] = useState(0);
  const [recentUser, setRecentUser] = useState(0);
  const [activities, setActivities] = useState<any[]>([]);
  const [totalInvestment, setTotalInvestment] = useState(0);

  // Fetch platform activity data and format it
  const fetchPlatformActivity = async () => {
    try {
      const { data } = await client.query({ query: GET_USERS }) as ApolloQueryResult<any>;
      if (data) {
        const allActivities = [...data.registrations, ...data.upgrades].map((activity: any) => {
          const timestamp = parseInt(activity.blockTimestamp, 10) * 1000;
          return {
            userId: activity.user,
            action: activity.userId ? "Registration" : "Upgrade",
            matrix: activity.matrix === 1 ? "x3" : activity.matrix === 2 ? "x4" : "x3 & x4",
            level: activity.level || "1",
            timestamp,
          };
        });
        // Calculate total investment from registrations and upgrades
        const totalInvestment = allActivities.reduce((acc, activity) => {
          const levelCost = levels.find(level => level.level === parseInt(activity.level, 10))?.cost || 0;
          return acc + levelCost;
        }, 0);

        setTotalInvestment(totalInvestment);

        const totalUsers = data.registrations.length;
        setTotalUser(totalUsers);
        const formattedActivities = await Promise.all(
          allActivities
            .sort((a: any, b: any) => b.timestamp - a.timestamp) // Sort by most recent activity
            .map(async (activity: any) => {
              // Fetch wallet address to ID
              const walletData = await client.query({
                query: GET_WALLET_ADDRESS_TO_ID,
                variables: { wallet: activity.userId },
              }) as ApolloQueryResult<any>;

              const walletId = walletData.data?.registrations?.[0]?.userId || activity.userId;

              return {
                ...activity,
                userId: walletId, // Update with the wallet ID
                timestamp: new Date(activity.timestamp).toLocaleString(),
              };
            })
        );

        setActivities(formattedActivities);
      }
    } catch (error) {
      console.error('Error fetching platform activity:', error);
    }
  };


  useEffect(() => {
    fetchPlatformActivity();

  }, []);

  return (
    <section className="my-6">
      <div>
        <div
          className="pb-9 w-full mx-auto text-center text-white px-4 sm:px-6 lg:px-8 bg-black bg-opacity-60 rounded-lg"
          style={{
            backgroundImage: `url(${BannerSecond.src})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <h2 className="m-6 pt-7 text-4xl font-bold mb-4">Platform Recent Activity</h2>
          <p className="text-lg mb-8">Real-time global events of the RonX Platform</p>
          <div className="bg-black rounded-lg overflow-hidden shadow-lg">
            <div className="overflow-y-auto max-h-96">
              <table className="table-auto w-full text-left text-white">
                <thead className="sticky top-0 bg-gray-800">
                  <tr>
                  <th className="px-4 py-2">User ID</th>
                  <th className="px-4 py-2">Action</th>
                  <th className="px-4 py-2">Matrix</th>
                  <th className="px-4 py-2">Level</th>
                  <th className="px-4 py-2">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {activities.map((activity, index) => (
                    <tr key={index} className="hover:bg-gray-700">
                      <td className="px-4 py-2">{activity.userId}</td>
                      <td className="px-4 py-2">{activity.action}</td>
                      <td className="px-4 py-2">{activity.matrix}</td>
                      <td className="px-4 py-2">{activity.level}</td>
                      <td className="px-4 py-2">{activity.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="text-center text-white mt-10">
            <h2 className="text-3xl font-bold mb-4">Partner Results</h2>
            <div className="mt-8 flex flex-col sm:flex-row justify-around">
              <div className="mb-6 sm:mb-0">
                <span>Member Total</span>
                <span className="block text-4xl font-bold">{totalUser}</span>
                <span className="block text-2xl font-bold text-blue-500">{recentUser}</span>
              </div>
              <div className="mb-6 sm:mb-0">
                <span className="block text-4xl font-bold">{totalInvestment}</span>
                <span>Total Invested, BNB</span>
              </div>
              <div>
                <span className="block text-4xl font-bold">149,386,219</span>
                <span>Total Payout, BUSD</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ActivitySection;