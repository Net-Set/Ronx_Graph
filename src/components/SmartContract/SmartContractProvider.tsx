"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import abi from "@/components/SmartContract/abi.json";
import TOKEN_ABI from "@/components/SmartContract/tokenabi.json";
import axios from "axios";
import { Web3Provider } from "@ethersproject/providers";
import { INFURA_PROJECT_ID, CONTRACT_ADDRESS, TOKEN_CONTRACT_ADDRESS } from "@/config/constants";

interface SmartContractContextType {
  fetchData: (methodName: string, ...params: any[]) => Promise<any | null>;
  writeData: (methodName: string, ...params: any[]) => Promise<any | null>;
  users: (userAddress: string) => Promise<{
    id: number;
    referrer: string;
    partnersCount: number;
    registrationTime: number;
  } | null>;
  usersActiveX3Levels: (userAddress: string, level: number) => Promise<boolean | null>;
  usersActiveX4Levels: (userAddress: string, level: number) => Promise<boolean | null>;
  userX3Matrix: (userAddress: string, level: number) => Promise<number | null>;
  userX4Matrix: (userAddress: string, level: number) => Promise<number | null>;
  getPartnerCount: (userAddress: string, matrix: number, level: number) => Promise<number | null>;
  getTotalCycles: (userAddress: string, matrix: number, level: number) => Promise<number | null>;
  getUserRecentActivityUserMatrics: (timestamp: number, unit: string) => Promise<number | null>;
  getTeamSizeData: (userAddress: string) => Promise<number | null>;
  getPlatformRecentActivity: () => Promise<number | null>;
  getUserIdsWalletaddress: (userid: number) => Promise<number | null>;
  getDetailedMatrixInfo: (userid: number, matrix: number, level: number) => Promise<number | null>;
  registrationFor: (useraddress: string, referrer: string) => Promise<any | null>;
  transferTokens: (useraddress: string, amount: string) => Promise<void>;
  buyNewLevel: ( matrix: number, level: number) => Promise<any | null>;
  provider: ethers.providers.JsonRpcProvider | null;
}

const SmartContractContext = createContext<SmartContractContextType | undefined>(undefined);

