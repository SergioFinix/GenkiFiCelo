"use client";

import { ConnectButton } from "thirdweb/react";
import { Button } from "@/components/ui/Button";
import { inAppWallet, createWallet } from "thirdweb/wallets";
import { celoAlfajores, client } from "@/lib/thirdweb/client";

// Custom wallet configurations
const wallets = [
  inAppWallet({
    auth: {
      options: [
        "google",
        "discord",
        "telegram",
        "farcaster",
        "email",
        "x",
        "passkey",
        "phone",
      ],
    },
  }),
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("me.rainbow"),
  createWallet("com.trustwallet.app"),
  createWallet("io.rabby"),
  createWallet("io.zerion.wallet"),
];

interface ConnectWalletProps {
  className?: string;
  size?: "default" | "sm" | "lg" | "xl";
  variant?: "default" | "secondary" | "accent" | "outline";
}

export function ConnectWalletButton({ 
  className,
  size = "lg",
  variant = "default"
}: ConnectWalletProps) {
  return (
    <ConnectButton
      client={client}
      chain={celoAlfajores}
      wallets={wallets}
      connectButton={{
        label: "Connect Wallet",
        className: "w-full",
      }}
      connectModal={{
        size: "compact",
        title: "Connect to GenkiFi",
        titleIcon: "",
        showThirdwebBranding: false,
      }}
    />
  );
}

// Custom styled connect button component
interface CustomConnectButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export function CustomConnectButton({ 
  className,
  children = "Connect Wallet"
}: CustomConnectButtonProps) {
  return (
    <ConnectButton
      client={client}
      chain={celoAlfajores}
      wallets={wallets}
      connectButton={{
        label: children,
        className: `w-full h-12 px-6 py-3 bg-gradient-primary text-white rounded-xl font-medium transition-all duration-200 hover:shadow-glow-green hover:scale-105 active:scale-95 ${className}`,
      }}
      connectModal={{
        size: "compact",
        title: "Connect to GenkiFi",
        titleIcon: "",
        showThirdwebBranding: false,
      }}
    />
  );
}
