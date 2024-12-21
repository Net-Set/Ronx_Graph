"use client"
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Ensure you are using the correct import for App Router
import { useSmartContract } from '@/components/SmartContract/SmartContractProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons';
import client from '@/lib/apolloClient';
import { GET_USERS } from '@/graphql/PlatformRecentActivity/queries';
import { ApolloQueryResult } from '@apollo/client';



const PlatformRecentActivity: React.FC = () => {
  const router = useRouter(); // Use the router from 'next/navigation'
  const { getPlatformRecentActivity, getUserRecentActivityUserMatrics } = useSmartContract();
  const [totalUser, setTotalUser] = useState(0);
  const [recentUser, setRecentUser] = useState(0);
  const [activities, setActivities] = useState<any[]>([]);

   // Fetch platform recent activity data in the specified format
   useEffect(() => {
  // Fetch platform activity data and format it
  const fetchPlatformActivity = async () => {
    try {
      const { data } = await client.query({ query: GET_USERS }) as ApolloQueryResult<any>;
      if (data) {
        const userActivities: Record<string, any> = {};

        // Combine registrations and upgrades
        [...data.registrations, ...data.upgrades].forEach((activity: any) => {
          const userId =  activity.user;
          const action = activity.userId ? "Registration" : "Upgrade";
          const timestamp = parseInt(activity.blockTimestamp, 10) * 1000;

          if (!userActivities[userId] || userActivities[userId].timestamp < timestamp) {
            userActivities[userId] = {
              userId,
              action,
              matrix: activity.matrix || "1",
              level: activity.level || "1",
              timestamp,
            };
          }
        });

        const formattedActivities = Object.values(userActivities)
          .sort((a: any, b: any) => b.timestamp - a.timestamp)
          .map((activity: any) => ({
            ...activity,
            timestamp: new Date(activity.timestamp).toLocaleString(),
          }));

        setActivities(formattedActivities);
      }
    } catch (error) {
      console.error('Error fetching platform activity:', error);
    }
  };


    fetchPlatformActivity();
  }, []);

  const handleRegisterBUSD = (userId: string) => {
    router.push(`/retro?userId=${userId}`); // Use userId in the URL
  };

  
  // Fetch getUserRecentActivityUserMatrics data 
  useEffect(() => {
    const fetchUserMetrics = async () => {
      const data = await getUserRecentActivityUserMatrics(24, "hour");
      if (data) {
        const totalUsers = data.totalUsers?.toNumber() || 0;
        const recentUsers = data.recentUsers?.toNumber() || 0;
        setTotalUser(totalUsers);
        setRecentUser(recentUsers);
      } else {
        setTotalUser(0);
        setRecentUser(0);
      }
    };
    fetchUserMetrics();
  }, [getUserRecentActivityUserMatrics]);
  return (
    <div className="text-white p-8 rounded-md w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 h-full">
      <div className="col-span-2 h-full flex flex-col">
        <h2 className="text-xl font-semibold mb-4">Platform Recent Activity</h2>
        <div className="bg-gray-800 rounded-lg p-4 mb-4 flex-1 flex flex-col overflow-hidden">
          <div className="overflow-y-auto max-h-96">
            <table className="table-auto w-full text-left text-white">
              <thead>
                <tr className="bg-gray-700">
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
          <div className="mt-auto">
            <button className="w-full p-3 bg-gray-700 text-white rounded-md hover:bg-gray-800 focus:outline-none">
              See more
            </button>
          </div>
        </div>
      </div>
      <div className="mt-10">
        <div className="bg-gray-800 rounded-lg p-4 mb-4 flex-1">
          <h3 className="text-lg font-semibold mb-2">Members total</h3>
          <p className="text-2xl	 flex mt-3 items-center rounded-lg bg-gray-100 p-2 dark:bg-light-dark justify-between mb-1">
          {totalUser}  <span className="text-blue-500 text-base">
      <FontAwesomeIcon icon={faArrowUp} /> {recentUser} 
    </span>
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 mb-4 flex-1">
          <h3 className="text-lg font-semibold mb-2">RonX BUSD Contracts</h3>
          <p className="text-sm flex mt-3 items-center rounded-lg bg-gray-100 p-2 dark:bg-light-dark justify-between mb-1">
            x3/x4: <span className="text-blue-500">0x5ac...b97</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PlatformRecentActivity;
