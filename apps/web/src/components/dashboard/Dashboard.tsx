"use client";

import { UserStats } from "./UserStats";
import { MyCircles } from "./MyCircles";
import { DailyWorkout } from "./DailyWorkout";
import { AICoach } from "./AICoach";
import { useActiveAccount } from "thirdweb/react";
import { formatAddress } from "@/lib/utils/helpers";

export function Dashboard() {
  const account = useActiveAccount();

  if (!account) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Please connect your wallet</h1>
          <p className="text-white/60">You need to connect your wallet to access the dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back!
          </h1>
          <p className="text-white/60">
            Connected as {formatAddress(account.address)}
          </p>
        </div>

        {/* Stats Section */}
        <div className="mb-8">
          <UserStats />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Circles */}
          <div className="lg:col-span-2">
            <MyCircles />
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            <DailyWorkout />
            <AICoach />
          </div>
        </div>
      </div>
    </div>
  );
}
