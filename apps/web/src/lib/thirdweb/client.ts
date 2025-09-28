import { createThirdwebClient } from "thirdweb";
import { celo } from "thirdweb/chains";

// Thirdweb client configuration
export const client = createThirdwebClient({
  clientId: "c32dfba51fb18c067febf5989d042513",
});

// Celo Alfajores testnet configuration
export const celoAlfajores = {
  id: 44787,
  name: "Celo Alfajores",
  nativeCurrency: {
    name: "Celo",
    symbol: "CELO",
    decimals: 18,
  },
  rpc: "https://alfajores-forno.celo-testnet.org",
  testnet: true,
} as const;

// Use official thirdweb chain configurations
export const celoMainnet = celo;
export { celo };
export const defaultChain = celo;
