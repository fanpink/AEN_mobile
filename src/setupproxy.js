const { createProxyMiddleware } = require('http-proxy-middleware');

// CRA 开发代理：将 /api/earthquake 重写到 CEIC 的 speedsearch.html
module.exports = function (app) {
  app.use(
    '/api/earthquake',
    createProxyMiddleware({
      target: 'https://news.ceic.ac.cn',
      changeOrigin: true,
      secure: true,
      pathRewrite: {
        '^/api/earthquake': '/speedsearch.html',
      },
      headers: {
        Referer: 'https://news.ceic.ac.cn/speedsearch.html',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      },
      onProxyReq: (proxyReq) => {
        // 确保不携带缓存，提高稳定性
        proxyReq.setHeader('Cache-Control', 'no-cache');
      },
    })
  );

};