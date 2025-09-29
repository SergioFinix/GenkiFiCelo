"use client";

import { SmartConnectButton } from "./SmartConnectButton";



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
  return (
    <SmartConnectButton 
      className={className}
      size={size}
      variant={variant}
      onSuccess={onSuccess}
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
    <SmartConnectButton 
      className={className}
    />
  );
}