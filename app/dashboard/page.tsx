// app/dashboard/page.tsx

'use client';

import { useEffect, useState } from 'react';

interface Player {
  displayname: string;
  level: number;
  totalxp: number;
  dom_level: number;
  sub_level: number;
  switch_level: number;
  time_level: number;
  cumlevel: number;
}

export default function DashboardPage() {
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);

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
      console.error('Failed to load player:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPlayer();

    const interval = setInterval(fetchPlayer, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div style={{ color: '#8888aa' }}>Loading dashboard...</div>;
  }

  if (!player) {
    return <div style={{ color: '#ff4444' }}>Failed to load player.</div>;
  }

  return (
    <div>
      <h1
        style={{
          color: '#c9a84c',
          fontSize: '28px',
          marginBottom: '20px',
        }}
      >
        Welcome, {player.displayname}
      </h1>

      {/* Main Level */}
      <StatCard label="Main Level" value={`Level ${player.level}`} />
      <StatCard label="Total XP" value={player.totalxp.toLocaleString()} />

      {/* Tracks */}
      <div style={{ marginTop: '30px' }}>
        <h2 style={sectionTitle}>Progression Tracks</h2>

        <StatCard label="DOM Track" value={`Level ${player.dom_level}`} />
        <StatCard label="SUB Track" value={`Level ${player.sub_level}`} />
        <StatCard label="SWITCH Track" value={`Level ${player.switch_level}`} />
        <StatCard label="TIME Track" value={`Level ${player.time_level}`} />
        <StatCard label="CUM Level" value={`Level ${player.cumlevel}`} />
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div
      style={{
        backgroundColor: '#1a1a2e',
        border: '1px solid #2a2a4e',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '12px',
      }}
    >
      <div
        style={{
          color: '#8888aa',
          fontSize: '12px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {label}
      </div>

      <div
        style={{
          color: '#ffffff',
          fontSize: '18px',
          fontWeight: 'bold',
        }}
      >
        {value}
      </div>
    </div>
  );
}

const sectionTitle: React.CSSProperties = {
  color: '#c9a84c',
  marginBottom: '10px',
};