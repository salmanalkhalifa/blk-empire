'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface Player {
  displayname: string;
  level: number;
  totalxp: number;
  dom_level: number;
  sub_level: number;
  switch_level: number;
  time_level: number;
  cumlevel: number;
  role: string;
  gender: string;
}

export default function PublicPlayerPage() {
  const params = useParams();
  const uuid = params?.uuid as string;

  const [player, setPlayer] = useState<Player | null>(null);
  const [error, setError] = useState('');

  async function fetchPlayer() {
    try {
      const res = await fetch(`/api/player/${uuid}/public`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to load player');
        return;
      }

      setPlayer(data.player);
    } catch (err) {
      console.error(err);
      setError('Something went wrong');
    }
  }

  useEffect(() => {
    if (uuid) fetchPlayer();
  }, [uuid]);

  if (error) {
    return <div style={errorStyle}>{error}</div>;
  }

  if (!player) {
    return <div style={loading}>Loading player...</div>;
  }

  return (
    <div style={container}>
      <h1 style={name}>{player.displayname}</h1>

      <div style={card}>
        <Stat label="Main Level" value={`Level ${player.level}`} />
        <Stat label="Total XP" value={player.totalxp.toLocaleString()} />
        <Stat label="Role" value={player.role} />
        <Stat label="Gender" value={player.gender} />
      </div>

      <div style={section}>
        <h2 style={sectionTitle}>Tracks</h2>

        <Stat label="DOM" value={`Level ${player.dom_level}`} />
        <Stat label="SUB" value={`Level ${player.sub_level}`} />
        <Stat label="SWITCH" value={`Level ${player.switch_level}`} />
        <Stat label="TIME" value={`Level ${player.time_level}`} />
        <Stat label="CUM" value={`Level ${player.cumlevel}`} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={statCard}>
      <div style={labelStyle}>{label}</div>
      <div style={valueStyle}>{value}</div>
    </div>
  );
}

/* ================= STYLES ================= */

const container: React.CSSProperties = {
  minHeight: '100vh',
  backgroundColor: '#0d0d1a',
  color: '#fff',
  padding: '30px',
};

const name: React.CSSProperties = {
  color: '#c9a84c',
  fontSize: '28px',
  marginBottom: '20px',
};

const card: React.CSSProperties = {
  backgroundColor: '#1a1a2e',
  border: '1px solid #2a2a4e',
  borderRadius: '12px',
  padding: '20px',
  marginBottom: '20px',
};

const section: React.CSSProperties = {
  marginTop: '20px',
};

const sectionTitle: React.CSSProperties = {
  color: '#c9a84c',
  marginBottom: '10px',
};

const statCard: React.CSSProperties = {
  backgroundColor: '#1a1a2e',
  border: '1px solid #2a2a4e',
  borderRadius: '10px',
  padding: '12px',
  marginBottom: '10px',
};

const labelStyle: React.CSSProperties = {
  color: '#8888aa',
  fontSize: '12px',
};

const valueStyle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: 'bold',
};

const loading: React.CSSProperties = {
  color: '#8888aa',
  padding: '30px',
};

const errorStyle: React.CSSProperties = {
  color: '#ff4444',
  padding: '30px',
};