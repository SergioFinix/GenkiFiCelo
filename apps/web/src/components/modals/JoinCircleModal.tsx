"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/Button";
import { useActiveAccount, useSendTransaction, useReadContract } from "thirdweb/react";
import { prepareContractCall } from "thirdweb";
import { genkiFiCoreContract, cusdTokenContract, CONTRACT_STATUS, CONTRACT_ADDRESSES } from "@/lib/thirdweb/contracts";
import { formatCurrency, formatAddress } from "@/lib/utils/helpers";
import { Users, DollarSign, Clock, CheckCircle, AlertCircle } from "lucide-react";

interface JoinCircleModalProps {
  isOpen: boolean;
  onClose: () => void;
  circleId: string;
  onSuccess: () => void;
}

export function JoinCircleModal({ isOpen, onClose, circleId, onSuccess }: JoinCircleModalProps) {
  const [investmentAmount, setInvestmentAmount] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [localCusdAllowance, setLocalCusdAllowance] = useState<bigint | undefined>(undefined);

  const account = useActiveAccount();
  const { mutate: sendTx } = useSendTransaction();

  // Reset local allowance when modal opens
  useEffect(() => {
    if (isOpen) {
      console.log("=== MODAL OPENED - RESETTING ALLOWANCE ===");
      setLocalCusdAllowance(undefined);
      setInvestmentAmount("");
      setError("");
      setValidationErrors([]);
    }
  }, [isOpen]);

  // Read circle information
  const { data: circleInfo, isLoading: isLoadingCircle } = useReadContract({
    contract: genkiFiCoreContract,
    method: "getCircleInfo",
    params: [BigInt(circleId)],
    queryOptions: {
      enabled: CONTRACT_STATUS.GENKIFI_CORE_DEPLOYED && !!circleId
    }
  });

  // Read user's cUSD balance
  const { data: cusdBalance, refetch: refetchBalance } = useReadContract({
    contract: cusdTokenContract,
    method: "balanceOf",
    params: [account?.address || "0x0"],
    queryOptions: {
      enabled: CONTRACT_STATUS.GENKIFI_CORE_DEPLOYED && !!account?.address,
      refetchInterval: 10000
    }
  });

  // Read user's cUSD allowance
  const { data: cusdAllowance, refetch: refetchAllowance } = useReadContract({
    contract: cusdTokenContract,
    method: "allowance",
    params: [account?.address || "0x0", CONTRACT_ADDRESSES.GENKIFI_CORE as `0x${string}`],
    queryOptions: {
      enabled: CONTRACT_STATUS.GENKIFI_CORE_DEPLOYED && !!account?.address,
      refetchInterval: 10000
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

  // Update local allowance when contract data changes
  useEffect(() => {
    if (cusdAllowance !== undefined) {
      console.log("=== UPDATING LOCAL ALLOWANCE ===");
      console.log("cusdAllowance from contract:", cusdAllowance);
      console.log("cusdAllowance type:", typeof cusdAllowance);
      console.log("cusdAllowance as string:", cusdAllowance.toString());
      console.log("cusdDecimals:", cusdDecimals);
      console.log("Display value would be:", getDisplayValue(cusdAllowance, Number(cusdDecimals)));
      setLocalCusdAllowance(cusdAllowance);
    }
  }, [cusdAllowance, cusdDecimals]);

  // Initialize investment amount when circle info loads
  useEffect(() => {
    if (circleInfo && cusdDecimals) {
      console.log("=== INITIALIZING INVESTMENT AMOUNT ===");
      console.log("circleInfo:", circleInfo);
      console.log("circleInfo.minInvestment:", circleInfo.minInvestment);
      console.log("circleInfo.minInvestment type:", typeof circleInfo.minInvestment);
      console.log("cusdDecimals:", cusdDecimals);
      
      const minInvestment = Number(circleInfo.minInvestment);
      const decimals = Number(cusdDecimals);
      
      // Use the simplified calculation (6 decimals for cUSD)
      const displayValue = minInvestment / 1000000;
      
      console.log("minInvestment (number):", minInvestment);
      console.log("decimals:", decimals);
      console.log("displayValue:", displayValue);
      
      setInvestmentAmount(displayValue.toString());
    }
  }, [circleInfo, cusdDecimals]);

  // Helper function to convert display value to raw value
  const getRawValue = (displayValue: string, decimals: number) => {
    const numValue = parseFloat(displayValue);
    if (isNaN(numValue)) return 0;
    // Use actual token decimals for raw value conversion
    return Math.floor(numValue * Math.pow(10, decimals));
  };

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

  // Validate form
  const validateForm = () => {
    const errors: string[] = [];

    if (!account) {
      errors.push("Please connect your wallet");
    }

    if (!circleInfo) {
      errors.push("Circle information not available");
    }

    if (!cusdDecimals) {
      errors.push("Token decimals not available");
    }

    if (!investmentAmount || parseFloat(investmentAmount) <= 0) {
      errors.push("Please enter a valid investment amount");
    }

    if (circleInfo && cusdDecimals) {
      const minInvestment = Number(circleInfo.minInvestment);
      const minDisplayValue = minInvestment / 1000000; // Use 6 decimals for cUSD
      
      if (parseFloat(investmentAmount) < minDisplayValue) {
        errors.push(`Minimum investment required: ${formatCurrency(minDisplayValue, "cUSD")}`);
      }

      if (cusdBalance) {
        const userBalance = getDisplayValue(cusdBalance, Number(cusdDecimals));
        if (parseFloat(investmentAmount) > userBalance) {
          errors.push("Insufficient cUSD balance");
        }
      }

      if (localCusdAllowance) {
        const userAllowance = getDisplayValue(localCusdAllowance, Number(cusdDecimals));
        if (parseFloat(investmentAmount) > userAllowance) {
          errors.push("Insufficient cUSD allowance. Please approve the contract to spend your cUSD.");
        }
      }

      // Check if circle is full
    if (circleInfo.members && circleInfo.members.length >= 12) {
        errors.push("Circle is full (maximum 12 members)");
    }

      // Check if user is already a member
    const isAlreadyMember = circleInfo.members && circleInfo.members.some(
        (member: string) => member.toLowerCase() === account?.address?.toLowerCase()
    );
    if (isAlreadyMember) {
        errors.push("You are already a member of this circle");
      }
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  // Handle amount change
  const handleAmountChange = (value: string) => {
    setInvestmentAmount(value);
    setError("");
  };

  // Handle approve
  const handleApprove = async () => {
    if (!account || !cusdDecimals) {
      setError("Please connect your wallet");
      return;
    }

    setIsApproving(true);
    setError("");

    try {
      const rawAmount = getRawValue(investmentAmount, Number(cusdDecimals));
      
      console.log("=== APPROVE DEBUG ===");
      console.log("investmentAmount (display):", investmentAmount);
      console.log("cusdDecimals:", cusdDecimals);
      console.log("rawAmount (for transaction):", rawAmount);
      console.log("rawAmount as BigInt:", BigInt(rawAmount));
      console.log("Display value check:", rawAmount / Math.pow(10, Number(cusdDecimals)));
      
      const approveTransaction = prepareContractCall({
        contract: cusdTokenContract,
        method: "approve",
        params: [CONTRACT_ADDRESSES.GENKIFI_CORE as `0x${string}`, BigInt(rawAmount)]
      });

      sendTx(approveTransaction, {
        onSuccess: async () => {
          console.log("=== APPROVE SUCCESS - REFRESHING ALLOWANCE ===");
          setIsApproving(false);
          setError("");
          
          // Wait a moment for the transaction to be mined, then refresh allowance
          setTimeout(async () => {
            try {
              const result = await refetchAllowance();
              console.log("Allowance refreshed after approve:", result.data);
              // Update local allowance immediately
              if (result.data) {
                setLocalCusdAllowance(result.data);
              }
            } catch (error) {
              console.error("Error refreshing allowance:", error);
            }
          }, 2000); // Wait 2 seconds for transaction to be mined
        },
        onError: (error) => {
          setError(`Failed to approve cUSD: ${error.message || "Unknown error"}`);
          setIsApproving(false);
        }
      });

    } catch (err: any) {
      setError(`Failed to prepare approve transaction: ${err.message || "Unknown error"}`);
      setIsApproving(false);
    }
  };

  // Handle join circle
  const handleJoinCircle = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError("");

    try {
      const rawAmount = getRawValue(investmentAmount, Number(cusdDecimals));

      console.log("=== JOIN CIRCLE DEBUG ===");
      console.log("investmentAmount (display):", investmentAmount);
      console.log("cusdDecimals:", cusdDecimals);
      console.log("rawAmount (for transaction):", rawAmount);
      console.log("rawAmount as BigInt:", BigInt(rawAmount));
      console.log("Display value check:", rawAmount / Math.pow(10, Number(cusdDecimals)));
      
      const transaction = prepareContractCall({
        contract: genkiFiCoreContract,
        method: "joinCircle",
        params: [BigInt(circleId), BigInt(rawAmount)]
      });

      sendTx(transaction, {
        onSuccess: async () => {
          console.log("=== JOIN CIRCLE SUCCESS - REFRESHING DATA ===");
          onSuccess();
          onClose();
          setError("");
          setValidationErrors([]);
          
          // Wait a moment for the transaction to be mined, then refresh data
          setTimeout(async () => {
            try {
              await Promise.all([refetchBalance(), refetchAllowance()]);
              console.log("Balance and allowance refreshed after join circle");
            } catch (error) {
              console.error("Error refreshing data:", error);
            }
          }, 2000); // Wait 2 seconds for transaction to be mined
        },
        onError: (error) => {
          setError(`Failed to join circle: ${error.message || "Unknown error"}`);
        },
        onSettled: () => {
          setIsSubmitting(false);
        }
      });

    } catch (err: any) {
      setError(`Failed to prepare join circle transaction: ${err.message || "Unknown error"}`);
      setIsSubmitting(false);
    }
  };

  // Handle close
  const handleClose = () => {
    if (!isSubmitting && !isApproving) {
      onClose();
      setError("");
      setValidationErrors([]);
    }
  };

  // Loading state
  if (isLoadingCircle) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="Join Circle" size="lg">
        <div className="flex items-center justify-center py-8">
          <div className="text-white/60">Loading circle information...</div>
        </div>
      </Modal>
    );
  }

  // Error state
  if (!circleInfo) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="Join Circle" size="lg">
        <div className="text-center py-8">
          <div className="text-red-400 mb-4">Circle not found</div>
          <Button onClick={handleClose} variant="outline">
            Close
          </Button>
        </div>
      </Modal>
    );
  }

  // Check if user is already a member
  const isAlreadyMember = circleInfo.members && circleInfo.members.some(
    (member: string) => member.toLowerCase() === account?.address?.toLowerCase()
  );

  // Check if circle is full
  const isCircleFull = circleInfo.members && circleInfo.members.length >= 12;


  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Join Circle" size="md">
      <div className="space-y-6">
        {/* Circle Information */}
        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-3">{circleInfo.name}</h3>
          
          {/* Tags */}
          {circleInfo.tags && circleInfo.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {circleInfo.tags.map((tag: string, index: number) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-genki-green/20 text-genki-green rounded-full text-xs border border-genki-green/30"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Circle Stats */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-white/60" />
              <span className="text-white/80">
                {circleInfo.members?.length || 0}/12 members
              </span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-white/60" />
              <span className="text-white/80">
                {cusdDecimals ? formatCurrency(getDisplayValue(circleInfo.totalValue || 0, Number(cusdDecimals)), "cUSD") : "Loading..."} total
              </span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-white/60" />
              <span className="text-white/80">
                Min: {cusdDecimals ? formatCurrency(Number(circleInfo.minInvestment) / 1000000, "cUSD") : "Loading..."}
              </span>
            </div>
            
            {/* Debug info for min investment display */}
            
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-white/60" />
              <span className="text-white/80">
                Created {circleInfo.createdAt ? new Date(Number(circleInfo.createdAt) * 1000).toLocaleDateString() : "Unknown"}
              </span>
            </div>
          </div>

          {/* Creator */}
          <div className="mt-3 pt-3 border-t border-white/10">
            <p className="text-xs text-white/60">
              Created by: {formatAddress(circleInfo.creator || "0x0")}
            </p>
          </div>
        </div>

        {/* Status Messages */}
        {isAlreadyMember && (
          <div className="p-4 bg-genki-green/10 border border-genki-green/20 rounded-xl">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-genki-green" />
              <span className="text-genki-green font-medium">You are already a member of this circle!</span>
            </div>
          </div>
        )}

        {isCircleFull && !isAlreadyMember && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-red-400" />
              <span className="text-red-400 font-medium">This circle is full (12/12 members)</span>
            </div>
          </div>
        )}

        {/* Investment Amount */}
        {!isAlreadyMember && !isCircleFull && (
          <>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Investment Amount (cUSD) *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="number"
                  value={investmentAmount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="1.00"
                  min={cusdDecimals ? getDisplayValue(circleInfo.minInvestment || 0, Number(cusdDecimals)) : undefined}
                  step="0.01"
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-genki-green focus:border-transparent"
                  disabled={isSubmitting || isApproving}
                />
              </div>
              {cusdDecimals && (
                <p className="text-xs text-white/60 mt-1">
                  Minimum: {Number(circleInfo.minInvestment) / 1000000}
                </p>
              )}
              
              
              {cusdBalance && cusdDecimals && (
                <div className="text-xs text-white/60 mt-1 space-y-1">
                  <p>Your balance: {formatCurrency(getDisplayValue(cusdBalance, Number(cusdDecimals)), "cUSD")}</p>
                  {localCusdAllowance && (
                    <p>Allowance: {formatCurrency(getDisplayValue(localCusdAllowance, Number(cusdDecimals)), "cUSD")}</p>
                  )}
                  
                  {/* Debug info for allowance */}
                  {localCusdAllowance && cusdDecimals && (
                    <div className="text-xs text-yellow-400 mt-1">
                      Debug Allowance: raw={localCusdAllowance.toString()}, decimals={cusdDecimals}, 
                      display={getDisplayValue(localCusdAllowance, Number(cusdDecimals))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* XP Reward Info */}
            <div className="p-4 bg-genki-green/10 border border-genki-green/20 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-genki-green" />
                <h3 className="text-genki-green font-semibold">XP Reward</h3>
              </div>
              <p className="text-white/80 text-sm">
                You&apos;ll earn <span className="text-genki-green font-semibold">25 XP</span> for joining this circle!
              </p>
            </div>
          </>
        )}

        {/* Validation Errors */}
        {validationErrors.length > 0 && !isAlreadyMember && !isCircleFull && (
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <div className="space-y-1">
              {validationErrors.map((error, index) => (
                <p key={index} className="text-yellow-400 text-sm">• {error}</p>
              ))}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleClose}
            variant="outline"
            className="flex-1"
            disabled={isSubmitting || isApproving}
          >
            {isAlreadyMember ? "Close" : "Cancel"}
          </Button>
          
          {!isAlreadyMember && !isCircleFull && (
            <>
              {/* Approve Button - Only show if approval is needed */}
              {(!localCusdAllowance || (!!cusdDecimals && parseFloat(investmentAmount || "0") > getDisplayValue(localCusdAllowance, Number(cusdDecimals)))) && (
                <Button
                  onClick={handleApprove}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
                  disabled={isApproving || isSubmitting || validationErrors.length > 0}
                  loading={isApproving}
                >
                  {isApproving ? "Approving cUSD..." : "Approve cUSD"}
                </Button>
              )}
              
              {/* Join Circle Button */}
              <Button
                onClick={handleJoinCircle}
                className="flex-1 bg-gradient-primary hover:bg-gradient-primary/90"
                disabled={isSubmitting || isApproving || validationErrors.length > 0 || (!localCusdAllowance || (!!cusdDecimals && parseFloat(investmentAmount || "0") > getDisplayValue(localCusdAllowance, Number(cusdDecimals))))}
                loading={isSubmitting}
              >
                {isSubmitting ? "Joining Circle..." : "Join Circle"}
              </Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}