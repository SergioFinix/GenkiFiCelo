import { createThirdwebClient } from "thirdweb";

// Thirdweb client configuration
export const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "your-client-id-here",
});

// Celo network configuration
export const celoMainnet = {
  id: 42220,
  name: "Celo",
  nativeCurrency: {
    name: "Celo",
    symbol: "CELO",
    decimals: 18,
  },
  rpc: "https://forno.celo.org",
  blockExplorers: [
    {
      name: "Celo Explorer",
      url: "https://celoscan.io",
    },
  ],
};

export const celoAlfajores = {
  id: 44787,
  name: "Celo Alfajores",
  nativeCurrency: {
    name: "Celo",
    symbol: "CELO",
    decimals: 18,
  },
  rpc: "https://alfajores-forno.celo-testnet.org",
  blockExplorers: [
    {
      name: "Celo Alfajores Explorer",
      url: "https://alfajores.celoscan.io",
    },
  ],
};

export const celoSepolia = {
  id: 11142220,
  name: "Celo Sepolia",
  nativeCurrency: {
    name: "Celo",
    symbol: "CELO",
    decimals: 18,
  },
  rpc: "https://forno.celo-sepolia.celo-testnet.org",
  blockExplorers: [
    {
      name: "Celo Sepolia Explorer",
      url: "https://celo-sepolia.blockscout.com",
    },
  ],
};

// Default chain (Mainnet for production)
export const defaultChain = celoMainnet;
