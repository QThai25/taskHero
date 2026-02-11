import api from "./axios";

export interface Badge {
  _id: string;
  name: string;
  description: string;
  icon: string;
}

export interface UserBadgeItem {
  _id: string;
  badgeId: Badge;
  awardedAt: string;
}

export const badgesApi = {
  async getMyBadges() {
    const res = await api.get<UserBadgeItem[]>("/badges/me", {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });

    return res.data;
  },
};

export default badgesApi;
