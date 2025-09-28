// GenkiFi Constants
export const APP_CONFIG = {
  NAME: "GenkiFi",
  TAGLINE: "Where friends level up together",
  DESCRIPTION: "La primera plataforma de DeFi social gamificada. Forma círculos con amigos, gana yields reales, y sube de nivel juntos.",
  VERSION: "1.0.0",
} as const;

// UI Constants
export const UI_CONFIG = {
  MAX_CIRCLE_SIZE: 12,
  MIN_CIRCLE_SIZE: 8,
  DAILY_WORKOUTS: 3,
  XP_PER_WORKOUT: 100,
  LEVELS: {
    1: { xp: 0, name: "Novice" },
    2: { xp: 500, name: "Apprentice" },
    3: { xp: 1500, name: "Investor" },
    4: { xp: 3500, name: "Strategist" },
    5: { xp: 7000, name: "Master" },
  },
} as const;

// Network Constants
export const NETWORK_CONFIG = {
  CELO_MAINNET: {
    chainId: 42220,
    name: "Celo",
    currency: "CELO",
    testnet: false,
  },
  CELO_ALFAJORES: {
    chainId: 44787,
    name: "Celo Alfajores",
    currency: "CELO",
    testnet: true,
  },
  CELO_SEPOLIA: {
    chainId: 11142220,
    name: "Celo Sepolia",
    currency: "CELO",
    testnet: true,
  },
} as const;

// Achievement Constants
export const ACHIEVEMENTS = {
  FIRST_DEPOSIT: {
    id: "first_deposit",
    name: "First Deposit",
    description: "Make your first deposit to a circle",
    xp: 50,
    icon: "💰",
  },
  CIRCLE_LEADER: {
    id: "circle_leader",
    name: "Circle Leader",
    description: "Create your first investment circle",
    xp: 100,
    icon: "👑",
  },
  DAILY_MASTER: {
    id: "daily_master",
    name: "Daily Master",
    description: "Complete 7 daily workouts in a row",
    xp: 200,
    icon: "🔥",
  },
  YIELD_HUNTER: {
    id: "yield_hunter",
    name: "Yield Hunter",
    description: "Earn your first yield from DeFi protocols",
    xp: 150,
    icon: "📈",
  },
} as const;
