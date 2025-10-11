import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { FaHome, FaBell, FaEnvelope, FaCog } from 'react-icons/fa'; // 引入图标
import { EventProvider } from './Status_Context'; // 引入 EventProvider
import Event from './pages/Event';
import History from './pages/History';
import Reporting from './pages/Reporting';
import WordPre from './pages/Reporting/WordPre';
import Setting from './pages/Setting';
import { makeUrl } from './services/serverBase';

function Navigation() {
  return (
    <nav style={styles.nav}>
      <NavLink
        to="/"
        end
        style={({ isActive }) => ({
          ...styles.link,
          color: isActive ? '#ff4500' : '#808080',
        })}
      >
        <FaHome /> 烈度评估
      </NavLink>
      <NavLink
        to="/Reporting"
        style={({ isActive }) => ({
          ...styles.link,
          color: isActive ? '#ff4500' : '#808080',
        })}
      >
        <FaBell /> 报告生成
      </NavLink>
      <NavLink
        to="/History"
        style={({ isActive }) => ({
          ...styles.link,
          color: isActive ? '#ff4500' : '#808080',
        })}
      >
        <FaEnvelope /> 快速报送
      </NavLink>
      <NavLink
        to="/Setting"
        style={({ isActive }) => ({
          ...styles.link,
          color: isActive ? '#ff4500' : '#808080',
        })}
      >
        <FaCog /> 设置
      </NavLink>
    </nav>
  );
}

function App() {
  return (
    <EventProvider>
      <Router>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
          {/* 页面内容区域 */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
            {/* 应用启动时全局读取一次配置并缓存到会话，供各页面使用 */}
            {(() => {
              try {
                // 在顶层触发一次配置读取
                // 使用副作用钩子以避免多次执行
                // 这里通过自执行函数配合 useEffect 实现
              } catch (_) {}
            })()}
            {useEffect(() => {
              (async () => {
                try {
                  const resp = await fetch(makeUrl('/config/report'));
                  const json = await resp.json();
                  if (json?.status === 'success' && json?.data) {
                    try {
                      sessionStorage.setItem('report_config', JSON.stringify(json.data));
                      if (typeof window !== 'undefined') {
                        window.__AEN_config__ = json.data;
                      }
                    } catch (_) {}
                  }
                } catch (_) {
                  // 忽略错误，页面级读取会兜底
                }
              })();
            }, [])}
            <Routes>
              <Route path="/" element={<Event />} />
              <Route path="/Reporting" element={<Reporting />} />
              <Route path="/Reporting/WordPre" element={<WordPre />} />
              <Route path="/history" element={<History />} />
              <Route path="/setting" element={<Setting />} />
            </Routes>
          </div>

          {/* 底部导航栏 */}
          <Navigation />
        </div>
      </Router>
    </EventProvider>
  );
}

// 样式
const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderTop: '1px solid #ddd',
    padding: '10px 0',
  },
  link: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textDecoration: 'none',
    color: '#007bff',
    fontSize: '14px',
  },
};

export default App;