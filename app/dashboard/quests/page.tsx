'use client';

import { useEffect, useState } from 'react';

export default function QuestsPage() {
  const [quests, setQuests] = useState<any[]>([]);

  async function load() {
    const res = await fetch('/api/quests/active', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    const data = await res.json();
    setQuests(data.quests || []);
  }

  async function complete(id: string) {
    await fetch('/api/quests/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ questid: id }),
    });
    load();
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <h1>Quests</h1>

      {quests.map((q) => (
        <div key={q.id} style={card}>
          <h3>{q.title}</h3>
          <p>{q.description}</p>
          <p>Progress: {q.progress || 0}</p>

          {!q.completedat && (
            <button onClick={() => complete(q.id)}>Complete</button>
          )}

          {q.completedat && <span>✔ Completed</span>}
        </div>
      ))}
    </div>
  );
}

const card: React.CSSProperties = {
  background: '#1a1a2e',
  padding: '12px',
  marginBottom: '10px',
};