// 服务端地址统一配置
// 在此文件中统一管理所有服务端地址，便于切换环境

// 从环境变量读取服务端地址（在 .env 文件中配置）
const DEFAULT_SERVER_BASE = process.env.REACT_APP_SERVER_BASE;

export default DEFAULT_SERVER_BASE;