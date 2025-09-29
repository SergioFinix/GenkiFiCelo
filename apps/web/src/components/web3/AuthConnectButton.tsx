"use client";

import { ConnectButton } from "thirdweb/react";
import { inAppWallet, createWallet } from "thirdweb/wallets";
import { celo, client } from "@/lib/thirdweb/client";
import { generatePayload, isLoggedIn, login, logout } from "@/lib/auth";
import { useEffect, useState } from "react";

// Configuración de wallets con Auth
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

interface AuthConnectButtonProps {
  className?: string;
  size?: "default" | "sm" | "lg" | "xl";
  variant?: "default" | "secondary" | "accent" | "outline";
}

export function AuthConnectButton({ 
  className,
  size = "lg",
  variant = "default"
}: AuthConnectButtonProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className={`w-full h-12 bg-gray-200 animate-pulse rounded-xl ${className}`} />
    );
  }

  return (
    <ConnectButton
      client={client}
      chain={celo}
      wallets={wallets}
      auth={{
        isLoggedIn: async (address) => {
          console.log("🔍 Checking if logged in for address:", address);
          return await isLoggedIn();
        },
        doLogin: async (params) => {
          console.log("🚀 Logging in with params:", params);
          await login(params);
        },
        getLoginPayload: async ({ address }) => {
          console.log("📝 Generating login payload for address:", address);
          return generatePayload({ address });
        },
        doLogout: async () => {
          console.log("👋 Logging out");
          await logout();
        },
      }}
      connectButton={{
        label: "Connect Wallet",
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
