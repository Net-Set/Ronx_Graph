"use client";

import React, { useState } from 'react';
import { Box, Button, Flex, Link, Text, useDisclosure } from '@chakra-ui/react';
import Image from '@/components/ui/image';
import darkLogo from '@/assets/images/logo-white.svg';
import ConnectWallet from './ConnectWallet';
import WalletConnect from '@/components/nft/wallet-connect';

interface HeaderProps {
  onRegistrationClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onRegistrationClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [walletData, setWalletData] = useState({
    address: "",
    balance: null as string | null,
  });

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Function to handle wallet connection and updating state
  const handleConnect = (address: string, balance: string) => {
    setWalletData({ address, balance });
  };

  return (
    <header
      className="fixed top-0 left-0 w-full z-50 bg-black text-white p-4 flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0 shadow-lg"
    >
      <Flex justify="space-between" align="center" w="full">
        {/* Logo */}
        <Image src={darkLogo} alt="Criptic" height={45} priority />

        {/* Toggle Menu Button for Mobile */}
      
      </Flex>

      {/* Navigation Links */}
      <Flex
        direction={{ base: 'column', lg: 'row' }}
        align="center"
        display={isMenuOpen ? 'flex' : { base: 'none', lg: 'flex' }}
        className="space-x-4"
      >
        <Link href="#documentation" color="white" _hover={{ color: 'gray.400' }}>Documentation</Link>
        <Link href={`/minimal`} color="white" _hover={{ color: 'gray.400' }}>Login</Link>
        <Link
          href="#register"
          onClick={(e) => { e.preventDefault(); onRegistrationClick(); }}
          color="white"
          _hover={{ color: 'gray.400' }}
        >
          Registration
        </Link>
      </Flex>

      {/* Stats Section */}
      <Flex direction="column" align="center" className="space-y-2 lg:space-y-0 lg:space-x-4">
        <Text color="white">Maximum</Text>
        <Text color="white">Accrual 5.12%</Text>
        <Text color="white">Annual Rate 5.05%</Text>
      </Flex>

      {/* Wallet Connect Section */}
      <Flex direction="column" align="center">
        <WalletConnect />
      </Flex>
    </header>
  );
};

export default Header;
