"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useActiveAccount, useReadContract } from "thirdweb/react";
import { readContract, getContract } from "thirdweb";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { genkiFiCoreContract, cusdTokenContract, CONTRACT_STATUS, CONTRACT_ADDRESSES, GENKIFI_CORE_ABI } from "@/lib/thirdweb/contracts";
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
  const [maxInvestmentFilter, setMaxInvestmentFilter] = useState(1000);
  const [memberCountFilter, setMemberCountFilter] = useState({ min: 0, max: 12 });
  const [dateFilter, setDateFilter] = useState({ start: "", end: "" });
  const [sortBy, setSortBy] = useState<"name" | "createdAt" | "totalValue" | "members">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [loadingCircles, setLoadingCircles] = useState<boolean[]>([]);
  const [circles, setCircles] = useState<CircleInfo[]>([]);
  const [loadingProgress, setLoadingProgress] = useState({ current: 0, total: 0 });
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

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

  // Get total circles count
  const { data: totalCircles, isLoading: isLoadingTotal } = useReadContract({
    contract: genkiFiCoreContract,
    method: "getTotalCircles",
    params: [],
    queryOptions: {
      enabled: CONTRACT_STATUS.GENKIFI_CORE_DEPLOYED
    }
  });

  // Load all circles with improved performance
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
      setLoadingError(null);
      const loadedCircles: CircleInfo[] = [];
      const errors: string[] = [];

      try {
        // Load circles in batches for better performance
        const BATCH_SIZE = 5;
        const batches = Math.ceil(total / BATCH_SIZE);
        
        for (let batch = 0; batch < batches; batch++) {
          const startIndex = batch * BATCH_SIZE + 1;
          const endIndex = Math.min(startIndex + BATCH_SIZE - 1, total);
          
          console.log(`Loading batch ${batch + 1}/${batches} (circles ${startIndex}-${endIndex})...`);
          
          // Load circles in parallel within each batch
          const batchPromises = [];
          for (let i = startIndex; i <= endIndex; i++) {
            batchPromises.push(loadSingleCircle(i));
          }
          
          try {
            const batchResults = await Promise.allSettled(batchPromises);
            
            batchResults.forEach((result, index) => {
              const circleIndex = startIndex + index;
              setLoadingProgress({ current: circleIndex, total });
              
              if (result.status === 'fulfilled' && result.value) {
                loadedCircles.push(result.value);
                console.log(`✅ Circle ${circleIndex} loaded:`, result.value.name);
              } else {
                console.log(`❌ Circle ${circleIndex} failed:`, result.status === 'rejected' ? result.reason : 'returned null');
                errors.push(`Circle ${circleIndex}: ${result.status === 'rejected' ? result.reason : 'returned null'}`);
              }
            });
            
          } catch (error) {
            console.error(`❌ Error loading batch ${batch + 1}:`, error);
            errors.push(`Batch ${batch + 1}: ${error}`);
          }
          
          // Small delay between batches to avoid overwhelming the RPC
          if (batch < batches - 1) {
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        }

        console.log(`✅ Loading complete! Loaded ${loadedCircles.length}/${total} circles`);
        console.log(`Errors encountered:`, errors);
        setCircles(loadedCircles);
        setLoadingProgress({ current: total, total });
        
        // Set error if too many circles failed to load
        if (errors.length > total * 0.5) {
          setLoadingError(`Failed to load ${errors.length} out of ${total} circles. Please try again.`);
        }
        
      } catch (error) {
        console.error('❌ Critical error loading circles:', error);
        setLoadingError(`Failed to load circles: ${error}`);
        setLoadingProgress({ current: 0, total: 0 });
      }
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
        tags: [...(circleData.tags || [])],
        creator: circleData.creator || "0x0",
        members: [...(circleData.members || [])],
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

  // Filter and sort circles based on search and filters
  const filteredAndSortedCircles = useMemo(() => {
    let filtered = circles.filter(circle => {
      // Search filter
      if (searchTerm && !circle.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Tags filter
      if (selectedTags.length > 0 && !selectedTags.some(tag => circle.tags.includes(tag))) {
        return false;
      }

      // Investment range filter - use correct decimal calculation
      const minInvestment = cusdDecimals ? getDisplayValue(circle.minInvestment, Number(cusdDecimals)) : Number(circle.minInvestment) / 1000000;
      const totalValue = cusdDecimals ? getDisplayValue(circle.totalValue, Number(cusdDecimals)) : Number(circle.totalValue) / 1000000;
      
      if (minInvestment < minInvestmentFilter || minInvestment > maxInvestmentFilter) {
        return false;
      }

      // Member count filter
      const memberCount = circle.members.length;
      if (memberCount < memberCountFilter.min || memberCount > memberCountFilter.max) {
        return false;
      }

      // Date filter
      if (dateFilter.start || dateFilter.end) {
        const circleDate = new Date(Number(circle.createdAt) * 1000);
        const startDate = dateFilter.start ? new Date(dateFilter.start) : null;
        const endDate = dateFilter.end ? new Date(dateFilter.end) : null;
        
        if (startDate && circleDate < startDate) return false;
        if (endDate && circleDate > endDate) return false;
      }

      // Only show active circles
      return circle.isActive;
    });

    // Sort circles
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "createdAt":
          aValue = Number(a.createdAt);
          bValue = Number(b.createdAt);
          break;
        case "totalValue":
          aValue = Number(a.totalValue);
          bValue = Number(b.totalValue);
          break;
        case "members":
          aValue = a.members.length;
          bValue = b.members.length;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [circles, searchTerm, selectedTags, minInvestmentFilter, maxInvestmentFilter, memberCountFilter, dateFilter, sortBy, sortOrder, cusdDecimals]);

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
    setMaxInvestmentFilter(1000);
    setMemberCountFilter({ min: 0, max: 12 });
    setDateFilter({ start: "", end: "" });
    setSortBy("createdAt");
    setSortOrder("desc");
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setLoadingError(null);
    // Trigger reload by updating a dependency
    if (totalCircles) {
      setCircles([]);
      setLoadingProgress({ current: 0, total: 0 });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Browse Circles" size="xl">
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
              {(searchTerm || selectedTags.length > 0 || minInvestmentFilter > 0 || maxInvestmentFilter < 1000 || memberCountFilter.min > 0 || memberCountFilter.max < 12 || dateFilter.start || dateFilter.end) && (
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

            {/* Investment Range Filter */}
            <div className="space-y-3">
              <label className="text-white/60 text-xs block">Investment Range</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-white/40 text-xs mb-1 block">Min: {formatCurrency(minInvestmentFilter)}</label>
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
                <div>
                  <label className="text-white/40 text-xs mb-1 block">Max: {formatCurrency(maxInvestmentFilter)}</label>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    step="10"
                    value={maxInvestmentFilter}
                    onChange={(e) => setMaxInvestmentFilter(Number(e.target.value))}
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
              </div>
            </div>

            {/* Member Count Filter */}
            <div className="space-y-3">
              <label className="text-white/60 text-xs block">Member Count</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-white/40 text-xs mb-1 block">Min: {memberCountFilter.min}</label>
                  <input
                    type="range"
                    min="0"
                    max="12"
                    step="1"
                    value={memberCountFilter.min}
                    onChange={(e) => setMemberCountFilter(prev => ({ ...prev, min: Number(e.target.value) }))}
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
                <div>
                  <label className="text-white/40 text-xs mb-1 block">Max: {memberCountFilter.max}</label>
                  <input
                    type="range"
                    min="0"
                    max="12"
                    step="1"
                    value={memberCountFilter.max}
                    onChange={(e) => setMemberCountFilter(prev => ({ ...prev, max: Number(e.target.value) }))}
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
              </div>
            </div>

            {/* Date Filter */}
            <div className="space-y-3">
              <label className="text-white/60 text-xs block">Created Date</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-white/40 text-xs mb-1 block">From</label>
                  <input
                    type="date"
                    value={dateFilter.start}
                    onChange={(e) => setDateFilter(prev => ({ ...prev, start: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-genki-green"
                  />
                </div>
                <div>
                  <label className="text-white/40 text-xs mb-1 block">To</label>
                  <input
                    type="date"
                    value={dateFilter.end}
                    onChange={(e) => setDateFilter(prev => ({ ...prev, end: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-genki-green"
                  />
                </div>
              </div>
            </div>

            {/* Sort Options */}
            <div className="space-y-3">
              <label className="text-white/60 text-xs block">Sort By</label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-genki-green"
                >
                  <option value="createdAt">Date Created</option>
                  <option value="name">Name</option>
                  <option value="totalValue">Total Value</option>
                  <option value="members">Members</option>
                </select>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as any)}
                  className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-genki-green"
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Error State */}
        {loadingError && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-red-400 text-xs">!</span>
              </div>
              <div className="flex-1">
                <h3 className="text-red-400 font-medium mb-1">Loading Error</h3>
                <p className="text-red-300 text-sm mb-3">{loadingError}</p>
                <div className="flex gap-2">
                  <Button onClick={handleRetry} size="sm" variant="outline" className="text-red-400 border-red-400 hover:bg-red-400/10">
                    Retry ({retryCount > 0 && `${retryCount} attempts`})
                  </Button>
                  <Button onClick={handleClearFilters} size="sm" variant="ghost" className="text-red-400 hover:bg-red-400/10">
                    Clear Filters
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

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
                <div>{`${filteredAndSortedCircles.length} of ${circles.length} circles`}</div>
                {circles.length > 0 && (
                  <div className="text-xs text-white/40">
                    Total expected: {Number(totalCircles || 0)} circles
                  </div>
                )}
              </div>
            )}
          </div>
          
        </div>

        {/* Circles List */}
        <div className="space-y-4 max-h-80 overflow-y-auto">
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
          ) : filteredAndSortedCircles.length === 0 ? (
            // Empty state
            <Card variant="glass" className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white/40" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No Circles Found</h3>
              <p className="text-white/60 text-sm mb-4">
                {searchTerm || selectedTags.length > 0 || minInvestmentFilter > 0 || maxInvestmentFilter < 1000 || memberCountFilter.min > 0 || memberCountFilter.max < 12 || dateFilter.start || dateFilter.end
                  ? "Try adjusting your filters to see more circles."
                  : "No circles are available at the moment."}
              </p>
              {(searchTerm || selectedTags.length > 0 || minInvestmentFilter > 0 || maxInvestmentFilter < 1000 || memberCountFilter.min > 0 || memberCountFilter.max < 12 || dateFilter.start || dateFilter.end) && (
                <Button onClick={handleClearFilters} variant="outline" size="sm">
                  Clear Filters
                </Button>
              )}
            </Card>
          ) : (
            // Circles list
            filteredAndSortedCircles.map((circle) => (
              <CircleCard
                key={circle.id}
                circle={circle}
                onJoin={() => onJoinCircle(circle.id)}
                isUserMember={account?.address ? circle.members.includes(account.address) : false}
                cusdDecimals={cusdDecimals}
                getDisplayValue={getDisplayValue}
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
  isUserMember,
  cusdDecimals,
  getDisplayValue
}: { 
  circle: CircleInfo; 
  onJoin: () => void; 
  isUserMember: boolean;
  cusdDecimals: number | undefined;
  getDisplayValue: (rawValue: bigint | number, decimals: number) => number;
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
              {cusdDecimals ? formatCurrency(getDisplayValue(circle.totalValue, Number(cusdDecimals)), "cUSD") : "Loading..."}
            </div>
            <div className="text-xs text-white/60">Total Value</div>
          </div>
          <div>
            <div className="text-lg font-bold text-genki-green">
              {cusdDecimals ? formatCurrency(getDisplayValue(circle.minInvestment, Number(cusdDecimals)), "cUSD") : "Loading..."}
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