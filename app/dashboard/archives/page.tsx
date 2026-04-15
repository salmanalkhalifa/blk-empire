'use client';

import { useEffect, useState } from 'react';

type ArchiveEntry = {
  rank: number;
  displayname: string;
  score: number;
};

export default function ArchivesPage() {
  const [month, setMonth] = useState<string>('');
  const [archives, setArchives] = useState<ArchiveEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const now = new Date();
    const defaultMonth = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, '0')}`;
    setMonth(defaultMonth);
    fetchArchives(defaultMonth);
  }, []);

  async function fetchArchives(selectedMonth: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/archives?month=${selectedMonth}`);
      const data = await res.json();
      setArchives(data.archives || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setMonth(value);
    fetchArchives(value);
  }

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold text-[#c9a84c] mb-6">
        Monthly Archives
      </h1>

      {/* Month Picker */}
      <div className="mb-6">
        <label className="block text-sm text-[#8888aa] mb-1">
          Select Month
        </label>
        <input
          type="month"
          value={month}
          onChange={handleChange}
          className="bg-[#0d0d1a] border border-[#2a2a4e] rounded p-2 text-white"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div>Loading archives...</div>
      ) : archives.length === 0 ? (
        <div className="text-[#8888aa]">
          No archive data available for this month.
        </div>
      ) : (
        <div className="bg-[#1a1a2e] border border-[#2a2a4e] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#14142a] text-[#c9a84c]">
              <tr>
                <th className="text-left p-3">Rank</th>
                <th className="text-left p-3">Player</th>
                <th className="text-left p-3">Score</th>
              </tr>
            </thead>
            <tbody>
              {archives.map((entry) => (
                <tr
                  key={entry.rank}
                  className="border-t border-[#2a2a4e]"
                >
                  <td className="p-3">#{entry.rank}</td>
                  <td className="p-3">{entry.displayname}</td>
                  <td className="p-3">{entry.score.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}