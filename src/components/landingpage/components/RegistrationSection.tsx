import React from 'react';
import { useRouter } from 'next/navigation';


import Image from '@/components/ui/image';
import AuthSignup from '@/app/authentication/sign-up/page';
import darkLogo from '@/assets/images/logo-white.svg';
interface RegistrationSectionProps {
  onClose: () => void;
}

const RegistrationSection: React.FC<RegistrationSectionProps> = ({ onClose }) => {
  const router = useRouter();

  return (
    <div className="m-1000 fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
      <div className="m-100 bg-gray-900 text-white p-8 rounded-lg  w-200 mx-4 md:mx-auto text-center relative">
        <button className="absolute top-4 right-4 text-white mt-5" onClick={onClose}>
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold mb-4">Register</h2>
        <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
          <div className="bg-gray-800 text-white p-6 rounded-lg text-center">
          <Image src={darkLogo} alt="Criptic" height={45} priority />
            <h3 className="text-xl font-bold mb-4">Busd</h3>
            <p>Advantages:</p>
            <ul className="mb-4 text-left">
              <li>Stablecoin is pegged to the value of the dollar</li>
              <li>Approved by the New York State Financial Services Authority (NYDFS)</li>
              <li>Fixed profit and fall protection</li>
              <li>Instant transactions</li>
            </ul>
            <p>Limitations:</p>
            <ul className="mb-4 text-left">
              <li>Due to the stable price, it is difficult to make money on growth</li>
            </ul>
            <button className="mt-4 bg-indigo-500 text-white py-2 px-4 rounded"  onClick={() => router.push('/authentication/sign-up')}>
              Register BUSD
            </button>          </div>

          {/* <div className="bg-gray-800 text-white p-6 rounded-lg text-center">
            <img src="ethereum.png" alt="Ethereum" className="h-12 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-4">Ethereum</h3>
            <p>Advantages:</p>
            <ul className="mb-4 text-left">
              <li>The largest crypto community</li>
              <li>The second cryptocurrency by capitalization</li>
              <li>The opportunity to earn on the growth of cryptocurrency capitalization</li>
              <li>Reliable and stable network</li>
            </ul>
            <p>Limitations:</p>
            <ul className="mb-4 text-left">
              <li>High network commission</li>
              <li>Low transaction speed</li>
              <li>The cost of entry is highly dependent on the price of the cryptocurrency</li>
            </ul>
            <button className="mt-4 bg-indigo-500 text-white py-2 px-4 rounded">Register Ethereum</button>
          </div>

          <div className="bg-gray-800 text-white p-6 rounded-lg text-center">
            <img src="tron.png" alt="Tron" className="h-12 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-4">Tron</h3>
            <p>Advantages:</p>
            <ul className="mb-4 text-left">
              <li>Instant transactions</li>
              <li>Low network commission</li>
              <li>Affordable and easy start</li>
            </ul>
            <p>Limitations:</p>
            <ul className="mb-4 text-left">
              <li>High TRX volatility</li>
            </ul>
            <button className="mt-4 bg-indigo-500 text-white py-2 px-4 rounded">Register Tron</button>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default RegistrationSection;
