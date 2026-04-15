'use client';

import { useEffect, useState } from 'react';

interface Partner {
  id: string;
  displayname: string;
  cumcount: number;
  favoritepart: string | null;
  lastcumat: string;
}

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const token = localStorage.getItem('token');

      const res = await fetch('/api/player/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setPartners(data.partners || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white p-6">
      <h1 className="text-2xl font-bold text-[#c9a84c] mb-6">
        Your Partners
      </h1>

      {loading ? (
        <p className="text-[#8888aa]">Loading partners...</p>
      ) : partners.length === 0 ? (
        <p className="text-[#8888aa]">No partners yet.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {partners.map((partner) => (
            <div
              key={partner.id}
              className="bg-[#1a1a2e] border border-[#2a2a4e] rounded-xl p-4"
            >
              <h2 className="text-lg font-bold text-[#c9a84c]">
                {partner.displayname}
              </h2>

              <p className="text-sm text-[#ccccdd] mt-2">
                Total Interactions:{" "}
                <span className="text-[#44ff88] font-semibold">
                  {partner.cumcount}
                </span>
              </p>

              {partner.favoritepart && (
                <p className="text-sm text-[#8888aa] mt-1 capitalize">
                  Favorite: {partner.favoritepart}
                </p>
              )}

              <p className="text-xs text-[#8888aa] mt-3">
                Last: {new Date(partner.lastcumat).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}