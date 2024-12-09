'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ImageCarousel from '../ui/imageCarsoule';
import Roadmap from '@/components/ui/roadmap';
import SupportPage from '@/components/ui/footer';
import AccountPreview from '@/components/ui/accountpreview';
import PlatformRecentActivity from '@/components/ui/platformrecentactivity';
import { useBreakpoint } from '@/lib/hooks/use-breakpoint';
import Image from '@/components/ui/image';
import BusdBanner from '@/assets/images/BannerBUSD.png';

import { useWallet } from '@/app/context/WalletContext';
import WalletConnect from '@/components/nft/wallet-connect';
import { RetroHeader2 } from '@/layouts/header/header';

interface Breakpoint {
  breakpoint: string;
}

const topPoolsLimit = (breakpoint: Breakpoint['breakpoint']): number => {
  switch (breakpoint) {
    case 'md':
    case '2xl':
      return 5;
    default:
      return 4;
  }
};

export default function MinimalScreen() {
  const wallet = useWallet(); // Assuming `useWallet` provides wallet connection status
  const [walletAddress, setWalletAddress] = useState<string | null>(null); // Local state for wallet address
  const [limit, setLimit] = useState(4);
  const breakpoint = useBreakpoint();
  const router = useRouter();

  useEffect(() => {
    // Fetch wallet address or connection status
    setWalletAddress(wallet?.walletAddress || null); // Adjust based on your wallet context structure
  }, [wallet]);

  useEffect(() => {
    setLimit(topPoolsLimit(breakpoint));
  }, [breakpoint]);

  const handleRegisterBUSD = () => {
    router.push('/authentication/sign-up');
  };

  const handleConnectWallet = () => {
   
    setTimeout(() => {
      setWalletAddress(wallet?.walletAddress || null); // Replace with actual wallet address
    }, 1000); // Simulate async connection
  };

  return (
    <>
      <RetroHeader2/>
      <div
        className="relative w-5/6 mx-auto h-60 bg-cover bg-center rounded-xl mt-12"
        style={{
          backgroundImage: `url(${BusdBanner.src})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: '30vh',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Optional overlay */}
        <div className="absolute inset-0 bg-black opacity-50 rounded-xl"></div>

        {/* Content inside the banner */}
        <div className=" absolute inset-0 flex flex-col md:flex-row items-center justify-between p-4 md:p-8 rounded-xl">
          <div className="text-white text-center md:text-left">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4">
              Welcome to RonX BUSD
            </h1>
            <p className="text-base md:text-lg lg:text-xl mb-4">
              Connect Your Wallet to Start Working. First time here? Watch a tutorial to learn more
            </p>
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
              {walletAddress ? (
                <button
                  className="bg-black hover:bg-gray-800 text-white py-2 px-4 rounded"
                  onClick={handleRegisterBUSD}
                >
                  Join RonX
                </button>
              ) : (
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
                  onClick={handleConnectWallet}
                >
                <WalletConnect />
                </button>
              )}
              <button className="bg-gray-500 hover:bg-gray-700 text-white py-2 px-4 rounded">
                Watch Tutorial
              </button>
            </div>
          </div>
        </div>
      </div>

      <ImageCarousel />
      <AccountPreview />
      <Roadmap />
      <PlatformRecentActivity />
      <SupportPage />
    </>
  );
}
