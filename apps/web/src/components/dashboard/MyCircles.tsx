"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CircleContract } from "@/components/web3/CircleContract";
import { formatCurrency, generateCircleColor } from "@/lib/utils/helpers";
import { Plus, Users, TrendingUp, Settings, ExternalLink } from "lucide-react";
import { useState } from "react";

// Mock data - replace with actual contract data
const mockCircles = [
  {
    id: "1",
    name: "Friends Circle #1",
    members: 8,
    totalDeposits: 1250.50,
    userDeposit: 150.25,
    currentYield: 4.2,
    status: "active" as const,
    color: generateCircleColor(),
    lastActivity: "2 hours ago",
  },
  {
    id: "2",
    name: "Crypto Squad",
    members: 12,
    totalDeposits: 3200.75,
    userDeposit: 275.00,
    currentYield: 3.8,
    status: "active" as const,
    color: generateCircleColor(),
    lastActivity: "1 day ago",
  },
  {
    id: "3",
    name: "DeFi Explorers",
    members: 10,
    totalDeposits: 850.25,
    userDeposit: 85.00,
    currentYield: 5.1,
    status: "voting" as const,
    color: generateCircleColor(),
    lastActivity: "3 hours ago",
  },
];

export function MyCircles() {
  const [selectedCircle, setSelectedCircle] = useState<string | null>(null);

  const handleCreateCircle = () => {
    // Implement create circle logic
    console.log("Creating new circle...");
  };

  const handleJoinCircle = () => {
    // Implement join circle logic
    console.log("Joining circle...");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">My Circles</h2>
          <p className="text-white/60">Manage your investment circles</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleJoinCircle} variant="outline" size="sm">
            Join Circle
          </Button>
          <Button onClick={handleCreateCircle} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Create Circle
          </Button>
        </div>
      </div>

      {/* Circles Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {mockCircles.map((circle) => (
          <Card
            key={circle.id}
            variant="glass"
            hover
            className="cursor-pointer group"
            onClick={() => setSelectedCircle(circle.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl ${circle.color} flex items-center justify-center shadow-lg`}>
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-white group-hover:text-genki-green transition-colors">
                      {circle.name}
                    </CardTitle>
                    <p className="text-white/60 text-sm">
                      {circle.members} members • {circle.status}
                    </p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Circle Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-lg font-bold text-white">
                    {formatCurrency(circle.totalDeposits)}
                  </div>
                  <div className="text-xs text-white/60">Total Deposits</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-genki-green">
                    {circle.currentYield}%
                  </div>
                  <div className="text-xs text-white/60">Current Yield</div>
                </div>
              </div>

              {/* User's Deposit */}
              <div className="p-3 bg-white/5 rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="text-white/70 text-sm">Your Deposit</span>
                  <span className="text-white font-semibold">
                    {formatCurrency(circle.userDeposit)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button size="sm" className="flex-1">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Details
                </Button>
                <Button size="sm" variant="outline">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>

              {/* Last Activity */}
              <div className="text-xs text-white/50">
                Last activity: {circle.lastActivity}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {mockCircles.length === 0 && (
        <Card variant="glass" className="text-center py-12">
          <CardContent>
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-white/40" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Circles Yet</h3>
            <p className="text-white/60 mb-6">
              Create your first investment circle or join an existing one to start earning together.
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={handleCreateCircle}>
                <Plus className="w-4 h-4 mr-2" />
                Create Circle
              </Button>
              <Button onClick={handleJoinCircle} variant="outline">
                Join Circle
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Circle Detail Modal */}
      {selectedCircle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <Card variant="glass" className="relative">
              <Button
                onClick={() => setSelectedCircle(null)}
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 z-10"
              >
                ×
              </Button>
              <CircleContract circleId={selectedCircle} />
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
