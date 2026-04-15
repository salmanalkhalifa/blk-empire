'use client';

import { useEffect, useState } from 'react';

export default function ProfilePage() {
  const [player, setPlayer] = useState<any>(null);

  async function fetchPlayer() {
    try {
      const res = await fetch('/api/player/me', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await res.json();
      setPlayer(data.player);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    fetchPlayer();

    const interval = setInterval(fetchPlayer, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!player) {
    return <div style={loading}>Loading...</div>;
  }

  return (
    <div style={container}>
      <h1 style={title}>My Profile</h1>

      <div style={card}>
        <div style={row}>
          <span style={label}>DISPLAY NAME</span>
          <span style={value}>{player.displayname}</span>
        </div>

        <div style={row}>
          <span style={label}>ROLE</span>
          <span style={value}>{player.role}</span>
        </div>

        <div style={row}>
          <span style={label}>MAIN LEVEL</span>
          <span style={value}>Level {player.level}</span>
        </div>
      </div>

      <div style={grid}>
        <Stat label="DOM LEVEL" value={player.dom_level} />
        <Stat label="SUB LEVEL" value={player.sub_level} />
        <Stat label="SWITCH LEVEL" value={player.switch_level} />
        <Stat label="TIME LEVEL" value={player.time_level} />
        <Stat label="CUM LEVEL" value={player.cumlevel} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div style={statCard}>
      <div style={statLabel}>{label}</div>
      <div style={statValue}>{value}</div>
    </div>
  );
}

/* ================= STYLES ================= */

const container = {
  minHeight: '100vh',
  backgroundColor: '#0d0d1a',
  color: '#ffffff',
  padding: '30px',
};

const title = {
  color: '#c9a84c',
  fontSize: '28px',
  fontWeight: 'bold',
  marginBottom: '20px',
};

const card = {
  backgroundColor: '#1a1a2e',
  border: '1px solid #2a2a4e',
  borderRadius: '12px',
  padding: '20px',
  marginBottom: '20px',
};

const row = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '12px',
};

const label = {
  color: '#8888aa',
  fontSize: '12px',
  letterSpacing: '1px',
};

const value = {
  color: '#c9a84c',
  fontWeight: 'bold',
};

const grid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
  gap: '15px',
};

const statCard = {
  backgroundColor: '#1a1a2e',
  border: '1px solid #2a2a4e',
  borderRadius: '10px',
  padding: '15px',
  textAlign: 'center' as const,
};

const statLabel = {
  color: '#8888aa',
  fontSize: '11px',
  marginBottom: '6px',
};

const statValue = {
  color: '#c9a84c',
  fontSize: '20px',
  fontWeight: 'bold',
};

const loading = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#0d0d1a',
  color: '#ffffff',
};