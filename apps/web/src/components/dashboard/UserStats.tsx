"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserStats } from "@/components/web3/CircleContract";
import { formatCurrency, calculateLevel } from "@/lib/utils/helpers";
import { TrendingUp, Users, Trophy, Zap } from "lucide-react";

export function UserStats() {
  const { data: stats, isLoading, error } = useUserStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} variant="glass">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-white/20 rounded w-1/2" />
                <div className="h-8 bg-white/20 rounded w-3/4" />
                <div className="h-3 bg-white/20 rounded w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <Card variant="glass">
        <CardContent className="p-6 text-center">
          <p className="text-white/60">Unable to load user stats</p>
        </CardContent>
      </Card>
    );
  }

  const levelInfo = calculateLevel(stats.totalXP);

  const statCards = [
    {
      title: "Current Level",
      value: `${levelInfo.name} ${levelInfo.level}`,
      subtitle: `${stats.totalXP} XP`,
      icon: Trophy,
      color: "text-yellow-400",
      progress: levelInfo.progress,
    },
    {
      title: "Total Deposits",
      value: formatCurrency(stats.totalDeposits),
      subtitle: "Across all circles",
      icon: TrendingUp,
      color: "text-green-400",
    },
    {
      title: "Total Yield Earned",
      value: formatCurrency(stats.totalYield),
      subtitle: "Lifetime earnings",
      icon: Zap,
      color: "text-blue-400",
    },
    {
      title: "Circles Joined",
      value: stats.circlesJoined.toString(),
      subtitle: `${stats.achievements} achievements`,
      icon: Users,
      color: "text-purple-400",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Level Progress Bar */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-3">
            <Trophy className="w-6 h-6 text-yellow-400" />
            Level Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white font-semibold">
                Level {levelInfo.level} - {levelInfo.name}
              </span>
              <span className="text-white/60 text-sm">
                {stats.totalXP} XP
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${levelInfo.progress * 100}%` }}
              />
            </div>
            <p className="text-white/60 text-sm">
              {Math.round((1 - levelInfo.progress) * 100)}% to next level
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} variant="glass" hover>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                {stat.progress !== undefined && (
                  <div className="text-right">
                    <div className="text-xs text-white/60">Progress</div>
                    <div className="text-sm font-semibold text-white">
                      {Math.round(stat.progress * 100)}%
                    </div>
                  </div>
                )}
              </div>
              <div>
                <div className="text-2xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-white/60 mb-2">
                  {stat.title}
                </div>
                <div className="text-xs text-white/50">
                  {stat.subtitle}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
