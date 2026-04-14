// lib/services/AchievementService.ts

import { query } from '@/lib/db';
import { awardXP } from '@/lib/services/XPService';

type AchievementResult = {
  id: string;
  name: string;
  xpreward: number;
};

export async function checkAchievements(playerId: string): Promise<AchievementResult[]> {
  // 1. Get player stats
  const playerRes = await query(
    `SELECT 
      totalxp,
      level,
      cumcount,
      cumlevel,
      dom_level,
      sub_level,
      time_level
     FROM players
     WHERE id = $1`,
    [playerId]
  );

  if (!playerRes.rowCount) return [];

  const player = playerRes.rows[0];

  // 2. Get all active achievements not yet unlocked
  const achievementsRes = await query(
    `SELECT a.*
     FROM achievements a
     LEFT JOIN playerachievements pa
       ON pa.achievementid = a.id AND pa.playerid = $1
     WHERE a.isactive = TRUE
       AND pa.id IS NULL`,
    [playerId]
  );

  const unlocked: AchievementResult[] = [];

  for (const ach of achievementsRes.rows) {
    let conditionMet = false;

    switch (ach.conditiontype) {
      case 'xp_total':
        conditionMet = player.totalxp >= ach.conditionvalue;
        break;
      case 'level_reached':
        conditionMet = player.level >= ach.conditionvalue;
        break;
      case 'cum_count':
        conditionMet = player.cumcount >= ach.conditionvalue;
        break;
      case 'cum_level':
        conditionMet = player.cumlevel >= ach.conditionvalue;
        break;
      case 'dom_level':
        conditionMet = player.dom_level >= ach.conditionvalue;
        break;
      case 'sub_level':
        conditionMet = player.sub_level >= ach.conditionvalue;
        break;
      case 'time_level':
        conditionMet = player.time_level >= ach.conditionvalue;
        break;
      default:
        break;
    }

    if (!conditionMet) continue;

    // 3. Insert achievement unlock
    await query(
      `INSERT INTO playerachievements (playerid, achievementid)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [playerId, ach.id]
    );

    // 4. Award XP if defined
    if (ach.xpreward && ach.xpreward > 0) {
      await awardXP(playerId, ach.xpreward, 'achievement', ach.id);
    }

    unlocked.push({
      id: ach.id,
      name: ach.name,
      xpreward: ach.xpreward,
    });
  }

  return unlocked;
}