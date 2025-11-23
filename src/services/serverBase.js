// 统一后端基址：所有环境都使用 serverhost.js 中的配置
import DEFAULT_SERVER_BASE from './serverhost.js';

export function getServerBase() {
  return DEFAULT_SERVER_BASE;
}

export function makeUrl(path) {
  let base = getServerBase() || '';
  // 去掉尾部斜杠，避免重复
  base = String(base).replace(/\/$/, '');
  if (!path) return base;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}