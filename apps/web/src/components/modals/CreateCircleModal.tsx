"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/Button";
import { useActiveAccount, useSendTransaction } from "thirdweb/react";
import { prepareContractCall, sendTransaction } from "thirdweb";
import { genkiFiCoreContract, CONTRACT_STATUS } from "@/lib/thirdweb/contracts";
import { formatCurrency } from "@/lib/utils/helpers";
import { Plus, X, Tag, DollarSign } from "lucide-react";

interface CreateCircleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (circleId: string) => void;
}

// Predefined tags based on the smart contract requirements
const AVAILABLE_TAGS = [
  "DeFi",
  "Stablecoins",
  "Yield Farming",
  "Lending",
  "DEX",
  "NFT",
  "Gaming",
  "Social",
  "Education",
  "Innovation",
  "Conservative",
  "Aggressive",
  "Long-term",
  "Short-term",
  "Diversified"
];

// Constants from the smart contract
const MIN_INVESTMENT_USDC = 1000000; // $1 USDC (6 decimals)
const MAX_TAGS = 5;

export function CreateCircleModal({ isOpen, onClose, onSuccess }: CreateCircleModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    tags: [] as string[],
    minInvestment: MIN_INVESTMENT_USDC,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const account = useActiveAccount();
  const { mutate: sendTx } = useSendTransaction();

  const handleInputChange = (field: string, value: string | number | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleTagToggle = (tag: string) => {
    setFormData(prev => {
      const newTags = prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : prev.tags.length < MAX_TAGS
          ? [...prev.tags, tag]
          : prev.tags;

      return { ...prev, tags: newTags };
    });
  };

  const validateForm = () => {
    // Smart contract validations
    if (!formData.name.trim()) {
      setError("Circle name cannot be empty");
      return false;
    }

    if (formData.tags.length === 0) {
      setError("Must provide at least one tag");
      return false;
    }

    if (formData.tags.length > MAX_TAGS) {
      setError("Maximum 5 tags allowed");
      return false;
    }

    if (formData.minInvestment <= 0) {
      setError("Minimum investment must be greater than 0");
      return false;
    }

    if (formData.minInvestment < MIN_INVESTMENT_USDC) {
      setError(`Minimum investment must be at least $${MIN_INVESTMENT_USDC / 1000000} cUSD`);
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!account) {
      setError("Please connect your wallet");
      return;
    }

    if (!CONTRACT_STATUS.GENKIFI_CORE_DEPLOYED) {
      setError("GenkiFiCore contract is not deployed yet");
      return;
    }

    if (!validateForm()) return;

    setIsSubmitting(true);
    setError("");

    try {
      // Prepare the contract call
      const transaction = prepareContractCall({
        contract: genkiFiCoreContract,
        method: "createCircle",
        params: [
          formData.name.trim(),
          formData.tags,
          BigInt(formData.minInvestment)
        ]
      });

      // Send the transaction
      sendTx(transaction, {
        onSuccess: (result) => {
          console.log("Circle created successfully:", result);
          onSuccess(result.transactionHash);
          onClose();
          // Reset form
          setFormData({
            name: "",
            tags: [],
            minInvestment: MIN_INVESTMENT_USDC,
          });
        },
        onError: (error) => {
          console.error("Error creating circle:", error);
          setError(error.message || "Failed to create circle");
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Investment Circle"
      size="lg"
    >
      <div className="space-y-6">
        {/* Circle Name */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Circle Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="Enter circle name..."
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-genki-green focus:border-transparent"
            maxLength={50}
            disabled={isSubmitting}
          />
          <p className="text-xs text-white/60 mt-1">
            {formData.name.length}/50 characters
          </p>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-3">
            Tags * (Select 1-{MAX_TAGS})
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {AVAILABLE_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagToggle(tag)}
                disabled={isSubmitting}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${formData.tags.includes(tag)
                    ? "bg-genki-green text-white shadow-lg"
                    : "bg-white/10 text-white/70 hover:bg-white/20 border border-white/20"
                  }
                  ${isSubmitting ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                `}
              >
                <Tag className="w-4 h-4" />
                {tag}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-white/60">
              Selected: {formData.tags.length}/{MAX_TAGS}
            </p>
            {formData.tags.length > 0 && (
              <button
                type="button"
                onClick={() => handleInputChange("tags", [])}
                className="text-xs text-genki-green hover:text-genki-green/80 transition-colors"
                disabled={isSubmitting}
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Selected Tags Display */}
        {formData.tags.length > 0 && (
          <div>
            <p className="text-sm font-medium text-white/80 mb-2">Selected Tags:</p>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-genki-green/20 text-genki-green rounded-full text-sm border border-genki-green/30"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleTagToggle(tag)}
                    className="hover:text-genki-green/80 transition-colors"
                    disabled={isSubmitting}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Minimum Investment */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Minimum Investment (cUSD) *
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="number"
              value={formData.minInvestment / 1000000}
              onChange={(e) => handleInputChange("minInvestment", Math.max(MIN_INVESTMENT_USDC, parseInt(e.target.value) * 1000000))}
              placeholder="1.00"
              min={MIN_INVESTMENT_USDC / 1000000}
              step="0.01"
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-genki-green focus:border-transparent"
              disabled={isSubmitting}
            />
          </div>
          <p className="text-xs text-white/60 mt-1">
            Minimum: ${MIN_INVESTMENT_USDC / 1000000} cUSD
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* XP Reward Info */}
        <div className="p-4 bg-genki-green/10 border border-genki-green/20 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Plus className="w-5 h-5 text-genki-green" />
            <h3 className="text-genki-green font-semibold">XP Reward</h3>
          </div>
          <p className="text-white/80 text-sm">
            You&apos;ll earn <span className="text-genki-green font-semibold">50 XP</span> for creating this circle!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleClose}
            variant="outline"
            className="flex-1"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1 bg-gradient-primary hover:bg-gradient-primary/90"
            disabled={isSubmitting || !formData.name.trim() || formData.tags.length === 0}
            loading={isSubmitting}
          >
            {isSubmitting ? "Creating Circle..." : "Create Circle"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
