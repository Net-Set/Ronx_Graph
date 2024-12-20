import React, { useEffect, useState } from 'react';
import { useSmartContract } from '@/components/SmartContract/SmartContractProvider';
import Image from '@/components/ui/image';
import BannerFirst from '@/assets/images/BannerFirst.png';
import Logo from '@/assets/images/logo-white.svg';
import { useRouter } from 'next/navigation';

const HeroSection: React.FC = () => {
  const { fetchData } = useSmartContract();
  const [data, setData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const getData = async () => {
      const result = await fetchData('LAST_LEVEL');
      setData(result);
    };
    getData();
  }, [fetchData]);

  const handleFetchData = async () => {
    try {
      const result = await fetchData('BASIC_PRICE');
      setData(result);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleRegisterBUSD = () => {
    router.push('/authentication/sign-up');
  };

  return (
    <section
      className="relative bg-gradient-to-r from-green-400 via-purple-500 to-blue-500 text-white text-center flex items-center justify-center"
      style={{
        backgroundImage: `url(${BannerFirst.src})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: '100vh',
      }}
    >
      {/* Dark overlay with lower z-index */}
      <div className="absolute inset-0 bg-black opacity-50 z-0"></div>
      
      {/* Hero content with lower z-index */}
      <div className="relative p-8 md:p-16 z-10">
        <div className="flex flex-col items-center mb-4">
          <div className="mb-2">
            <Image src={Logo} alt="Criptic" height={45} priority />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold">Ronx BUSD</h1>
        </div>
        <p className="mb-8 w-5/6 md:w-3/4 mx-auto">
          A decentralized networking platform based on smart contracts, together with NFT technology, which brings people together from all over the world and opens up endless possibilities for new economic financial systems.
        </p>
        <button
          className="bg-purple-700 hover:bg-purple-800 text-white font-bold py-2 px-4 rounded-full mb-8"
          onClick={handleRegisterBUSD}
        >
          Registration
        </button>

        <div className="max-w-4xl mx-auto grid grid-cols-1 gap-8">
          <div className="p-8 bg-gray-800 rounded-lg shadow-lg">
            <div className="flex items-center mb-4">
              <svg
                className="w-8 h-8 text-gray-400 mr-4"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2a10 10 0 00-10 10 10 10 0 0010 10 10 10 0 0010-10 10 10 0 00-10-10zm-1 17.93a7.965 7.965 0 01-5.684-2.229 7.965 7.965 0 01-2.229-5.684c0-1.704.528-3.288 1.508-4.657.066.52.158 1.027.274 1.525a13.055 13.055 0 001.46 3.468 8.09 8.09 0 002.209 2.208c.001 0 .002.001.003.002a13.053 13.053 0 003.468 1.46c.498.116 1.005.208 1.525.274-.765 1.483-1.849 2.737-3.199 3.69a7.965 7.965 0 01-3.339.917zm2.032-9.747a13.067 13.067 0 00-3.468-1.46c-.497-.115-1.004-.208-1.524-.274-.149-.669-.21-1.378-.185-2.084 1.369-.98 2.953-1.508 4.657-1.508.768 0 1.525.098 2.258.287.99.243 1.942.62 2.809 1.11a10.059 10.059 0 00-2.848 3.929c-.002 0-.002.001-.003.001-.294.499-.61.988-.948 1.467z"></path>
              </svg>
              <div className="text-left">
                <h3 className="text-2xl font-bold">Documentation</h3>
                <p className="text-gray-400">Participant learning platform</p>
              </div>
            </div>
            <a href="#start-learning" className="text-purple-500 hover:underline">
              <a href="/documentation" target='_blank'> Start learning →</a>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
