'use client';

import { useEffect, useState } from 'react';

export default function DashboardHome() {
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

    const interval = setInterval(fetchPlayer, 30000); // polling every 30s
    return () => clearInterval(interval);
  }, []);

  if (!player) {
    return <div style={loading}>Loading...</div>;
  }

  return (
    <div style={container}>
      <h1 style={title}>Dashboard</h1>

      <div style={grid}>
        <TrackCard
          label="MAIN LEVEL"
          value={`Level ${player.level}`}
          progress={player.totalxp % 1000}
        />

        <TrackCard
          label="DOM TRACK"
          value={`Level ${player.dom_level}`}
          progress={player.domxp % 1000}
        />

        <TrackCard
          label="SUB TRACK"
          value={`Level ${player.sub_level}`}
          progress={player.subxp % 1000}
        />

        <TrackCard
          label="SWITCH TRACK"
          value={`Level ${player.switch_level}`}
          progress={player.switchxp % 1000}
        />

        <TrackCard
          label="TIME TRACK"
          value={`Level ${player.time_level}`}
          progress={player.timexp % 3600}
        />

        <TrackCard
          label="CUM LEVEL"
          value={`Level ${player.cumlevel}`}
          progress={player.cumxp % 1000}
        />
      </div>
    </div>
  );
}

function TrackCard({
  label,
  value,
  progress,
}: {
  label: string;
  value: string;
  progress: number;
}) {
  return (
    <div style={card}>
      <div style={labelStyle}>{label}</div>
      <div style={valueStyle}>{value}</div>

      <div style={barBackground}>
        <div
          style={{
            ...barFill,
            width: `${Math.min(progress / 10, 100)}%`,
          }}
        />
      </div>
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

const grid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  gap: '20px',
};

const card = {
  backgroundColor: '#1a1a2e',
  border: '1px solid #2a2a4e',
  borderRadius: '12px',
  padding: '20px',
};

const labelStyle = {
  color: '#8888aa',
  fontSize: '12px',
  letterSpacing: '1px',
  marginBottom: '8px',
};

const valueStyle = {
  color: '#c9a84c',
  fontSize: '18px',
  fontWeight: 'bold',
  marginBottom: '12px',
};

const barBackground = {
  width: '100%',
  height: '10px',
  backgroundColor: '#2a2a4e',
  borderRadius: '6px',
  overflow: 'hidden',
};

const barFill = {
  height: '100%',
  backgroundColor: '#c9a84c',
};

const loading = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#0d0d1a',
  color: '#ffffff',
};