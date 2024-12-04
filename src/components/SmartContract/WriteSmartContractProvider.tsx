"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { ethers } from "ethers";
import contractABI from "./abi.json";

interface SmartContractContextType {
  registrationFor: (
    userAddress: string,
    referrer: string,
    value: ethers.BigNumber
  ) => Promise<any>;
  walletAddress: string | null;
  connectWallet: () => Promise<void>;
}

const SmartContractContext = createContext<SmartContractContextType | undefined>(undefined);

export const WriteSmartContractProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const contractAddress = "0x6f4dc25CEb0581eDD1Cc5A982794AC021bFEa2a5"; // Replace with your contract address

  const connectWallet = async () => {
    if (!window.ethereum) {
      console.error("MetaMask is not installed!");
      return;
    }

    try {
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      await web3Provider.send("eth_requestAccounts", []);
      const signer = web3Provider.getSigner();
      const address = await signer.getAddress();

      setProvider(web3Provider);
      setWalletAddress(address);
      console.log("Connected wallet address:", address);
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  const registrationFor = async (
    userAddress: string,
    referrer: string,
    value: ethers.BigNumber
  ): Promise<any> => {
    if (!provider) {
      console.error("No provider available. Ensure the wallet is connected.");
      return null;
    }
  
    if (!walletAddress) {
      console.error("No wallet address found. Ensure the wallet is connected.");
      return null;
    }
  
    try {
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
  
      console.log("Initiating registration for wallet:", walletAddress);
  
      const tx = await contract.registrationFor(userAddress, referrer, {
        value,
        gasLimit: ethers.BigNumber.from("300000"), // Example gas limit
      });
  
      console.log("Transaction submitted:", tx);
      await tx.wait();
      console.log("Transaction confirmed:", tx);
  
      return tx;
    } catch (error: any) {
      console.error("Error during registration:", error.message);
      if (error.code) {
        console.error("Error code:", error.code);
      }
      throw error;
    }
  };
  
  
  return (
    <SmartContractContext.Provider value={{ registrationFor, walletAddress, connectWallet }}>
      {children}
    </SmartContractContext.Provider>
  );
};

export const useSmartContract = (): SmartContractContextType => {
  const context = useContext(SmartContractContext);
  if (!context) {
    throw new Error("useSmartContract must be used within a WriteSmartContractProvider");
  }
  return context;
};
