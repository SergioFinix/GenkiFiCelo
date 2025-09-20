import { getContract } from "thirdweb";
import { client, defaultChain } from "./client";

// Contract addresses - Update these with your deployed contract addresses
export const CONTRACT_ADDRESSES = {
  GENKIFI_CORE: "0x...", // Update with your GenkiFiCore contract address
  CUSD_TOKEN: "0x765DE816845861e75A25fCA122bb6898B8B1282a", // cUSD on Alfajores
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

// Contract ABI - This should match your GenkiFiCore.sol
export const GENKIFI_CORE_ABI = [
  // Add your contract ABI here
  {
    inputs: [],
    name: "getUserLevel",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  // Add more ABI entries as needed
] as const;
