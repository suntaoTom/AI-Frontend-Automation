/**
 * @description Umi 主配置文件，启用 vite 模式和核心插件
 * @module config
 */
import { defineConfig } from '@umijs/max';
import { theme } from './theme';
import { proxy } from './proxy';

export default defineConfig({
  vite: {},
  antd: {
    theme,
  },
  model: {},
  initialState: {},
  request: {},
  locale: {
    default: 'zh-CN',
    antd: true,
    baseNavigator: false,
  },
  access: {},
  layout: {
    title: 'AI Frontend',
    locale: true,
  },
  proxy,
  mock: {},
  npmClient: 'pnpm',
});