export const SmartContractProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [provider, setProvider] = useState<ethers.providers.JsonRpcProvider | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [tokenContract, setTokenContract] = useState<ethers.Contract | null>(null);

  useEffect(() => {
    const init = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          const web3Provider = new Web3Provider(window.ethereum);
          const signer = web3Provider.getSigner();
          const infuraProvider = new ethers.providers.JsonRpcProvider(
            `https://bsc-testnet.infura.io/v3/${INFURA_PROJECT_ID}`
          );
          setProvider(infuraProvider);
          const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, abi, infuraProvider);
          const tokenContractInstance = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_ABI, signer);
          setTokenContract(tokenContractInstance);
          setContract(contractInstance);
        } catch (error) {
          console.error("Error initializing provider or contract:", error);
        }
      }
    };
    init();
  }, []);

 
  


  const fetchData = async (methodName: string, ...params: any[]) => {
    if (!contract) return null;
    try {
      const result = await contract[methodName](...params);
      return result;
    } catch (error) {
      console.error(`Error fetching data from ${methodName}:`, error);
      return null;
    }
  };

  const writeData = async (methodName: string, ...params: any[]) => {
    if (!contract) return null;
    try {
      const signer = provider?.getSigner();
      if (!signer) {
        throw new Error("No signer available");
      }
      if (!contract) {
        throw new Error("Contract is not initialized");
      }
      const contractWithSigner = contract.connect(signer);
      const tx = await contractWithSigner[methodName](...params);
      await tx.wait();
      return tx;
    } catch (error) {
      console.error(`Error writing data to ${methodName}:`, error);
      return null;
    }
  };

  // Users method to fetch user details based on the provided address
  const users = async (userAddress: string) => {
    if (!contract) return null;
    try {
      const result = await contract.users(userAddress);
      const userData = {
        id: result.id.toNumber(),
        referrer: result.referrer,
        partnersCount: result.partnersCount.toNumber(),
        registrationTime: result.registrationTime.toNumber(),
      };
      return userData;
    } catch (error) {
      console.error("Error fetching user details:", error);
      return null;
    }
  };

  // Check if a user is active in X3 at a certain level
  const usersActiveX3Levels = async (userAddress: string, level: number) => {
    if (!contract) return null;
    try {
      const result = await contract.usersActiveX3Levels(userAddress, level);
      return result; // Assuming this returns a boolean
    } catch (error) {
      console.error("Error fetching usersActiveX3Levels:", error);
      return null;
    }
  };

  // Check if a user is active in X4 at a certain level
  const usersActiveX4Levels = async (userAddress: string, level: number) => {
    if (!contract) return null;
    try {
      const result = await contract.usersActiveX6Levels(userAddress, level);
      return result; // Assuming this returns a boolean
    } catch (error) {
      console.error("Error fetching usersActiveX4Levels:", error);
      return null;
    }
  };

  // Fetch users X3 matrix
  const userX3Matrix = async (userAddress: string, level: number) => {
    if (!contract) return null;
    try {
      const result = await contract.usersX3Matrix(userAddress, level);
      return result; // Return relevant data
    } catch (error) {
      console.error("Error fetching usersX3Matrix:", error);
      return null;
    }
  };

  // Fetch contract data for X4 matrix
  const userX4Matrix = async (userAddress: string, level: number) => {
    if (!contract) return null;
    try {
      const result = await contract.usersX6Matrix(userAddress, level);
      return result; // Assuming this returns a number
    } catch (error) {
      console.error("Error fetching userX4Matrix:", error);
      return null;
    }
  };

  // Fetch the total cycles for a user at a certain level and matrix
  const getTotalCycles = async (userAddress: string, matrix: number, level: number) => {
    if (!contract) return null;
    try {
      const cycles = await contract.getTotalCycles(userAddress, matrix, level);
      return cycles.toNumber();
    } catch (error) {
      console.error("Error fetching total cycles:", error);
      return null;
    }
  };

  // Fetch the partner count for a user at a certain level and matrix
  const getPartnerCount = async (userAddress: string, matrix: number, level: number): Promise<number | null> => {
    if (!contract) return null;
    try {
      const partnerCount = await contract.getPartnerCount(userAddress, matrix, level);
      return partnerCount.toNumber(); // Assuming this returns a BigNumber that needs to be converted to a number
    } catch (error) {
      console.error("Error fetching partner count:", error);
      return null;
    }
  };

  //last 24 hourse fetch recent activity in user register and buy new level that relate data fetch
  const getUserRecentActivityUserMatrics = async (timestemp: number ,uint: string) => {
    if (!contract) return null;
    try {
      const result = await contract.getUserRegistrationMetrics(timestemp,uint);
      return result; // Return relevant data
    } catch (error) {
      console.error("Error fetching user recent activity:", error);
      return null;
    }
  };

  //fetch Platform recentActivity that related data display in fetch in method
  const getPlatformRecentActivity = async () => {
    if (!contract) return null;
    try {
      const result = await contract.getRecentActivity();
      return result; // Return relevant data
    } catch (error) {
      console.error("Error fetching platform recent activity:", error);
      return null;
    }
  };


  // Function to fetch wallet address using userId
const getUserIdsWalletaddress = async (userId: number) => {
  if (!contract) return null;
  try {
    // Call smart contract method to get the wallet address by userId
    const address = await contract.userIds(userId);
    return address;  // Address will be returned as a single value
  } catch (error) {
    console.error("Error fetching user wallet address through userId:", error);
    return null;
  }
};

//Get Team Size data fetch useing wallet Address
const getTeamSizeData = async (userAddress: string) => {
  if(!contract) return null;

  try{

    //call Smart Contract method to get user wallet address through team size that user fetch  
    const result = await contract.getTeamSize(userAddress);
    return result;

  }catch(error){
    console.error("error Message in wallet address not found error:",error);
    return null;
  }



};

