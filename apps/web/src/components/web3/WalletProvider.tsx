"use client";

import { ThirdwebProvider } from "thirdweb/react";
import { client } from "@/lib/thirdweb/client";

interface WalletProviderProps {
  children: React.ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  return (
    <ThirdwebProvider>
      {children}
    </ThirdwebProvider>
  );
}
