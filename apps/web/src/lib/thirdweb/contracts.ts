import { getContract } from "thirdweb";
import { client, defaultChain } from "./client";

// Contract addresses - Update these with your deployed contract addresses
export const CONTRACT_ADDRESSES = {
  GENKIFI_CORE: "0x2A9B75953b21A6DF8DAe458067a562f540551210", // GenkiFiCore deployed on Celo Mainnet
  CUSD_TOKEN: "0x765DE816845861e75A25fCA122bb6898B8B1282a", // cUSD on Celo Mainnet
} as const;

// Contract instances
export const genkiFiCoreContract = getContract({
  client,
  chain: defaultChain,
  address: CONTRACT_ADDRESSES.GENKIFI_CORE,
});

export const cusdTokenContract = getContract({
  client,
  chain: defaultChain,
  address: CONTRACT_ADDRESSES.CUSD_TOKEN,
});

// Helper function to check if contracts are deployed
export const isContractDeployed = (address: string): boolean => {
  return address !== "0x0000000000000000000000000000000000000000" && address !== "0x...";
};

// Contract deployment status
export const CONTRACT_STATUS = {
  GENKIFI_CORE_DEPLOYED: isContractDeployed(CONTRACT_ADDRESSES.GENKIFI_CORE),
  CUSD_TOKEN_DEPLOYED: isContractDeployed(CONTRACT_ADDRESSES.CUSD_TOKEN),
} as const;

// GenkiFiCore Contract ABI - Based on the smart contract
export const GENKIFI_CORE_ABI = [
  // View functions
  {
    inputs: [{ internalType: "address", name: "_user", type: "address" }],
    name: "getUserXP",
    outputs: [
      { internalType: "uint256", name: "xp", type: "uint256" },
      { internalType: "uint256", name: "level", type: "uint256" },
      { internalType: "uint256", name: "nextLevelXP", type: "uint256" }
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_circleId", type: "uint256" }],
    name: "getCircleInfo",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "id", type: "uint256" },
          { internalType: "string", name: "name", type: "string" },
          { internalType: "string[]", name: "tags", type: "string[]" },
          { internalType: "address", name: "creator", type: "address" },
          { internalType: "address[]", name: "members", type: "address[]" },
          { internalType: "uint256", name: "totalValue", type: "uint256" },
          { internalType: "uint256", name: "minInvestment", type: "uint256" },
          { internalType: "uint256", name: "createdAt", type: "uint256" },
          { internalType: "bool", name: "isActive", type: "bool" }
        ],
        internalType: "struct GenkiFiCore.Circle",
        name: "",
        type: "tuple"
      }
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_circleId", type: "uint256" }],
    name: "getCircleMembers",
    outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_user", type: "address" }],
    name: "getUserCircles",
    outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTotalCircles",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTotalUsers",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getContractBalance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  // Write functions
  {
    inputs: [
      { internalType: "string", name: "_name", type: "string" },
      { internalType: "string[]", name: "_tags", type: "string[]" },
      { internalType: "uint256", name: "_minInvestment", type: "uint256" }
    ],
    name: "createCircle",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_circleId", type: "uint256" },
      { internalType: "uint256", name: "_amount", type: "uint256" }
    ],
    name: "joinCircle",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "completeDailyWorkout",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  // Constants
  {
    inputs: [],
    name: "MIN_JOIN_AMOUNT",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "MAX_CIRCLE_MEMBERS",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "XP_CREATE_CIRCLE",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "XP_JOIN_CIRCLE",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "XP_DAILY_WORKOUT",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  }
] as const;
