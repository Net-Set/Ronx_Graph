'use client';
import { useState, useEffect } from 'react';
import { useCopyToClipboard } from 'react-use';
import userBanner from '@/assets/images/userBanner.png';
import { useWallet } from '@/app/context/WalletContext';
import { useSmartContract } from '@/components/SmartContract/SmartContractProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import Avatar from '@/components/ui/avatar';
// static data
import { authorData } from '@/data/static/author';

interface User {
  _id: string;
  userid: number;
  userWalletAddress: string;
  profilePic: string;
  personalLink: string;
  username: string;
}

export default function Profile() {
  const { users } = useSmartContract();
  const walletAddress  = useWallet();
  const address = useWallet();
  console.log("address:", address);
  // Access the `address` field within the object, or handle undefined
  const staticAddress = walletAddress ? walletAddress.walletAddress : '';
  const addressnew = staticAddress;

  console.log("addressnew 1:", staticAddress);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState<string | null>('');
  const [newWalletAddress, setNewWalletAddress] = useState<string | null>('');
  const [profilePic, setProfilePic] = useState<string | null>('');

  const [profileImage, setProfileImage] = useState<string>("/uploads/profile-picture.png"); // Default image
  const wallet = useWallet(); // Wallet context

  // Handle Edit Button Click
  const handleEditClick = () => {
    setIsEditing(true);
    if (user) {
      setNewUsername(user.username); // Pre-fill fields with current data
      setNewWalletAddress(user.userWalletAddress);
    }
  };

  // Close the Edit Popup
  const handleClosePopup = () => {
    setIsEditing(false);
  };


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result as string);  // Set the image preview as a data URL
      };
      reader.readAsDataURL(file);  // Convert the file to a data URL for the preview
    }
  };
  
  // Fetch profile picture dynamically based on wallet address
  const fetchProfileImage = async () => {
    if (!staticAddress) {
      console.warn("Wallet address is not available.");
      return;
    }

    try {
      const response = await fetch(`/page/api/walletToProfilepic?wallet=${staticAddress}`);
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched Profile Data:", data);

        // Ensure `profilePic` exists in the response
        if (data.profilePic) {
          setProfileImage(data.profilePic);
        } else {
          console.warn("Profile picture not found in the response.");
        }
      } else {
        console.error(`Failed to fetch profile picture. Status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error fetching profile image:", error);
    }
  };

  useEffect(() => {
    fetchProfileImage();
  }, [staticAddress]);
  // Fetch User Data
  async function fetchUserDataByUserId(staticAddress: string) {
    try {
      const response = await fetch(`/page/api/users?userWalletAddress=${staticAddress}`);
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);  // Update user data state
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }

  useEffect(() => {
    fetchUserDataByUserId(staticAddress || 'null');
  }, [walletAddress]);


  const handleSaveChanges = async () => {
    if (!newUsername || !newWalletAddress) {
      console.error("Username or wallet address is missing");
      return;
    }
  
    // Prepare form data for the request
    const formData = new FormData();
    formData.append("userWalletAddress", newWalletAddress);
    formData.append("username", newUsername);
    if (profilePic) {
      const blob = await fetch(profilePic).then((r) => r.blob());
      formData.append("profilePic", blob, "profile.jpg");
    }
  
    try {
      const response = await fetch("/page/api/update-profile", {
        method: "POST",
        body: formData, // Use form data for file upload
      });
  
      // Handle response
      const contentType = response.headers.get("Content-Type");
      if (contentType && contentType.includes("application/json")) {
        const result = await response.json();
        if (response.ok) {
          console.log("Profile updated:", result.message);
          setIsEditing(false);
          fetchProfileImage();
          fetchUserDataByUserId(newWalletAddress); // Refetch user data
          // alert success
          // alert("Profile updated successfully!");
        } else {
          console.error("Error updating profile:", result.error);
        }
      } else {
        console.error("Response is not JSON:", await response.text());
      }
    } catch (error) {
      console.error("Unexpected error while updating profile:", error);
    }
  };
  
  

  if (loading) return <div>Loading...</div>;

  return (
    <div className="flex flex-col w-full pt-4 md:flex-row md:pt-10 lg:pt-12">
      {/* User Information Section */}
      <Avatar
          size="xl"
          image={profileImage} // Dynamic profile image
          alt="Author"
          width={100}
          height={100}
          className="z-10 mx-auto -mt-12 dark:border-gray-500 sm:-mt-14 md:mx-0 md:-mt-16 xl:mx-0 3xl:-mt-20"
        />
      <div className="shrink-0 border-dashed border-gray-200 dark:border-gray-700 md:w-72 ltr:md:border-r md:ltr:pr-7 rtl:md:border-l md:rtl:pl-7 lg:ltr:pr-10 lg:rtl:pl-10">
        <div className="mx-auto mt-5 p-4 rounded-lg bg-white shadow-card dark:bg-light-dark md:mx-0 xl:mt-6">
         <h3> User Details: 
          <button onClick={handleEditClick} className="text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
            <FontAwesomeIcon  icon={faPencilAlt as IconProp} />
          </button>
          </h3>
          <div className="mt-4 space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <p><strong>ID:</strong> {user?.userid}</p>
            <p><strong>Username:</strong> {user?.username}</p>
            <p><strong>Wallet Address:</strong> {user?.userWalletAddress ? `${user.userWalletAddress.slice(0, 20)}...` : "Not Available"}</p>
          </div>
          <div className="absolute top-2 right-2">
            {/* Edit Icon */}
            <button onClick={handleEditClick} className="text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Edit
              <i className="fas fa-pencil-alt"></i> {/* Font Awesome pencil icon */}
            </button>
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="flex-1 space-y-6">
        {/* Personal Link Section */}
        <div className="p-4 rounded-lg bg-[#182349] bg-opacity-60 text-white">
          <h4 className="text-xl font-semibold mb-2">Personal Link</h4>
          <a
            href={user?.personalLink || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg underline"
          >
            {user?.personalLink || "No Personal Link"}
          </a>
        </div>

        {/* Banner Section */}
        <div
          className="p-4 rounded-lg bg-cover bg-center text-white"
          style={{
            backgroundImage: `url(${userBanner.src})`,
            height: "15vh",
          }}
        >
          <div className="flex items-center gap-4">
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
  <div className="fixed inset-0  bg-opacity-70 flex justify-center items-center z-50">
    <div className="bg-[#182349] p-6 rounded-lg shadow-lg w-96">
      <h4 className="text-lg font-semibold mb-4 text-white">Edit User Information</h4>

      {/* User ID */}
      <div className="mb-4">
        <label htmlFor="userid" className="block text-sm text-gray-300">User ID</label>
        <input
          type="text"
          id="userid"
          value={user?.userid || ''}
          readOnly
          className="w-full p-2 mt-2 border border-blue-400 rounded-md text-gray-300 bg-blue-800"
        />
      </div>

      {/* Username Input */}
      <div className="mb-4">
        <label htmlFor="username" className="block text-sm text-gray-300">Username</label>
        <input
          type="text"
          id="username"
          value={newUsername || ''}
          onChange={(e) => setNewUsername(e.target.value)}
          className="w-full p-2 mt-2 border border-blue-400 rounded-md text-gray-300 bg-blue-800"
        />
      </div>

      {/* Wallet Address Input */}
      <div className="mb-4">
        <label htmlFor="walletAddress" className="block text-sm text-gray-300">Wallet Address</label>
        <input
          type="text"
          id="walletAddress"
          value={newWalletAddress || ''}
          readOnly
          className="w-full p-2 mt-2 border border-blue-400 rounded-md text-gray-300 bg-blue-800"
        />
      </div>

      {/* Profile Picture Input */}
      <div className="mb-4">
        <label htmlFor="profilePic" className="block text-sm text-gray-300">Profile Picture</label>
        <input
          type="file"
          id="profilePic"
          accept="image/*"
          onChange={(e) => handleFileChange(e)}
          className="w-full p-2 mt-2 border border-blue-400 rounded-md text-gray-300 bg-blue-800"
        />
        {/* Display the selected image preview */}
        {profilePic && (
          <div className="mt-2">
            <img src={profilePic} alt="Profile Preview" className="w-24 h-24 object-cover rounded-full border-4 border-blue-600" />
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-4">
        <button onClick={handleClosePopup} className="px-4 py-2 bg-blue-700 rounded-md hover:bg-blue-600 text-white">Cancel</button>
        <button onClick={handleSaveChanges} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500">Save</button>
      </div>
    </div>
  </div>
)}


    </div>
  );
}