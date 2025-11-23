const { createProxyMiddleware } = require('http-proxy-middleware');

// 可选 CRA 开发代理：根据环境变量 REACT_APP_USE_PROXY 控制是否启用
// 若启用，代理目标由 REACT_APP_SERVER_BASE 决定（回退到默认地址）
module.exports = function (app) {
  try {
    const useProxy = String(process.env.REACT_APP_USE_PROXY || '').toLowerCase() === 'true';
    if (!useProxy) return; // no-op when proxy disabled

    // const rawTarget = process.env.REACT_APP_SERVER_BASE || 'http://192.168.10.38:5000';
    const rawTarget = process.env.REACT_APP_SERVER_BASE || 'http://eqsuijiang.wicp.vip:47778';

    const target = String(rawTarget).replace(/\/$/, '');

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