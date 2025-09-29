"use client";

import { AuthConnectButton } from "./AuthConnectButton";



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