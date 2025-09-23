"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useActiveAccount, useReadContract } from "thirdweb/react";
import { readContract, getContract } from "thirdweb";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { genkiFiCoreContract, CONTRACT_STATUS, CONTRACT_ADDRESSES, GENKIFI_CORE_ABI } from "@/lib/thirdweb/contracts";
import { formatCurrency, generateCircleColor } from "@/lib/utils/helpers";
import { useCircleData, CircleInfo } from "@/hooks/useCircleData";
import { defaultChain, client } from "@/lib/thirdweb/client";
import { Users, Search, Filter, X, ExternalLink, TrendingUp } from "lucide-react";

interface BrowseCirclesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoinCircle: (circleId: string) => void;
}


export function BrowseCirclesModal({ isOpen, onClose, onJoinCircle }: BrowseCirclesModalProps) {
  const account = useActiveAccount();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [minInvestmentFilter, setMinInvestmentFilter] = useState(0);
  const [loadingCircles, setLoadingCircles] = useState<boolean[]>([]);
  const [circles, setCircles] = useState<CircleInfo[]>([]);
  const [loadingProgress, setLoadingProgress] = useState({ current: 0, total: 0 });

  // Get total circles count
  const { data: totalCircles, isLoading: isLoadingTotal } = useReadContract({
    contract: genkiFiCoreContract,
    method: "getTotalCircles",
    params: [],
    queryOptions: {
      enabled: CONTRACT_STATUS.GENKIFI_CORE_DEPLOYED
    }
  });

  // Load all circles
  useEffect(() => {
    if (!totalCircles || totalCircles === 0n) {
      setCircles([]);
      return;
    }

    const loadCircles = async () => {
      const total = Number(totalCircles);
      console.log(`Starting to load ${total} circles...`);
      setLoadingCircles(new Array(total).fill(true));
      setLoadingProgress({ current: 0, total });
      const loadedCircles: CircleInfo[] = [];
      const errors: string[] = [];

      // Load circles sequentially to avoid RPC rate limits and ensure all are loaded
      for (let i = 1; i <= total; i++) {
        try {
          console.log(`Loading circle ${i}/${total}...`);
          setLoadingProgress({ current: i, total });
          const circle = await loadSingleCircle(i);
          if (circle) {
            loadedCircles.push(circle);
            console.log(`✅ Circle ${i} loaded:`, circle.name);
          } else {
            console.log(`❌ Circle ${i} returned null`);
            errors.push(`Circle ${i}: returned null`);
          }
        } catch (error) {
          console.error(`❌ Error loading circle ${i}:`, error);
          errors.push(`Circle ${i}: ${error}`);
        }
        
        // Small delay to avoid overwhelming the RPC
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      console.log(`✅ Loading complete! Loaded ${loadedCircles.length}/${total} circles`);
      console.log(`Errors encountered:`, errors);
      setCircles(loadedCircles);
      setLoadingProgress({ current: total, total });
    };

    loadCircles();
  }, [totalCircles]);

  // Function to load a single circle from the contract
  const loadSingleCircle = async (circleId: number): Promise<CircleInfo | null> => {
    try {
      console.log(`Loading circle ${circleId} from contract...`);
      
      // Create a fresh contract instance for this call
      const contract = getContract({
        client,
        chain: defaultChain,
        address: CONTRACT_ADDRESSES.GENKIFI_CORE,
        abi: GENKIFI_CORE_ABI,
      });

      // Call the contract to get circle info
      const circleData = await readContract({
        contract,
        method: "getCircleInfo",
        params: [BigInt(circleId)]
      });

      console.log(`Circle ${circleId} raw data:`, circleData);

      // Check if we got valid data
      if (!circleData) {
        console.log(`Circle ${circleId}: No data returned from contract`);
        return null;
      }

      // Transform contract data to our interface
      const transformedCircle: CircleInfo = {
        id: circleId.toString(),
        name: circleData.name || `Circle #${circleId}`,
        tags: circleData.tags || [],
        creator: circleData.creator || "0x0",
        members: circleData.members || [],
        totalValue: circleData.totalValue || 0n,
        minInvestment: circleData.minInvestment || 0n,
        createdAt: circleData.createdAt || 0n,
        isActive: circleData.isActive !== undefined ? circleData.isActive : true
      };

      console.log(`Circle ${circleId} transformed:`, {
        id: transformedCircle.id,
        name: transformedCircle.name,
        tags: transformedCircle.tags,
        membersCount: transformedCircle.members.length,
        totalValue: transformedCircle.totalValue.toString(),
        minInvestment: transformedCircle.minInvestment.toString(),
        isActive: transformedCircle.isActive
      });

      // Update loading state
      setLoadingCircles(prev => {
        const newLoading = [...prev];
        newLoading[circleId - 1] = false;
        return newLoading;
      });

      return transformedCircle;
    } catch (error: any) {
      console.error(`Error loading circle ${circleId}:`, error);
      
      // Update loading state even on error
      setLoadingCircles(prev => {
        const newLoading = [...prev];
        newLoading[circleId - 1] = false;
        return newLoading;
      });
      
      // Return null for failed loads
      return null;
    }
  };

  // Get all unique tags from circles
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    circles.forEach(circle => {
      circle.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [circles]);

  // Filter circles based on search and filters
  const filteredCircles = useMemo(() => {
    return circles.filter(circle => {
      // Search filter
      if (searchTerm && !circle.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Tags filter
      if (selectedTags.length > 0 && !selectedTags.some(tag => circle.tags.includes(tag))) {
        return false;
      }

      // Min investment filter
      if (Number(circle.minInvestment) / 1000000 < minInvestmentFilter) {
        return false;
      }

      // Only show active circles
      return circle.isActive;
    });
  }, [circles, searchTerm, selectedTags, minInvestmentFilter]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedTags([]);
    setMinInvestmentFilter(0);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Browse Circles">
      <div className="space-y-6">
        {/* Search and Filters */}
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
            <input
              type="text"
              placeholder="Search circles by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-genki-green"
            />
          </div>

          {/* Filters */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-white/60" />
              <span className="text-white/60 text-sm">Filters</span>
              {(searchTerm || selectedTags.length > 0 || minInvestmentFilter > 0) && (
                <Button
                  onClick={handleClearFilters}
                  variant="ghost"
                  size="sm"
                  className="text-white/60 hover:text-white"
                >
                  <X className="w-3 h-3 mr-1" />
                  Clear
                </Button>
              )}
            </div>

            {/* Tags Filter */}
            {allTags.length > 0 && (
              <div>
                <label className="text-white/60 text-xs mb-2 block">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => handleTagToggle(tag)}
                      className={`px-3 py-1 rounded-full text-xs transition-colors ${
                        selectedTags.includes(tag)
                          ? "bg-genki-green text-white"
                          : "bg-white/10 text-white/60 hover:bg-white/20"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Min Investment Filter */}
            <div>
              <label className="text-white/60 text-xs mb-2 block">
                Min Investment: {formatCurrency(minInvestmentFilter)}
              </label>
              <input
                type="range"
                min="0"
                max="1000"
                step="10"
                value={minInvestmentFilter}
                onChange={(e) => setMinInvestmentFilter(Number(e.target.value))}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <div className="text-white/60 text-sm">
            {isLoadingTotal ? (
              "Loading circles..."
            ) : loadingProgress.total > 0 && loadingProgress.current < loadingProgress.total ? (
              <div className="space-y-1">
                <div>Loading circles... {loadingProgress.current}/{loadingProgress.total}</div>
                <div className="w-32 h-2 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-genki-green transition-all duration-300"
                    style={{ width: `${(loadingProgress.current / loadingProgress.total) * 100}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <div>{`${filteredCircles.length} of ${circles.length} circles`}</div>
                {circles.length > 0 && (
                  <div className="text-xs text-white/40">
                    Total expected: {Number(totalCircles || 0)} circles
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Debug button - remove in production */}
          <Button
            onClick={() => {
              console.log("=== BROWSE CIRCLES DEBUG ===");
              console.log("Total circles:", totalCircles);
              console.log("Circles loaded:", circles);
              console.log("Filtered circles:", filteredCircles);
              console.log("Loading states:", loadingCircles);
              console.log("Search term:", searchTerm);
              console.log("Selected tags:", selectedTags);
              console.log("Min investment filter:", minInvestmentFilter);
            }}
            variant="ghost"
            size="sm"
            className="text-white/40 hover:text-white"
          >
            Debug
          </Button>
        </div>

        {/* Circles List */}
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {isLoadingTotal ? (
            // Loading skeleton
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} variant="glass" className="p-4">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-white/20 rounded w-3/4"></div>
                  <div className="h-3 bg-white/20 rounded w-1/2"></div>
                  <div className="h-8 bg-white/20 rounded"></div>
                </div>
              </Card>
            ))
          ) : filteredCircles.length === 0 ? (
            // Empty state
            <Card variant="glass" className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white/40" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No Circles Found</h3>
              <p className="text-white/60 text-sm mb-4">
                {searchTerm || selectedTags.length > 0 || minInvestmentFilter > 0
                  ? "Try adjusting your filters to see more circles."
                  : "No circles are available at the moment."}
              </p>
              {(searchTerm || selectedTags.length > 0 || minInvestmentFilter > 0) && (
                <Button onClick={handleClearFilters} variant="outline" size="sm">
                  Clear Filters
                </Button>
              )}
            </Card>
          ) : (
            // Circles list
            filteredCircles.map((circle) => (
              <CircleCard
                key={circle.id}
                circle={circle}
                onJoin={() => onJoinCircle(circle.id)}
                isUserMember={account?.address ? circle.members.includes(account.address) : false}
              />
            ))
          )}
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-4 border-t border-white/20">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// Individual Circle Card Component
function CircleCard({ 
  circle, 
  onJoin, 
  isUserMember 
}: { 
  circle: CircleInfo; 
  onJoin: () => void; 
  isUserMember: boolean;
}) {
  const availableSpots = 12 - circle.members.length;
  const isFull = availableSpots === 0;

  return (
    <Card variant="glass" hover className="group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl ${generateCircleColor()} flex items-center justify-center shadow-lg`}>
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg text-white group-hover:text-genki-green transition-colors">
                {circle.name}
              </CardTitle>
              <p className="text-white/60 text-sm">
                {circle.members.length}/12 members • {circle.isActive ? "active" : "inactive"}
              </p>
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Tags */}
        {circle.tags && circle.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {circle.tags.slice(0, 3).map((tag: string, index: number) => (
              <span
                key={index}
                className="px-2 py-1 bg-genki-green/20 text-genki-green rounded-full text-xs border border-genki-green/30"
              >
                {tag}
              </span>
            ))}
            {circle.tags.length > 3 && (
              <span className="px-2 py-1 bg-white/10 text-white/60 rounded-full text-xs">
                +{circle.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Circle Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-lg font-bold text-white">
              {formatCurrency(Number(circle.totalValue) / 1000000)}
            </div>
            <div className="text-xs text-white/60">Total Value</div>
          </div>
          <div>
            <div className="text-lg font-bold text-genki-green">
              {formatCurrency(Number(circle.minInvestment) / 1000000)}
            </div>
            <div className="text-xs text-white/60">Min Investment</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button 
            size="sm" 
            className="flex-1"
            onClick={onJoin}
            disabled={isUserMember || isFull}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            {isUserMember ? "Already Member" : isFull ? "Full" : "Join Circle"}
          </Button>
        </div>

        {/* Created Date */}
        <div className="text-xs text-white/50">
          Created {new Date(Number(circle.createdAt) * 1000).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );
}
