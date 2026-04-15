'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();

  const [avataruuid, setAvatarUUID] = useState('');
  const [displayname, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('unassigned');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avataruuid, displayname, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed');
        setLoading(false);
        return;
      }

      // Auto-login after register
      localStorage.setItem('token', data.token);

      router.push('/dashboard');
    } catch (err) {
      setError('Something went wrong');
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>BLK EMPIRE</h1>
        <p style={styles.subtitle}>Create your account</p>

        <form onSubmit={handleRegister} style={styles.form}>
          <label style={styles.label}>Avatar UUID</label>
          <input
            type="text"
            value={avataruuid}
            onChange={(e) => setAvatarUUID(e.target.value)}
            required
            style={styles.input}
          />

          <label style={styles.label}>Display Name</label>
          <input
            type="text"
            value={displayname}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            style={styles.input}
          />

          <label style={styles.label}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />

          <label style={styles.label}>Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={styles.input}
          >
            <option value="unassigned">Unassigned</option>
            <option value="dom">Dom</option>
            <option value="sub">Sub</option>
            <option value="switch">Switch</option>
          </select>

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account?{' '}
          <span
            style={styles.link}
            onClick={() => router.push('/login')}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: '#0d0d1a',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#1a1a2e',
    border: '1px solid #2a2a4e',
    borderRadius: '12px',
    padding: '40px',
    width: '100%',
    maxWidth: '420px',
  },
  title: {
    color: '#c9a84c',
    fontSize: '28px',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '10px',
  },
  subtitle: {
    color: '#8888aa',
    textAlign: 'center',
    marginBottom: '30px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    color: '#8888aa',
    fontSize: '12px',
    marginBottom: '5px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  input: {
    backgroundColor: '#0d0d1a',
    border: '1px solid #2a2a4e',
    color: '#ffffff',
    padding: '10px',
    borderRadius: '6px',
    marginBottom: '15px',
  },
  button: {
    backgroundColor: '#c9a84c',
    color: '#0d0d1a',
    padding: '12px',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '10px',
  },
  error: {
    color: '#ff4444',
    marginBottom: '10px',
    fontSize: '14px',
  },
  footer: {
    color: '#8888aa',
    marginTop: '20px',
    textAlign: 'center',
    fontSize: '14px',
  },
  link: {
    color: '#c9a84c',
    cursor: 'pointer',
    marginLeft: '5px',
  },
};