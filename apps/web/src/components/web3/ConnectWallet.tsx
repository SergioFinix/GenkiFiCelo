"use client";

import { ConnectButton } from "thirdweb/react";
import { Button } from "@/components/ui/Button";
import { inAppWallet, createWallet } from "thirdweb/wallets";
import { celo, client } from "@/lib/thirdweb/client";
import { useMiniApp } from "@/contexts/miniapp-context";
import { useEffect, useState } from "react";

// Custom wallet configurations for web
const webWallets = [
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

// Farcaster-only wallet for mobile
const farcasterWallets = [
  inAppWallet({
    auth: {
      options: ["farcaster"], // Solo Farcaster para móvil
    },
  }),
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
  const [isClient, setIsClient] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isFarcasterEnv, setIsFarcasterEnv] = useState(false);
  
  const { context, isMiniAppReady } = useMiniApp();

  useEffect(() => {
    setIsClient(true);
    
    if (typeof window !== 'undefined') {
      // Detectar si es móvil
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      setIsMobile(isMobileDevice);
      
      // Detectar si está en Farcaster
      const isInFarcaster = window.location.href.includes('farcaster') || 
                           window.location.href.includes('warpcast') ||
                           (window as any).farcaster ||
                           context?.client ||
                           isMiniAppReady;
      setIsFarcasterEnv(isInFarcaster);
      
      console.log("Environment detection:", {
        isMobile: isMobileDevice,
        isFarcaster: isInFarcaster,
        userAgent: userAgent,
        url: window.location.href,
        context: !!context
      });
    }
  }, [context, isMiniAppReady]);

  // Evitar problemas de hidratación
  if (!isClient) {
    return (
      <div className={`w-full h-12 bg-gray-200 animate-pulse rounded-xl ${className}`} />
    );
  }

  // Si estamos en móvil Y en Farcaster, usar solo Farcaster
  if (isMobile && isFarcasterEnv) {
    return (
      <ConnectButton
        client={client}
        chain={celo}
        wallets={farcasterWallets}
        connectButton={{
          label: "Connect with Farcaster",
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

  // Si estamos en web, usar todas las opciones de wallet
  return (
    <ConnectButton
      client={client}
      chain={celo}
      wallets={webWallets}
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
      chain={celo}
      wallets={webWallets}
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