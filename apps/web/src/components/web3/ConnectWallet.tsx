"use client";

import { AuthConnectButton } from "./AuthConnectButton";
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

  // En web, usar Auth de Thirdweb
  return (
    <AuthConnectButton 
      className={className}
      size={size}
      variant={variant}
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
    <AuthConnectButton 
      className={className}
    />
  );
}