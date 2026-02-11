export interface Badge {
  id: string;
  key: string;
  name: string;
  description: string;
  icon: string;
  awardedAt: string;
}

export interface UserStats {
  points: number;
  level: number;
  tasksCompleted: number;
  streakDays: number;
  bestStreak: number;
}

export interface LevelProgress {
  currentXP: number;
  nextLevelXP: number;
  percent: number;
}

export interface RankInfo {
  topPercent: number;
}

export interface RecentActivityItem {
  task: string;
  points: string;
  status: string;
  date: string;
}

export interface ProfileResponse {
  user: {
    name: string;
    email: string;
    picture?: string;
  };
  stats: UserStats;
  levelProgress: LevelProgress;
  badges: Badge[];
  recentActivity: RecentActivityItem[];
  rank: RankInfo;
}
