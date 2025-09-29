"use client";

import { LevelProgress, CompactLevelProgress, LevelBadge } from "@/components/ui/LevelProgress";
import { Card } from "@/components/ui/Card";
import { useState } from "react";

export function LevelProgressExample() {
  const [xp, setXp] = useState(1250);

  const addXP = (amount: number) => {
    setXp(prev => prev + amount);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Level Progress Component
        </h1>
        <p className="text-gray-600">
          Interactive examples of the Level Progress component
        </p>
      </div>

      {/* XP Controls */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">XP Controls</h2>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => addXP(50)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            +50 XP
          </button>
          <button
            onClick={() => addXP(100)}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            +100 XP
          </button>
          <button
            onClick={() => addXP(500)}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
          >
            +500 XP
          </button>
          <button
            onClick={() => setXp(0)}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Reset
          </button>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          Current XP: <span className="font-mono font-bold">{xp.toLocaleString()}</span>
        </div>
      </Card>

      {/* Full Level Progress */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Full Level Progress</h2>
        <LevelProgress 
          xp={xp}
          showNextLevel={true}
          showXP={true}
          size="lg"
          animated={true}
        />
      </Card>

      {/* Different Sizes */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Different Sizes</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Small</h3>
            <LevelProgress 
              xp={xp}
              size="sm"
              showNextLevel={false}
            />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Medium</h3>
            <LevelProgress 
              xp={xp}
              size="md"
              showNextLevel={false}
            />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Large</h3>
            <LevelProgress 
              xp={xp}
              size="lg"
              showNextLevel={false}
            />
          </div>
        </div>
      </Card>

      {/* Compact Version */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Compact Version</h2>
        <div className="space-y-3">
          <CompactLevelProgress xp={xp} showXP={true} />
          <CompactLevelProgress xp={xp} showXP={false} />
        </div>
      </Card>

      {/* Level Badges */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Level Badges</h2>
        <div className="flex gap-2 flex-wrap">
          <LevelBadge xp={0} />
          <LevelBadge xp={500} />
          <LevelBadge xp={1500} />
          <LevelBadge xp={3500} />
          <LevelBadge xp={7000} />
        </div>
      </Card>

      {/* Different XP Levels */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Different XP Levels</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[0, 250, 750, 2000, 5000, 8000].map((testXP) => (
            <div key={testXP} className="p-4 border border-gray-200 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                {testXP.toLocaleString()} XP
              </h3>
              <LevelProgress 
                xp={testXP}
                size="sm"
                showNextLevel={false}
                animated={false}
              />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
