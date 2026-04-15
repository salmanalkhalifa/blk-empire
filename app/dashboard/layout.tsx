'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      router.push('/auth/login');
    }
  }, [router]);

  function logout() {
    localStorage.removeItem('token');
    router.push('/auth/login');
  }

  return (
    <div style={container}>
      {/* SIDEBAR */}
      <div style={sidebar}>
        <div style={logo}>BLK EMPIRE</div>

        <nav style={nav}>
          <NavItem href="/dashboard" label="Home" />
          <NavItem href="/dashboard/profile" label="Profile" />

          <Divider />

          <NavItem href="/dashboard/quests" label="Quests" />
          <NavItem href="/dashboard/achievements" label="Achievements" />
          <NavItem href="/dashboard/badges" label="Badges" />

          <Divider />

          <NavItem href="/dashboard/titles" label="Titles" />
          <NavItem href="/dashboard/stats" label="Stats" />
          <NavItem href="/dashboard/cum-history" label="Cum History" />
          <NavItem href="/dashboard/partners" label="Partners" />

          <Divider />

          <NavItem href="/dashboard/settings" label="Settings" />
          <NavItem href="/dashboard/notifications" label="Notifications" />
          <NavItem href="/dashboard/news" label="News" />
          <NavItem href="/dashboard/archives" label="Archives" />
        </nav>

        <button onClick={logout} style={logoutButton}>
          Logout
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div style={content}>{children}</div>
    </div>
  );
}

function NavItem({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} style={navItem}>
      {label}
    </Link>
  );
}

function Divider() {
  return <div style={divider} />;
}

/* ================= STYLES ================= */

const container = {
  display: 'flex',
  minHeight: '100vh',
  backgroundColor: '#0d0d1a',
};

const sidebar = {
  width: '240px',
  backgroundColor: '#1a1a2e',
  borderRight: '1px solid #2a2a4e',
  padding: '20px',
  display: 'flex',
  flexDirection: 'column' as const,
  justifyContent: 'space-between',
};

const logo = {
  color: '#c9a84c',
  fontWeight: 'bold',
  fontSize: '20px',
  marginBottom: '20px',
};

const nav = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '8px',
};

const navItem = {
  color: '#ffffff',
  textDecoration: 'none',
  padding: '10px',
  borderRadius: '6px',
  transition: '0.2s',
};

const divider = {
  height: '1px',
  backgroundColor: '#2a2a4e',
  margin: '10px 0',
};

const logoutButton = {
  marginTop: '20px',
  padding: '10px',
  backgroundColor: '#2a2a4e',
  border: '1px solid #c9a84c',
  color: '#c9a84c',
  borderRadius: '6px',
  cursor: 'pointer',
};

const content = {
  flex: 1,
  padding: '20px',
};