/**
 * @description 运行时配置：全局 request 拦截器、layout 配置、initialState
 * @module src
 * @dependencies @umijs/max
 */
import { getIntl } from '@umijs/max';
import type { AxiosRequestConfig, RequestConfig, RunTimeLayoutConfig } from '@umijs/max';

/**
 * 全局初始化数据，供 useModel('@@initialState') 消费
 */
export async function getInitialState(): Promise<Record<string, unknown>> {
  return {};
}

/**
 * Layout 运行时配置
 */
export const layout: RunTimeLayoutConfig = () => {
  return {
    title: 'AI Frontend',
  };
};

/**
 * 全局 request 配置：拦截器、错误处理
 */
export const request: RequestConfig = {
  timeout: 10000,
  requestInterceptors: [
    (config: AxiosRequestConfig) => {
      const headers = {
        ...config.headers,
        'Content-Type': 'application/json',
      };
      return { ...config, headers };
    },
  ],
  responseInterceptors: [
    (response) => {
      return response;
    },
  ],
  errorConfig: {
    errorThrower: (resData: { success: boolean; errorMessage?: string }) => {
      if (!resData.success) {
        const error = new Error(
          resData.errorMessage || getIntl().formatMessage({ id: 'common.error' }),
        );
        throw error;
      }
    },
    errorHandler: (error: unknown) => {
      if (error instanceof Error) {
        console.error('Request Error:', error.message);
      }
    },
  },
};
