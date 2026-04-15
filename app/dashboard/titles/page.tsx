'use client';

import { useEffect, useState } from 'react';

interface Title {
  id: string;
  name: string;
  category: string;
  description: string;
  unlockedat: string;
}

export default function TitlesPage() {
  const [titles, setTitles] = useState<Title[]>([]);
  const [activeTitleId, setActiveTitleId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTitles();
  }, []);

  const fetchTitles = async () => {
    try {
      const token = localStorage.getItem('token');

      const res = await fetch('/api/titles', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setTitles(data.titles || []);
      setActiveTitleId(data.activeTitleId || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const equipTitle = async (titleId: string) => {
    try {
      const token = localStorage.getItem('token');

      await fetch('/api/titles/equip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ titleId }),
      });

      setActiveTitleId(titleId);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white p-6">
      <h1 className="text-2xl font-bold text-[#c9a84c] mb-6">
        Your Titles
      </h1>

      {loading ? (
        <p className="text-[#8888aa]">Loading titles...</p>
      ) : titles.length === 0 ? (
        <p className="text-[#8888aa]">No titles unlocked yet.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {titles.map((title) => {
            const isActive = activeTitleId === title.id;

            return (
              <div
                key={title.id}
                className={`p-4 rounded-xl border ${
                  isActive
                    ? 'border-[#c9a84c]'
                    : 'border-[#2a2a4e]'
                } bg-[#1a1a2e]`}
              >
                <h2 className="text-lg font-bold text-[#c9a84c]">
                  {title.name}
                </h2>

                <p className="text-xs text-[#8888aa] uppercase tracking-wide mt-1">
                  {title.category}
                </p>

                <p className="text-sm text-[#ccccdd] mt-2">
                  {title.description}
                </p>

                <p className="text-xs text-[#8888aa] mt-3">
                  Unlocked: {new Date(title.unlockedat).toLocaleDateString()}
                </p>

                <button
                  onClick={() => equipTitle(title.id)}
                  disabled={isActive}
                  className={`mt-4 w-full py-2 rounded-lg font-semibold transition ${
                    isActive
                      ? 'bg-[#2a2a4e] text-[#8888aa] cursor-not-allowed'
                      : 'bg-[#c9a84c] text-black hover:bg-[#f0d080]'
                  }`}
                >
                  {isActive ? 'Equipped' : 'Equip'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}