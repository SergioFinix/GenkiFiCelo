"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CircleContract } from "@/components/web3/CircleContract";
import { CreateCircleModal } from "@/components/modals/CreateCircleModal";
import { JoinCircleModal } from "@/components/modals/JoinCircleModal";
import { formatCurrency, generateCircleColor } from "@/lib/utils/helpers";
import { Plus, Users, TrendingUp, Settings, ExternalLink } from "lucide-react";
import { useState } from "react";
import { useActiveAccount, useReadContract } from "thirdweb/react";
import { genkiFiCoreContract, CONTRACT_STATUS } from "@/lib/thirdweb/contracts";

export function MyCircles() {
  const [selectedCircle, setSelectedCircle] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCircleId, setJoinCircleId] = useState<string>("");

  const account = useActiveAccount();

  // Get user's circles from the smart contract (only if contract is deployed)
  const { data: userCircles, isLoading: isLoadingCircles } = useReadContract({
    contract: genkiFiCoreContract,
    method: "function getUserCircles(address _user) view returns (uint256[])",
    params: [account?.address || "0x0"],
    queryOptions: {
      enabled: CONTRACT_STATUS.GENKIFI_CORE_DEPLOYED && !!account?.address
    }
  });

  const handleCreateCircle = () => {
    setShowCreateModal(true);
  };

  const handleJoinCircle = (circleId?: string) => {
    if (circleId) {
      setJoinCircleId(circleId);
      setShowJoinModal(true);
    } else {
      // Open a general join modal or circle browser
      console.log("Open circle browser...");
    }
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
          <Button onClick={() => handleJoinCircle()} variant="outline" size="sm">
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
            userCircles.map((circleId: bigint) => (
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

  // Get circle information
  const { data: circleData, isLoading: isLoadingInfo } = useReadContract({
    contract: genkiFiCoreContract,
    method: "function getCircleInfo(uint256 _circleId) view returns (tuple)",
    params: [BigInt(circleId)]
  });

  React.useEffect(() => {
    if (circleData) {
      setCircleInfo(circleData);
      setIsLoading(false);
    }
  }, [circleData]);

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

  if (!circleInfo) return null;

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
                {circleInfo.name}
              </CardTitle>
              <p className="text-white/60 text-sm">
                {circleInfo.members.length}/12 members • {circleInfo.isActive ? "active" : "inactive"}
              </p>
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Tags */}
        {circleInfo.tags && circleInfo.tags.length > 0 && (
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
              {formatCurrency(circleInfo.totalValue / 1000000)}
            </div>
            <div className="text-xs text-white/60">Total Value</div>
          </div>
          <div>
            <div className="text-lg font-bold text-genki-green">
              {formatCurrency(circleInfo.minInvestment / 1000000)}
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
          Created {new Date(Number(circleInfo.createdAt) * 1000).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );
}
