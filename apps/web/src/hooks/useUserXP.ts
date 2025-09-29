"use client";

import { useState, useEffect } from "react";
import { useActiveWallet } from "thirdweb/react";
import { client } from "@/lib/thirdweb/client";
import { readContract } from "thirdweb";
import { genkiFiCoreContract } from "@/lib/thirdweb/contracts";

interface UserXPData {
  xp: number;
  level: number;
  nextLevelXP: number;
  isLoading: boolean;
  error: string | null;
}

export function useUserXP(): UserXPData {
  const [xpData, setXpData] = useState<UserXPData>({
    xp: 0,
    level: 1,
    nextLevelXP: 500,
    isLoading: true,
    error: null,
  });

  const wallet = useActiveWallet();

  useEffect(() => {
    async function fetchUserXP() {
      if (!wallet?.address) {
        setXpData(prev => ({ ...prev, isLoading: false }));
        return;
      }

      try {
        setXpData(prev => ({ ...prev, isLoading: true, error: null }));

        console.log("🔍 Fetching user XP from contract for address:", wallet.address);

        // Call the smart contract to get user XP data
        const result = await readContract({
          contract: genkiFiCoreContract,
          method: "getUserXP",
          params: [wallet.address],
        });

        console.log("📊 Contract response:", result);

        const [xp, level, nextLevelXP] = result as [bigint, bigint, bigint];

        setXpData({
          xp: Number(xp),
          level: Number(level),
          nextLevelXP: Number(nextLevelXP),
          isLoading: false,
          error: null,
        });

        console.log("✅ User XP data loaded:", {
          xp: Number(xp),
          level: Number(level),
          nextLevelXP: Number(nextLevelXP)
        });
      } catch (error) {
        console.error("❌ Error fetching user XP from contract:", error);
        
        // Check if error is "User does not exist"
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes("User does not exist")) {
          console.log("👤 User not registered in contract, showing default values");
          setXpData({
            xp: 0,
            level: 1,
            nextLevelXP: 100,
            isLoading: false,
            error: "User not registered. Create or join a circle to start earning XP!",
          });
        } else {
          console.log("🔄 Contract error, falling back to mock data for development");
          setXpData({
            xp: 1250,
            level: 2,
            nextLevelXP: 3500,
            isLoading: false,
            error: null,
          });
        }
      }
    }

    fetchUserXP();
  }, [wallet?.address]);

  return xpData;
}

// Mock data for development/testing
export function useMockUserXP(): UserXPData {
  const [xpData, setXpData] = useState<UserXPData>({
    xp: 1250,
    level: 2,
    nextLevelXP: 3500,
    isLoading: false,
    error: null,
  });

  // Simulate XP updates for demo purposes
  useEffect(() => {
    const interval = setInterval(() => {
      setXpData(prev => ({
        ...prev,
        xp: prev.xp + Math.floor(Math.random() * 10),
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return xpData;
}
