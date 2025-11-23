// 统一后端基址：在 CRA 开发环境使用代理，在其他环境直连后端
export function getServerBase() {
  // 优先使用环境变量（CRA 在构建时会注入 REACT_APP_* 环境变量）
  try {
    const envBase = process && process.env && process.env.REACT_APP_SERVER_BASE;
    if (envBase) return envBase;
  } catch (_) {}

  // 在生产构建或当页面由后端 (port 5000) 提供时，使用相对路径（空字符串）
  // 这样 build 后的静态页面可以通过同源请求直接访问后端 API（避免 CORS）
  try {
    if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'production') {
      return '';
    }
  } catch (_) {}

  try {
    if (typeof window !== 'undefined' && window && window.location) {
      // 若页面当前由后端的端口提供（例如 5000），也使用相对路径
      const port = String(window.location.port || '');
      if (port === '5000') return '';
    }
  } catch (_) {}

  // 若未进入上面两种情况，则使用默认后端地址（直接访问，不使用代理）
  // const DEFAULT_BASE = 'http://192.168.10.38:5000';
  const DEFAULT_BASE = 'http://eqsuijiang.wicp.vip:47778';
  return DEFAULT_BASE;
}

export function makeUrl(path) {
  let base = getServerBase() || '';
  // 去掉尾部斜杠，避免重复
  base = String(base).replace(/\/$/, '');
  if (!path) return base;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}