'use client';

import { useEffect, useState } from 'react';

type Entry = {
  rank: number;
  displayname: string;
  score: number;
};

export default function LeaderboardPage() {
  const [type, setType] = useState<'xp' | 'cum' | 'dom' | 'sub' | 'time'>('xp');
  const [period, setPeriod] = useState<'alltime' | 'monthly'>('alltime');
  const [data, setData] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchLeaderboard() {
    setLoading(true);
    try {
      const res = await fetch(`/api/leaderboard/${type}?period=${period}`);
      const json = await res.json();
      setData(json.leaderboard || []);
    } catch (err) {
      console.error('Leaderboard error:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLeaderboard();
  }, [type, period]);

  return (
    <div style={container}>
      <h1 style={title}>Leaderboard</h1>

      {/* TYPE SELECT */}
      <div style={controls}>
        {['xp', 'cum', 'dom', 'sub', 'time'].map((t) => (
          <button
            key={t}
            onClick={() => setType(t as any)}
            style={button(type === t)}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* PERIOD SELECT */}
      <div style={controls}>
        {['alltime', 'monthly'].map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p as any)}
            style={button(period === p)}
          >
            {p.toUpperCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={loadingStyle}>Loading...</div>
      ) : (
        <div style={table}>
          <div style={rowHeader}>
            <div>#</div>
            <div>Player</div>
            <div>Score</div>
          </div>

          {data.map((entry) => (
            <div key={entry.rank} style={row}>
              <div>{entry.rank}</div>
              <div>{entry.displayname}</div>
              <div>{entry.score.toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ================= STYLES ================= */

const container: React.CSSProperties = {
  minHeight: '100vh',
  backgroundColor: '#0d0d1a',
  color: '#ffffff',
  padding: '30px',
};

const title: React.CSSProperties = {
  color: '#c9a84c',
  marginBottom: '20px',
};

const controls: React.CSSProperties = {
  display: 'flex',
  gap: '10px',
  marginBottom: '15px',
  flexWrap: 'wrap',
};

const button = (active: boolean): React.CSSProperties => ({
  padding: '8px 14px',
  borderRadius: '6px',
  border: 'none',
  cursor: 'pointer',
  backgroundColor: active ? '#c9a84c' : '#2a2a4e',
  color: active ? '#000' : '#fff',
  fontWeight: 'bold',
});

const loadingStyle: React.CSSProperties = {
  color: '#8888aa',
};

const table: React.CSSProperties = {
  backgroundColor: '#1a1a2e',
  borderRadius: '10px',
  overflow: 'hidden',
  border: '1px solid #2a2a4e',
};

const rowHeader: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '80px 1fr 120px',
  padding: '12px',
  backgroundColor: '#2a2a4e',
  fontWeight: 'bold',
};

const row: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '80px 1fr 120px',
  padding: '12px',
  borderTop: '1px solid #2a2a4e',
};