'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/app/context/WalletContext';
import Avatar from '@/components/ui/avatar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt, faCopy } from '@fortawesome/free-solid-svg-icons';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import userBanner from '@/assets/images/userBanner.png';

interface User {
  _id: string;
  userId: number;
  userWalletAddress: string;
  profilePic: string;
  personalLink: string;
  username: string;
  uplineId: number;
}

export default function Profile() {
  const walletContext = useWallet();
  const walletAddress = walletContext?.walletAddress || '';

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [profilePic, setProfilePic] = useState<string | null>(null);

  // Fetch user data by wallet address
  async function fetchUserData(address: string) {
    try {
      const response = await fetch(`/page/api/users?userWalletAddress=${address}`);
      if (response.ok) {
        const userData = await response.json();
        console.log('User data:', userData);
        setUser(userData);
        setLoading(false);
      } else {
        console.error('Failed to fetch user data:', response.status);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }

  // Handle file input for profile picture
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle save changes
  const handleSaveChanges = async () => {
    if (!newUsername) {
      console.error('Username is required');
      return;
    }

    const formData = new FormData();
    formData.append('username', newUsername);
    if (profilePic) {
      const blob = await fetch(profilePic).then((r) => r.blob());
      formData.append('profilePic', blob, 'profile.jpg');
    }

    try {
      const response = await fetch('/page/api/update-profile', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Profile updated:', result.message);
        setIsEditing(false);
        fetchUserData(walletAddress);
      } else {
        console.error('Error updating profile:', response.status);
      }
    } catch (error) {
      console.error('Unexpected error while updating profile:', error);
    }
  };

  // Copy wallet address to clipboard
  const copyToClipboard = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      alert('Wallet address copied to clipboard!');
    } catch (err) {
      console.error('Error copying wallet address:', err);
      alert('Failed to copy wallet address.');
    }
  };

  // Load user data on component mount
  useEffect(() => {
    if (walletAddress) {
      fetchUserData(walletAddress);
    }
  }, [walletAddress]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="flex flex-col w-full pt-4 md:flex-row md:pt-10 lg:pt-12">
      {/* User Information */}
      <div className="flex flex-col items-center gap-6">
        <div className="flex-shrink-0 flex items-center justify-center z-0">
          <Avatar
            size="xl"
            image={user?.profilePic || '/uploads/profile-picture.png'}
            alt="Author"
            width={100}
            height={100}
            className="z-10 mx-auto -mt-12 dark:border-gray-500 sm:-mt-14 md:-mt-16 xl:-mt-20"
          />
        </div>
      </div>

      {/* User Details Section */}
      <div className="shrink-0 border-dashed border-gray-200 dark:border-gray-700 md:w-72 ltr:md:border-r md:ltr:pr-7 rtl:md:border-l md:rtl:pl-7 lg:ltr:pr-10 lg:rtl:pl-10">
        <div className="mx-auto mt-5 p-4 rounded-lg bg-white shadow-card dark:bg-light-dark md:mx-0 xl:mt-6">
          <h3>
            User Details:
            <button
              onClick={() => setIsEditing(true)}
              className="text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              <FontAwesomeIcon icon={faPencilAlt as IconProp} />
            </button>
          </h3>
          <div className="mt-4 space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <p>
              <strong>ID:</strong> {user?.userId}
            </p>
            <p>
              <strong>Username:</strong> {user?.username}
            </p>
            <p>
              <strong>Wallet Address:</strong>{" "}
              {user?.userWalletAddress
                ? `${user.userWalletAddress.slice(0, 20)}...`
                : "Not Available"}
            </p>
          </div>
          <div className="absolute top-2 right-2">
            <button
              onClick={() => setIsEditing(true)}
              className="text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              <i className="fas fa-pencil-alt"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="flex-1 space-y-6">
        <div className="p-4 rounded-2xl bg-[#182349] bg-opacity-60 text-white lg:ml-20 mt-4">
          <h4 className="text-xl font-semibold mb-2">Personal Link</h4>
          <a
            href={user?.personalLink || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg underline"
          >
            {user?.personalLink || 'No Personal Link'}
          </a>
        </div>

        <div
          className="p-4 rounded-lg bg-cover bg-center text-white"
          style={{ backgroundImage: `url(${userBanner.src})`, height: '15vh' }}
        >
          <div className="flex items-center gap-4 mt-10 lg:ml-20">
            <h4 className="text-xl font-semibold">Ronx Token</h4>
            <a
              href="https://RonX.io/b/pyffvf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg underline"
            >
              Login in RonX
            </a>
          </div>
        </div>
      </div>

      {/* Edit Popup */}
      {isEditing && (
        <div className="fixed inset-0 bg-opacity-70 flex justify-center items-center z-50">
          <div className="bg-[#182349] p-6 rounded-lg shadow-lg w-96">
            <h4 className="text-lg font-semibold mb-4 text-white">Edit User Information</h4>
            <div className="mb-4">
              <label htmlFor="username" className="block text-sm text-gray-300">Username</label>
              <input
                type="text"
                id="username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="w-full p-2 mt-2 border border-blue-400 rounded-md text-gray-300 bg-blue-800"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="profilePic" className="block text-sm text-gray-300">Profile Picture</label>
              <input
                type="file"
                id="profilePic"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full p-2 mt-2 border border-blue-400 rounded-md text-gray-300 bg-blue-800"
              />
              {profilePic && (
                <div className="mt-2">
                  <img src={profilePic} alt="Profile Preview" className="w-24 h-24 object-cover rounded-full border-4 border-blue-600" />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-blue-700 rounded-md hover:bg-blue-600 text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveChanges}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
