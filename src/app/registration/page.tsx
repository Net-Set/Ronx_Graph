"use client";

import React, { useState } from "react";
import { useWallet } from "@/app/context/WalletContext";
import { useSmartContract } from "@/components/SmartContract/WriteSmartContractProvider";
import { ethers } from "ethers";

function RegistrationPage() {
  const { walletAddress } = useWallet();
  const { registrationFor } = useSmartContract();
  const [status, setStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

const handleRegistration = async () => {
  if (!walletAddress) {
    setStatus("Wallet is not connected.");
    return;
  }

  const referrerAddress = "0x5AA7271111df08db28d68DbdAb69e59d63b7362b"; // Replace with the desired referrer address.
  const registrationValue = ethers.utils.parseEther("0.1"); // Adjust Ether value as needed

  setStatus("Starting registration...");
  console.log("Starting registration for wallet:", walletAddress);

  try {
    const result = await registrationFor(walletAddress, referrerAddress, registrationValue);
    if (result) {
      console.log("Registration transaction:", result);
      setStatus("Registration successful!");
    } else {
      setStatus("Registration failed.");
    }
  } catch (error) {
    console.error("Error during registration:", error);
    setStatus("Error during registration. Check console for details.");
  }
};


  return (
    <div>
      <h1>Registration Component</h1>
      <button onClick={handleRegistration} disabled={isLoading}>
        {isLoading ? "Registering..." : "Register"}
      </button>
      {status && <p>{status}</p>}
    </div>
  );
}

export default RegistrationPage;
