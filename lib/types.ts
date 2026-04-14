// lib/types.ts

// =========================
// PLAYER
// =========================
export interface Player {
  id: string;
  avataruuid: string;
  displayname: string;
  passwordhash: string;

  gender: 'male' | 'female' | 'unknown';
  role: 'dom' | 'sub' | 'switch' | 'unassigned';

  level: number;
  prestige: number;

  totalxp: number;
  domxp: number;
  subxp: number;
  switchxp: number;
  timexp: number;

  dom_level: number;
  sub_level: number;
  switch_level: number;
  time_level: number;

  cumlevel: number;
  cumcount: number;
  cumxp: number;

  lastcumat: string | null;
  activetitleid: string | null;

  honorscore: number;

  createdat: string;
  lastactive: string;
}

// =========================
// SESSION
// =========================
export interface Session {
  id: string;
  playerid: string;
  objectuuid: string;
  objectname?: string;
  region?: string;

  startedat: string;
  endedat?: string;
  durationseconds: number;
  xpawarded: number;
  isactive: boolean;
}

// =========================
// XP EVENT
// =========================
export type XPSourceType =
  | 'furniture'
  | 'zone'
  | 'quest'
  | 'achievement'
  | 'cum';

export interface XPEvent {
  id: string;
  playerid: string;
  xpamount: number;
  sourcetype: XPSourceType;
  sourceid?: string;
  description?: string;
  createdat: string;
}

// =========================
// CUM EVENT
// =========================
export interface CumEvent {
  id: string;
  providerid: string;
  recipientid: string;
  bodypart: string;
  sourcetype: string;
  xpawarded: number;
  createdat: string;
}

// =========================
// QUEST
// =========================
export type QuestDifficulty = 'easy' | 'medium' | 'hard';
export type QuestRotation = 'daily' | 'weekly' | 'monthly';

export interface Quest {
  id: string;
  title: string;
  description: string;
  category: string;
  rotationtype: QuestRotation;
  xpreward: number;
  conditiontype?: string;
  conditionvalue?: number;
  difficulty: QuestDifficulty;
  isactive: boolean;
}

// =========================
// ACHIEVEMENT
// =========================
export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  conditiontype: string;
  conditionvalue: number;
  xpreward: number;
  isactive: boolean;
}

// =========================
// BADGE
// =========================
export type BadgeRarity =
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'epic'
  | 'legendary';

export interface Badge {
  id: string;
  name: string;
  description: string;
  category: string;
  rarity: BadgeRarity;
  iconemoji: string;
  conditiontype: string;
  conditionvalue: number;
  isactive: boolean;
}

// =========================
// TITLE
// =========================
export type TitleCategory =
  | 'progression'
  | 'donor'
  | 'special'
  | 'role_tier'
  | 'cum';

export interface Title {
  id: string;
  name: string;
  category: TitleCategory;
  description?: string;
  isactive: boolean;
}

// =========================
// NOTIFICATION
// =========================
export type NotificationType =
  | 'achievement'
  | 'levelup'
  | 'questcomplete'
  | 'cumevent'
  | 'announcement'
  | 'tier_unlock';

export interface Notification {
  id: string;
  playerid: string;
  type: NotificationType;
  title: string;
  message?: string;
  isread: boolean;
  createdat: string;
}