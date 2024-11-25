'use client';

import { useState } from 'react';
import Button from '@/components/ui/button/button';
import Input from '@/components/ui/forms/input';
import { useRouter } from 'next/navigation';
import WalletStatus from '@/components/walletstatus/walletstatus';
import { useWallet } from '@/app/context/WalletContext';

export default function SignUpForm() {
  const { walletAddress, balance } = useWallet();
  const router = useRouter();

  const [formData, setFormData] = useState({
    UplineId: '1', // Default Upline ID
  });

  const [errors, setErrors] = useState({
    UplineId: '',
  });

  const [uplineWallet, setUplineWallet] = useState<string | null>(null); // State to store fetched wallet address
  const [isLoading, setIsLoading] = useState(false); // State for API loading

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
      try {
        setIsLoading(true);
        const response = await fetch(`/page/api/idTowalletAddress?id=${value}`);
        const data = await response.json();

        if (response.ok) {
          setUplineWallet(data.walletAddress); // Update wallet address state
        } else {
          setUplineWallet(null); // Clear wallet address if not found
        }
      } catch (error) {
        console.error('Error fetching wallet address:', error);
        setUplineWallet(null); // Handle fetch error
      } finally {
        setIsLoading(false);
      }
    } else {
      setUplineWallet(null); // Clear wallet address if input is invalid
    }
  }

  // Handle form submission
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Check if there are no validation errors
    if (Object.values(errors).every((x) => x === '') && formData.UplineId) {
      console.log('Form submitted:', formData, 'Upline Wallet:', uplineWallet);
      router.push('/retro');
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
        >
          Sign Up
        </Button>
      </form>
    </>
  );
}
