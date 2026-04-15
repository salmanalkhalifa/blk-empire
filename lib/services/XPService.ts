// lib/services/XPService.ts

import { query } from '@/lib/db';
import { XPSourceType } from '@/lib/types';

type AwardXPResult = {
  newtotalxp: number;
  newlevel: number;
  levelup: boolean;
  dom_level: number;
  dom_levelup: boolean;
  sub_level: number;
  sub_levelup: boolean;
  switch_level: number;
  switch_levelup: boolean;
  time_level: number;
  time_levelup: boolean;
  cumlevel: number;
  cum_levelup: boolean;
};

function getTier(level: number) {
  return Math.floor((level - 1) / 50);
}

export async function awardXP(
  playerId: string,
  xpAmount: number,
  sourceType: XPSourceType,
  sourceId?: string
): Promise<AwardXPResult> {
  // 1. Event sourcing
  await query(
    `INSERT INTO xpevents (playerid, xpamount, sourcetype, sourceid)
     VALUES ($1, $2, $3, $4)`,
    [playerId, xpAmount, sourceType, sourceId || null]
  );

  // 2. Load player
  const playerRes = await query(`SELECT * FROM players WHERE id = $1`, [playerId]);
  const player = playerRes.rows[0];

  let domGain = 0;
  let subGain = 0;
  let switchGain = 0;

  if (sourceType === 'furniture' || sourceType === 'cum') {
    if (player.role === 'dom') {
      domGain = Math.floor(xpAmount * 0.7);
      subGain = Math.floor(xpAmount * 0.3);
    } else if (player.role === 'sub') {
      domGain = Math.floor(xpAmount * 0.3);
      subGain = Math.floor(xpAmount * 0.7);
    } else if (player.role === 'switch') {
      domGain = Math.floor(xpAmount * 0.5);
      subGain = Math.floor(xpAmount * 0.5);
      switchGain = xpAmount;
    }
  }

  const timeGain = sourceType === 'furniture' ? xpAmount : 0;

  // 3. Apply XP
  const updated = await query(
    `UPDATE players
     SET totalxp = totalxp + $1,
         domxp = domxp + $2,
         subxp = subxp + $3,
         switchxp = switchxp + $4,
         timexp = timexp + $5
     WHERE id = $6
     RETURNING *`,
    [xpAmount, domGain, subGain, switchGain, timeGain, playerId]
  );

  const p = updated.rows[0];

  // =========================
  // MAIN LEVEL
  // =========================
  const levelRes = await query(
    `SELECT level FROM levels 
     WHERE xprequired <= $1 
     ORDER BY level DESC LIMIT 1`,
    [p.totalxp]
  );

  const newLevel = levelRes.rows[0].level;
  const levelup = newLevel > player.level;

  if (levelup) {
    await query(`UPDATE players SET level = $1 WHERE id = $2`, [newLevel, playerId]);

    await query(
      `INSERT INTO notifications (playerid, type, title, message)
       VALUES ($1, 'levelup', 'Level Up!', $2)`,
      [playerId, `You reached Level ${newLevel}`]
    );
  }

  // =========================
  // ROLE / TIME TRACKS
  // =========================
  async function checkRoleLevel(
    xp: number,
    currentLevel: number,
    field: string,
    table: string,
    label: string
  ) {
    const res = await query(
      `SELECT level FROM ${table}
       WHERE xprequired <= $1
       ORDER BY level DESC LIMIT 1`,
      [xp]
    );

    const newLevel = res.rows[0].level;
    const levelup = newLevel > currentLevel;

    if (levelup) {
      await query(`UPDATE players SET ${field} = $1 WHERE id = $2`, [
        newLevel,
        playerId,
      ]);

      await query(
        `INSERT INTO notifications (playerid, type, title, message)
         VALUES ($1, 'levelup', $2, $3)`,
        [
          playerId,
          `${label} Level Up`,
          `Your ${label} level is now ${newLevel}`,
        ]
      );

      // Tier unlock check
      const oldTier = getTier(currentLevel);
      const newTier = getTier(newLevel);

      if (newTier > oldTier) {
        await query(
          `INSERT INTO notifications (playerid, type, title, message)
           VALUES ($1, 'tier_unlock', 'New Tier Unlocked!', $2)`,
          [
            playerId,
            `You reached a new ${label} tier at level ${newLevel}`,
          ]
        );
      }
    }

    return { newLevel, levelup };
  }

  const dom = await checkRoleLevel(p.domxp, player.dom_level, 'dom_level', 'role_levels', 'DOM');
  const sub = await checkRoleLevel(p.subxp, player.sub_level, 'sub_level', 'role_levels', 'SUB');
  const sw = await checkRoleLevel(p.switchxp, player.switch_level, 'switch_level', 'role_levels', 'SWITCH');
  const time = await checkRoleLevel(p.timexp, player.time_level, 'time_level', 'time_levels', 'TIME');

  // =========================
  // CUM LEVEL
  // =========================
  const cumRes = await query(
    `SELECT level FROM cum_levels
     WHERE xprequired <= $1
     ORDER BY level DESC LIMIT 1`,
    [p.cumxp]
  );

  const newCumLevel = cumRes.rows[0].level;
  const cumLevelUp = newCumLevel > player.cumlevel;

  if (cumLevelUp) {
    await query(`UPDATE players SET cumlevel = $1 WHERE id = $2`, [
      newCumLevel,
      playerId,
    ]);

    await query(
      `INSERT INTO notifications (playerid, type, title, message)
       VALUES ($1, 'levelup', 'Cum Level Up!', $2)`,
      [playerId, `Your cum level is now ${newCumLevel}`]
    );
  }

  return {
    newtotalxp: p.totalxp,
    newlevel: newLevel,
    levelup,
    dom_level: dom.newLevel,
    dom_levelup: dom.levelup,
    sub_level: sub.newLevel,
    sub_levelup: sub.levelup,
    switch_level: sw.newLevel,
    switch_levelup: sw.levelup,
    time_level: time.newLevel,
    time_levelup: time.levelup,
    cumlevel: newCumLevel,
    cum_levelup: cumLevelUp,
  };
}