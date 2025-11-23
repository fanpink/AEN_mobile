import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { makeUrl } from '../../services/serverBase';

function User() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    password: '',
    姓名: '',
    职务: '',
    电话: '',
    role: 'user'
  });

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
        setEditForm({
          姓名: json.user.姓名 || '',
          职务: json.user.职务 || '',
          电话: json.user.电话 || ''
        });
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        // 检查是否为管理员
        checkAdminStatus(token);
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

  const checkAdminStatus = async (token) => {
    try {
      const resp = await fetch(makeUrl('/auth/users'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (resp.status === 200) {
        setIsAdmin(true);
        fetchAllUsers(token);
      }
    } catch (e) {
      // 非管理员会返回403，这是正常的
      setIsAdmin(false);
    }
  };

  const fetchAllUsers = async (token) => {
    try {
      const resp = await fetch(makeUrl('/auth/users'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const json = await resp.json();
      if (json && json.status === 'success') {
        setAllUsers(json.data || []);
      }
    } catch (e) {
      console.error('获取用户列表失败:', e);
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

  const handleEdit = () => {
    setIsEditing(true);
    setShowPasswordForm(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setShowPasswordForm(false);
    setEditForm({
      姓名: user.姓名 || '',
      职务: user.职务 || '',
      电话: user.电话 || ''
    });
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handleSaveEdit = async () => {
    const token = sessionStorage.getItem('auth_token');
    if (!token) {
      setError('未检测到登录令牌');
      return;
    }

    // 如果显示密码表单且有新密码，验证密码
    if (showPasswordForm && passwordForm.newPassword) {
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        setError('新密码与确认密码不一致');
        return;
      }
      if (passwordForm.newPassword.length < 6) {
        setError('新密码长度至少6位');
        return;
      }
    }

    setLoading(true);
    try {
      const updateData = { ...editForm };
      
      // 如果修改密码，添加密码字段
      if (showPasswordForm && passwordForm.newPassword) {
        updateData.current_password = passwordForm.currentPassword;
        updateData.new_password = passwordForm.newPassword;
      }

      const resp = await fetch(makeUrl(`/auth/users/${user.name}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });
      const json = await resp.json();
      if (json && json.status === 'success') {
        setUser({
          ...user,
          ...json.data
        });
        setIsEditing(false);
        setShowPasswordForm(false);
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setError('');
      } else {
        setError(json?.message || '更新失败');
      }
    } catch (e) {
      setError('网络错误或服务不可用');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePasswordInputChange = (field, value) => {
    setPasswordForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const togglePasswordForm = () => {
    setShowPasswordForm(!showPasswordForm);
    if (!showPasswordForm) {
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  };

  const handleNewUserInputChange = (field, value) => {
    setNewUserForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreateUser = async () => {
    const token = sessionStorage.getItem('auth_token');
    if (!token) {
      setError('未检测到登录令牌');
      return;
    }

    if (!newUserForm.name || !newUserForm.password) {
      setError('用户名和密码不能为空');
      return;
    }

    setLoading(true);
    try {
      const resp = await fetch(makeUrl('/auth/users'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newUserForm),
      });
      const json = await resp.json();
      if (json && json.status === 'success') {
        setNewUserForm({
          name: '',
          password: '',
          姓名: '',
          职务: '',
          电话: '',
          role: 'user'
        });
        setError('');
        fetchAllUsers(token);
      } else {
        setError(json?.message || '创建用户失败');
      }
    } catch (e) {
      setError('网络错误或服务不可用');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (username) => {
    if (!window.confirm(`确定要删除用户 ${username} 吗？此操作不可撤销。`)) {
      return;
    }

    const token = sessionStorage.getItem('auth_token');
    if (!token) {
      setError('未检测到登录令牌');
      return;
    }

    setLoading(true);
    try {
      const resp = await fetch(makeUrl(`/auth/users/${username}`), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const json = await resp.json();
      if (json && json.status === 'success') {
        setError('');
        fetchAllUsers(token);
      } else {
        setError(json?.message || '删除用户失败');
      }
    } catch (e) {
      setError('网络错误或服务不可用');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserRole = async (username, newRole) => {
    const token = sessionStorage.getItem('auth_token');
    if (!token) {
      setError('未检测到登录令牌');
      return;
    }

    setLoading(true);
    try {
      const resp = await fetch(makeUrl(`/auth/users/${username}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });
      const json = await resp.json();
      if (json && json.status === 'success') {
        setError('');
        fetchAllUsers(token);
      } else {
        setError(json?.message || '更新用户角色失败');
      }
    } catch (e) {
      setError('网络错误或服务不可用');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>用户管理</h2>
      {loading && <div>加载中…</div>}
      {error && (
        <div style={{ color: '#ff4d4f', marginBottom: 12 }}>{error}</div>
      )}
      {!loading && !error && !user && (
        <div>未登录或无法获取用户信息。请先登录。</div>
      )}

      {user && (
        <div>
          <div style={{ border: '1px solid #e8e8e8', padding: 12, borderRadius: 6, maxWidth: 480, marginBottom: 16 }}>
            <h3>当前登录用户</h3>
            {!isEditing ? (
              <>
                <div style={{ marginBottom: 8 }}><strong>用户名：</strong>{user.name || '-'}</div>
                <div style={{ marginBottom: 8 }}><strong>姓名：</strong>{user.姓名 || user.name || '-'}</div>
                <div style={{ marginBottom: 8 }}><strong>职务：</strong>{user.职务 || '-'}</div>
                <div style={{ marginBottom: 8 }}><strong>电话：</strong>{user.电话 || '-'}</div>
                <div style={{ marginBottom: 8 }}><strong>角色：</strong>{isAdmin ? '管理员' : '普通用户'}</div>
                <button onClick={handleEdit} style={{ padding: '6px 12px', marginRight: 8 }}>编辑信息</button>
                <button
                  onClick={togglePasswordForm}
                  style={{ padding: '6px 12px', marginRight: 8, backgroundColor: '#1890ff', color: 'white', border: 'none' }}
                >
                  修改密码
                </button>
              </>
            ) : (
              <>
                <div style={{ marginBottom: 8 }}>
                  <strong>姓名：</strong>
                  <input
                    type="text"
                    value={editForm.姓名 || ''}
                    onChange={(e) => handleInputChange('姓名', e.target.value)}
                    style={{ marginLeft: 8, padding: 4 }}
                  />
                </div>
                <div style={{ marginBottom: 8 }}>
                  <strong>职务：</strong>
                  <input
                    type="text"
                    value={editForm.职务 || ''}
                    onChange={(e) => handleInputChange('职务', e.target.value)}
                    style={{ marginLeft: 8, padding: 4 }}
                  />
                </div>
                <div style={{ marginBottom: 8 }}>
                  <strong>电话：</strong>
                  <input
                    type="text"
                    value={editForm.电话 || ''}
                    onChange={(e) => handleInputChange('电话', e.target.value)}
                    style={{ marginLeft: 8, padding: 4 }}
                  />
                </div>
                {showPasswordForm && (
                  <div style={{ borderTop: '1px solid #e8e8e8', paddingTop: 12, marginTop: 12 }}>
                    <h4>修改密码</h4>
                    <div style={{ marginBottom: 8 }}>
                      <strong>当前密码：</strong>
                      <input
                        type="password"
                        value={passwordForm.currentPassword || ''}
                        onChange={(e) => handlePasswordInputChange('currentPassword', e.target.value)}
                        style={{ marginLeft: 8, padding: 4 }}
                        placeholder="输入当前密码"
                      />
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <strong>新密码：</strong>
                      <input
                        type="password"
                        value={passwordForm.newPassword || ''}
                        onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
                        style={{ marginLeft: 8, padding: 4 }}
                        placeholder="输入新密码"
                      />
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <strong>确认密码：</strong>
                      <input
                        type="password"
                        value={passwordForm.confirmPassword || ''}
                        onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
                        style={{ marginLeft: 8, padding: 4 }}
                        placeholder="再次输入新密码"
                      />
                    </div>
                    <div style={{ fontSize: '0.8em', color: '#666', marginBottom: 8 }}>
                      密码长度至少6位
                    </div>
                  </div>
                )}
                
                <div style={{ marginTop: 12 }}>
                  <button onClick={handleSaveEdit} style={{ padding: '6px 12px', marginRight: 8 }}>保存</button>
                  <button onClick={handleCancelEdit} style={{ padding: '6px 12px' }}>取消</button>
                  {!showPasswordForm && (
                    <button
                      onClick={togglePasswordForm}
                      style={{ padding: '6px 12px', marginLeft: 8, backgroundColor: '#1890ff', color: 'white', border: 'none' }}
                    >
                      修改密码
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          {isAdmin && (
            <div style={{ border: '1px solid #e8e8e8', padding: 12, borderRadius: 6 }}>
              <h3>
                用户管理
                <button
                  onClick={() => setShowUserManagement(!showUserManagement)}
                  style={{ padding: '4px 8px', marginLeft: 12, fontSize: '0.8em' }}
                >
                  {showUserManagement ? '隐藏' : '显示'}
                </button>
              </h3>
              
              {showUserManagement && (
                <>
                  <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                    <h4>创建新用户</h4>
                    <div style={{ marginBottom: 8 }}>
                      <strong>用户名：</strong>
                      <input
                        type="text"
                        value={newUserForm.name}
                        onChange={(e) => handleNewUserInputChange('name', e.target.value)}
                        style={{ marginLeft: 8, padding: 4 }}
                      />
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <strong>密码：</strong>
                      <input
                        type="password"
                        value={newUserForm.password}
                        onChange={(e) => handleNewUserInputChange('password', e.target.value)}
                        style={{ marginLeft: 8, padding: 4 }}
                      />
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <strong>姓名：</strong>
                      <input
                        type="text"
                        value={newUserForm.姓名}
                        onChange={(e) => handleNewUserInputChange('姓名', e.target.value)}
                        style={{ marginLeft: 8, padding: 4 }}
                      />
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <strong>职务：</strong>
                      <input
                        type="text"
                        value={newUserForm.职务}
                        onChange={(e) => handleNewUserInputChange('职务', e.target.value)}
                        style={{ marginLeft: 8, padding: 4 }}
                      />
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <strong>电话：</strong>
                      <input
                        type="text"
                        value={newUserForm.电话}
                        onChange={(e) => handleNewUserInputChange('电话', e.target.value)}
                        style={{ marginLeft: 8, padding: 4 }}
                      />
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <strong>角色：</strong>
                      <select
                        value={newUserForm.role}
                        onChange={(e) => handleNewUserInputChange('role', e.target.value)}
                        style={{ marginLeft: 8, padding: 4 }}
                      >
                        <option value="user">普通用户</option>
                        <option value="admin">管理员</option>
                      </select>
                    </div>
                    <button onClick={handleCreateUser} style={{ padding: '6px 12px' }}>创建用户</button>
                  </div>

                  <h4>用户列表</h4>
                  {allUsers.length === 0 ? (
                    <div>暂无其他用户</div>
                  ) : (
                    <div>
                      {allUsers.map((u, index) => (
                        <div key={index} style={{
                          border: '1px solid #e8e8e8',
                          padding: 8,
                          marginBottom: 8,
                          borderRadius: 4,
                          backgroundColor: u.name === user.name ? '#f0f8ff' : 'white'
                        }}>
                          <div><strong>用户名：</strong>{u.name}</div>
                          <div><strong>姓名：</strong>{u.姓名 || '-'}</div>
                          <div><strong>职务：</strong>{u.职务 || '-'}</div>
                          <div><strong>电话：</strong>{u.电话 || '-'}</div>
                          <div>
                            <strong>角色：</strong>
                            <select
                              value={u.role || 'user'}
                              onChange={(e) => handleUpdateUserRole(u.name, e.target.value)}
                              style={{ marginLeft: 8, padding: 4 }}
                              disabled={u.name === user.name}
                            >
                              <option value="user">普通用户</option>
                              <option value="admin">管理员</option>
                            </select>
                          </div>
                          {u.name !== user.name && (
                            <button
                              onClick={() => handleDeleteUser(u.name)}
                              style={{
                                padding: '4px 8px',
                                marginTop: 8,
                                backgroundColor: '#ff4d4f',
                                color: 'white',
                                border: 'none',
                                borderRadius: 4
                              }}
                            >
                              删除
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
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
