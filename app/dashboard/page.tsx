// app/page.tsx

'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <div style={container}>
      <div style={heroCard}>
        <h1 style={title}>BLK EMPIRE</h1>

        <p style={subtitle}>
          A persistent RPG progression system for Second Life.
        </p>

        <div style={buttonRow}>
          <Link href="/auth/login">
            <button style={primaryButton}>Enter Dashboard</button>
          </Link>

          <Link href="/leaderboard">
            <button style={secondaryButton}>View Leaderboard</button>
          </Link>
        </div>
      </div>

      <div style={featuresSection}>
        <Feature
          title="Progression System"
          description="Level up across 5 independent tracks: Main, Dom, Sub, Switch, and Time."
        />

        <Feature
          title="Live Leaderboards"
          description="Compete globally across XP, Cum, and role-based rankings."
        />

        <Feature
          title="Quests & Achievements"
          description="Complete rotating quests and unlock achievements to gain XP."
        />

        <Feature
          title="Cum Tracking"
          description="Track interactions, partners, and unlock unique cum-based titles."
        />
      </div>
    </div>
  );
}

function Feature({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div style={featureCard}>
      <h3 style={featureTitle}>{title}</h3>
      <p style={featureDesc}>{description}</p>
    </div>
  );
}

/* ================= STYLES ================= */

const container: React.CSSProperties = {
  minHeight: '100vh',
  backgroundColor: '#0d0d1a',
  color: '#ffffff',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '40px 20px',
};

const heroCard: React.CSSProperties = {
  backgroundColor: '#1a1a2e',
  border: '1px solid #2a2a4e',
  borderRadius: '16px',
  padding: '40px',
  textAlign: 'center',
  maxWidth: '600px',
  width: '100%',
  marginBottom: '40px',
};

const title: React.CSSProperties = {
  color: '#c9a84c',
  fontSize: '36px',
  fontWeight: 'bold',
  marginBottom: '10px',
};

const subtitle: React.CSSProperties = {
  color: '#8888aa',
  fontSize: '16px',
  marginBottom: '30px',
};

const buttonRow: React.CSSProperties = {
  display: 'flex',
  gap: '12px',
  justifyContent: 'center',
  flexWrap: 'wrap',
};

const primaryButton: React.CSSProperties = {
  padding: '12px 20px',
  backgroundColor: '#c9a84c',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: 'bold',
};

const secondaryButton: React.CSSProperties = {
  padding: '12px 20px',
  backgroundColor: '#2a2a4e',
  border: '1px solid #c9a84c',
  color: '#c9a84c',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: 'bold',
};

const featuresSection: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: '20px',
  width: '100%',
  maxWidth: '900px',
};

const featureCard: React.CSSProperties = {
  backgroundColor: '#1a1a2e',
  border: '1px solid #2a2a4e',
  borderRadius: '12px',
  padding: '20px',
};

const featureTitle: React.CSSProperties = {
  color: '#c9a84c',
  fontWeight: 'bold',
  marginBottom: '8px',
};

const featureDesc: React.CSSProperties = {
  color: '#8888aa',
  fontSize: '14px',
};