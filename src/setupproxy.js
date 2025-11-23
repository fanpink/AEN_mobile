const { createProxyMiddleware } = require('http-proxy-middleware');
const DEFAULT_SERVER_BASE = require('./services/serverhost.js').default;

// 开发代理：统一使用 serverhost.js 中的配置
module.exports = function (app) {
  try {
    const target = String(DEFAULT_SERVER_BASE).replace(/\/$/, '');

    app.use(
      '/api/server',
      createProxyMiddleware({
        target: target,
        changeOrigin: true,
        pathRewrite: {
          '^/api/server': '',
        },
      })
    );
  } catch (e) {
    // 如果代理初始化失败，保持 no-op
    // eslint-disable-next-line no-console
    console.warn('setupproxy initialization failed:', e && e.message ? e.message : e);
  }
};