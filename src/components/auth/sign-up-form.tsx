
'use client';
import { useEffect, useState } from 'react';

// Declare the ethereum property on the window object
declare global {
  interface Window {
    ethereum?: any;
  }
}
import Button from '@/components/ui/button/button';
import Input from '@/components/ui/forms/input';
import { useRouter } from 'next/navigation';
import WalletStatus from '@/components/walletstatus/walletstatus';
import { useWallet } from '@/app/context/WalletContext';
import { ethers } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';
import CONTRACT_ABI from '@/components/SmartContract/abi.json';
import {useSmartContract}  from '@/components/SmartContract/SmartContractProvider';
import { CONTRACT_ADDRESS } from '@/config/constants';
export default function SignUpForm() {
  const { walletAddress, balance } = useWallet();
  const {transferTokens  } = useSmartContract();
  const router = useRouter();

  const [formData, setFormData] = useState({
    UplineId: '1', // Default Upline ID
  });

  const [errors, setErrors] = useState({
    UplineId: '',
  });

  const [uplineWallet, setUplineWallet] = useState<string | null>(null); // State to store fetched wallet address
  const [isLoading, setIsLoading] = useState(false); // State for API loading
  const [isRegistering, setIsRegistering] = useState(false); // State for registration loading

  // Validate fields
  function validateField(name: string, value: string) {
    const newErrors = { ...errors };

    switch (name) {
      case 'UplineId':
        if (!value) {
          newErrors.UplineId = 'Upline ID is required';
        } else if (!/^\d+$/.test(value)) {
          newErrors.UplineId = 'Only numbers are allowed';
        } else {
          newErrors.UplineId = '';
        }
        break;
      default:
        break;
    }

    setErrors(newErrors);
  }
  // Handle input changes and fetch wallet address if Upline ID is valid
  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;

    // Only allow numbers in the UplineId field
    if (name === 'UplineId' && !/^\d*$/.test(value)) return;

    setFormData({ ...formData, [name]: value });
    validateField(name, value);

    // Fetch wallet address if the Upline ID is valid
    if (name === 'UplineId' && /^\d+$/.test(value)) {
      fetchWalletAddress(value);
    } else {
      setUplineWallet(null); // Clear wallet address if input is invalid
    }
  }

  // Fetch wallet address based on Upline ID
  async function fetchWalletAddress(id: string) {
    try {
      setIsLoading(true);
      const response = await fetch(`/page/api/idTowalletAddress?id=${id}`);
      const data = await response.json();

      if (response.ok) {
        setUplineWallet(data.walletAddress); // Update wallet address state
        console.log("Upline Wallet Address:", data.walletAddress);
      } else {
        setUplineWallet(null); // Clear wallet address if not found
      }
    } catch (error) {
      console.error('Error fetching wallet address:', error);
      setUplineWallet(null); // Handle fetch error
    } finally {
      setIsLoading(false);
    }
  }

  // Fetch wallet address for the default Upline ID on component mount
  useEffect(() => {
    fetchWalletAddress(formData.UplineId);
  }, []);

  // Handle form submission and register
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    // Check if there are no validation errors
    if (Object.values(errors).every((x) => x === '') && formData.UplineId) {
      // if (!uplineWallet) {
      //   setErrors({ ...errors, UplineId: 'Please provide a valid Upline wallet address.' });
      //   return;
      // }

      // Begin registration process
      try {
        setIsRegistering(true);
        
        // Ensure the user is connected to MetaMask or an Ethereum-compatible wallet
        if (typeof window.ethereum === 'undefined') {
          alert('Please install MetaMask or another Ethereum wallet extension');
          return;
        }

        const provider = new Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        
        // Transfer tokens to the contract
        const tokenVerification = await transferTokens(CONTRACT_ADDRESS,"0.0002");
        console.log('test tokenVerification:', tokenVerification);
      console.log('test wallet address:', walletAddress);
        console.log('test upline wallet address:', uplineWallet);
        // Register with the Upline wallet address and user's wallet address
        const tx = await contract.registrationFor( walletAddress, uplineWallet);
        await tx.wait(); // Wait for the transaction to be mined

        alert('Registration successful!');

      //      // Static data for user profile creation
      const staticProfileData = {
        newUserId: 1, // Replace with the new user ID
        userWalletAddress: walletAddress, // Make sure this is the user's connected wallet address
        profilePic: "/uploads/default_pic.jpg", // Replace with a valid URL
        personalLink: "https://example.com", // Replace with a valid personal link
        username: "Username", // Replace with a username
      };
  
      // Send a POST request to create the user profile
      const response = await fetch("/page/api/userCreateProfile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(staticProfileData),
      });
  
      const result = await response.json();
  
      if (!response.ok) {
        throw new Error(result.error || "Failed to create profile.");
      }
  
      alert(`Profile created successfully: ${result.message}`);
      console.log("User ID:", result.userId);

        router.push('/retro'); // Redirect after successful registration
      } catch (error: any) {
        console.error('Registration failed:', error);
        alert('Failed to register. Check the console for details.');
      } finally {
        setIsRegistering(false);
      }
    }
  }

  return (
    <>
      <form noValidate onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-3">
          {/* Upline ID Input Field */}
          <Input
            name="UplineId"
            type="text"
            placeholder="Upline ID"
            value={formData.UplineId}
            onChange={handleChange}
            inputClassName="focus:!ring-0 placeholder:text-[#6B7280]"
          />
          {errors.UplineId && (
            <p className="text-red-500 text-xs">{errors.UplineId}</p>
          )}
        </div>

        {/* Display Upline Wallet Address */}
        <div className="mt-2">
          {isLoading ? (
            <p className="text-sm text-gray-500">Fetching wallet address...</p>
          ) : uplineWallet ? (
            <p className="text-sm text-green-500">
              Wallet Address: {uplineWallet}
            </p>
          ) : (
            <p className="text-sm text-red-500">
              {formData.UplineId ? 'No wallet address found' : ''}
            </p>
          )}
        </div>

        {/* Wallet Status Component */}
        <WalletStatus />

        {/* Sign Up Button */}
        <Button
          type="submit"
          className="mt-5 rounded-lg !text-sm uppercase tracking-[0.04em]"
          disabled={isRegistering}
        >
          {isRegistering ? 'Registering...' : 'Sign Up'}
        </Button>
      </form>
    </>
  );
}


