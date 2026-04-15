'use client';

import { useEffect, useState } from 'react';

type Achievement = {
  id: string;
  name: string;
  description: string;
  category: string;
  unlocked: boolean;
  unlockedat?: string;
};

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchAchievements() {
    try {
      const res = await fetch('/api/achievements', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await res.json();
      setAchievements(data.achievements || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAchievements();
    const interval = setInterval(fetchAchievements, 30000); // polling
    return () => clearInterval(interval);
  }, []);

  const grouped: Record<string, Achievement[]> = {};

  achievements.forEach((a) => {
    if (!grouped[a.category]) grouped[a.category] = [];
    grouped[a.category].push(a);
  });

  function renderAchievement(a: Achievement) {
    return (
      <div
        key={a.id}
        style={{
          background: '#1a1a2e',
          border: `1px solid ${a.unlocked ? '#c9a84c' : '#2a2a4e'}`,
          borderRadius: 12,
          padding: 16,
          marginBottom: 12,
          opacity: a.unlocked ? 1 : 0.5,
        }}
      >
        <h3 style={{ color: '#c9a84c', margin: 0 }}>{a.name}</h3>

        <p style={{ color: '#8888aa', margin: '6px 0 10px' }}>
          {a.description}
        </p>

        <div
          style={{
            fontSize: 12,
            color: '#8888aa',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <span>{a.category}</span>
          {a.unlocked ? (
            <span style={{ color: '#44ff88' }}>✓ Unlocked</span>
          ) : (
            <span style={{ color: '#ff4444' }}>Locked</span>
          )}
        </div>
      </div>
    );
  }

  function renderSection(category: string, list: Achievement[]) {
    return (
      <div key={category} style={{ marginBottom: 30 }}>
        <h2
          style={{
            color: '#c9a84c',
            marginBottom: 10,
            borderBottom: '1px solid #2a2a4e',
            paddingBottom: 6,
            textTransform: 'capitalize',
          }}
        >
          {category}
        </h2>

        {list.map(renderAchievement)}
      </div>
    );
  }

  return (
    <div
      style={{
        padding: 20,
        background: '#0d0d1a',
        minHeight: '100vh',
        color: '#ffffff',
      }}
    >
      <h1 style={{ color: '#c9a84c', marginBottom: 20 }}>
        Achievements
      </h1>

      {loading ? (
        <p style={{ color: '#8888aa' }}>Loading achievements...</p>
      ) : (
        Object.keys(grouped).map((cat) =>
          renderSection(cat, grouped[cat])
        )
      )}
    </div>
  );
}