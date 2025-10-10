// 统一后端基址：在 CRA 开发环境使用代理，在其他环境直连后端
export function getServerBase() {
  try {
    const envBase = process?.env?.REACT_APP_SERVER_BASE;
    if (envBase) return envBase;
  } catch (_) {}

  const isBrowser = typeof window !== 'undefined' && typeof window.location !== 'undefined';
  const port = isBrowser ? window.location.port : '';
  const isDev = typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development';
  const isCRADev = isDev && port === '3000';
  return isCRADev ? '/api/server' : 'http://localhost:5000';
}

export function makeUrl(path) {
  const base = getServerBase();
  if (!path) return base;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}