import { createThirdwebClient } from "thirdweb";
import { celo } from "thirdweb/chains";

// Create Thirdweb client
export const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "your-client-id-here",
});

// Export chains for use in components
export { celo };
