'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@/app/context/WalletContext';
import client from '@/lib/apolloClient';
import { CopyIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { GET_PARTNER_TABLE, x3_Partner_level_active, x4_Partner_level_active } from '@/graphql/PartnerTable_Through_WalletAddress/queries';
import ApplyFilters from '@/components/filters/Fliter';

interface Partner {
  id: string;
  wallet: string;
  timestamp: string;
  transactionHash: string;
  x3Count: number; // Count for X3 levels
  x4Count: number; // Count for X4 levels
}

const PartnerPage = () => {
  const walletAddress = useWallet(); // Retrieve wallet address from context
  const staticAddress = walletAddress ? walletAddress.walletAddress : null;
  
  const [partners, setPartners] = useState<Partner[]>([]);
  const [allPartners, setAllPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    program: '',
    level: '',
    searchValue: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000); // Reset copied state after 2 seconds
  };

  const handleApplyFilters = (newFilters: { program: string; level: string; searchValue: string }) => {
    setFilters(newFilters);
  };

  // Function to fetch X3 and X4 counts for a given wallet
  const fetchPartnerLevels = async (wallet: string): Promise<{ x3Count: number; x4Count: number }> => {
    try {
      // Fetch X3 levels
      const { data: x3Data } = await client.query({
        query: x3_Partner_level_active,
        variables: { walletAddress: wallet },
      });

      // Fetch X4 levels
      const { data: x4Data } = await client.query({
        query: x4_Partner_level_active,
        variables: { walletAddress: wallet },
      });

      return {
        x3Count: x3Data?.upgrades?.length + 1 || 0,
        x4Count: x4Data?.upgrades?.length + 1 || 0,
      };
    } catch (error) {
      console.error(`Error fetching X3/X4 levels for wallet: ${wallet}`, error);
      return { x3Count: 0, x4Count: 0 }; // Return 0 if any error occurs
    }
  };

  // Function to fetch partner data and their X3/X4 counts
  const fetchPartnerData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch partner registration data
      const { data } = await client.query({
        query: GET_PARTNER_TABLE,
        variables: { walletAddress: staticAddress },
      });
      console.log('Partner data:', data);
      // Fetch X3/X4 counts for each partner
      const partnerPromises = data?.registrations.map(async (reg: any) => {
        const levels = await fetchPartnerLevels(reg.user);
        return {
          id: reg.userId,
          wallet: reg.user,
          transactionHash: reg.transactionHash,
          timestamp: new Date(Number(reg.blockTimestamp) * 1000).toLocaleString(),
          x3Count: levels.x3Count,
          x4Count: levels.x4Count,
        };
      });

      // Resolve all promises and update the state
      const formattedPartners = await Promise.all(partnerPromises || []);
      setAllPartners(formattedPartners);
      setPartners(formattedPartners);
    } catch (err) {
      console.error('Error fetching partner data:', err);
      setError('Failed to fetch partner data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetchPartnerData when walletAddress is available
  useEffect(() => {
    fetchPartnerData();
  }, [walletAddress]);

  useEffect(() => {
    let filteredData = allPartners;
    if (filters.program) {
      filteredData = filteredData.filter(partner => partner.x3Count > 0 && filters.program === '1' || partner.x4Count > 0 && filters.program === '2');
    }
    if (filters.level) {
      filteredData = filteredData.filter(partner => partner.x3Count === parseInt(filters.level) || partner.x4Count === parseInt(filters.level));
    }
    if (filters.searchValue) {
      filteredData = filteredData.filter(partner => partner.wallet.includes(filters.searchValue));
    }
    setPartners(filteredData);
  }, [filters, allPartners]);

  return (
    <div className="container mx-auto my-12 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className='grid grid-cols-2 space-y-4'>

      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">
        Partner
      </h2>

      <button
        onClick={() => setShowFilters((prev) => !prev)}
        className="ml-auto px-4 py-2  bg-blue-500 text-white rounded hover:bg-blue-700"
        >
        {showFilters ? 'Filters' : 'Filters'}
      </button>
      </div>

      {showFilters && (
        <div className="p-4 bg-gray-100 dark:bg-gray-800">
          <ApplyFilters onApplyFilters={handleApplyFilters} />
        </div>
      )}

      {loading ? (
        <p className="text-center text-gray-600 dark:text-gray-300">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : partners.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 dark:border-gray-700">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="px-4 py-3 text-left border-b">ID</th>
                <th className="px-4 py-3 text-left border-b">Wallet Address</th>
                <th className="px-4 py-3 text-left border-b">Date</th>
                <th className="px-4 py-3 text-left border-b">X3 Levels</th>
                <th className="px-4 py-3 text-left border-b">X4 Levels</th>
              </tr>
            </thead>
            <tbody>
              {partners.map((partner) => (
                <tr key={partner.id} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                  <td className="px-4 py-3 border-b truncate">{partner.id}</td>
                  <td className="px-4 py-3 border-b truncate max-w-xs">{partner.wallet} 
                    <button
                      className="ml-2 text-white px-2 py-1 rounded hover:text-blue-600"
                      onClick={() => copyToClipboard(partner.wallet)}
                    >
                      <CopyIcon />
                    </button>
                    <a
                      href={`https://testnet.bscscan.com/tx/${partner.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <ExternalLinkIcon />
                    </a>
                  </td>
                  <td className="px-4 py-3 border-b">{partner.timestamp}</td>
                  <td className="px-4 py-3 border-b">{partner.x3Count}</td>
                  <td className="px-4 py-3 border-b">{partner.x4Count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-gray-600 dark:text-gray-300">No partner data found.</p>
      )}
    </div>
  );
};

export default PartnerPage;