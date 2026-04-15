'use client';

import { useEffect, useState } from 'react';

interface GlobalStats {
  totalPlayers: number;
  totalXP: number;
  totalSessions: number;
  totalCumEvents: number;
  averageLevel: number;
}

interface GenderStats {
  male: number;
  female: number;
  unknown: number;
}

interface RoleStats {
  dom: number;
  sub: number;
  switch: number;
  unassigned: number;
}

export default function StatisticsPage() {
  const [global, setGlobal] = useState<GlobalStats | null>(null);
  const [gender, setGender] = useState<GenderStats | null>(null);
  const [role, setRole] = useState<RoleStats | null>(null);

  async function fetchStats() {
    try {
      const [g, gen, r] = await Promise.all([
        fetch('/api/statistics/global').then((res) => res.json()),
        fetch('/api/statistics/gender').then((res) => res.json()),
        fetch('/api/statistics/role').then((res) => res.json()),
      ]);

      setGlobal(g);
      setGender(gen.genderStats);
      setRole(r.roleStats);
    } catch (err) {
      console.error('Stats error:', err);
    }
  }

  useEffect(() => {
    fetchStats();
  }, []);

  if (!global || !gender || !role) {
    return <div style={loading}>Loading statistics...</div>;
  }

  return (
    <div style={container}>
      <h1 style={title}>Global Statistics</h1>

      <div style={grid}>
        <Stat label="Total Players" value={global.totalPlayers} />
        <Stat label="Total XP" value={global.totalXP.toLocaleString()} />
        <Stat label="Sessions" value={global.totalSessions} />
        <Stat label="Cum Events" value={global.totalCumEvents} />
        <Stat label="Average Level" value={global.averageLevel} />
      </div>

      <h2 style={section}>Gender Distribution</h2>
      <div style={grid}>
        <Stat label="Male" value={gender.male} />
        <Stat label="Female" value={gender.female} />
        <Stat label="Unknown" value={gender.unknown} />
      </div>

      <h2 style={section}>Role Distribution</h2>
      <div style={grid}>
        <Stat label="Dom" value={role.dom} />
        <Stat label="Sub" value={role.sub} />
        <Stat label="Switch" value={role.switch} />
        <Stat label="Unassigned" value={role.unassigned} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={card}>
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

const title: React.CSSProperties = {
  color: '#c9a84c',
  marginBottom: '20px',
};

const section: React.CSSProperties = {
  color: '#c9a84c',
  marginTop: '30px',
  marginBottom: '10px',
};

const grid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '15px',
};

const card: React.CSSProperties = {
  backgroundColor: '#1a1a2e',
  border: '1px solid #2a2a4e',
  borderRadius: '12px',
  padding: '15px',
};

const labelStyle: React.CSSProperties = {
  color: '#8888aa',
  fontSize: '12px',
};

const valueStyle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: 'bold',
};

const loading: React.CSSProperties = {
  color: '#8888aa',
  padding: '30px',
};