'use client';

import { useEffect, useState } from 'react';

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  isread: boolean;
  createdat: string;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    try {
      const res = await fetch('/api/notifications', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function markAllRead() {
    try {
      await fetch('/api/notifications/read', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isread: true }))
      );
    } catch (err) {
      console.error(err);
    }
  }

  function getColor(type: string) {
    switch (type) {
      case 'achievement':
        return 'text-[#44ff88]';
      case 'levelup':
        return 'text-[#c9a84c]';
      case 'questcomplete':
        return 'text-[#4488ff]';
      case 'cumevent':
        return 'text-[#ff4488]';
      case 'tier_unlock':
        return 'text-[#8844ff]';
      case 'announcement':
        return 'text-[#ff8844]';
      default:
        return 'text-white';
    }
  }

  if (loading) {
    return <div className="p-6 text-white">Loading notifications...</div>;
  }

  return (
    <div className="p-6 text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#c9a84c]">
          Notifications
        </h1>

        <button
          onClick={markAllRead}
          className="bg-[#c9a84c] hover:bg-[#f0d080] text-black px-4 py-2 rounded text-sm font-semibold"
        >
          Mark all as read
        </button>
      </div>

      <div className="space-y-3">
        {notifications.length === 0 && (
          <div className="text-[#8888aa]">
            No notifications yet.
          </div>
        )}

        {notifications.map((n) => (
          <div
            key={n.id}
            className={`p-4 rounded-xl border ${
              n.isread
                ? 'bg-[#1a1a2e] border-[#2a2a4e]'
                : 'bg-[#14142a] border-[#c9a84c]'
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className={`font-semibold ${getColor(n.type)}`}>
                {n.title}
              </span>
              <span className="text-xs text-[#8888aa]">
                {new Date(n.createdat).toLocaleString()}
              </span>
            </div>

            {n.message && (
              <div className="text-sm text-[#ccccdd]">
                {n.message}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}