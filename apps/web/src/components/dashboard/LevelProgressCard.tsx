"use client";

import { LevelProgress, CompactLevelProgress, LevelBadge } from "@/components/ui/LevelProgress";
import { useUserXP } from "@/hooks/useUserXP";
import { Card } from "@/components/ui/Card";

export function LevelProgressCard() {
  const { xp, level, nextLevelXP, isLoading, error } = useUserXP();

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <div className="text-6xl mb-4">🌱</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Start Your Journey!
          </h3>
          <p className="text-gray-600 mb-4">
            {error}
          </p>
          <div className="text-sm text-gray-500">
            Create or join an investment circle to begin earning XP and leveling up!
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Main Level Progress */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Your Progress
          </h3>
          <LevelProgress 
            xp={xp}
            showNextLevel={true}
            showXP={true}
            size="lg"
            animated={true}
          />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{xp.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total XP</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">L{level}</div>
            <div className="text-sm text-gray-600">Current Level</div>
          </div>
        </div>

        {/* Next Level Progress */}
        {level < 5 && (
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Progress to Level {level + 1}
              </span>
              <LevelBadge xp={xp} />
            </div>
            <CompactLevelProgress 
              xp={xp}
              showXP={false}
            />
          </div>
        )}

        {/* Level Benefits */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Level Benefits
          </h4>
          <div className="text-xs text-gray-600 space-y-1">
            {level >= 1 && <div>✅ Access to investment circles</div>}
            {level >= 2 && <div>✅ Create your own circles</div>}
            {level >= 3 && <div>✅ Advanced analytics</div>}
            {level >= 4 && <div>✅ Priority support</div>}
            {level >= 5 && <div>✅ VIP features & exclusive circles</div>}
          </div>
        </div>
      </div>
    </Card>
  );
}

// Compact version for sidebar or smaller spaces
export function CompactLevelCard() {
  const { xp, level, isLoading, error } = useUserXP();

  if (isLoading) {
    return (
      <div className="p-4 bg-white rounded-lg border border-gray-200">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-white rounded-lg border border-gray-200">
        <div className="text-center">
          <div className="text-2xl mb-2">🌱</div>
          <div className="text-sm text-gray-600 mb-1">Start Your Journey!</div>
          <div className="text-xs text-gray-500">Join a circle to earn XP</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">Level Progress</h3>
          <LevelBadge xp={xp} />
        </div>
        
        <CompactLevelProgress 
          xp={xp}
          showXP={true}
        />
        
        <div className="text-xs text-gray-500">
          Keep investing to level up!
        </div>
      </div>
    </div>
  );
}