//Get Team Size data fetch useing wallet Address
const getDetailedMatrixInfo = async (userId: number, Matrix: number, Level: number) => {
  if(!contract) return null;

  try{

    //call Smart Contract method to get user wallet address through team size that user fetch  
    const result = await contract.getDetailedMatrixInfo(userId,Matrix, Level);
    return result;

  }catch(error){
    console.error("error Message in wallet address not found error:",error);
    return null;
  }

};

// Registration for user
const registrationFor = async (userAddress: string, referrer: string) => {
  if (!provider) {
    console.error("No provider available");
    return null;
  }

  try {
    // Request accounts and check connection
    await provider.send("eth_requestAccounts", []);
    const accounts = await provider.listAccounts();
    if (accounts.length === 0) {
      throw new Error("No accounts found. Please connect a wallet.");
    }

    // Get signer
    const signer = provider.getSigner();
    console.log("Signer Address:", await signer.getAddress());
    if(!contract) {
      throw new Error("Contract is not initialized");
    }
    // Connect contract to signer
    const contractWithSigner = contract.connect(signer);

    // Define the payable value (adjust as needed)
    const value = ethers.utils.parseEther("0.1");

    // Call the registration function
    const tx = await contractWithSigner.registration(userAddress, referrer, { value });
    await tx.wait();

    console.log("Registration successful:", tx);
    return tx;
  } catch (error) {
    console.error("Error registering user:", error);
    return null;
  }
};
const transferTokens = async (useraddress: string, amount: string ) => {
  if (!provider) throw new Error("No provider available");

  try {
    // Get the signer from the provider

    // Execute the transfer function
    if (!tokenContract) {
      throw new Error("Token contract is not initialized");
    }
    const tx = await tokenContract.approve(useraddress, ethers.utils.parseEther(amount));
    await tx.wait();

    console.log("Tokens transferred successfully:", tx);
  } catch (error) {
    console.error("Error during token transfer:", error);
    throw new Error("Failed to transfer tokens.");
  }
};

// Buy new level function to buy new level
const buyNewLevel = async (matrix: number, level: number) => {
  if (!provider) {
    console.error("No provider available");
    return null;
  }
  try{
    // Request accounts and check connection
    await provider.send("eth_requestAccounts", []);
    const accounts = await provider.listAccounts();
    if (accounts.length === 0) {
      throw new Error("No accounts found. Please connect a wallet.");
    }

    // Get signer
    const signer = provider.getSigner();
    console.log("Signer Address:", await signer.getAddress());
    if(!contract) {
      throw new Error("Contract is not initialized");
    }
    // Connect contract to signer
    const contractWithSigner = contract.connect(signer);

    // Define the payable value (adjust as needed)
    const value = ethers.utils.parseEther("0.1");

    // Call the registration function
    const tx = await contractWithSigner.buyNewLevel(matrix, level, { value });
    await tx.wait();

    console.log("Registration successful:", tx);
    return tx;
  }catch(error){
    console.error("Error buying new level:", error);
    return null;
  }
}

  return (
    <SmartContractContext.Provider
      value={{
        fetchData,
        writeData,
        users,
        usersActiveX3Levels,
        usersActiveX4Levels,
        getTotalCycles,
        userX3Matrix,
        userX4Matrix,
        getPartnerCount,
        getUserRecentActivityUserMatrics,
        getPlatformRecentActivity,
        getUserIdsWalletaddress,
        getTeamSizeData,
        getDetailedMatrixInfo,
        registrationFor,
        transferTokens,
        buyNewLevel,
        provider,
      }}
    >
      {children}
    </SmartContractContext.Provider>
  );
};

// Hook to use the SmartContract context
export const useSmartContract = () => {
  const context = useContext(SmartContractContext);
  if (context === undefined) {
    throw new Error("useSmartContract must be used within a SmartContractProvider");
  }
  return context;
};