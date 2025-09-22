"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/Button";
import { useActiveAccount, useSendTransaction, useReadContract } from "thirdweb/react";
import { prepareContractCall } from "thirdweb";
import { genkiFiCoreContract, CONTRACT_STATUS } from "@/lib/thirdweb/contracts";
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
  const [investmentAmount, setInvestmentAmount] = useState(MIN_JOIN_AMOUNT_USDC);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const account = useActiveAccount();
  const { mutate: sendTx } = useSendTransaction();

  // Read circle information (only if contract is deployed)
  const { data: circleInfo, isLoading: isLoadingCircle } = useReadContract({
    contract: genkiFiCoreContract,
    method: "function getCircleInfo(uint256 _circleId) view returns (tuple)",
    params: [BigInt(circleId)],
    queryOptions: {
      enabled: CONTRACT_STATUS.GENKIFI_CORE_DEPLOYED && !!circleId
    }
  });

  // Read user's cUSD balance
  const { data: cusdBalance } = useReadContract({
    contract: genkiFiCoreContract,
    method: "function balanceOf(address account) view returns (uint256)",
    params: [account?.address || "0x0"]
  });

  const handleAmountChange = (value: string) => {
    const amount = parseFloat(value);
    if (!isNaN(amount) && amount > 0) {
      setInvestmentAmount(Math.max(MIN_JOIN_AMOUNT_USDC, amount * 1000000));
      setError("");
    }
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

    if (!circleInfo) {
      setError("Circle information not available");
      return false;
    }

    if (investmentAmount < circleInfo.minInvestment) {
      setError(`Minimum investment required: ${formatCurrency(circleInfo.minInvestment / 1000000, "cUSD")}`);
      return false;
    }

    if (investmentAmount < MIN_JOIN_AMOUNT_USDC) {
      setError(`Minimum investment must be at least $${MIN_JOIN_AMOUNT_USDC / 1000000} cUSD`);
      return false;
    }

    if (cusdBalance && BigInt(investmentAmount) > cusdBalance) {
      setError("Insufficient cUSD balance");
      return false;
    }

    if (circleInfo.members.length >= 12) {
      setError("Circle is full (maximum 12 members)");
      return false;
    }

    // Check if user is already in circle
    const isAlreadyMember = circleInfo.members.some(
      (member: string) => member.toLowerCase() === account.address.toLowerCase()
    );
    if (isAlreadyMember) {
      setError("You are already a member of this circle");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError("");

    try {
      // Prepare the contract call
      const transaction = prepareContractCall({
        contract: genkiFiCoreContract,
        method: "function joinCircle(uint256 _circleId, uint256 _amount)",
        params: [BigInt(circleId), BigInt(investmentAmount)]
      });

      // Send the transaction
      sendTx(transaction, {
        onSuccess: () => {
          console.log("Successfully joined circle");
          onSuccess();
          onClose();
          setInvestmentAmount(MIN_JOIN_AMOUNT_USDC);
        },
        onError: (error) => {
          console.error("Error joining circle:", error);
          setError(error.message || "Failed to join circle");
        },
        onSettled: () => {
          setIsSubmitting(false);
        }
      });

    } catch (err) {
      console.error("Error preparing transaction:", err);
      setError("Failed to prepare transaction");
      setIsSubmitting(false);
    }
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

  const isAlreadyMember = circleInfo.members.some(
    (member: string) => member.toLowerCase() === account?.address?.toLowerCase()
  );

  const isCircleFull = circleInfo.members.length >= 12;

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
                {formatCurrency(circleInfo.totalValue / 1000000, "cUSD")} total
              </span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-white/60" />
              <span className="text-white/80">
                Min: {formatCurrency(circleInfo.minInvestment / 1000000, "cUSD")}
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
                  value={investmentAmount / 1000000}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="1.00"
                  min={circleInfo.minInvestment / 1000000}
                  step="0.01"
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-genki-green focus:border-transparent"
                  disabled={isSubmitting}
                />
              </div>
              <p className="text-xs text-white/60 mt-1">
                Minimum: {formatCurrency(circleInfo.minInvestment / 1000000, "cUSD")}
              </p>
              {cusdBalance && (
                <p className="text-xs text-white/60 mt-1">
                  Your balance: {formatCurrency(Number(cusdBalance) / 1000000, "cUSD")}
                </p>
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
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleClose}
            variant="outline"
            className="flex-1"
            disabled={isSubmitting}
          >
            {isAlreadyMember ? "Close" : "Cancel"}
          </Button>
          {!isAlreadyMember && !isCircleFull && (
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-gradient-primary hover:bg-gradient-primary/90"
              disabled={isSubmitting || investmentAmount < circleInfo.minInvestment}
              loading={isSubmitting}
            >
              {isSubmitting ? "Joining Circle..." : "Join Circle"}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
