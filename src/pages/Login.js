import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { makeUrl } from '../services/serverBase';

async function sha256Hex(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(String(text));
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function Login() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const password_hash = await sha256Hex(password);
      const resp = await fetch(makeUrl('/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, password_hash })
      });
      const json = await resp.json();
      if (json?.status === 'success' && json?.token) {
        sessionStorage.setItem('auth_token', json.token);
        sessionStorage.setItem('auth_user', JSON.stringify(json.user || {}));
        // 设置全局 axios Authorization，避免刷新后丢失
        try {
          const axios = require('axios');
          axios.defaults.headers.common['Authorization'] = `Bearer ${json.token}`;
        } catch (_) {}
        navigate('/', { replace: true });
      } else {
        setError(json?.message || '登录失败');
      }
    } catch (err) {
      setError('网络错误或服务器异常');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={{ marginBottom: 20 }}>登录</h2>
        <form onSubmit={handleSubmit}>
          <div style={styles.formItem}>
            <label style={styles.label}>用户名 / 姓名</label>
            <input
              style={styles.input}
              type="text"
              placeholder="请输入用户名或姓名"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div style={styles.formItem}>
            <label style={styles.label}>密码</label>
            <input
              style={styles.input}
              type="password"
              placeholder="请输入密码（加密传输）"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div style={styles.error}>{error}</div>}
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? '登录中...' : '登录'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f5f6fa',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    background: '#fff',
    borderRadius: 8,
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
    padding: 24,
  },
  formItem: {
    marginBottom: 16,
  },
  label: {
    display: 'block',
    marginBottom: 6,
    color: '#333',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: 6,
    fontSize: 14,
  },
  button: {
    width: '100%',
    padding: '10px 14px',
    background: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 16,
  },
  error: {
    color: '#ff4d4f',
    background: '#fff1f0',
    border: '1px solid #ffa39e',
    borderRadius: 6,
    padding: '8px 12px',
    marginBottom: 12,
    fontSize: 13,
  },
};