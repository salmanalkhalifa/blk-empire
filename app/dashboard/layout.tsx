import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

// ✅ FIX: make async
async function verifyAuth() {
  const cookieStore = await cookies(); // ✅ FIX

  const token = cookieStore.get('token')?.value;

  if (!token) {
    return null;
  }

  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

// ✅ FIX: make component async
export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await verifyAuth(); // ✅ FIX

  if (!user) {
    redirect('/auth/login');
  }

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#0d0d1a',
        color: '#ffffff',
      }}
    >
      <aside
        style={{
          width: '240px',
          backgroundColor: '#1a1a2e',
          borderRight: '1px solid #2a2a4e',
          padding: '20px',
        }}
      >
        <h2
          style={{
            color: '#c9a84c',
            fontWeight: 'bold',
            marginBottom: '30px',
          }}
        >
          BLK EMPIRE
        </h2>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <a href="/dashboard" style={linkStyle}>Home</a>
          <a href="/dashboard/quests" style={linkStyle}>Quests</a>
          <a href="/dashboard/achievements" style={linkStyle}>Achievements</a>
          <a href="/dashboard/badges" style={linkStyle}>Badges</a>
          <a href="/dashboard/titles" style={linkStyle}>Titles</a>
          <a href="/dashboard/stats" style={linkStyle}>Stats</a>
          <a href="/dashboard/cum-history" style={linkStyle}>Cum History</a>
          <a href="/dashboard/partners" style={linkStyle}>Partners</a>
          <a href="/dashboard/notifications" style={linkStyle}>Notifications</a>
          <a href="/dashboard/settings" style={linkStyle}>Settings</a>
        </nav>
      </aside>

      <main
        style={{
          flex: 1,
          padding: '30px',
        }}
      >
        {children}
      </main>
    </div>
  );
}

const linkStyle: React.CSSProperties = {
  color: '#8888aa',
  textDecoration: 'none',
  fontSize: '14px',
  letterSpacing: '0.05em',
};