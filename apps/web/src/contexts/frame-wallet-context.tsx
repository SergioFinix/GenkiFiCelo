"use client";

import { ReactNode } from "react";
import { ThirdwebProvider } from "thirdweb/react";

export default function FrameWalletProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ThirdwebProvider>
      {children}
    </ThirdwebProvider>
  );
}
