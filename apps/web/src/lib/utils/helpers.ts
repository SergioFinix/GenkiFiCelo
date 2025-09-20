import { UI_CONFIG } from "./constants";

// Utility functions for GenkiFi

/**
 * Calculate user level based on XP
 */
export function calculateLevel(xp: number): { level: number; name: string; progress: number } {
  const levels = Object.entries(UI_CONFIG.LEVELS).sort(([, a], [, b]) => b.xp - a.xp);
  
  for (const [levelStr, levelData] of levels) {
    if (xp >= levelData.xp) {
      const currentLevel = parseInt(levelStr);
      const nextLevel = levels.find(([l]) => parseInt(l) === currentLevel + 1);
      const nextLevelXP = nextLevel ? nextLevel[1].xp : currentLevel * 1000;
      
      return {
        level: currentLevel,
        name: levelData.name,
        progress: Math.min((xp - levelData.xp) / (nextLevelXP - levelData.xp), 1),
      };
    }
  }
  
  return {
    level: 1,
    name: "Novice",
    progress: 0,
  };
}

/**
 * Format currency values
 */
export function formatCurrency(amount: number | string, currency: string = "cUSD"): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  
  if (num >= 1000000) {
    return `$${(num / 1000000).toFixed(1)}M ${currency}`;
  } else if (num >= 1000) {
    return `$${(num / 1000).toFixed(1)}K ${currency}`;
  } else {
    return `$${num.toFixed(2)} ${currency}`;
  }
}

/**
 * Format percentage values
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Generate random circle colors
 */
export function generateCircleColor(): string {
  const colors = [
    "bg-gradient-to-br from-green-400 to-blue-500",
    "bg-gradient-to-br from-purple-400 to-pink-500",
    "bg-gradient-to-br from-yellow-400 to-orange-500",
    "bg-gradient-to-br from-blue-400 to-cyan-500",
    "bg-gradient-to-br from-pink-400 to-rose-500",
    "bg-gradient-to-br from-indigo-400 to-purple-500",
  ];
  
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Format wallet address for display
 */
export function formatAddress(address: string, chars: number = 6): string {
  if (!address) return "";
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Calculate time until next workout reset
 */
export function getTimeUntilReset(): { hours: number; minutes: number; seconds: number } {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  const diff = tomorrow.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return { hours, minutes, seconds };
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Generate invite code
 */
export function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
