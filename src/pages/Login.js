import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { makeUrl } from '../services/serverBase';

async function sha256Hex(text) {
  const txt = String(text || '');
  // Prefer Web Crypto when available (secure & fast)
  try {
    if (typeof crypto !== 'undefined' && crypto && crypto.subtle && typeof crypto.subtle.digest === 'function') {
      const encoder = new TextEncoder();
      const data = encoder.encode(txt);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (e) {
    // fall through to JS fallback
  }

  // Pure-JS fallback for environments where Web Crypto is unavailable (e.g. HTTP on some LAN IPs)
  // This ensures login works even when `crypto.subtle` is not available.
  // Note: fallback is slower than SubtleCrypto but functional for development.
  // eslint-disable-next-line no-console
  console.warn('[sha256Hex] using JS fallback for SHA-256 (crypto.subtle unavailable)');
  return sha256HexFallback(txt);
}

// Minimal SHA-256 implementation (public-domain style compact implementation)
function sha256HexFallback(ascii) {
  function rightRotate(n, x) { return (x >>> n) | (x << (32 - n)); }
  var K = [
    0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
    0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
    0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
    0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
    0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
    0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
    0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
    0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2
  ];
  var H = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];

  var i, j;
  var bytes = [];
  for (i = 0; i < ascii.length; i++) {
    var code = ascii.charCodeAt(i);
    if (code < 0x80) {
      bytes.push(code);
    } else if (code < 0x800) {
      bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
    } else if (code < 0xd800 || code >= 0xe000) {
      bytes.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
    } else {
      i++;
      // Surrogate pair
      var codePoint = 0x10000 + (((code & 0x3ff) << 10) | (ascii.charCodeAt(i) & 0x3ff));
      bytes.push(
        0xf0 | (codePoint >> 18),
        0x80 | ((codePoint >> 12) & 0x3f),
        0x80 | ((codePoint >> 6) & 0x3f),
        0x80 | (codePoint & 0x3f)
      );
    }
  }
  var bitLen = bytes.length * 8;
  bytes.push(0x80);
  while ((bytes.length % 64) !== 56) bytes.push(0x00);
  // append big-endian 64-bit length
  for (i = 7; i >= 0; i--) bytes.push((bitLen >>> (i * 8)) & 0xff);

  var w = new Array(64);
  for (i = 0; i < bytes.length; i += 64) {
    for (j = 0; j < 16; j++) {
      w[j] = (bytes[i + (j * 4)] << 24) | (bytes[i + (j * 4 + 1)] << 16) | (bytes[i + (j * 4 + 2)] << 8) | (bytes[i + (j * 4 + 3)]);
    }
    for (j = 16; j < 64; j++) {
      var s0 = (rightRotate(7, w[j - 15]) ^ rightRotate(18, w[j - 15]) ^ (w[j - 15] >>> 3));
      var s1 = (rightRotate(17, w[j - 2]) ^ rightRotate(19, w[j - 2]) ^ (w[j - 2] >>> 10));
      w[j] = (w[j - 16] + s0 + w[j - 7] + s1) | 0;
    }

    var a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
    for (j = 0; j < 64; j++) {
      var S1 = (rightRotate(6, e) ^ rightRotate(11, e) ^ rightRotate(25, e));
      var ch = (e & f) ^ (~e & g);
      var temp1 = (h + S1 + ch + K[j] + w[j]) | 0;
      var S0 = (rightRotate(2, a) ^ rightRotate(13, a) ^ rightRotate(22, a));
      var maj = (a & b) ^ (a & c) ^ (b & c);
      var temp2 = (S0 + maj) | 0;

      h = g; g = f; f = e; e = (d + temp1) | 0;
      d = c; c = b; b = a; a = (temp1 + temp2) | 0;
    }

    H[0] = (H[0] + a) | 0; H[1] = (H[1] + b) | 0; H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0;
    H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0; H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
  }

  return H.map(function(h) { return ('00000000' + (h >>> 0).toString(16)).slice(-8); }).join('');
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