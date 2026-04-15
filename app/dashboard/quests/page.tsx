'use client';

import { useEffect, useState } from 'react';

type Quest = {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  xpreward: number;
  progress: number;
  conditionvalue: number;
  completedat?: string;
  rotationtype: 'daily' | 'weekly' | 'monthly';
};

export default function QuestsPage() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchQuests() {
    try {
      const res = await fetch('/api/quests/active', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await res.json();
      setQuests(data.quests || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchQuests();
    const interval = setInterval(fetchQuests, 30000); // polling
    return () => clearInterval(interval);
  }, []);

  const grouped = {
    daily: quests.filter((q) => q.rotationtype === 'daily'),
    weekly: quests.filter((q) => q.rotationtype === 'weekly'),
    monthly: quests.filter((q) => q.rotationtype === 'monthly'),
  };

  function getDifficultyColor(diff: string) {
    if (diff === 'easy') return '#44ff88';
    if (diff === 'medium') return '#ff8844';
    return '#ff4444';
  }

  function renderQuest(q: Quest) {
    const percent = Math.min(
      (q.progress / q.conditionvalue) * 100,
      100
    );

    return (
      <div
        key={q.id}
        style={{
          background: '#1a1a2e',
          border: '1px solid #2a2a4e',
          borderRadius: 12,
          padding: 16,
          marginBottom: 12,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <h3 style={{ color: '#c9a84c', margin: 0 }}>{q.title}</h3>
          <span
            style={{
              color: getDifficultyColor(q.difficulty),
              fontWeight: 'bold',
              textTransform: 'uppercase',
            }}
          >
            {q.difficulty}
          </span>
        </div>

        <p style={{ color: '#8888aa', margin: '6px 0 10px' }}>
          {q.description}
        </p>

        <div
          style={{
            height: 8,
            background: '#0d0d1a',
            borderRadius: 6,
            overflow: 'hidden',
            marginBottom: 8,
          }}
        >
          <div
            style={{
              width: `${percent}%`,
              background: '#c9a84c',
              height: '100%',
            }}
          />
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 12,
            color: '#8888aa',
          }}
        >
          <span>
            {q.progress} / {q.conditionvalue}
          </span>
          <span style={{ color: '#44ff88' }}>+{q.xpreward} XP</span>
        </div>

        {q.completedat && (
          <div style={{ color: '#44ff88', marginTop: 6 }}>
            ✓ Completed
          </div>
        )}
      </div>
    );
  }

  function renderSection(title: string, list: Quest[]) {
    return (
      <div style={{ marginBottom: 30 }}>
        <h2
          style={{
            color: '#c9a84c',
            marginBottom: 10,
            borderBottom: '1px solid #2a2a4e',
            paddingBottom: 6,
          }}
        >
          {title}
        </h2>

        {list.length === 0 ? (
          <p style={{ color: '#8888aa' }}>No quests available.</p>
        ) : (
          list.map(renderQuest)
        )}
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
        Quests
      </h1>

      {loading ? (
        <p style={{ color: '#8888aa' }}>Loading quests...</p>
      ) : (
        <>
          {renderSection('Daily Quests', grouped.daily)}
          {renderSection('Weekly Quests', grouped.weekly)}
          {renderSection('Monthly Quests', grouped.monthly)}
        </>
      )}
    </div>
  );
}