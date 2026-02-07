import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { GoogleLoginButton } from "@/components/GoogleLoginButton";
import { LocalLoginButton } from "@/components/LoginButton";
import { useAuth } from "@/contexts/AuthContext";
import {
  Target,
  Trophy,
  Flame,
  Users,
  Calendar,
  Bell,
  TrendingUp,
  Award,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import logo from "@/assets/logo.jpg";

const Index = () => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src={logo}
              alt="Final Call Logo"
              className="h-8 w-8 object-contain"
            />
            <span className="text-2xl font-bold text-foreground">
              Final Call
            </span>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <Link to="/dashboard">
                <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity">
                  Get Started
                </Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-background pointer-events-none" />
        <div className="container mx-auto px-4 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <div className="inline-block">
                <span className="px-4 py-2 rounded-full bg-accent/10 text-accent font-medium text-sm border border-accent/20">
                  Beat the deadline. Level up your productivity.
                </span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Final Call
                <br></br>
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Give It Your All!
                </span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Stay on track with gamified task management. Earn points, build
                streaks, unlock badges, and compete with your team while
                crushing your goals.
              </p>
              <div className="flex items-center gap-4">
                {user ? (
                  <Link to="/dashboard">
                    <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                      Dashboard
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/login">
                      <Button variant="ghost">Login</Button>
                    </Link>
                    <Link to="/login">
                      <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </div>
              <div className="flex items-center gap-8 pt-4">
                <div>
                  <div className="text-3xl font-bold text-foreground">10K+</div>
                  <div className="text-sm text-muted-foreground">
                    Active Users
                  </div>
                </div>
                <div className="h-12 w-px bg-border" />
                <div>
                  <div className="text-3xl font-bold text-foreground">50K+</div>
                  <div className="text-sm text-muted-foreground">
                    Tasks Completed
                  </div>
                </div>
                <div className="h-12 w-px bg-border" />
                <div>
                  <div className="text-3xl font-bold text-foreground">95%</div>
                  <div className="text-sm text-muted-foreground">
                    On-Time Rate
                  </div>
                </div>
              </div>
            </div>
            <div className="relative animate-slide-up lg:block hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent/20 rounded-3xl blur-3xl" />
              <img
                src={logo}
                alt="Final Call Dashboard"
                className="relative rounded-3xl shadow-2xl border border-border"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Everything You Need to Stay Productive
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to help you manage deadlines and boost
              motivation
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Target,
                title: "Smart Deadline Tracking",
                description:
                  "Create, organize, and track tasks with priorities, tags, and due dates. Never miss a deadline again.",
                color: "text-primary",
              },
              {
                icon: Trophy,
                title: "Gamified Rewards",
                description:
                  "Earn points for completing tasks on time, level up, and unlock exclusive badges for your achievements.",
                color: "text-warning",
              },
              {
                icon: Flame,
                title: "Build Streaks",
                description:
                  "Maintain completion streaks and watch your productivity soar. Consistency is key to success.",
                color: "text-accent",
              },
              {
                icon: Calendar,
                title: "Calendar Views",
                description:
                  "Visualize your deadlines with monthly and weekly calendar views. Plan ahead with confidence.",
                color: "text-primary",
              },
              {
                icon: Bell,
                title: "Smart Reminders",
                description:
                  "Get timely notifications via email or browser alerts. Choose when you want to be reminded.",
                color: "text-accent",
              },
              {
                icon: Users,
                title: "Team Collaboration",
                description:
                  "Work together with team mode. Assign tasks, track progress, and compete on leaderboards.",
                color: "text-primary",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-card"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6">
                  <feature.icon className={`h-12 w-12 ${feature.color} mb-4`} />
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              How Final Call Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Simple steps to transform your productivity
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: "01",
                icon: CheckCircle2,
                title: "Create Your Tasks",
                description:
                  "Add tasks with deadlines, priorities, and descriptions. Organize by projects and tags.",
              },
              {
                step: "02",
                icon: TrendingUp,
                title: "Complete & Earn Points",
                description:
                  "Finish tasks on time to earn points. Complete early for bonus rewards and maintain streaks.",
              },
              {
                step: "03",
                icon: Award,
                title: "Level Up & Compete",
                description:
                  "Unlock badges, climb levels, and compete on leaderboards. Celebrate your progress.",
              },
            ].map((step, index) => (
              <div key={index} className="text-center space-y-4">
                <div className="relative">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <step.icon className="h-10 w-10 text-primary-foreground" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-12 h-12 rounded-full bg-secondary border-2 border-border flex items-center justify-center">
                    <span className="text-sm font-bold text-foreground">
                      {step.step}
                    </span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-foreground">
                  {step.title}
                </h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-accent/10 to-background">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground">
              Ready to Beat Your Deadlines?
            </h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of productive users and start turning your tasks
              into achievements today.
            </p>
            <Link to="/dashboard">
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity text-lg px-12 py-6 shadow-xl"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground">
              No credit card required • Start in seconds
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-secondary/30 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Target className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold text-foreground">
                Final Call
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 Final Call. Where productivity meets fun.
            </p>
            <div className="flex gap-6">
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Privacy
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Terms
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
