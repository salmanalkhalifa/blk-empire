'use client';

import { useEffect, useState } from 'react';

interface Event {
  id: string;
  type: string;
  title: string;
  message: string;
  createdat: string;
}

export default function ActivityPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchActivity() {
    try {
      // Using announcements as public activity feed for now
      const res = await fetch('/api/announcements');
      const data = await res.json();
      setEvents(data.announcements || []);
    } catch (err) {
      console.error('Activity error:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchActivity();
    const interval = setInterval(fetchActivity, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={container}>
      <h1 style={title}>Activity Feed</h1>

      {loading ? (
        <div style={loadingStyle}>Loading activity...</div>
      ) : (
        <div style={feed}>
          {events.map((e) => (
            <div key={e.id} style={card}>
              <div style={cardTitle}>{e.title}</div>
              <div style={message}>{e.message}</div>
              <div style={time}>
                {new Date(e.createdat).toLocaleString()}
              </div>
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
  color: '#fff',
  padding: '30px',
};

const title: React.CSSProperties = {
  color: '#c9a84c',
  marginBottom: '20px',
};

const loadingStyle: React.CSSProperties = {
  color: '#8888aa',
};

const feed: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
};

const card: React.CSSProperties = {
  backgroundColor: '#1a1a2e',
  border: '1px solid #2a2a4e',
  borderRadius: '12px',
  padding: '15px',
};

const cardTitle: React.CSSProperties = {
  color: '#c9a84c',
  fontWeight: 'bold',
  marginBottom: '5px',
};

const message: React.CSSProperties = {
  color: '#ccc',
  marginBottom: '6px',
};

const time: React.CSSProperties = {
  color: '#8888aa',
  fontSize: '12px',
};