'use client';

import { useEffect, useState } from 'react';

export default function AchievementsPage() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/achievements')
      .then((r) => r.json())
      .then((d) => setData(d.achievements || []));
  }, []);

  return (
    <div>
      <h1>Achievements</h1>

      {data.map((a) => (
        <div key={a.id} style={card}>
          <h3>{a.name}</h3>
          <p>{a.description}</p>
          {a.unlockedat && <span>✔ Unlocked</span>}
        </div>
      ))}
    </div>
  );
}

const card = { background: '#1a1a2e', padding: 10, marginBottom: 10 };