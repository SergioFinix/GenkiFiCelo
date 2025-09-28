"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/Button";
import { useActiveAccount, useSendTransaction, useReadContract } from "thirdweb/react";
import { prepareContractCall } from "thirdweb";
import { genkiFiCoreContract, cusdTokenContract, CONTRACT_STATUS, CONTRACT_ADDRESSES } from "@/lib/thirdweb/contracts";
import { formatCurrency, formatAddress } from "@/lib/utils/helpers";
import { Users, DollarSign, Clock, CheckCircle } from "lucide-react";

interface JoinCircleModalProps {
  isOpen: boolean;
  onClose: () => void;
  circleId: string;
  onSuccess: () => void;
}

// Constants from the smart contract
const MIN_JOIN_AMOUNT_USDC = 1000000; // $1 USDC (6 decimals)

export function JoinCircleModal({ isOpen, onClose, circleId, onSuccess }: JoinCircleModalProps) {
  const [investmentAmount, setInvestmentAmount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isRetrying, setIsRetrying] = useState(false);

  const account = useActiveAccount();
  const { mutate: sendTx } = useSendTransaction();

  // Read circle information (only if contract is deployed)
  const { data: circleInfo, isLoading: isLoadingCircle } = useReadContract({
    contract: genkiFiCoreContract,
    method: "getCircleInfo",
    params: [BigInt(circleId)],
    queryOptions: {
      enabled: CONTRACT_STATUS.GENKIFI_CORE_DEPLOYED && !!circleId
    }
  });

  // Read user's cUSD balance using the cUSD token contract
  const { data: cusdBalance, isLoading: isLoadingBalance } = useReadContract({
    contract: cusdTokenContract,
    method: "balanceOf",
    params: [account?.address || "0x0"],
    queryOptions: {
      enabled: CONTRACT_STATUS.GENKIFI_CORE_DEPLOYED && !!account?.address,
      refetchInterval: 10000 // Refetch every 10 seconds
    }
  });

  // Read user's cUSD allowance for the GenkiFiCore contract
  const { data: cusdAllowance, isLoading: isLoadingAllowance } = useReadContract({
    contract: cusdTokenContract,
    method: "allowance",
    params: [account?.address || "0x0", CONTRACT_ADDRESSES.GENKIFI_CORE as `0x${string}`],
    queryOptions: {
      enabled: CONTRACT_STATUS.GENKIFI_CORE_DEPLOYED && !!account?.address,
      refetchInterval: 10000 // Refetch every 10 seconds
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

  // Initialize investmentAmount when cusdDecimals is available
  useEffect(() => {
    if (cusdDecimals && investmentAmount === 0 && circleInfo) {
      // Use the actual minimum from the circle contract, but ensure it's at least $1 USD
      const decimalMultiplier = Math.pow(10, Number(cusdDecimals));
      const circleMinInvestment = circleInfo && typeof circleInfo === 'object' && 'minInvestment' in circleInfo 
        ? Number(circleInfo.minInvestment) 
        : decimalMultiplier; // Fallback to $1 USD if no circle info
      
      // Check if this is a legacy 6-decimal value
      const isLegacyValue = circleMinInvestment === 1000000 && Number(cusdDecimals) === 18;
      
      let minAmount;
      if (isLegacyValue) {
        // For legacy values, use the raw value (1,000,000) which represents $1 USD with 6 decimals
        minAmount = 1000000;
        console.log("=== INITIALIZING WITH LEGACY VALUE ===");
      } else {
        // For new values, use the actual value or at least $1 USD
        minAmount = Math.max(circleMinInvestment, decimalMultiplier);
        console.log("=== INITIALIZING WITH NEW VALUE ===");
      }
      
      console.log("Circle minInvestment:", circleMinInvestment);
      console.log("Decimal multiplier:", decimalMultiplier);
      console.log("Is legacy value:", isLegacyValue);
      console.log("Final minAmount:", minAmount);
      console.log("Setting investmentAmount to:", minAmount);
      
      setInvestmentAmount(minAmount);
    }
  }, [cusdDecimals, investmentAmount, circleInfo]);

  // Helper function to handle legacy 6-decimal values
  const getDisplayValue = (rawValue: bigint | number, decimals?: bigint | number) => {
    const numValue = Number(rawValue);
    const numDecimals = decimals ? Number(decimals) : 18;
    
    console.log("getDisplayValue called with:", { numValue, numDecimals });
    
    // Check if this is a legacy 6-decimal value (1,000,000 stored with 18 decimals)
    const isLegacyValue = numValue === 1000000 && numDecimals === 18;
    
    if (isLegacyValue) {
      console.log("Detected legacy 6-decimal value, using 6 decimals");
      return numValue / 1000000; // Use 6 decimals for legacy values
    } else {
      console.log("Using actual decimals:", numDecimals);
      return numValue / Math.pow(10, numDecimals); // Use actual decimals
    }
  };

  // Auto-validate when circle info or balance changes
  useEffect(() => {
    if (circleInfo && investmentAmount) {
      validateAmount(investmentAmount);
    }
  }, [circleInfo, cusdBalance, investmentAmount]);

  // Debug circle info when it loads
  useEffect(() => {
    if (circleInfo) {
      console.log("=== CIRCLE INFO DEBUG ===");
      console.log("Circle Info:", circleInfo);
      console.log("Circle Info Type:", typeof circleInfo);
      console.log("Circle Info Keys:", Object.keys(circleInfo));
      console.log("Min Investment Raw:", circleInfo.minInvestment);
      console.log("Min Investment Type:", typeof circleInfo.minInvestment);
      console.log("Min Investment String:", circleInfo.minInvestment?.toString());
      console.log("Circle ID from props:", circleId);
      console.log("Circle ID type:", typeof circleId);
      console.log("cUSD Decimals:", cusdDecimals);
      console.log("cUSD Decimals type:", typeof cusdDecimals);
      
      if (cusdDecimals) {
        const rawValue = Number(circleInfo.minInvestment);
        const isLegacyValue = rawValue === 1000000 && Number(cusdDecimals) === 18;
        console.log("Is Legacy 6-decimal value:", isLegacyValue);
        console.log("Raw value as number:", rawValue);
        console.log("Display value:", getDisplayValue(circleInfo.minInvestment, cusdDecimals));
        
        if (isLegacyValue) {
          console.log("Legacy Min Investment in cUSD (6 decimals):", rawValue / 1000000);
        } else {
          console.log("Min Investment in cUSD (18 decimals):", rawValue / Math.pow(10, Number(cusdDecimals)));
        }
      }
      
      // Check if minInvestment is actually 0 or undefined
      if (!circleInfo.minInvestment || Number(circleInfo.minInvestment) === 0) {
        console.log("⚠️ WARNING: minInvestment is 0 or undefined!");
        console.log("Raw minInvestment value:", circleInfo.minInvestment);
        console.log("minInvestment as string:", circleInfo.minInvestment?.toString());
        console.log("minInvestment as number:", Number(circleInfo.minInvestment));
        console.log("minInvestment type:", typeof circleInfo.minInvestment);
      }
      
      // Log all circle properties to see what we're getting
      console.log("=== FULL CIRCLE INFO ===");
      Object.entries(circleInfo).forEach(([key, value]) => {
        console.log(`${key}:`, value, `(type: ${typeof value})`);
      });
    }
  }, [circleInfo, cusdDecimals]);

  const handleAmountChange = (value: string) => {
    console.log("=== AMOUNT CHANGE DEBUG ===");
    console.log("Input value:", value);
    console.log("cUSD Decimals:", cusdDecimals);
    
    const amount = parseFloat(value);
    console.log("Parsed amount:", amount);
    
    if (!isNaN(amount) && amount > 0 && cusdDecimals) {
      const decimalMultiplier = Math.pow(10, Number(cusdDecimals));
      console.log("Decimal multiplier:", decimalMultiplier);
      
      // Use the actual minimum from the circle contract, but ensure it's at least $1 USD
      const circleMinInvestment = circleInfo && typeof circleInfo === 'object' && 'minInvestment' in circleInfo 
        ? Number(circleInfo.minInvestment) 
        : decimalMultiplier; // Fallback to $1 USD if no circle info
      const minAmount = Math.max(circleMinInvestment, decimalMultiplier); // At least $1 USD
      const newAmount = Math.max(minAmount, amount * decimalMultiplier);
      console.log("New amount (with decimals):", newAmount);
      console.log("New amount in cUSD:", newAmount / decimalMultiplier);
      
      setInvestmentAmount(newAmount);
      setError("");
      
      // Real-time validation
      validateAmount(newAmount);
    }
  };

  // Real-time validation function
  const validateAmount = (amount: number) => {
    const errors: string[] = [];
    
    if (circleInfo && typeof circleInfo === 'object' && 'minInvestment' in circleInfo && cusdDecimals) {
      const decimalMultiplier = Math.pow(10, Number(cusdDecimals));
      
      // Use the actual minimum from the circle contract
      const circleMinInvestment = Number(circleInfo.minInvestment);
      if (amount < circleMinInvestment) {
        errors.push(`Minimum investment required: ${formatCurrency(getDisplayValue(circleInfo.minInvestment, cusdDecimals), "cUSD")}`);
      }
      
      // Also ensure it's at least $1 USD
      const minAmount = decimalMultiplier; // $1 USD
      if (amount < minAmount) {
        errors.push(`Minimum investment must be at least $${minAmount / decimalMultiplier} cUSD`);
      }
      
      if (cusdBalance && typeof cusdBalance === 'bigint' && BigInt(amount) > cusdBalance) {
        errors.push("Insufficient cUSD balance");
      }
      
      if (cusdAllowance && typeof cusdAllowance === 'bigint' && BigInt(amount) > cusdAllowance) {
        errors.push("Insufficient cUSD allowance. Please approve the contract to spend your cUSD.");
      }
    }
    
    setValidationErrors(errors);
  };

  const validateForm = () => {
    if (!account) {
      setError("Please connect your wallet");
      return false;
    }

    if (!CONTRACT_STATUS.GENKIFI_CORE_DEPLOYED) {
      setError("GenkiFiCore contract is not deployed yet");
      return false;
    }

    if (!circleInfo || typeof circleInfo !== 'object' || !('minInvestment' in circleInfo)) {
      setError("Circle information not available");
      return false;
    }

    if (!cusdDecimals) {
      setError("Token decimals not available");
      return false;
    }

    const decimalMultiplier = Math.pow(10, Number(cusdDecimals));

    if (investmentAmount < Number(circleInfo.minInvestment)) {
      setError(`Minimum investment required: ${formatCurrency(getDisplayValue(circleInfo.minInvestment, cusdDecimals), "cUSD")}`);
      return false;
    }

    const minAmount = decimalMultiplier; // $1 USD
    if (investmentAmount < minAmount) {
      setError(`Minimum investment must be at least $${minAmount / decimalMultiplier} cUSD`);
      return false;
    }

    if (cusdBalance && typeof cusdBalance === 'bigint' && BigInt(investmentAmount) > cusdBalance) {
      setError("Insufficient cUSD balance");
      return false;
    }

    if (cusdAllowance && typeof cusdAllowance === 'bigint' && BigInt(investmentAmount) > cusdAllowance) {
      setError("Insufficient cUSD allowance. Please approve the contract to spend your cUSD.");
      return false;
    }

    if (circleInfo.members && circleInfo.members.length >= 12) {
      setError("Circle is full (maximum 12 members)");
      return false;
    }

    // Check if user is already in circle
    const isAlreadyMember = circleInfo.members && circleInfo.members.some(
      (member: string) => member.toLowerCase() === account.address.toLowerCase()
    );
    if (isAlreadyMember) {
      setError("You are already a member of this circle");
      return false;
    }

    return true;
  };

  const handleApprove = async () => {
    if (!account) {
      setError("Please connect your wallet");
      return;
    }

    setIsApproving(true);
    setError("");

    try {
      console.log("=== APPROVE DEBUG ===");
      console.log("User Address:", account.address);
      console.log("Contract Address:", CONTRACT_ADDRESSES.GENKIFI_CORE);
      console.log("Investment Amount (raw):", investmentAmount);
      console.log("Investment Amount (BigInt):", BigInt(investmentAmount));
      console.log("cUSD Decimals:", cusdDecimals);
      console.log("Investment Amount in cUSD:", cusdDecimals ? investmentAmount / Math.pow(10, Number(cusdDecimals)) : "N/A");
      console.log("cUSD Token Address:", CONTRACT_ADDRESSES.CUSD_TOKEN);
      
      // Prepare the approve transaction
      const approveTransaction = prepareContractCall({
        contract: cusdTokenContract,
        method: "approve",
        params: [CONTRACT_ADDRESSES.GENKIFI_CORE as `0x${string}`, BigInt(investmentAmount)]
      });

      console.log("Approve transaction prepared:", approveTransaction);

      // Send the approve transaction
      sendTx(approveTransaction, {
        onSuccess: (result) => {
          console.log("=== APPROVE SUCCESS ===");
          console.log("Transaction hash:", result.transactionHash);
          console.log("cUSD approved successfully");
          setIsApproving(false);
          setError("");
        },
        onError: (error) => {
          console.error("=== APPROVE ERROR ===");
          console.error("Error approving cUSD:", error);
          console.error("Error message:", error.message);
          
          let errorMessage = "Failed to approve cUSD";
          
          if (error.message?.includes("user rejected")) {
            errorMessage = "cUSD approval was cancelled by user";
          } else if (error.message?.includes("gas")) {
            errorMessage = "cUSD approval failed due to gas issues. Please try again";
          } else if (error.message) {
            errorMessage = `cUSD approval failed: ${error.message}`;
          }
          
          setError(errorMessage);
          setIsApproving(false);
        }
      });

    } catch (err: any) {
      console.error("=== PREPARE APPROVE ERROR ===");
      console.error("Error preparing approve transaction:", err);
      console.error("Error message:", err.message);
      
      let errorMessage = "Failed to prepare approve transaction";
      
      if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setIsApproving(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setIsTransferring(true);
    setError("");

    try {
      // Check if we need to approve cUSD first
      const needsApproval = !cusdAllowance || BigInt(investmentAmount) > cusdAllowance;
      
      if (needsApproval) {
        setError("Please approve cUSD first before joining the circle");
        setIsSubmitting(false);
        setIsTransferring(false);
        return;
      }

      // Proceed to join circle
      joinCircle();

    } catch (err: any) {
      console.error("Error preparing transaction:", err);
      let errorMessage = "Failed to prepare transaction";
      
      if (err.message?.includes("insufficient")) {
        errorMessage = "Insufficient cUSD balance or allowance";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setIsSubmitting(false);
      setIsTransferring(false);
    }
  };

  const joinCircle = async () => {
    try {
      // Validaciones adicionales antes de proceder
      if (!account?.address) {
        setError("Wallet not connected");
        setIsSubmitting(false);
        setIsTransferring(false);
        return;
      }

      if (!circleId) {
        setError("Invalid circle ID");
        setIsSubmitting(false);
        setIsTransferring(false);
        return;
      }

      if (!cusdBalance || BigInt(investmentAmount) > cusdBalance) {
        setError("Insufficient cUSD balance");
        setIsSubmitting(false);
        setIsTransferring(false);
        return;
      }

      if (!cusdAllowance || BigInt(investmentAmount) > cusdAllowance) {
        setError("Insufficient cUSD allowance");
        setIsSubmitting(false);
        setIsTransferring(false);
        return;
      }

      console.log("=== JOIN CIRCLE DEBUG ===");
      console.log("Circle ID:", circleId);
      console.log("Investment Amount (raw):", investmentAmount);
      console.log("Investment Amount (BigInt):", BigInt(investmentAmount));
      console.log("cUSD Decimals:", cusdDecimals);
      console.log("Investment Amount in cUSD:", cusdDecimals ? investmentAmount / Math.pow(10, Number(cusdDecimals)) : "N/A");
      console.log("User Address:", account?.address);
      console.log("cUSD Balance BEFORE:", cusdBalance);
      console.log("cUSD Allowance BEFORE:", cusdAllowance);
      console.log("Contract Address:", CONTRACT_ADDRESSES.GENKIFI_CORE);
      console.log("cUSD Token Address:", CONTRACT_ADDRESSES.CUSD_TOKEN);
      
      // Prepare the join circle transaction
      const transaction = prepareContractCall({
        contract: genkiFiCoreContract,
        method: "joinCircle",
        params: [BigInt(circleId), BigInt(investmentAmount)]
      });

      console.log("Join circle transaction prepared:", transaction);

      // Send the transaction
      sendTx(transaction, {
        onSuccess: async (result) => {
          console.log("=== JOIN CIRCLE SUCCESS ===");
          console.log("Transaction hash:", result.transactionHash);
          console.log("Successfully joined circle");
          
          // Wait a moment for the transaction to be mined and then check balances
          setTimeout(async () => {
            try {
              console.log("=== CHECKING BALANCES AFTER TRANSACTION ===");
              
              // Read updated balance and allowance
              const updatedBalance = await cusdTokenContract.read({
                method: "balanceOf",
                params: [account?.address || "0x0"]
              });
              
              const updatedAllowance = await cusdTokenContract.read({
                method: "allowance", 
                params: [account?.address || "0x0", CONTRACT_ADDRESSES.GENKIFI_CORE as `0x${string}`]
              });
              
              console.log("cUSD Balance AFTER:", updatedBalance);
              console.log("cUSD Allowance AFTER:", updatedAllowance);
              
              const balanceDiff = cusdBalance && typeof cusdBalance === 'bigint' && typeof updatedBalance === 'bigint' 
                ? Number(cusdBalance) - Number(updatedBalance) 
                : 0;
              
              console.log("cUSD Balance Difference:", balanceDiff);
              console.log("Expected Transfer Amount:", investmentAmount);
              
              if (balanceDiff === investmentAmount) {
                console.log("✅ cUSD transfer successful!");
              } else {
                console.log("❌ cUSD transfer may have failed or amount differs");
              }
              
            } catch (balanceError) {
              console.error("Error checking balances after transaction:", balanceError);
            }
          }, 3000); // Wait 3 seconds for transaction to be mined
          
          onSuccess();
          onClose();
          // Don't reset investmentAmount to maintain the user's input for debugging
          // setInvestmentAmount(MIN_JOIN_AMOUNT_USDC);
          setError("");
          setValidationErrors([]);
        },
        onError: (error) => {
          console.error("=== JOIN CIRCLE ERROR ===");
          console.error("Error joining circle:", error);
          console.error("Error message:", error.message);
          
          let errorMessage = "Failed to join circle";
          
          // Provide more specific error messages
          if (error.message?.includes("insufficient")) {
            errorMessage = "Insufficient cUSD balance or allowance";
          } else if (error.message?.includes("revert")) {
            errorMessage = "Transaction failed. Circle may be full or you may already be a member";
          } else if (error.message?.includes("user rejected")) {
            errorMessage = "Transaction was cancelled by user";
          } else if (error.message?.includes("gas")) {
            errorMessage = "Transaction failed due to gas issues. Please try again";
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          setError(errorMessage);
        },
        onSettled: () => {
          console.log("=== JOIN CIRCLE SETTLED ===");
          setIsSubmitting(false);
          setIsTransferring(false);
        }
      });

    } catch (err: any) {
      console.error("=== PREPARE JOIN CIRCLE ERROR ===");
      console.error("Error preparing join circle transaction:", err);
      console.error("Error message:", err.message);
      
      let errorMessage = "Failed to prepare join circle transaction";
      
      if (err.message?.includes("insufficient")) {
        errorMessage = "Insufficient cUSD balance or allowance";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setIsSubmitting(false);
      setIsTransferring(false);
    }
  };

  const handleRetry = () => {
    setIsRetrying(true);
    setError("");
    // Small delay to show retry state
    setTimeout(() => {
      handleSubmit();
      setIsRetrying(false);
    }, 500);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      setError("");
    }
  };

  if (isLoadingCircle) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="Join Circle" size="md">
        <div className="flex items-center justify-center py-8">
          <div className="text-white/60">Loading circle information...</div>
        </div>
      </Modal>
    );
  }

  if (!circleInfo) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="Join Circle" size="md">
        <div className="text-center py-8">
          <div className="text-red-400 mb-4">Circle not found</div>
          <Button onClick={handleClose} variant="outline">
            Close
          </Button>
        </div>
      </Modal>
    );
  }

  const isAlreadyMember = circleInfo && typeof circleInfo === 'object' && 'members' in circleInfo && circleInfo.members.some(
    (member: string) => member.toLowerCase() === account?.address?.toLowerCase()
  );

  const isCircleFull = circleInfo && typeof circleInfo === 'object' && 'members' in circleInfo && circleInfo.members.length >= 12;

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
                {circleInfo.members.length}/12 members
              </span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-white/60" />
              <span className="text-white/80">
                {formatCurrency(getDisplayValue(circleInfo.totalValue, cusdDecimals), "cUSD")} total
              </span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-white/60" />
              <span className="text-white/80">
                Min: {formatCurrency(getDisplayValue(circleInfo.minInvestment, cusdDecimals), "cUSD")}
                {Number(circleInfo.minInvestment) === 1000000 && Number(cusdDecimals) === 18 && " (⚠️ Legacy 6-decimal value)"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-white/60" />
              <span className="text-white/80">
                Created {new Date(Number(circleInfo.createdAt) * 1000).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Creator */}
          <div className="mt-3 pt-3 border-t border-white/10">
            <p className="text-xs text-white/60">
              Created by: {formatAddress(circleInfo.creator)}
            </p>
          </div>
        </div>

        {/* Real-time Validation Errors */}
        {validationErrors.length > 0 && !isAlreadyMember && !isCircleFull && (
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <div className="space-y-1">
              {validationErrors.map((error, index) => (
                <p key={index} className="text-yellow-400 text-sm">• {error}</p>
              ))}
            </div>
          </div>
        )}

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
                  value={getDisplayValue(investmentAmount, cusdDecimals)}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="1.00"
                  min={getDisplayValue(circleInfo.minInvestment, cusdDecimals)}
                  step="0.01"
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-genki-green focus:border-transparent"
                  disabled={isSubmitting}
                />
                {/* Debug info for input value */}
                <p className="text-xs text-yellow-400 mt-1">
                  Input value: {getDisplayValue(investmentAmount, cusdDecimals)} 
                  (Raw: {investmentAmount}, Decimals: {cusdDecimals?.toString()})
                </p>
              </div>
              <p className="text-xs text-white/60 mt-1">
                Minimum: {formatCurrency(getDisplayValue(circleInfo.minInvestment, cusdDecimals), "cUSD")}
                {/* Debug info */}
                <span className="text-yellow-400 ml-2">
                  (Raw: {circleInfo.minInvestment?.toString()}, Decimals: {cusdDecimals?.toString()})
                </span>
              </p>
              {cusdBalance && (
                <div className="text-xs text-white/60 mt-1 space-y-1">
                  <p>Your balance: {formatCurrency(getDisplayValue(cusdBalance, cusdDecimals), "cUSD")}</p>
                  {cusdAllowance && (
                    <p>Allowance: {formatCurrency(getDisplayValue(cusdAllowance, cusdDecimals), "cUSD")}</p>
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

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-red-400 text-xs">!</span>
              </div>
              <div className="flex-1">
                <p className="text-red-400 text-sm mb-3">{error}</p>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleRetry} 
                    size="sm" 
                    variant="outline" 
                    className="text-red-400 border-red-400 hover:bg-red-400/10"
                    disabled={isSubmitting || isRetrying}
                    loading={isRetrying}
                  >
                    {isRetrying ? "Retrying..." : "Retry"}
                  </Button>
                  <Button 
                    onClick={() => setError("")} 
                    size="sm" 
                    variant="ghost" 
                    className="text-red-400 hover:bg-red-400/10"
                  >
                    Dismiss
                  </Button>
                </div>
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
              {(!cusdAllowance || BigInt(investmentAmount) > cusdAllowance) && (
                <Button
                  onClick={handleApprove}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
                  disabled={isApproving || isSubmitting || validationErrors.length > 0 || investmentAmount < Number(circleInfo.minInvestment)}
                  loading={isApproving}
                >
                  {isApproving ? "Approving cUSD..." : "Approve cUSD"}
                </Button>
              )}
              
              {/* Join Circle Button */}
              <Button
                onClick={handleSubmit}
                className={`flex-1 ${
                  isTransferring 
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                    : "bg-gradient-primary hover:bg-gradient-primary/90"
                }`}
                disabled={isSubmitting || isApproving || validationErrors.length > 0 || investmentAmount < Number(circleInfo.minInvestment) || (!cusdAllowance || BigInt(investmentAmount) > cusdAllowance)}
                loading={isSubmitting}
              >
                {isTransferring ? "Joining Circle..." : "Join Circle"}
              </Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}