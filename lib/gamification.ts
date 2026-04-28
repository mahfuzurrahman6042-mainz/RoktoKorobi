// Gamification system for blood donation
export interface Badge {
  id: string;
  name: string;
  nameBN: string;
  description: string;
  descriptionBN: string;
  icon: string;
  requirement: number; // Minimum donations required
  color: string;
}

export const badges: Badge[] = [
  {
    id: 'first-donation',
    name: 'First Drop',
    nameBN: 'প্রথম বুকড্রপ',
    description: 'Made your first blood donation',
    descriptionBN: 'প্রথম রক্তদান সম্পন্ন',
    icon: '🩸',
    requirement: 1,
    color: '#E53935'
  },
  {
    id: 'life-saver',
    name: 'Life Saver',
    nameBN: 'জীবন রক্ষাকারী',
    description: 'Saved 5 lives through blood donation',
    descriptionBN: 'রক্তদানের মাধ্যমে ৫টি জীবন বাঁচিয়েছেন',
    icon: '❤️',
    requirement: 5,
    color: '#FF5252'
  },
  {
    id: 'hero',
    name: 'Blood Hero',
    nameBN: 'রক্ত বীর',
    description: 'Donated blood 10 times',
    descriptionBN: '১০ বার রক্তদান করেছেন',
    icon: '🦸',
    requirement: 10,
    color: '#FF9800'
  },
  {
    id: 'champion',
    name: 'Champion',
    nameBN: 'চ্যাম্পিয়ন',
    description: 'Donated blood 25 times',
    descriptionBN: '২৫ বার রক্তদান করেছেন',
    icon: '🏆',
    requirement: 25,
    color: '#FFC107'
  },
  {
    id: 'legend',
    name: 'Legend',
    nameBN: 'কিংবদন্তি',
    description: 'Donated blood 50 times',
    descriptionBN: '৫০ বার রক্তদান করেছেন',
    icon: '⭐',
    requirement: 50,
    color: '#9C27B0'
  },
  {
    id: 'saint',
    name: 'Blood Saint',
    nameBN: 'রক্ত সাধু',
    description: 'Donated blood 100 times',
    descriptionBN: '১০০ বার রক্তদান করেছেন',
    icon: '👼',
    requirement: 100,
    color: '#673AB7'
  }
];

export function getBadgesForDonationCount(donationCount: number): Badge[] {
  return badges.filter(badge => donationCount >= badge.requirement);
}

export function getNextBadge(donationCount: number): Badge | null {
  const earnedBadges = getBadgesForDonationCount(donationCount);
  const nextBadge = badges.find(badge => !earnedBadges.includes(badge));
  return nextBadge || null;
}

export function getProgressToNextBadge(donationCount: number): number {
  const nextBadge = getNextBadge(donationCount);
  if (!nextBadge) return 100;
  
  const previousBadge = badges[badges.indexOf(nextBadge) - 1];
  const previousRequirement = previousBadge ? previousBadge.requirement : 0;
  const range = nextBadge.requirement - previousRequirement;
  const progress = donationCount - previousRequirement;
  
  return Math.min(100, Math.round((progress / range) * 100));
}
