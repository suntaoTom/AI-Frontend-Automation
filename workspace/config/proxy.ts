/**
 * @description 开发环境代理配置，通过环境变量控制后端地址
 * @module config
 */
export const proxy: Record<string, object> = {
  '/api': {
    target: 'http://localhost:8080',
    changeOrigin: true,
  },
};
