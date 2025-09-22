"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Brain, TrendingUp, Shield, Lightbulb, MessageCircle, ArrowRight } from "lucide-react";
import { useState } from "react";

// Mock AI coach data
const mockRecommendations = [
  {
    id: "1",
    type: "investment" as const,
    title: "Diversify Your Portfolio",
    description: "Consider adding stablecoin lending to your current strategy for better risk distribution.",
    confidence: 85,
    potentialYield: "3.2-4.1%",
    risk: "Low",
    action: "View Strategy",
  },
  {
    id: "2",
    type: "learning" as const,
    title: "Learn About Aave V3",
    description: "Understanding Aave V3's new features could help optimize your yields.",
    confidence: 92,
    difficulty: "Beginner",
    time: "15 min",
    action: "Start Learning",
  },
  {
    id: "3",
    type: "circle" as const,
    title: "Invite More Friends",
    description: "Your circle is at 8 members. Adding 2-4 more could improve decision-making.",
    confidence: 78,
    benefit: "Better decisions",
    impact: "Medium",
    action: "Send Invites",
  },
];

const quickActions = [
  {
    icon: TrendingUp,
    title: "Market Analysis",
    description: "Get current DeFi market insights",
    color: "text-green-400",
  },
  {
    icon: Shield,
    title: "Risk Assessment",
    description: "Analyze your portfolio risk",
    color: "text-blue-400",
  },
  {
    icon: Lightbulb,
    title: "Strategy Tips",
    description: "Personalized investment tips",
    color: "text-yellow-400",
  },
];

export function AICoach() {
  const [selectedRecommendation, setSelectedRecommendation] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    // Simulate analysis
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 2000);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "investment":
        return TrendingUp;
      case "learning":
        return Lightbulb;
      case "circle":
        return MessageCircle;
      default:
        return Brain;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "investment":
        return "text-green-400";
      case "learning":
        return "text-yellow-400";
      case "circle":
        return "text-blue-400";
      default:
        return "text-purple-400";
    }
  };

  return (
    <Card variant="glass">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          AI Coach
        </CardTitle>
        <p className="text-white/60 text-sm">
          Personalized recommendations for your financial journey
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto p-4 flex flex-col items-start gap-2 hover:bg-white/10"
            >
              <div className="flex items-center gap-2">
                <action.icon className={`w-4 h-4 ${action.color}`} />
                <span className="text-white font-medium">{action.title}</span>
              </div>
              <p className="text-white/60 text-xs text-left">{action.description}</p>
            </Button>
          ))}
        </div>

        {/* Analyze Button */}
        <div className="text-center">
          <Button
            onClick={handleAnalyze}
            loading={isAnalyzing}
            variant="default"
            size="lg"
            className="w-full bg-gradient-primary hover:bg-gradient-primary/90"
          >
            {isAnalyzing ? "Analyzing..." : "Get AI Analysis"}
          </Button>
        </div>

        {/* Recommendations */}
        <div className="space-y-4">
          <h3 className="text-white font-semibold">Recommended Actions</h3>
          {mockRecommendations.map((rec) => {
            const Icon = getTypeIcon(rec.type);
            const color = getTypeColor(rec.type);
            
            return (
              <div
                key={rec.id}
                className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                onClick={() => setSelectedRecommendation(rec.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center ${color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-semibold">{rec.title}</h4>
                      <span className="text-xs text-white/60 bg-white/10 px-2 py-1 rounded-full">
                        {rec.confidence}% confidence
                      </span>
                    </div>
                    
                    <p className="text-white/70 text-sm mb-3">{rec.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex gap-4 text-xs text-white/60">
                        {rec.potentialYield && (
                          <span>Yield: {rec.potentialYield}</span>
                        )}
                        {rec.risk && (
                          <span>Risk: {rec.risk}</span>
                        )}
                        {rec.difficulty && (
                          <span>Level: {rec.difficulty}</span>
                        )}
                        {rec.time && (
                          <span>Time: {rec.time}</span>
                        )}
                      </div>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log(`Executing ${rec.action} for ${rec.id}`);
                        }}
                      >
                        {rec.action}
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* AI Insights */}
        <div className="p-4 bg-gradient-secondary/20 rounded-xl border border-white/20">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-4 h-4 text-purple-400" />
            <span className="text-white font-semibold text-sm">AI Insight</span>
          </div>
          <p className="text-white/70 text-sm">
            Based on your activity, you&apos;re performing 23% better than average users. 
            Consider increasing your deposit frequency to maximize compound returns.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
