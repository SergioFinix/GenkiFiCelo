"use client";

import { useDisconnect, useActiveWallet } from "thirdweb/react";
import { Button } from "@/components/ui/Button";
import { LogOut } from "lucide-react";

interface DisconnectWalletProps {
  className?: string;
  size?: "default" | "sm" | "lg" | "xl";
  variant?: "default" | "secondary" | "accent" | "outline" | "ghost" | "destructive";
  children?: React.ReactNode;
  onDisconnect?: () => void;
}

export function DisconnectWalletButton({ 
  className,
  size = "default",
  variant = "outline",
  children = "Disconnect Wallet",
  onDisconnect
}: DisconnectWalletProps) {
  const wallet = useActiveWallet();
  const { disconnect } = useDisconnect();

  const handleDisconnect = async () => {
    if (!wallet) {
      console.error("No wallet to disconnect");
      return;
    }
    
    try {
      await disconnect(wallet);
      if (onDisconnect) {
        onDisconnect();
      }
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
    }
  };

  return (
    <Button
      onClick={handleDisconnect}
      disabled={!wallet}
      variant={variant}
      size={size}
      className={`flex items-center gap-2 ${className}`}
    >
      <LogOut className="h-4 w-4" />
      {children}
    </Button>
  );
}

// Versión simplificada para uso en navbar
export function DisconnectButton({ className }: { className?: string }) {
  const wallet = useActiveWallet();
  const { disconnect } = useDisconnect();

  const handleDisconnect = async () => {
    if (!wallet) {
      console.error("No wallet to disconnect");
      return;
    }
    
    try {
      await disconnect(wallet);
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
    }
  };

  return (
    <Button
      onClick={handleDisconnect}
      disabled={!wallet}
      variant="ghost"
      size="sm"
      className={`text-white/60 hover:text-white hover:bg-white/10 ${className}`}
      title="Disconnect Wallet"
    >
      <LogOut className="h-4 w-4" />
    </Button>
  );
}
