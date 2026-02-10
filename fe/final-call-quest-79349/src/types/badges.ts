export interface Badge {
  _id: string;
  name: string;
  description: string;
  icon: string;
}

export interface UserBadgeItem {
  _id: string;
  awardedAt: string;
  badge: Badge;
}
