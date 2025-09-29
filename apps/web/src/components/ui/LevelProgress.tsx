"use client";

import { calculateLevel } from "@/lib/utils/helpers";
import { UI_CONFIG } from "@/lib/utils/constants";
import { useEffect, useState } from "react";

interface LevelProgressProps {
  xp: number;
  className?: string;
  showNextLevel?: boolean;
  showXP?: boolean;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}

export function LevelProgress({
  xp,
  className = "",
  showNextLevel = true,
  showXP = true,
  size = "md",
  animated = true
}: LevelProgressProps) {
  const [displayXP, setDisplayXP] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const levelData = calculateLevel(xp);
  const nextLevel = levelData.level < 5 ? levelData.level + 1 : levelData.level;
  const nextLevelXP = UI_CONFIG.LEVELS[nextLevel as keyof typeof UI_CONFIG.LEVELS]?.xp || levelData.level * 1000;
  const currentLevelXP = UI_CONFIG.LEVELS[levelData.level as keyof typeof UI_CONFIG.LEVELS]?.xp || 0;
  const xpNeeded = nextLevelXP - currentLevelXP;
  const xpProgress = xp - currentLevelXP;
  const progressPercentage = Math.min((xpProgress / xpNeeded) * 100, 100);

  // Animate XP counter
  useEffect(() => {
    if (animated) {
      setIsAnimating(true);
      const duration = 1000; // 1 second
      const steps = 60;
      const stepDuration = duration / steps;
      const stepSize = xp / steps;
      
      let currentStep = 0;
      const interval = setInterval(() => {
        currentStep++;
        setDisplayXP(Math.min(stepSize * currentStep, xp));
        
        if (currentStep >= steps) {
          clearInterval(interval);
          setIsAnimating(false);
        }
      }, stepDuration);
      
      return () => clearInterval(interval);
    } else {
      setDisplayXP(xp);
    }
  }, [xp, animated]);

  const sizeClasses = {
    sm: "h-2",
    md: "h-3",
    lg: "h-4"
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  };

  const levelColors = {
    1: "from-gray-400 to-gray-600",
    2: "from-green-400 to-green-600",
    3: "from-blue-400 to-blue-600",
    4: "from-purple-400 to-purple-600",
    5: "from-yellow-400 to-yellow-600",
  };

  const levelEmojis = {
    1: "🌱",
    2: "🌿",
    3: "🌳",
    4: "🏆",
    5: "👑",
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Level Info */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{levelEmojis[levelData.level as keyof typeof levelEmojis] || "🌱"}</span>
          <div>
            <div className={`font-semibold ${textSizeClasses[size]} text-gray-900`}>
              Level {levelData.level} - {levelData.name}
            </div>
            {showXP && (
              <div className={`${textSizeClasses[size]} text-gray-600`}>
                {displayXP.toLocaleString()} XP
              </div>
            )}
          </div>
        </div>
        
        {showNextLevel && levelData.level < 5 && (
          <div className="text-right">
            <div className={`${textSizeClasses[size]} text-gray-600`}>
              Next: Level {nextLevel}
            </div>
            <div className={`${textSizeClasses[size]} text-gray-500`}>
              {Math.max(0, nextLevelXP - xp).toLocaleString()} XP needed
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className={`relative ${sizeClasses[size]} bg-gray-200 rounded-full overflow-hidden`}>
        <div
          className={`absolute top-0 left-0 h-full bg-gradient-to-r ${levelColors[levelData.level as keyof typeof levelColors] || "from-gray-400 to-gray-600"} rounded-full transition-all duration-1000 ease-out ${
            isAnimating ? "animate-pulse" : ""
          }`}
          style={{ width: `${progressPercentage}%` }}
        />
        
        {/* Progress percentage text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`${textSizeClasses[size]} font-medium text-white drop-shadow-sm`}>
            {progressPercentage.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* XP Progress Details */}
      {showNextLevel && levelData.level < 5 && (
        <div className="flex justify-between items-center mt-2">
          <span className={`${textSizeClasses[size]} text-gray-500`}>
            {xpProgress.toLocaleString()} / {xpNeeded.toLocaleString()} XP
          </span>
          <span className={`${textSizeClasses[size]} text-gray-500`}>
            {Math.round(progressPercentage)}% complete
          </span>
        </div>
      )}

      {/* Max Level Badge */}
      {levelData.level >= 5 && (
        <div className="mt-2 text-center">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-yellow-400 to-yellow-600 text-white">
            🏆 Max Level Achieved!
          </span>
        </div>
      )}
    </div>
  );
}

// Compact version for smaller spaces
export function CompactLevelProgress({
  xp,
  className = "",
  showXP = true
}: Omit<LevelProgressProps, 'showNextLevel' | 'size' | 'animated'>) {
  const levelData = calculateLevel(xp);
  const levelEmojis = {
    1: "🌱",
    2: "🌿", 
    3: "🌳",
    4: "🏆",
    5: "👑",
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-lg">{levelEmojis[levelData.level as keyof typeof levelEmojis] || "🌱"}</span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900 truncate">
          L{levelData.level} {levelData.name}
        </div>
        {showXP && (
          <div className="text-xs text-gray-600">
            {xp.toLocaleString()} XP
          </div>
        )}
      </div>
      <div className="text-xs text-gray-500">
        {Math.round(levelData.progress * 100)}%
      </div>
    </div>
  );
}

// Level badge component
export function LevelBadge({
  xp,
  className = ""
}: {
  xp: number;
  className?: string;
}) {
  const levelData = calculateLevel(xp);
  const levelEmojis = {
    1: "🌱",
    2: "🌿",
    3: "🌳", 
    4: "🏆",
    5: "👑",
  };

  const levelColors = {
    1: "bg-gray-100 text-gray-800",
    2: "bg-green-100 text-green-800",
    3: "bg-blue-100 text-blue-800",
    4: "bg-purple-100 text-purple-800",
    5: "bg-yellow-100 text-yellow-800",
  };

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${levelColors[levelData.level as keyof typeof levelColors] || "bg-gray-100 text-gray-800"} ${className}`}>
      <span>{levelEmojis[levelData.level as keyof typeof levelEmojis] || "🌱"}</span>
      <span>L{levelData.level}</span>
    </div>
  );
}
