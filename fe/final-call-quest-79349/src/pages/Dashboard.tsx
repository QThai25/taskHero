import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { 
  Target, 
  Plus,
  Trophy,
  Flame,
  TrendingUp,
  Calendar as CalendarIcon,
  List,
  User
} from "lucide-react";
import { TaskList } from "@/components/TaskList";
import { StatsCards } from "@/components/StatsCards";
import CreateTaskDialogClean from "@/components/CreateTaskDialogClean";
import { CalendarView } from "@/components/CalendarView";
import { Task } from "@/types/task";
import logo from '../assets/logo.jpg'
import ExpiredTasksWidget from "@/components/ExpiredTasksWidget";
import { UpcomingTasksWidget } from "@/components/UpcomingTasksWidget";

const Dashboard = () => {
  const [view, setView] = useState<"list" | "calendar">("list");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

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
          <div className="flex items-center gap-4">
            <Link to="/profile">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Your Dashboard</h1>
            <p className="text-muted-foreground">Track your progress and manage your deadlines</p>
          </div>
          <Button 
            size="lg"
            onClick={() => { setEditingTask(null); setIsCreateDialogOpen(true); }}
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
          >
            <Plus className="mr-2 h-5 w-5" />
            New Task
          </Button>
        </div>

        {/* Stats Cards */}
        <StatsCards />

        {/* View Toggle */}
        <div className="flex items-center gap-2 mb-6">
          <Button
            variant={view === "list" ? "default" : "outline"}
            onClick={() => setView("list")}
            className={view === "list" ? "bg-gradient-to-r from-primary to-accent" : ""}
          >
            <List className="mr-2 h-4 w-4" />
            List View
          </Button>
          <Button
            variant={view === "calendar" ? "default" : "outline"}
            onClick={() => setView("calendar")}
            className={view === "calendar" ? "bg-gradient-to-r from-primary to-accent" : ""}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            Calendar View
          </Button>
        </div>

        {/* Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Tasks */}
          <div className="lg:col-span-2">
            {view === "list" ? <TaskList onEditTask={(t) => { setEditingTask(t); setIsCreateDialogOpen(true); }} /> : <CalendarView />}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Reminders Widget */}
            <UpcomingTasksWidget />
            {/* Quick Stats */}
              <ExpiredTasksWidget />
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-warning" />
                  Your Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <span className="text-lg font-bold text-primary-foreground">5</span>
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">Level 5</div>
                      <div className="text-sm text-muted-foreground">240/300 XP</div>
                    </div>
                  </div>
                  <TrendingUp className="h-5 w-5 text-success" />
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-gradient-to-r from-primary to-accent h-2 rounded-full" style={{ width: "80%" }} />
                </div>
              </CardContent>
            </Card>

            {/* Current Streak */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-accent" />
                  Current Streak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <div className="text-6xl font-bold bg-gradient-to-r from-accent to-warning bg-clip-text text-transparent mb-2">
                    7
                  </div>
                  <div className="text-muted-foreground">Days in a row</div>
                  <div className="mt-4 flex justify-center gap-1">
                    {[...Array(7)].map((_, i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-warning flex items-center justify-center">
                        <Flame className="h-4 w-4 text-accent-foreground" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Badges */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-warning" />
                  Recent Badges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  {["🏆", "⭐", "🔥", "🎯", "💎", "👑"].map((emoji, i) => (
                    <div 
                      key={i}
                      className="aspect-square rounded-lg bg-gradient-to-br from-secondary to-secondary/50 flex items-center justify-center text-3xl hover:scale-110 transition-transform cursor-pointer"
                    >
                      {emoji}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Create Task Dialog */}
      <CreateTaskDialogClean 
        open={isCreateDialogOpen} 
        onOpenChange={(open) => { if (!open) setEditingTask(null); setIsCreateDialogOpen(open); }}
        task={editingTask}
        onSaved={() => setEditingTask(null)}
      />
    </div>
  );
};

export default Dashboard;
