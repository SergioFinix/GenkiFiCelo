"use client";

import { useState, useEffect } from "react";
import { useActiveAccount } from "thirdweb/react";

interface UserXPData {
  xp: number;
  level: number;
  nextLevelXP: number;
  isLoading: boolean;
  error: string | null;
}

// Mock data for development - simula datos reales del contrato
export function useUserXPMock(): UserXPData {
  const [xpData, setXpData] = useState<UserXPData>({
    xp: 0,
    level: 1,
    nextLevelXP: 500,
    isLoading: true,
    error: null,
  });

  const account = useActiveAccount();

  useEffect(() => {
    async function simulateContractCall() {
      if (!account?.address) {
        setXpData(prev => ({ ...prev, isLoading: false }));
        return;
      }

      // Simular delay de llamada al contrato
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log("🎭 Using mock XP data for development");
      console.log("🔍 Simulating contract call for address:", account.address);

      // Simular diferentes niveles de XP basados en la dirección
      const addressHash = account.address.slice(-4);
      const hashNumber = parseInt(addressHash, 16);
      
      // Generar XP basado en el hash de la dirección para consistencia
      const baseXP = (hashNumber % 5) * 1000 + 500; // 500-4500 XP
      const level = Math.floor(baseXP / 1000) + 1;
      const nextLevelXP = (level * 1000) + 1000;

      setXpData({
        xp: baseXP,
        level: Math.min(level, 5),
        nextLevelXP: Math.min(nextLevelXP, 7000),
        isLoading: false,
        error: null,
      });

      console.log("✅ Mock XP data loaded:", {
        xp: baseXP,
        level: Math.min(level, 5),
        nextLevelXP: Math.min(nextLevelXP, 7000)
      });
    }

    simulateContractCall();
  }, [account?.address]);

  return xpData;
}

// Versión que simula actualizaciones de XP en tiempo real
export function useUserXPLive(): UserXPData {
  const [xpData, setXpData] = useState<UserXPData>({
    xp: 1250,
    level: 2,
    nextLevelXP: 3500,
    isLoading: false,
    error: null,
  });

  const account = useActiveAccount();

  useEffect(() => {
    if (!wallet?.address) {
      setXpData(prev => ({ ...prev, isLoading: false }));
      return;
    }

    // Simular actualizaciones de XP cada 10 segundos
    const interval = setInterval(() => {
      setXpData(prev => {
        const newXP = prev.xp + Math.floor(Math.random() * 50) + 10;
        const newLevel = Math.floor(newXP / 1000) + 1;
        const newNextLevelXP = (newLevel * 1000) + 1000;

        console.log("📈 XP updated:", { xp: newXP, level: newLevel });

        return {
          ...prev,
          xp: newXP,
          level: Math.min(newLevel, 5),
          nextLevelXP: Math.min(newNextLevelXP, 7000),
        };
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [account?.address]);

  return xpData;
}
