"use client";

import { FarcasterOnlyButton } from "./FarcasterOnlyButton";
import { AuthConnectButton } from "./AuthConnectButton";
import { useEffect, useState } from "react";

interface SmartConnectButtonProps {
  className?: string;
  size?: "default" | "sm" | "lg" | "xl";
  variant?: "default" | "secondary" | "accent" | "outline";
  onSuccess?: () => void;
}

export function SmartConnectButton({ 
  className,
  size = "lg",
  variant = "default",
  onSuccess
}: SmartConnectButtonProps) {
  const [isClient, setIsClient] = useState(false);
  const [isFarcaster, setIsFarcaster] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    if (typeof window !== 'undefined') {
      // Detectar Farcaster
      const farcasterDetected = !!(window as any).farcaster;
      
      // Detectar móvil
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      
      // Detectar si es una PWA o app nativa
      const isInApp = (navigator as any).standalone || window.matchMedia('(display-mode: standalone)').matches;
      
      console.log("🔍 Smart Detection:", {
        userAgent,
        farcasterDetected,
        isMobileDevice,
        isInApp,
        windowFarcaster: (window as any).farcaster,
        windowLocation: window.location.href
      });
      
      setIsFarcaster(farcasterDetected);
      setIsMobile(isMobileDevice || isInApp);
    }
  }, []);

  // Evitar problemas de hidratación
  if (!isClient) {
    return (
      <div className={`w-full h-12 bg-gray-200 animate-pulse rounded-xl ${className}`} />
    );
  }

  // Si estamos en Farcaster O en móvil, usar Farcaster
  if (isFarcaster || isMobile) {
    console.log("📱🚀 Using FarcasterOnlyButton - Farcaster:", isFarcaster, "Mobile:", isMobile);
    return (
      <FarcasterOnlyButton 
        className={className}
        size={size}
        variant={variant}
        onSuccess={onSuccess}
      />
    );
  }

  // En web desktop, usar Thirdweb
  console.log("💻 Using AuthConnectButton for desktop web");
  return (
    <AuthConnectButton 
      className={className}
      size={size}
      variant={variant}
    />
  );
}
