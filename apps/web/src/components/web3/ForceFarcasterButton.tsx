"use client";

import { FarcasterOnlyButton } from "./FarcasterOnlyButton";
import { useEffect, useState } from "react";

interface ForceFarcasterButtonProps {
  className?: string;
  size?: "default" | "sm" | "lg" | "xl";
  variant?: "default" | "secondary" | "accent" | "outline";
  onSuccess?: () => void;
}

export function ForceFarcasterButton({ 
  className,
  size = "lg",
  variant = "default",
  onSuccess
}: ForceFarcasterButtonProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    if (typeof window !== 'undefined') {
      console.log("🔍 ForceFarcasterButton - Environment Check:", {
        userAgent: navigator.userAgent,
        windowFarcaster: (window as any).farcaster,
        windowLocation: window.location.href,
        isStandalone: window.navigator.standalone,
        displayMode: window.matchMedia('(display-mode: standalone)').matches
      });
    }
  }, []);

  if (!isClient) {
    return (
      <div className={`w-full h-12 bg-gray-200 animate-pulse rounded-xl ${className}`} />
    );
  }

  console.log("🚀 ForceFarcasterButton - Always using Farcaster");
  
  return (
    <FarcasterOnlyButton 
      className={className}
      size={size}
      variant={variant}
      onSuccess={onSuccess}
    />
  );
}
