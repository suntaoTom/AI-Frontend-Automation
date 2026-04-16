/**
 * @description listApi 单元测试
 * @module tests/features/list/api
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getList } from '@/features/list/api/listApi';
import { API_ENDPOINTS } from '@/features/list/constants';

const requestMock = vi.fn();
vi.mock('@umijs/max', () => ({
  request: (...args: unknown[]) => requestMock(...args),
}));

describe('listApi.getList', () => {
  beforeEach(() => {
    requestMock.mockReset();
  });

  it('使用 GET 方法请求 LIST 端点并透传参数', async () => {
    requestMock.mockResolvedValue({ data: [], total: 0, page: 1, pageSize: 10 });
    const params = { page: 1, pageSize: 10, keyword: 'abc', status: 1 };

    await getList(params);

    expect(requestMock).toHaveBeenCalledWith(API_ENDPOINTS.LIST, {
      method: 'GET',
      params,
    });
  });

  it('成功时返回后端响应数据', async () => {
    const resp = {
      data: [{ id: '1', title: 't', description: 'd', status: 1, createdAt: '', updatedAt: '' }],
      total: 1,
      page: 1,
      pageSize: 10,
    };
    requestMock.mockResolvedValue(resp);

    const result = await getList({ page: 1, pageSize: 10 });

    expect(result).toEqual(resp);
  });

  it('请求失败时抛出错误供上层处理', async () => {
    requestMock.mockRejectedValue(new Error('network error'));

    await expect(getList({ page: 1, pageSize: 10 })).rejects.toThrow('network error');
  });
});
