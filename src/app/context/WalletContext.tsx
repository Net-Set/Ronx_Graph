'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAccount, useDisconnect, useBalance, useNetwork } from 'wagmi';

interface WalletContextProps {
  walletAddress: string | null;
  setWalletAddressExternally: (address: string | null) => void;

  balance: string | null;
  disconnect: () => void;
  networkId: number | null;
  isConnected: boolean;
}

const WalletContext = createContext<WalletContextProps | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: balanceData } = useBalance({ address });
  const { chain } = useNetwork();
  
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [networkId, setNetworkId] = useState<number | null>(null);


  const setWalletAddressExternally = (address: string | null) => {
    setWalletAddress(address);
  };
  useEffect(() => {
    if (isConnected && address) {
      setWalletAddress(address);
      setBalance(balanceData?.formatted ?? null);
      setNetworkId(chain?.id ?? null);
    } else {
      setWalletAddress(null);
      setBalance(null);
      setNetworkId(null);
    }
  }, [isConnected, address, balanceData, chain]);

  return (
    <WalletContext.Provider
      value={{
        walletAddress,
        setWalletAddressExternally,
        balance,
        disconnect,
        networkId,
        isConnected,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};



export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
