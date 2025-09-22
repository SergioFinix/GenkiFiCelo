"use client";

import { useActiveAccount, useReadContract, useSendTransaction } from "thirdweb/react";
import { getContract } from "thirdweb";
import { client, celoAlfajores } from "@/lib/thirdweb/client";
import { genkiFiCoreContract, CONTRACT_ADDRESSES } from "@/lib/thirdweb/contracts";
import { formatAddress, formatCurrency } from "@/lib/utils/helpers";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useState } from "react";

interface CircleContractProps {
  circleId?: string;
}

export function CircleContract({ circleId }: CircleContractProps) {
  const account = useActiveAccount();
  const [isLoading, setIsLoading] = useState(false);

  // Mock data - replace with actual contract calls
  const circleData = {
    id: circleId || "1",
    name: "Friends Circle #1",
    members: 8,
    totalDeposits: 1250.50,
    currentYield: 4.2,
    status: "active" as const,
  };

  const handleDeposit = async () => {
    if (!account) return;
    
    setIsLoading(true);
    try {
      // Implement deposit logic here
      console.log("Depositing to circle...");
      // await sendTransaction(...)
    } catch (error) {
      console.error("Deposit failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!account) return;
    
    setIsLoading(true);
    try {
      // Implement withdraw logic here
      console.log("Withdrawing from circle...");
      // await sendTransaction(...)
    } catch (error) {
      console.error("Withdraw failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!account) {
    return (
      <Card variant="glass" className="text-center">
        <CardContent className="pt-6">
          <p className="text-white/60 mb-4">Connect your wallet to interact with circles</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="glass" className="w-full">
      <CardHeader>
        <CardTitle className="text-white">{circleData.name}</CardTitle>
        <p className="text-white/60">
          {circleData.members} members • {circleData.status}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">
              {formatCurrency(circleData.totalDeposits)}
            </p>
            <p className="text-sm text-white/60">Total Deposits</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-genki-green">
              {circleData.currentYield}%
            </p>
            <p className="text-sm text-white/60">Current Yield</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={handleDeposit}
            disabled={isLoading}
            loading={isLoading}
            className="flex-1"
          >
            Deposit cUSD
          </Button>
          <Button 
            onClick={handleWithdraw}
            disabled={isLoading}
            loading={isLoading}
            variant="outline"
            className="flex-1"
          >
            Withdraw
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Hook for circle data
export function useCircleData(circleId: string) {
  const account = useActiveAccount();
  
  // Mock implementation - replace with actual contract calls
  const mockData = {
    isLoading: false,
    error: null,
    data: {
      id: circleId,
      name: `Friends Circle #${circleId}`,
      members: 8,
      totalDeposits: 1250.50,
      currentYield: 4.2,
      status: "active" as const,
      userDeposit: 150.25,
      userXP: 450,
      userLevel: 2,
    }
  };

  return mockData;
}

// Hook for user stats
export function useUserStats() {
  const account = useActiveAccount();
  
  // Mock implementation - replace with actual contract calls
  const mockData = {
    isLoading: false,
    error: null,
    data: {
      totalXP: 1250,
      level: 3,
      levelName: "Investor",
      levelProgress: 0.65,
      totalDeposits: 500.75,
      totalYield: 25.50,
      circlesJoined: 2,
      achievements: 5,
    }
  };

  return mockData;
}
