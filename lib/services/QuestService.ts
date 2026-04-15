// lib/services/QuestService.ts

import { query } from '@/lib/db';
import { awardXP } from '@/lib/services/XPService';

export async function getAllQuests() {
  const res = await query(
    `SELECT * FROM quests WHERE isactive = TRUE`
  );
  return res.rows;
}

export async function getActiveQuestsForPlayer(playerId: string) {
  const res = await query(
    `SELECT 
        q.*,
        pq.progress,
        pq.completedat,
        pq.assignedat
     FROM activequestrotations aqr
     JOIN quests q ON q.id = aqr.questid
     LEFT JOIN playerquests pq 
       ON pq.questid = q.id AND pq.playerid = $1
     WHERE NOW() BETWEEN aqr.validfrom AND aqr.validuntil
     ORDER BY aqr.slottype, aqr.slotindex`,
    [playerId]
  );

  return res.rows;
}

export async function assignActiveQuests(playerId: string) {
  const active = await query(
    `SELECT questid FROM activequestrotations
     WHERE NOW() BETWEEN validfrom AND validuntil`
  );

  for (const row of active.rows) {
    await query(
      `INSERT INTO playerquests (playerid, questid)
       VALUES ($1, $2)
       ON CONFLICT (playerid, questid) DO NOTHING`,
      [playerId, row.questid]
    );
  }
}

export async function updateQuestProgress(
  playerId: string,
  conditionType: string,
  increment: number = 1
) {
  const res = await query(
    `UPDATE playerquests pq
     SET progress = progress + $1
     FROM quests q
     WHERE pq.questid = q.id
       AND pq.playerid = $2
       AND q.conditiontype = $3
       AND pq.completedat IS NULL
     RETURNING pq.*, q.conditionvalue`,
    [increment, playerId, conditionType]
  );

  return res.rows;
}

export async function completeQuest(playerId: string, questId: string) {
  const res = await query(
    `SELECT 
        pq.progress,
        pq.completedat,
        q.conditionvalue,
        q.xpreward,
        q.title
     FROM playerquests pq
     JOIN quests q ON q.id = pq.questid
     WHERE pq.playerid = $1 AND pq.questid = $2`,
    [playerId, questId]
  );

  if (!res.rowCount) throw new Error('Quest not found');

  const quest = res.rows[0];

  if (quest.completedat) throw new Error('Quest already completed');
  if (quest.progress < quest.conditionvalue) throw new Error('Quest not complete');

  // Mark complete
  await query(
    `UPDATE playerquests
     SET completedat = NOW()
     WHERE playerid = $1 AND questid = $2`,
    [playerId, questId]
  );

  // Notification
  await query(
    `INSERT INTO notifications (playerid, type, title, message)
     VALUES ($1, 'questcomplete', 'Quest Completed!', $2)`,
    [
      playerId,
      `You completed: ${quest.title}`,
    ]
  );

  // Award XP
  const xpResult = await awardXP(
    playerId,
    quest.xpreward,
    'quest',
    questId
  );

  return {
    xpreward: quest.xpreward,
    ...xpResult,
  };
}