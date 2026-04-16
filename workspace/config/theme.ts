/**
 * @description Ant Design 主题 token 统一定义，所有颜色/字体/间距从此处引入
 * @module config
 */
import type { ThemeConfig } from 'antd';

export const theme: ThemeConfig = {
  token: {
    colorPrimary: '#1677ff',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#1677ff',
    fontSize: 14,
    borderRadius: 6,
    padding: 16,
    paddingLG: 24,
    paddingSM: 12,
    paddingXS: 8,
  },
};
