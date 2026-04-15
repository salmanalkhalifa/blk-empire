'use client';

import { useEffect, useState } from 'react';

type Announcement = {
  id: string;
  title: string;
  content: string;
  type: string;
  createdat: string;
};

export default function NewsPage() {
  const [news, setNews] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews();
  }, []);

  async function fetchNews() {
    try {
      const res = await fetch('/api/announcements');
      const data = await res.json();
      setNews(data.announcements || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function getTypeColor(type: string) {
    switch (type) {
      case 'info':
        return 'text-[#4488ff]';
      case 'warning':
        return 'text-[#ff8844]';
      case 'update':
        return 'text-[#44ff88]';
      case 'event':
        return 'text-[#c9a84c]';
      default:
        return 'text-white';
    }
  }

  if (loading) {
    return <div className="p-6 text-white">Loading news...</div>;
  }

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold text-[#c9a84c] mb-6">
        News & Announcements
      </h1>

      <div className="space-y-4">
        {news.length === 0 && (
          <div className="text-[#8888aa]">
            No announcements available.
          </div>
        )}

        {news.map((item) => (
          <div
            key={item.id}
            className="bg-[#1a1a2e] border border-[#2a2a4e] rounded-xl p-5"
          >
            <div className="flex justify-between items-center mb-2">
              <span className={`font-semibold ${getTypeColor(item.type)}`}>
                {item.title}
              </span>
              <span className="text-xs text-[#8888aa]">
                {new Date(item.createdat).toLocaleDateString()}
              </span>
            </div>

            <div className="text-sm text-[#ccccdd] whitespace-pre-line">
              {item.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}