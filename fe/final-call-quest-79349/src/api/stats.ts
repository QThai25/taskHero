import api from './axios';

export interface UserStats {
  userId: string;
  points: number;
  level: number;
  streakDays: number;
  lastCompleted?: string | null;
  tasksCompleted?: number;
}

export interface UserBadge {
  id: string;
  name: string;
  awardedAt: string;
}

export const statsApi = {
  async getStats() {
    const response = await api.get('/stats');
    return response.data as UserStats;
  },

  async getBadges() {
    const response = await api.get('/badges');
    return response.data as UserBadge[];
  },
};
