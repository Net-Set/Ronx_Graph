
"use client"
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

// Define the ABI of your smart contract
import abi from './abi.json';
import { CONTRACT_ADDRESS } from '@/config/constants';
export const useSmartContract = () => {
    const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
    const [contract, setContract] = useState<ethers.Contract | null>(null);

    useEffect(() => {
        // Initialize ethers provider and contract on component mount
        const init = async () => {
            if (window.ethereum) {
                const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
                setProvider(web3Provider);
                const signer = web3Provider.getSigner();
                const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
                setContract(contractInstance);
            }
        };
        init();
    }, []);

    // Fetch any data from the contract (generic function for global use)
    const fetchData = async (methodName: string, ...params: any[]) => {
        if (!contract) return null;
        try {
            const result = await contract[methodName](...params);
            return result;
        } catch (error) {
            console.error("Error fetching data:", error);
            return null;
        }
    };

    // Optionally: Add a method to handle write operations (interactions)
    const writeData = async (methodName: string, ...params: any[]) => {
        if (!contract) return null;
        try {
            const tx = await contract[methodName](...params);
            await tx.wait(); // Wait for the transaction to be mined
            return tx;
        } catch (error) {
            console.error("Error writing data:", error);
            return null;
        }
    };

    return { fetchData, writeData, provider };
};
