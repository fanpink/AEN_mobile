import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { makeUrl } from '../../services/serverBase';

function User() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchUser = async () => {
    setError('');
    const token = sessionStorage.getItem('auth_token');
    if (!token) {
      setError('未检测到登录令牌，请先登录。');
      setUser(null);
      return;
    }

    setLoading(true);
    try {
      const resp = await fetch(makeUrl('/auth/me'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const json = await resp.json();
      if (json && json.status === 'success' && json.user) {
        setUser(json.user);
      } else {
        setError(json?.message || '获取用户信息失败');
        setUser(null);
      }
    } catch (e) {
      setError('网络错误或服务不可用');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const navigate = useNavigate();

  const handleLogout = () => {
    try {
      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('auth_user');
    } catch (_) {}
    try {
      const axios = require('axios');
      if (axios && axios.defaults && axios.defaults.headers && axios.defaults.headers.common) {
        delete axios.defaults.headers.common['Authorization'];
      }
    } catch (_) {}
    setUser(null);
    navigate('/login', { replace: true });
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>当前登录用户</h2>
      {loading && <div>加载中…</div>}
      {error && (
        <div style={{ color: '#ff4d4f', marginBottom: 12 }}>{error}</div>
      )}
      {!loading && !error && !user && (
        <div>未登录或无法获取用户信息。请先登录。</div>
      )}

      {user && (
        <div style={{ border: '1px solid #e8e8e8', padding: 12, borderRadius: 6, maxWidth: 480 }}>
          <div style={{ marginBottom: 8 }}><strong>用户名：</strong>{user.name || '-'}</div>
          <div style={{ marginBottom: 8 }}><strong>姓名：</strong>{user.姓名 || user.name || '-'}</div>
          <div style={{ marginBottom: 8 }}><strong>职务：</strong>{user.职务 || '-'}</div>
          <div style={{ marginBottom: 8 }}><strong>电话：</strong>{user.电话 || '-'}</div>
        </div>
      )}

      <div style={{ marginTop: 12 }}>
        <button onClick={fetchUser} style={{ padding: '6px 12px', marginRight: 8 }}>刷新</button>
        <button onClick={handleLogout} style={{ padding: '6px 12px' }}>退出登录</button>
      </div>
    </div>
  );
}

export default User;
