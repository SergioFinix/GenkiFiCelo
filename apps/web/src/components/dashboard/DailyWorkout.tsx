"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils/helpers";
import { CheckCircle, Circle, Trophy, Clock, Zap } from "lucide-react";
import { useState } from "react";

// Mock workout data
const mockWorkouts = [
  {
    id: "1",
    title: "Daily Deposit",
    description: "Make a deposit to any of your circles",
    xp: 50,
    completed: true,
    progress: 100,
    type: "deposit",
    reward: "50 XP",
  },
  {
    id: "2",
    title: "Circle Participation",
    description: "Vote on investment strategies in your circles",
    xp: 75,
    completed: false,
    progress: 0,
    type: "vote",
    reward: "75 XP",
  },
  {
    id: "3",
    title: "DeFi Learning",
    description: "Read about DeFi protocols and strategies",
    xp: 25,
    completed: false,
    progress: 60,
    type: "learn",
    reward: "25 XP",
  },
];

const streakData = {
  current: 7,
  longest: 12,
  nextReward: "100 XP bonus",
};

export function DailyWorkout() {
  const [workouts, setWorkouts] = useState(mockWorkouts);

  const handleCompleteWorkout = (workoutId: string) => {
    setWorkouts(prev => 
      prev.map(workout => 
        workout.id === workoutId 
          ? { ...workout, completed: true, progress: 100 }
          : workout
      )
    );
  };

  const completedWorkouts = workouts.filter(w => w.completed).length;
  const totalXP = workouts.reduce((sum, w) => sum + (w.completed ? w.xp : 0), 0);

  return (
    <Card variant="glass">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Daily Workout
            </CardTitle>
            <p className="text-white/60 text-sm">
              Complete challenges to earn XP and level up
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{completedWorkouts}/3</div>
            <div className="text-xs text-white/60">Completed</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Streak Information */}
        <div className="p-4 bg-white/5 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-semibold">Current Streak</span>
            </div>
            <div className="text-white font-bold">{streakData.current} days</div>
          </div>
          <div className="flex justify-between text-sm text-white/60">
            <span>Longest: {streakData.longest} days</span>
            <span>Next reward: {streakData.nextReward}</span>
          </div>
        </div>

        {/* Workouts List */}
        <div className="space-y-4">
          {workouts.map((workout) => (
            <div
              key={workout.id}
              className={`p-4 rounded-xl border transition-all duration-300 ${
                workout.completed
                  ? "bg-green-500/10 border-green-500/30"
                  : "bg-white/5 border-white/10 hover:bg-white/10"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {workout.completed ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <Circle className="w-5 h-5 text-white/40" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`font-semibold ${
                      workout.completed ? "text-green-400" : "text-white"
                    }`}>
                      {workout.title}
                    </h3>
                    <span className="text-xs text-white/60 bg-white/10 px-2 py-1 rounded-full">
                      {workout.reward}
                    </span>
                  </div>
                  
                  <p className="text-white/70 text-sm mb-3">
                    {workout.description}
                  </p>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-white/10 rounded-full h-2 mb-3">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        workout.completed
                          ? "bg-green-400"
                          : "bg-gradient-primary"
                      }`}
                      style={{ width: `${workout.progress}%` }}
                    />
                  </div>
                  
                  {/* Action Button */}
                  {!workout.completed && (
                    <Button
                      size="sm"
                      onClick={() => handleCompleteWorkout(workout.id)}
                      disabled={workout.progress === 0}
                      className="w-full"
                    >
                      {workout.progress > 0 ? "Complete" : "Start"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Daily Summary */}
        <div className="p-4 bg-gradient-primary/20 rounded-xl border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white font-semibold">Today&apos;s Progress</div>
              <div className="text-white/60 text-sm">
                {completedWorkouts} of 3 workouts completed
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">{totalXP} XP</div>
              <div className="text-xs text-white/60">Earned today</div>
            </div>
          </div>
        </div>

        {/* Reset Timer */}
        <div className="flex items-center justify-center gap-2 text-white/60 text-sm">
          <Clock className="w-4 h-4" />
          <span>Workouts reset in 18 hours 42 minutes</span>
        </div>
      </CardContent>
    </Card>
  );
}
