"use client";

import { MiniAppProvider } from "@/contexts/miniapp-context";
import FrameWalletProvider from "@/contexts/frame-wallet-context";
import { WalletProvider } from "@/components/web3/WalletProvider";
import dynamic from "next/dynamic";

const ErudaProvider = dynamic(
  () => import("../components/Eruda").then((c) => c.ErudaProvider),
  { ssr: false }
);

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErudaProvider>
      <FrameWalletProvider>
        <WalletProvider>
          <MiniAppProvider addMiniAppOnLoad={true}>{children}</MiniAppProvider>
        </WalletProvider>
      </FrameWalletProvider>
    </ErudaProvider>
  );
}
