"use client";

import { useActiveAccount, useReadContract, useSendTransaction } from "thirdweb/react";
import { getContract } from "thirdweb";
import { client, celoAlfajores } from "@/lib/thirdweb/client";
import { genkiFiCoreContract, cusdTokenContract, CONTRACT_STATUS, CONTRACT_ADDRESSES } from "@/lib/thirdweb/contracts";
import { formatAddress, formatCurrency } from "@/lib/utils/helpers";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useState, useEffect } from "react";
import { Users, TrendingUp, Calendar, Tag } from "lucide-react";

interface CircleContractProps {
  circleId?: string;
}

export function CircleContract({ circleId }: CircleContractProps) {
  const account = useActiveAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [circleInfo, setCircleInfo] = useState<any>(null);

  // Read circle information from contract
  const { data: circleData, isLoading: isLoadingCircle, error } = useReadContract({
    contract: genkiFiCoreContract,
    method: "getCircleInfo",
    params: [BigInt(circleId || "0")],
    queryOptions: {
      enabled: CONTRACT_STATUS.GENKIFI_CORE_DEPLOYED && !!circleId
    }
  });

  // Read cUSD token decimals
  const { data: cusdDecimals } = useReadContract({
    contract: cusdTokenContract,
    method: "decimals",
    queryOptions: {
      enabled: CONTRACT_STATUS.GENKIFI_CORE_DEPLOYED
    }
  });

  // Helper function to convert raw value to display value
  const getDisplayValue = (rawValue: bigint | number, decimals: number) => {
    const numValue = Number(rawValue);
    
    // Check if this is a legacy 6-decimal value (1,000,000 with 18 decimals)
    const isLegacyValue = numValue === 1000000 && decimals === 18;
    
    let result;
    if (isLegacyValue) {
      // For legacy values, use 6 decimals
      result = numValue / 1000000;
    } else {
      // For new values, use actual decimals
      result = numValue / Math.pow(10, decimals);
    }
    
    console.log("getDisplayValue:", { rawValue, numValue, decimals, isLegacyValue, result });
    return result;
  };

  // Update local state when contract data changes
  useEffect(() => {
    if (circleData) {
      console.log("Circle data received:", circleData);
      setCircleInfo(circleData);
    }
  }, [circleData]);

  // Show loading state
  if (isLoadingCircle) {
    return (
      <Card variant="glass" className="w-full">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <LoadingSpinner />
            <span className="ml-2 text-white/60">Loading circle data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show error state
  if (error || !circleData) {
    return (
      <Card variant="glass" className="w-full">
        <CardContent className="pt-6 text-center">
          <p className="text-red-400 mb-4">Error loading circle data</p>
          <p className="text-white/60 text-sm">
            {error instanceof Error ? error.message : "Circle not found"}
          </p>
        </CardContent>
      </Card>
    );
  }

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

  // Extract data from contract response
  const circle = circleData as any;
  
  console.log("Circle data from contract:", circle);
  console.log("cUSD decimals:", cusdDecimals);
  console.log("Raw totalValue:", circle.totalValue);
  console.log("Raw minInvestment:", circle.minInvestment);
  
  // Use cUSD decimals for proper conversion
  const totalValue = cusdDecimals ? getDisplayValue(circle.totalValue, Number(cusdDecimals)) : Number(circle.totalValue) / 1000000;
  const minInvestment = cusdDecimals ? getDisplayValue(circle.minInvestment, Number(cusdDecimals)) : Number(circle.minInvestment) / 1000000;
  const memberCount = circle.members?.length || 0;
  const availableSpots = 12 - memberCount;
  const createdDate = new Date(Number(circle.createdAt) * 1000).toLocaleDateString();
  
  console.log("Calculated totalValue:", totalValue);
  console.log("Calculated minInvestment:", minInvestment);

  return (
    <Card variant="glass" className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-white text-xl mb-2">{circle.name}</CardTitle>
            <div className="flex items-center gap-4 text-sm text-white/60">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{memberCount}/12 members</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Created {createdDate}</span>
              </div>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            circle.isActive 
              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
              : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}>
            {circle.isActive ? 'Active' : 'Inactive'}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Tags */}
        {circle.tags && circle.tags.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Tag className="w-4 h-4 text-white/60" />
              <span className="text-sm text-white/60">Tags</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {circle.tags.map((tag: string, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-genki-green/20 text-genki-green rounded-full text-xs border border-genki-green/30"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Circle Stats */}
        <div className="grid grid-cols-2 gap-6">
          <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
            <p className="text-2xl font-bold text-white mb-1">
              {formatCurrency(totalValue, "cUSD")}
            </p>
            <p className="text-sm text-white/60">Total Value</p>
          </div>
          <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
            <p className="text-2xl font-bold text-genki-green mb-1">
              {formatCurrency(minInvestment, "cUSD")}
            </p>
            <p className="text-sm text-white/60">Min Investment</p>
          </div>
        </div>

        {/* Member Info */}
        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-white">Members ({memberCount}/12)</h3>
            <span className="text-xs text-white/60">{availableSpots} spots available</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {circle.members?.slice(0, 6).map((member: string, index: number) => (
              <div
                key={index}
                className="px-2 py-1 bg-white/10 rounded text-xs text-white/80"
              >
                {formatAddress(member, 4)}
              </div>
            ))}
            {memberCount > 6 && (
              <div className="px-2 py-1 bg-white/10 rounded text-xs text-white/60">
                +{memberCount - 6} more
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button 
            onClick={handleDeposit}
            disabled={isLoading || !circle.isActive || availableSpots === 0}
            loading={isLoading}
            className="flex-1"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            {availableSpots === 0 ? "Circle Full" : "Join Circle"}
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

        {/* Circle ID */}
        <div className="text-center text-xs text-white/40">
          Circle ID: {circleId}
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
