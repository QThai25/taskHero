import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { authApi } from "@/api/auth";
import {
  Target,
  ArrowLeft,
  Trophy,
  Flame,
  TrendingUp,
  Award,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import logo from "../assets/logo.jpg";

const Profile = () => {
  const { user, logout } = useAuth();

  const profile = user;

  const stats = [
    {
      label: "Total Points",
      value: "1,240",
      icon: Trophy,
      color: "text-warning",
    },
    {
      label: "Current Level",
      value: "5",
      icon: TrendingUp,
      color: "text-primary",
    },
    {
      label: "Tasks Completed",
      value: "127",
      icon: CheckCircle2,
      color: "text-success",
    },
    {
      label: "Best Streak",
      value: "14 days",
      icon: Flame,
      color: "text-accent",
    },
  ];

  const badges = [
    {
      emoji: "🏆",
      name: "First Task",
      description: "Complete your first task",
    },
    {
      emoji: "⭐",
      name: "Week Warrior",
      description: "Complete all tasks for a week",
    },
    {
      emoji: "🔥",
      name: "7-Day Streak",
      description: "Maintain a 7-day streak",
    },
    {
      emoji: "🎯",
      name: "Perfectionist",
      description: "Complete 10 tasks early",
    },
    { emoji: "💎", name: "Diamond Level", description: "Reach Level 5" },
    {
      emoji: "👑",
      name: "Productivity King",
      description: "Top of the leaderboard",
    },
    {
      emoji: "🚀",
      name: "Speed Demon",
      description: "Complete 5 tasks in one day",
    },
    { emoji: "📚", name: "Organized", description: "Create 10 projects" },
  ];

  const recentActivity = [
    {
      task: "Complete project proposal",
      points: "+6",
      status: "Early completion",
      date: "Today",
    },
    {
      task: "Review team feedback",
      points: "+4",
      status: "On time",
      date: "Yesterday",
    },
    {
      task: "Update documentation",
      points: "+4",
      status: "On time",
      date: "2 days ago",
    },
    {
      task: "Plan next sprint",
      points: "+6",
      status: "Early completion",
      date: "3 days ago",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img
              src={logo}
              alt="Final Call Logo"
              className="h-8 w-8 object-contain"
            />
            <span className="text-2xl font-bold text-foreground">
              Final Call
            </span>
          </Link>
          <div className="flex gap-2">
            <Link to="/dashboard">
              <Button variant="ghost">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  await logout();
                  window.location.href = "/";
                } catch (error) {
                  console.error("Logout failed:", error);
                }
              }}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      {/* Profile Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="mb-8">
          <Card className="border-border bg-gradient-to-br from-primary/5 via-accent/5 to-background">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-primary to-accent flex items-center justify-center text-5xl">
                    {profile?.picture ? (
                      <img
                        src={profile.picture}
                        alt={profile.name || "User"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-5xl">👤</span>
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-warning flex items-center justify-center border-4 border-background">
                    <span className="text-xl font-bold text-warning-foreground">
                      5
                    </span>
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-3xl font-bold text-foreground mb-2">
                    {profile?.name || user?.name || "Productivity Master"}
                  </h1>
                  <p className="text-muted-foreground mb-4">
                    {profile?.email || user?.email || "No email"}
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
                      Level 5
                    </span>
                    <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium border border-accent/20">
                      7-Day Streak 🔥
                    </span>
                    <span className="px-3 py-1 rounded-full bg-warning/10 text-warning text-sm font-medium border border-warning/20">
                      Top 10%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="border-border bg-card hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
                <div className="text-3xl font-bold text-foreground mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Badges */}
          <div className="lg:col-span-2">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-warning" />
                  Your Badges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  {badges.map((badge, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                    >
                      <div className="text-4xl">{badge.emoji}</div>
                      <div>
                        <div className="font-semibold text-foreground">
                          {badge.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {badge.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div
                      key={index}
                      className="pb-4 border-b border-border last:border-0 last:pb-0"
                    >
                      <div className="font-medium text-foreground text-sm mb-1">
                        {activity.task}
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          {activity.date}
                        </span>
                        <span className="text-success font-medium">
                          {activity.points}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {activity.status}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Progress to Next Level */}
            <Card className="border-border bg-card mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Level Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">
                        Current Level
                      </span>
                      <span className="font-semibold text-foreground">
                        240/300 XP
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-primary to-accent h-3 rounded-full transition-all"
                        style={{ width: "80%" }}
                      />
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Complete 3 more tasks to reach Level 6!
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
