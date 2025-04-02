import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { FaHome, FaBell, FaEnvelope, FaCog } from 'react-icons/fa'; // 引入图标
import EarthquakeCatalog from './pages/EarthquakeCatalog';
import SeismicBulletin from './pages/SeismicBulletin';
import InformationReporting from './pages/InformationReporting';
import BasicConfiguration from './pages/BasicConfiguration';

function Navigation() {
  const location = useLocation(); // 获取当前路由
  return (
    <nav style={styles.nav}>
      <Link
        to="/"
        style={{
          ...styles.link,
          color: location.pathname === '/' ? '#ff4500' : '#808080', // 激活状态为橙色，未激活状态为灰色
        }}
      >
        <FaHome /> 地震目录
      </Link>
      <Link
        to="/seismic-bulletin"
        style={{
          ...styles.link,
          color: location.pathname === '/seismic-bulletin' ? '#ff4500' : '#808080', // 激活状态为橙色，未激活状态为灰色
        }}
      >
        <FaBell /> 震情通报
      </Link>
      <Link
        to="/information-reporting"
        style={{
          ...styles.link,
          color: location.pathname === '/information-reporting' ? '#ff4500' : '#808080', // 激活状态为橙色，未激活状态为灰色
        }}
      >
        <FaEnvelope /> 信息报送
      </Link>
      <Link
        to="/basic-configuration"
        style={{
          ...styles.link,
          color: location.pathname === '/basic-configuration' ? '#ff4500' : '#808080', // 激活状态为橙色，未激活状态为灰色
        }}
      >
        <FaCog /> 基础配置
      </Link>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        {/* 页面内容区域 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          <Routes>
            <Route path="/" element={<EarthquakeCatalog />} />
            <Route path="/seismic-bulletin" element={<SeismicBulletin />} />
            <Route path="/information-reporting" element={<InformationReporting />} />
            <Route path="/basic-configuration" element={<BasicConfiguration />} />
          </Routes>
        </div>

        {/* 底部导航栏 */}
        <Navigation />
      </div>
    </Router>
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