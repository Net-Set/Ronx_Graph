"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import abi from "@/components/SmartContract/abi.json";
import axios from "axios";

const CONTRACT_ADDRESS = "0x6f4dc25CEb0581eDD1Cc5A982794AC021bFEa2a5";
const INFURA_PROJECT_ID = "54342a1556274e579ef82ed1022b7a7c"; 


interface SmartContractContextType {
  fetchData: (methodName: string, ...params: any[]) => Promise<any | null>;
  writeData: (methodName: string, ...params: any[]) => Promise<any | null>;
  users: (userAddress: string) => Promise<{ id: number; referrer: string; partnersCount: number; registrationTime: number } | null>;
  usersActiveX3Levels: (userAddress: string, level: number) => Promise<boolean | null>;
  usersActiveX4Levels: (userAddress: string, level: number) => Promise<boolean | null>;
  userX3Matrix: (userAddress: string, level: number) => Promise<number | null>;
  userX4Matrix: (userAddress: string, level: number) => Promise<number | null>;
  getPartnerCount: (userAddress: string, matrix: number, level: number) => Promise<number | null>;
  getTotalCycles: (userAddress: string, matrix: number, level: number) => Promise<number | null>;
  getUserRecentActivityUserMatrics: (timesteamp:number, uint: string) => Promise<number | null>;
  getTeamSizeData: (userAddress: string) => Promise<number | null>;
  getPlatformRecentActivity: ()=> Promise<number |null>;
  getUserIdsWalletaddress: (userid: number) => Promise<number | null>;
  getDetailedMatrixInfo: (userid: number, Matrix: number, Level: number) => Promise<number | null>;
  provider: ethers.providers.JsonRpcProvider | null;
}

const SmartContractContext = createContext<SmartContractContextType | undefined>(undefined);

export const SmartContractProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [provider, setProvider] = useState<ethers.providers.JsonRpcProvider | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const infuraProvider = new ethers.providers.JsonRpcProvider(`https://bsc-testnet.infura.io/v3/${INFURA_PROJECT_ID}`);
        setProvider(infuraProvider);
        const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, abi, infuraProvider);
        setContract(contractInstance);
      } catch (error) {
        console.error("Error initializing provider or contract:", error);
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