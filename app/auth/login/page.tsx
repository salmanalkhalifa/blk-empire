'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  const [mode, setMode] = useState<'uuid' | 'name'>('uuid');
  const [avataruuid, setAvatarUUID] = useState('');
  const [displayname, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleLogin() {
    setError('');

    try {
      const endpoint =
        mode === 'uuid'
          ? '/api/auth/login'
          : '/api/auth/login-by-name';

      const body =
        mode === 'uuid'
          ? { avataruuid, password }
          : { displayname, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      // Save token
      localStorage.setItem('token', data.token);
      document.cookie = `token=${data.token}; path=/`;

      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Something went wrong');
    }
  }

  return (
    <div style={container}>
      <div style={card}>
        <h1 style={title}>BLK EMPIRE</h1>

        <div style={{ marginBottom: '20px' }}>
          <button onClick={() => setMode('uuid')} style={modeButton(mode === 'uuid')}>
            Login with UUID
          </button>
          <button onClick={() => setMode('name')} style={modeButton(mode === 'name')}>
            Login with Name
          </button>
        </div>

        {mode === 'uuid' ? (
          <input
            placeholder="Avatar UUID"
            value={avataruuid}
            onChange={(e) => setAvatarUUID(e.target.value)}
            style={input}
          />
        ) : (
          <input
            placeholder="Display Name"
            value={displayname}
            onChange={(e) => setDisplayName(e.target.value)}
            style={input}
          />
        )}

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={input}
        />

        <button onClick={handleLogin} style={loginButton}>
          Login
        </button>

        {error && <div style={errorStyle}>{error}</div>}
      </div>
    </div>
  );
}

const container: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
  backgroundColor: '#0d0d1a',
};

const card: React.CSSProperties = {
  backgroundColor: '#1a1a2e',
  padding: '30px',
  borderRadius: '12px',
  width: '320px',
  border: '1px solid #2a2a4e',
};

const title: React.CSSProperties = {
  color: '#c9a84c',
  marginBottom: '20px',
  textAlign: 'center',
};

const input: React.CSSProperties = {
  width: '100%',
  padding: '10px',
  marginBottom: '10px',
  borderRadius: '8px',
  border: '1px solid #333',
  backgroundColor: '#0d0d1a',
  color: '#fff',
};

const loginButton: React.CSSProperties = {
  width: '100%',
  padding: '10px',
  backgroundColor: '#c9a84c',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: 'bold',
};

const errorStyle: React.CSSProperties = {
  color: '#ff4444',
  marginTop: '10px',
  textAlign: 'center',
};

const modeButton = (active: boolean): React.CSSProperties => ({
  marginRight: '10px',
  padding: '6px 10px',
  borderRadius: '6px',
  border: 'none',
  cursor: 'pointer',
  backgroundColor: active ? '#c9a84c' : '#333',
  color: active ? '#000' : '#fff',
});