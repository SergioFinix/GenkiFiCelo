"use client";

import { Button } from "@/components/ui/Button";
import { useMiniApp } from "@/contexts/miniapp-context";
import { useEffect, useState } from "react";

interface FarcasterOnlyButtonProps {
  className?: string;
  size?: "default" | "sm" | "lg" | "xl";
  variant?: "default" | "secondary" | "accent" | "outline";
  onSuccess?: () => void;
}

export function FarcasterOnlyButton({ 
  className,
  size = "lg",
  variant = "default",
  onSuccess
}: FarcasterOnlyButtonProps) {
  const [isClient, setIsClient] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  
  const { context, isMiniAppReady } = useMiniApp();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Verificar si ya está autenticado
  useEffect(() => {
    if (context?.user && isMiniAppReady) {
      setIsAuthenticated(true);
      setUserInfo(context.user);
      console.log("✅ User already authenticated via Farcaster:", context.user);
      onSuccess?.();
    }
  }, [context, isMiniAppReady, onSuccess]);

  const handleConnect = async () => {
    if (isAuthenticated) {
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      console.log("🔍 Checking Farcaster environment...");
      console.log("Context:", context);
      console.log("isMiniAppReady:", isMiniAppReady);
      console.log("Window.farcaster:", (window as any).farcaster);
      
      // Verificar si estamos en un entorno de Farcaster
      if (typeof window !== 'undefined' && (window as any).farcaster) {
        console.log("✅ Farcaster environment detected");
        
        // En un entorno de Farcaster real, el usuario ya debería estar autenticado
        if (!context?.user) {
          console.log("❌ No user context found, asking to refresh");
          throw new Error("Please refresh the page or reopen from Farcaster");
        }
        
        console.log("✅ User context found:", context.user);
        setIsAuthenticated(true);
        setUserInfo(context.user);
        onSuccess?.();
        
      } else {
        // Si no estamos en Farcaster, redirigir
        console.log("❌ Not in Farcaster environment, redirecting...");
        window.open("https://warpcast.com/~/settings/connected-apps", "_blank");
        throw new Error("Please open this app from Farcaster to connect");
      }
      
    } catch (error) {
      console.error("❌ Farcaster authentication error:", error);
      setError(error instanceof Error ? error.message : "Authentication failed");
    } finally {
      setIsConnecting(false);
    }
  };

  // Evitar problemas de hidratación
  if (!isClient) {
    return (
      <div className={`w-full h-12 bg-gray-200 animate-pulse rounded-xl ${className}`} />
    );
  }

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
        ✅ Connected as {userInfo.username || userInfo.displayName || 'Farcaster User'}
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
      {isConnecting ? "🔄 Connecting..." : "🚀 Connect with Farcaster"}
    </Button>
  );
}
