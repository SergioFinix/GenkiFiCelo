"use client";

import { ConnectButton } from "thirdweb/react";
import { Button } from "@/components/ui/Button";
import { inAppWallet, createWallet } from "thirdweb/wallets";
import { celo, client } from "@/lib/thirdweb/client";
import { useMiniApp } from "@/contexts/miniapp-context";
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

// Configuración para móvil (solo Farcaster)
const mobileWallets = [
  inAppWallet({
    auth: {
      options: ["farcaster"],
    },
  }),
];

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
}

// Componente para autenticación móvil nativa
function MobileFarcasterAuth({ className, size, variant }: ConnectWalletProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  
  const { context, isMiniAppReady } = useMiniApp();

  // Verificar si ya está autenticado
  useEffect(() => {
    if (context?.user && isMiniAppReady) {
      setIsAuthenticated(true);
      setUserInfo(context.user);
      console.log("User already authenticated via Farcaster:", context.user);
    }
  }, [context, isMiniAppReady]);

  const handleConnect = async () => {
    if (isAuthenticated) {
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Verificar si estamos en un entorno de Farcaster
      if (typeof window !== 'undefined' && (window as any).farcaster) {
        console.log("Farcaster environment detected");
        
        // En un entorno de Farcaster real, el usuario ya debería estar autenticado
        if (!context?.user) {
          throw new Error("Please refresh the page or reopen from Farcaster");
        }
        
        setIsAuthenticated(true);
        setUserInfo(context.user);
        
      } else {
        // Si no estamos en Farcaster, redirigir
        console.log("Not in Farcaster environment, redirecting...");
        window.open("https://warpcast.com/~/settings/connected-apps", "_blank");
        throw new Error("Please open this app from Farcaster to connect");
      }
      
    } catch (error) {
      console.error("Farcaster authentication error:", error);
      setError(error instanceof Error ? error.message : "Authentication failed");
    } finally {
      setIsConnecting(false);
    }
  };

  // Si hay error, mostrarlo
  if (error) {
    return (
      <Button
        onClick={handleConnect}
        size={size}
        variant="destructive"
        className={`w-full ${className}`}
      >
        {error} - Tap to retry
      </Button>
    );
  }

  // Si estamos autenticados
  if (isAuthenticated && userInfo) {
    return (
      <Button
        disabled={true}
        size={size}
        variant="secondary"
        className={`w-full ${className}`}
      >
        Connected as {userInfo.username || userInfo.displayName || 'Farcaster User'}
      </Button>
    );
  }

  return (
    <Button
      onClick={handleConnect}
      disabled={isConnecting}
      size={size}
      variant={variant}
      className={`w-full ${className}`}
    >
      {isConnecting ? "Connecting..." : "Connect with Farcaster"}
    </Button>
  );
}

export function ConnectWalletButton({ 
  className,
  size = "lg",
  variant = "default"
}: ConnectWalletProps) {
  const { isMobile, isClient } = useIsMobile();

  // Evitar problemas de hidratación
  if (!isClient) {
    return (
      <div className={`w-full h-12 bg-gray-200 animate-pulse rounded-xl ${className}`} />
    );
  }

  // En móvil, usar autenticación nativa de Farcaster
  if (isMobile) {
    return (
      <MobileFarcasterAuth 
        className={className}
        size={size}
        variant={variant}
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