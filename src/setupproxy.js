const { createProxyMiddleware } = require('http-proxy-middleware');

// CRA 开发代理：将 /api/server 转发到本地后端（http://localhost:5000）以避免跨域
module.exports = function (app) {
  app.use(
    '/api/server',
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
      pathRewrite: {
        '^/api/server': '',
      },
    })
  );
};