// lib/auth.ts

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

// Payload type (extend as needed)
export interface JWTPayload {
  playerId: string;
  avataruuid: string;
  displayname: string;
}

// Sign JWT (expires in 60 minutes)
export function signToken(payload: JWTPayload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '60m',
  });
}

// Verify JWT
export function verifyToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

// Extract token from Authorization header
export function getTokenFromHeader(authHeader?: string): string {
  if (!authHeader) {
    throw new Error('Missing Authorization header');
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    throw new Error('Invalid Authorization format');
  }

  return parts[1];
}