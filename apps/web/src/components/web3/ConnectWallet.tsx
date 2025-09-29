"use client";

import { ConnectButton } from "thirdweb/react";
import { Button } from "@/components/ui/Button";
import { inAppWallet, createWallet } from "thirdweb/wallets";
import { celo, client } from "@/lib/thirdweb/client";
import { FarcasterOnlyButton } from "./FarcasterOnlyButton";
import { useEffect, useState } from "react";

// Detección simple de móvil
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      setIsMobile(isMobileDevice);
    }
  }, []);

  return { isMobile, isClient };
}

// Configuración para web (todas las opciones)
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

interface ConnectWalletProps {
  className?: string;
  size?: "default" | "sm" | "lg" | "xl";
  variant?: "default" | "secondary" | "accent" | "outline";
  onSuccess?: () => void;
}

export function ConnectWalletButton({ 
  className,
  size = "lg",
  variant = "default",
  onSuccess
}: ConnectWalletProps) {
  const { isMobile, isClient } = useIsMobile();

  // Evitar problemas de hidratación
  if (!isClient) {
    return (
      <div className={`w-full h-12 bg-gray-200 animate-pulse rounded-xl ${className}`} />
    );
  }

  // En móvil, usar botón de Farcaster independiente
  if (isMobile) {
    return (
      <FarcasterOnlyButton 
        className={className}
        size={size}
        variant={variant}
        onSuccess={onSuccess}
      />
    );
  }

  // En web, usar Thirdweb con todas las opciones
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