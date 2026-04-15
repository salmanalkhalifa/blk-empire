'use client';

import { useEffect, useState } from 'react';

interface CumEvent {
  id: string;
  bodypart: string;
  xpawarded: number;
  createdat: string;
  providername?: string;
  recipientname?: string;
}

export default function CumHistoryPage() {
  const [events, setEvents] = useState<CumEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCumHistory();
  }, []);

  const fetchCumHistory = async () => {
    try {
      const token = localStorage.getItem('token');

      const res = await fetch('/api/cum-event', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setEvents(data.events || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white p-6">
      <h1 className="text-2xl font-bold text-[#c9a84c] mb-6">
        Cum History
      </h1>

      {loading ? (
        <p className="text-[#8888aa]">Loading history...</p>
      ) : events.length === 0 ? (
        <p className="text-[#8888aa]">No cum events recorded yet.</p>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-[#1a1a2e] border border-[#2a2a4e] rounded-xl p-4"
            >
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#8888aa]">
                  {new Date(event.createdat).toLocaleString()}
                </span>
                <span className="text-sm text-[#44ff88] font-semibold">
                  +{event.xpawarded} XP
                </span>
              </div>

              <p className="text-lg font-bold text-[#c9a84c] mt-2 capitalize">
                {event.bodypart}
              </p>

              {(event.providername || event.recipientname) && (
                <p className="text-sm text-[#ccccdd] mt-1">
                  {event.providername && `From: ${event.providername} `}
                  {event.recipientname && `→ To: ${event.recipientname}`}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}