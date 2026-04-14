// lib/services/CumService.ts

import { query } from '@/lib/db';
import { awardXP } from '@/lib/services/XPService';
import { rateLimitCumEvent } from '@/lib/security/rateLimit';

const BODY_PART_XP: Record<string, number> = {
  'in mouth': 25,
  'in pussy': 30,
  'in ass': 30,
  'outside only on crotch': 25,
  'on face': 10,
  'on tits': 15,
  'on ass': 15,
  'on chest': 12,
  'on neck': 12,
  'on stomach': 12,
  'on back': 12,
  'right hand': 8,
  'left hand': 8,
  'right arm': 8,
  'left arm': 8,
  'right leg': 8,
  'left leg': 8,
};

export async function processCumEvent(
  providerUUID: string,
  recipientUUID: string,
  bodypart: string
) {
  // 1. Rate limit check
  const allowed = rateLimitCumEvent(providerUUID, recipientUUID);
  if (!allowed) {
    throw new Error('Rate limited');
  }

  // 2. Validate body part
  const xpAmount = BODY_PART_XP[bodypart];
  if (!xpAmount) {
    throw new Error('Invalid body part');
  }

  // 3. Resolve players
  const providerRes = await query(
    `SELECT id FROM players WHERE avataruuid = $1`,
    [providerUUID]
  );

  const recipientRes = await query(
    `SELECT id FROM players WHERE avataruuid = $1`,
    [recipientUUID]
  );

  if (!providerRes.rowCount || !recipientRes.rowCount) {
    throw new Error('Player not found');
  }

  const providerId = providerRes.rows[0].id;
  const recipientId = recipientRes.rows[0].id;

  // 4. Insert cumevent
  await query(
    `INSERT INTO cumevents (providerid, recipientid, bodypart, xpawarded)
     VALUES ($1, $2, $3, $4)`,
    [providerId, recipientId, bodypart, xpAmount]
  );

  // 5. Update provider cum stats
  await query(
    `UPDATE players
     SET 
       cumxp = cumxp + $1,
       cumcount = cumcount + 1,
       lastcumat = NOW()
     WHERE id = $2`,
    [xpAmount, providerId]
  );

  // 6. Update cumpartners
  await query(
    `INSERT INTO cumpartners (providerid, recipientid, cumcount, favoritepart, lastcumat)
     VALUES ($1, $2, 1, $3, NOW())
     ON CONFLICT (providerid, recipientid)
     DO UPDATE SET
       cumcount = cumpartners.cumcount + 1,
       favoritepart = EXCLUDED.favoritepart,
       lastcumat = NOW()`,
    [providerId, recipientId, bodypart]
  );

  // 7. Award XP (this updates ALL progression tracks)
  const xpResult = await awardXP(
    providerId,
    xpAmount,
    'cum',
    undefined
  );

  return {
    xpawarded: xpAmount,
    ...xpResult,
  };
}