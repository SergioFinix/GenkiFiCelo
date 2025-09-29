"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CircleContract } from "@/components/web3/CircleContract";
import { CreateCircleModal } from "@/components/modals/CreateCircleModal";
import { JoinCircleModal } from "@/components/modals/JoinCircleModal";
import { BrowseCirclesModal } from "@/components/modals/BrowseCirclesModal";
import { formatCurrency, generateCircleColor } from "@/lib/utils/helpers";
import { Plus, Users, TrendingUp, Settings, ExternalLink } from "lucide-react";
import React, { useState } from "react";
import { useActiveAccount, useReadContract } from "thirdweb/react";
import { readContract, getContract } from "thirdweb";
import { genkiFiCoreContract, cusdTokenContract, CONTRACT_STATUS, CONTRACT_ADDRESSES, GENKIFI_CORE_ABI } from "@/lib/thirdweb/contracts";
import { defaultChain, client } from "@/lib/thirdweb/client";

export function MyCircles() {
  const [selectedCircle, setSelectedCircle] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showBrowseModal, setShowBrowseModal] = useState(false);
  const [joinCircleId, setJoinCircleId] = useState<string>("");

  const account = useActiveAccount();

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

  // Get user's circles from the smart contract (only if contract is deployed)
  const { data: userCircles, isLoading: isLoadingCircles, error: userCirclesError } = useReadContract({
    contract: genkiFiCoreContract,
    method: "getUserCircles",
    params: [account?.address || "0x0"],
    queryOptions: {
      enabled: CONTRACT_STATUS.GENKIFI_CORE_DEPLOYED && !!account?.address
    }
  });

  // Debug logging
  React.useEffect(() => {
    console.log("User circles data:", userCircles);
    console.log("Is loading circles:", isLoadingCircles);
    console.log("User circles error:", userCirclesError);
    console.log("Account address:", account?.address);
    console.log("Contract deployed:", CONTRACT_STATUS.GENKIFI_CORE_DEPLOYED);
  }, [userCircles, isLoadingCircles, userCirclesError, account?.address]);

  const handleCreateCircle = () => {
    setShowCreateModal(true);
  };

  const handleJoinCircle = (circleId?: string) => {
    if (circleId) {
      setJoinCircleId(circleId);
      setShowJoinModal(true);
    } else {
      // Open circle browser
      setShowBrowseModal(true);
    }
  };

  const handleBrowseCircles = () => {
    setShowBrowseModal(true);
  };

  const handleCreateSuccess = (circleId: string) => {
    console.log("Circle created successfully:", circleId);
    setShowCreateModal(false);
    // Refresh user circles or show success message
  };

  const handleJoinSuccess = () => {
    console.log("Successfully joined circle");
    setShowJoinModal(false);
    // Refresh user circles or show success message
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">My Circles</h2>
          <p className="text-white/60">Manage your investment circles</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleBrowseCircles} variant="outline" size="sm">
            Browse Circles
          </Button>
          <Button onClick={handleCreateCircle} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Create Circle
          </Button>
        </div>
      </div>


      {/* Contract Not Deployed State */}
      {!CONTRACT_STATUS.GENKIFI_CORE_DEPLOYED && (
        <div className="text-center py-8">
          <Card variant="glass" className="max-w-md mx-auto">
            <CardContent className="py-8">
              <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-4">
                <Settings className="w-8 h-8 text-yellow-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Contract Not Deployed</h3>
              <p className="text-white/60 text-sm mb-4">
                The GenkiFiCore smart contract has not been deployed yet. Please deploy the contract first to use circle features.
              </p>
              <div className="text-xs text-white/40">
                Contract Address: {CONTRACT_ADDRESSES.GENKIFI_CORE}
              </div>
            </CardContent>
          </Card>
                </div>
      )}

      {/* Error State */}
      {CONTRACT_STATUS.GENKIFI_CORE_DEPLOYED && userCirclesError && (
        <div className="text-center py-8">
          <Card variant="glass" className="max-w-md mx-auto">
            <CardContent className="py-8">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                <Settings className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Error Loading Circles</h3>
              <p className="text-white/60 text-sm mb-4">
                {userCirclesError.message || "Failed to load your circles from the smart contract."}
              </p>
              <div className="text-xs text-white/40">
                Make sure your wallet is connected and try again.
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Loading State */}
      {CONTRACT_STATUS.GENKIFI_CORE_DEPLOYED && isLoadingCircles && (
        <div className="text-center py-8">
          <div className="text-white/60">Loading your circles...</div>
      </div>
      )}

      {/* Circles Grid */}
      {!isLoadingCircles && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {userCircles && userCircles.length > 0 ? (
                userCircles.map((circleId: any) => (
              <CircleCard 
                key={circleId.toString()} 
                circleId={circleId.toString()} 
                onJoin={handleJoinCircle}
                onSelect={setSelectedCircle}
              />
            ))
          ) : (
            <div className="col-span-full">
        <Card variant="glass" className="text-center py-12">
          <CardContent>
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-white/40" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Circles Yet</h3>
            <p className="text-white/60 mb-6">
              Create your first investment circle or join an existing one to start earning together.
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={handleCreateCircle}>
                <Plus className="w-4 h-4 mr-2" />
                Create Circle
              </Button>
                    <Button onClick={() => handleJoinCircle()} variant="outline">
                      Browse Circles
              </Button>
            </div>
          </CardContent>
        </Card>
            </div>
          )}
        </div>
      )}

      {/* Circle Detail Modal */}
      {selectedCircle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <Card variant="glass" className="relative">
              <Button
                onClick={() => setSelectedCircle(null)}
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 z-10"
              >
                ×
              </Button>
              <CircleContract circleId={selectedCircle} />
            </Card>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateCircleModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />

          <JoinCircleModal
            isOpen={showJoinModal}
            onClose={() => setShowJoinModal(false)}
            circleId={joinCircleId}
            onSuccess={handleJoinSuccess}
          />

          <BrowseCirclesModal
            isOpen={showBrowseModal}
            onClose={() => setShowBrowseModal(false)}
            onJoinCircle={(circleId) => {
              setJoinCircleId(circleId);
              setShowBrowseModal(false);
              setShowJoinModal(true);
            }}
          />
        </div>
      );
    }

