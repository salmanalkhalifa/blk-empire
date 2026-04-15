'use client';

import { useEffect, useState } from 'react';

interface Stats {
  totalxp: number;
  level: number;
  dom_level: number;
  sub_level: number;
  switch_level: number;
  time_level: number;
  cumlevel: number;
  cumcount: number;
}

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');

      const res = await fetch('/api/player/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setStats(data.player);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ label, value }: { label: string; value: number }) => (
    <div className="bg-[#1a1a2e] border border-[#2a2a4e] rounded-xl p-4">
      <p className="text-xs text-[#8888aa] uppercase tracking-wide">
        {label}
      </p>
      <p className="text-xl font-bold text-white mt-2">
        {value.toLocaleString()}
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white p-6">
      <h1 className="text-2xl font-bold text-[#c9a84c] mb-6">
        Your Statistics
      </h1>

      {loading ? (
        <p className="text-[#8888aa]">Loading statistics...</p>
      ) : !stats ? (
        <p className="text-[#8888aa]">Failed to load stats.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard label="Total XP" value={stats.totalxp} />
          <StatCard label="Main Level" value={stats.level} />
          <StatCard label="Dom Level" value={stats.dom_level} />
          <StatCard label="Sub Level" value={stats.sub_level} />
          <StatCard label="Switch Level" value={stats.switch_level} />
          <StatCard label="Time Level" value={stats.time_level} />
          <StatCard label="Cum Level" value={stats.cumlevel} />
          <StatCard label="Total Cum Count" value={stats.cumcount} />
        </div>
      )}
    </div>
  );
}