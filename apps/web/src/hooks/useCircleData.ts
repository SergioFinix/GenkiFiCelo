"use client";

import { useState, useEffect } from "react";
import { useReadContract } from "thirdweb/react";
import { genkiFiCoreContract, CONTRACT_STATUS } from "@/lib/thirdweb/contracts";

export interface CircleInfo {
  id: string;
  name: string;
  tags: string[];
  creator: string;
  members: string[];
  totalValue: bigint;
  minInvestment: bigint;
  createdAt: bigint;
  isActive: boolean;
}

export function useCircleData(circleId: number) {
  const [circleInfo, setCircleInfo] = useState<CircleInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { data: circleData, isLoading: isLoadingContract, error: contractError } = useReadContract({
    contract: genkiFiCoreContract,
    method: "getCircleInfo",
    params: [BigInt(circleId)],
    queryOptions: {
      enabled: CONTRACT_STATUS.GENKIFI_CORE_DEPLOYED && circleId > 0
    }
  });

  useEffect(() => {
    if (isLoadingContract) {
      setIsLoading(true);
      setError(null);
      return;
    }

    if (contractError) {
      setError(`Failed to load circle ${circleId}: ${contractError.message}`);
      setIsLoading(false);
      return;
    }

    if (circleData) {
      try {
        // Transform the contract data to our interface
        const transformedData: CircleInfo = {
          id: circleId.toString(),
          name: circleData.name || `Circle #${circleId}`,
          tags: [...(circleData.tags || [])],
          creator: circleData.creator || "0x0",
          members: [...(circleData.members || [])],
          totalValue: circleData.totalValue || 0n,
          minInvestment: circleData.minInvestment || 0n,
          createdAt: circleData.createdAt || 0n,
          isActive: circleData.isActive !== undefined ? circleData.isActive : true
        };

        setCircleInfo(transformedData);
        setError(null);
      } catch (transformError) {
        setError(`Error processing circle data: ${transformError}`);
      }
    }

    setIsLoading(false);
  }, [circleData, isLoadingContract, contractError, circleId]);

  return {
    circleInfo,
    isLoading,
    error
  };
}

// Hook to load multiple circles
export function useMultipleCircles(circleIds: number[]) {
  const [circles, setCircles] = useState<CircleInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (circleIds.length === 0) {
      setCircles([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrors([]);

    const loadCircles = async () => {
      const loadedCircles: CircleInfo[] = [];
      const loadErrors: string[] = [];

      // Load circles in parallel (but limit concurrent requests)
      const batchSize = 5;
      for (let i = 0; i < circleIds.length; i += batchSize) {
        const batch = circleIds.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (circleId) => {
          try {
            // This would need to be implemented with direct contract calls
            // For now, we'll return a placeholder
            return {
              id: circleId.toString(),
              name: `Circle #${circleId}`,
              tags: [],
              creator: "0x0",
              members: [],
              totalValue: 0n,
              minInvestment: 0n,
              createdAt: 0n,
              isActive: true
            } as CircleInfo;
          } catch (error) {
            loadErrors.push(`Circle ${circleId}: ${error}`);
            return null;
          }
        });

        const batchResults = await Promise.all(batchPromises);
        loadedCircles.push(...batchResults.filter(circle => circle !== null) as CircleInfo[]);
      }

      setCircles(loadedCircles);
      setErrors(loadErrors);
      setIsLoading(false);
    };

    loadCircles();
  }, [circleIds]);

  return {
    circles,
    isLoading,
    errors
  };
}
