import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { profileApi } from "@/api/profile";
import type { RecentActivityItem } from "@/types/profile";
import badgesApi, { type UserBadgeItem } from "@/api/badges";
import {
  ArrowLeft,
  Trophy,
  Flame,
  TrendingUp,
  Award,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import logo from "../assets/logo.jpg";
import { useState } from "react";
import EditProfileDialog from "@/components/EditProfileDialog";
import ChangePasswordDialog from "@/components/ChangePasswordDialog";

const Profile = () => {
  const { user, logout } = useAuth();
  const [openEdit, setOpenEdit] = useState(false);
  const [openPassword, setOpenPassword] = useState(false);

  /* ======================
     FETCH PROFILE (REAL)
  ====================== */
  const { data: profileData } = useQuery({
    queryKey: ["profile"],
    queryFn: profileApi.getProfile,
  });

  /* ======================
     FETCH BADGES (REAL)
  ====================== */
  const { data: badges = [] } = useQuery<UserBadgeItem[]>({
    queryKey: ["my-badges"],
    queryFn: badgesApi.getMyBadges,
  });

  const stats = profileData?.stats;

  const statCards = [
    {
      label: "Total Points",
      value: stats?.points ?? 0,
      icon: Trophy,
      color: "text-warning",
    },
    {
      label: "Current Level",
      value: stats?.level ?? 1,
      icon: TrendingUp,
      color: "text-primary",
    },
    {
      label: "Tasks Completed",
      value: stats?.tasksCompleted ?? 0,
      icon: CheckCircle2,
      color: "text-success",
    },
    {
      label: "Best Streak",
      value: `${stats?.bestStreak ?? 0} days`,
      icon: Flame,
      color: "text-accent",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* ================= NAV ================= */}
      <nav className="border-b border-border sticky top-0 bg-background z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} className="h-8 w-8" />
            <span className="text-xl font-bold">Final Call</span>
          </Link>
          <div className="flex gap-2">
            <Link to="/dashboard">
              <Button variant="ghost">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={async () => {
                await logout();
                window.location.href = "/";
              }}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      {/* ================= CONTENT ================= */}
      <div className="container mx-auto px-4 py-8">
        {/* ===== PROFILE HEADER ===== */}
        <Card className="mb-8 bg-gradient-to-br from-primary/5 via-accent/5 to-background">
          <CardContent className="relative p-6">
            {/* ACTION BUTTONS – góc trên phải */}
            <div className="absolute top-6 right-6 flex gap-2">
              <Button size="sm" onClick={() => setOpenEdit(true)}>
                Edit Profile
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setOpenPassword(true)}
              >
                Change Password
              </Button>
            </div>

            {/* PROFILE INFO */}
            <div className="flex items-center gap-6">
              {/* AVATAR */}
              <div className="relative">
                <div className="w-28 h-28 rounded-full overflow-hidden bg-muted flex items-center justify-center text-4xl">
                  {profileData?.user?.picture ? (
                    <img
                      src={profileData.user.picture}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    "👤"
                  )}
                </div>

                {/* LEVEL BADGE */}
                <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-warning flex items-center justify-center border-4 border-background">
                  <span className="text-sm font-bold">{stats?.level ?? 1}</span>
                </div>
              </div>

              {/* INFO */}
              <div>
                <h1 className="text-2xl font-bold">
                  {profileData?.user?.name || user?.name}
                </h1>
                <p className="text-muted-foreground">
                  {profileData?.user?.email}
                </p>

                <div className="flex gap-2 mt-3 flex-wrap">
                  <span className="px-3 py-1 text-sm bg-primary/10 rounded-full">
                    Level {stats?.level ?? 1}
                  </span>

                  <span className="px-3 py-1 text-sm bg-accent/10 rounded-full">
                    Top {profileData?.rank?.topPercent ?? 100}%
                  </span>

                  {stats?.bestStreak > 0 && (
                    <span className="px-3 py-1 text-sm bg-warning/10 rounded-full">
                      🔥 {stats.bestStreak}-day streak
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* DIALOGS */}
            <EditProfileDialog open={openEdit} onOpenChange={setOpenEdit} />
            <ChangePasswordDialog
              open={openPassword}
              onOpenChange={setOpenPassword}
            />
          </CardContent>
        </Card>

        {/* ===== STATS ===== */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((s, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <s.icon className={`h-8 w-8 ${s.color}`} />
                <div className="text-2xl font-bold mt-2">{s.value}</div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* ===== BADGES ===== */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex gap-2 items-center">
                  <Award className="h-5 w-5 text-warning" />
                  Your Badges
                </CardTitle>
              </CardHeader>
              <CardContent>
                {badges.length === 0 && (
                  <p className="text-muted-foreground">
                    No badges yet. Complete tasks to earn some 💪
                  </p>
                )}

                <div className="grid sm:grid-cols-2 gap-4">
                  {badges.map((b) => (
                    <div
                      key={b._id}
                      className="bg-violet-500/10 rounded-lg p-4 space-y-2 hover:bg-violet-500/15 transition"
                    >
                      {/* Icon */}
                      <div className="text-3xl">{b.badgeId.icon}</div>

                      {/* Name */}
                      <div className="font-semibold text-foreground">
                        {b.badgeId.name}
                      </div>

                      {/* Description */}
                      <div className="text-sm text-muted-foreground">
                        {b.badgeId.description}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ===== RECENT ACTIVITY ===== */}
          <Card>
            <CardHeader>
              <CardTitle className="flex gap-2 items-center">
                <Calendar className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profileData?.recentActivity?.map((a: RecentActivityItem, i) => (
                <div key={i} className="border-b pb-2 last:border-0">
                  <div className="font-medium">{a.task}</div>
                  <div className="text-xs text-muted-foreground">
                    {a.points} • {a.status}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