// Circle Card Component
function CircleCard({ 
  circleId, 
  onJoin, 
  onSelect 
}: { 
  circleId: string; 
  onJoin: (id: string) => void; 
  onSelect: (id: string) => void; 
}) {
  const [circleInfo, setCircleInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  // Get circle information
  const { data: circleData, isLoading: isLoadingInfo, error } = useReadContract({
    contract: genkiFiCoreContract,
    method: "getCircleInfo",
    params: [BigInt(circleId)],
    queryOptions: {
      enabled: CONTRACT_STATUS.GENKIFI_CORE_DEPLOYED && !!circleId
    }
  });

  React.useEffect(() => {
    if (circleData) {
      console.log("Circle data received:", circleData);
      setCircleInfo(circleData);
      setIsLoading(false);
    }
  }, [circleData]);

  React.useEffect(() => {
    if (error) {
      console.error("Error loading circle info for circleId:", circleId, error);
      setIsLoading(false);
    }
  }, [error, circleId]);

  if (isLoading || isLoadingInfo) {
    return (
      <Card variant="glass" className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-white/20 rounded w-3/4"></div>
          <div className="h-3 bg-white/20 rounded w-1/2"></div>
          <div className="h-8 bg-white/20 rounded"></div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card variant="glass" className="p-6">
        <div className="text-center text-red-400">
          Error loading circle {circleId}
          <div className="text-xs text-white/60 mt-1">
            {error.message}
          </div>
        </div>
      </Card>
    );
  }

  if (!circleInfo) {
    return (
      <Card variant="glass" className="p-6">
        <div className="text-center text-white/60">
          Circle {circleId} not found
        </div>
      </Card>
    );
  }

  return (
    <Card
      variant="glass"
      hover
      className="cursor-pointer group"
      onClick={() => onSelect(circleId)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl ${generateCircleColor()} flex items-center justify-center shadow-lg`}>
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg text-white group-hover:text-genki-green transition-colors">
                {circleInfo?.name || "Loading..."}
              </CardTitle>
              <p className="text-white/60 text-sm">
                {circleInfo?.members?.length || 0}/12 members • {circleInfo?.isActive ? "active" : "inactive"}
              </p>
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Tags */}
        {circleInfo?.tags && circleInfo.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {circleInfo.tags.slice(0, 3).map((tag: string, index: number) => (
              <span
                key={index}
                className="px-2 py-1 bg-genki-green/20 text-genki-green rounded-full text-xs border border-genki-green/30"
              >
                {tag}
              </span>
            ))}
            {circleInfo.tags.length > 3 && (
              <span className="px-2 py-1 bg-white/10 text-white/60 rounded-full text-xs">
                +{circleInfo.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Circle Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-lg font-bold text-white">
              {cusdDecimals ? formatCurrency(getDisplayValue(circleInfo?.totalValue || 0, Number(cusdDecimals)), "cUSD") : "Loading..."}
            </div>
            <div className="text-xs text-white/60">Total Value</div>
          </div>
          <div>
            <div className="text-lg font-bold text-genki-green">
              {cusdDecimals ? formatCurrency(getDisplayValue(circleInfo?.minInvestment || 0, Number(cusdDecimals)), "cUSD") : "Loading..."}
            </div>
            <div className="text-xs text-white/60">Min Investment</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button size="sm" className="flex-1">
            <TrendingUp className="w-4 h-4 mr-2" />
            View Details
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onJoin(circleId);
            }}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        {/* Created Date */}
        <div className="text-xs text-white/50">
          Created {circleInfo?.createdAt ? new Date(Number(circleInfo.createdAt) * 1000).toLocaleDateString() : "Unknown"}
        </div>
      </CardContent>
    </Card>
  );
}
