import { createThirdwebClient } from "thirdweb";
import { celo, celoAlfajores } from "thirdweb/chains";

// Thirdweb client configuration
export const client = createThirdwebClient({
  clientId: "c32dfba51fb18c067febf5989d042513",
});

// Use official thirdweb chain configurations
export const celoMainnet = celo;
export { celo };
export const defaultChain = celo;
