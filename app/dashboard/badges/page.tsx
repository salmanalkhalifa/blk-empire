'use client';

import { useEffect, useState } from 'react';

type Badge = {
  id: string;
  name: string;
  description: string;
  category: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  iconemoji: string;
  unlocked: boolean;
};

export default function BadgesPage() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  async function fetchBadges() {
    try {
      const res = await fetch('/api/badges', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await res.json();
      setBadges(data.badges || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBadges();
    const interval = setInterval(fetchBadges, 30000); // polling
    return () => clearInterval(interval);
  }, []);

  function getRarityColor(rarity: string) {
    switch (rarity) {
      case 'common':
        return '#888888';
      case 'uncommon':
        return '#44ff88';
      case 'rare':
        return '#4488ff';
      case 'epic':
        return '#8844ff';
      case 'legendary':
        return '#c9a84c';
      default:
        return '#888888';
    }
  }

  const filtered =
    filter === 'all'
      ? badges
      : badges.filter((b) => b.rarity === filter);

  function renderBadge(b: Badge) {
    return (
      <div
        key={b.id}
        style={{
          background: '#1a1a2e',
          border: `1px solid ${getRarityColor(b.rarity)}`,
          borderRadius: 12,
          padding: 16,
          textAlign: 'center',
          opacity: b.unlocked ? 1 : 0.4,
        }}
      >
        <div style={{ fontSize: 32, marginBottom: 8 }}>
          {b.iconemoji}
        </div>

        <h3 style={{ color: '#c9a84c', margin: 0 }}>{b.name}</h3>

        <p style={{ color: '#8888aa', fontSize: 12 }}>
          {b.description}
        </p>

        <div
          style={{
            marginTop: 8,
            fontSize: 11,
            fontWeight: 'bold',
            color: getRarityColor(b.rarity),
            textTransform: 'uppercase',
          }}
        >
          {b.rarity}
        </div>
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
        Badges
      </h1>

      {/* Filter */}
      <div style={{ marginBottom: 20 }}>
        {['all', 'common', 'uncommon', 'rare', 'epic', 'legendary'].map(
          (r) => (
            <button
              key={r}
              onClick={() => setFilter(r)}
              style={{
                marginRight: 10,
                marginBottom: 10,
                padding: '6px 12px',
                background: filter === r ? '#c9a84c' : '#1a1a2e',
                color: filter === r ? '#0d0d1a' : '#ffffff',
                border: '1px solid #2a2a4e',
                borderRadius: 6,
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {r}
            </button>
          )
        )}
      </div>

      {loading ? (
        <p style={{ color: '#8888aa' }}>Loading badges...</p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: 16,
          }}
        >
          {filtered.map(renderBadge)}
        </div>
      )}
    </div>
  );
}