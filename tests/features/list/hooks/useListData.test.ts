/**
 * @description useListData hook 单元测试
 * @module tests/features/list/hooks
 */
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const getListMock = vi.fn();
vi.mock('@/features/list/api/listApi', () => ({
  getList: (...args: unknown[]) => getListMock(...args),
}));

import { useListData } from '@/features/list/hooks/useListData';
import { PAGE_SIZE } from '@/features/list/constants';

const buildResponse = (overrides = {}) => ({
  data: [{ id: '1', title: 't', description: 'd', status: 1, createdAt: '', updatedAt: '' }],
  total: 1,
  page: 1,
  pageSize: PAGE_SIZE,
  ...overrides,
});

describe('useListData', () => {
  beforeEach(() => {
    getListMock.mockReset();
  });

  it('挂载时自动请求默认参数', async () => {
    getListMock.mockResolvedValue(buildResponse());
    renderHook(() => useListData());

    await waitFor(() => {
      expect(getListMock).toHaveBeenCalledWith({ page: 1, pageSize: PAGE_SIZE });
    });
  });

  it('请求成功后更新 data 与 total', async () => {
    const resp = buildResponse({ total: 42 });
    getListMock.mockResolvedValue(resp);

    const { result } = renderHook(() => useListData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.data).toEqual(resp.data);
    expect(result.current.total).toBe(42);
    expect(result.current.error).toBeNull();
  });

  it('请求失败时设置 error 并清空数据', async () => {
    getListMock.mockRejectedValue(new Error('boom'));
    const { result } = renderHook(() => useListData());

    await waitFor(() => {
      expect(result.current.error).toBeInstanceOf(Error);
    });
    expect(result.current.error?.message).toBe('boom');
    expect(result.current.data).toEqual([]);
    expect(result.current.total).toBe(0);
  });

  it('onSearch 合并条件并重置到第 1 页', async () => {
    getListMock.mockResolvedValue(buildResponse());
    const { result } = renderHook(() => useListData());

    await waitFor(() => expect(getListMock).toHaveBeenCalledTimes(1));

    act(() => {
      result.current.onPageChange(3, PAGE_SIZE);
    });
    await waitFor(() => expect(result.current.queryParams.page).toBe(3));

    act(() => {
      result.current.onSearch({ keyword: 'x', status: 1 });
    });

    await waitFor(() => {
      expect(result.current.queryParams).toMatchObject({
        keyword: 'x',
        status: 1,
        page: 1,
      });
    });
  });

  it('onPageChange 保留筛选条件仅更新分页', async () => {
    getListMock.mockResolvedValue(buildResponse());
    const { result } = renderHook(() => useListData());
    await waitFor(() => expect(getListMock).toHaveBeenCalled());

    act(() => result.current.onSearch({ keyword: 'hello' }));
    await waitFor(() => expect(result.current.queryParams.keyword).toBe('hello'));

    act(() => result.current.onPageChange(2, 20));

    await waitFor(() => {
      expect(result.current.queryParams).toMatchObject({
        keyword: 'hello',
        page: 2,
        pageSize: 20,
      });
    });
  });

  it('onReset 恢复默认查询参数', async () => {
    getListMock.mockResolvedValue(buildResponse());
    const { result } = renderHook(() => useListData());
    await waitFor(() => expect(getListMock).toHaveBeenCalled());

    act(() => result.current.onSearch({ keyword: 'foo', status: 0 }));
    await waitFor(() => expect(result.current.queryParams.keyword).toBe('foo'));

    act(() => result.current.onReset());

    await waitFor(() => {
      expect(result.current.queryParams).toEqual({ page: 1, pageSize: PAGE_SIZE });
    });
  });

  it('refetch 以当前参数重新请求', async () => {
    getListMock.mockResolvedValue(buildResponse());
    const { result } = renderHook(() => useListData());
    await waitFor(() => expect(getListMock).toHaveBeenCalledTimes(1));

    act(() => result.current.refetch());

    await waitFor(() => expect(getListMock).toHaveBeenCalledTimes(2));
  });

  it('并发请求时只采用最新一次的响应', async () => {
    let resolveFirst: (v: unknown) => void = () => {};
    const firstPromise = new Promise((r) => {
      resolveFirst = r;
    });
    getListMock.mockReturnValueOnce(firstPromise);
    getListMock.mockResolvedValueOnce(buildResponse({ total: 999 }));

    const { result } = renderHook(() => useListData());

    act(() => result.current.onSearch({ keyword: 'second' }));
    await waitFor(() => expect(result.current.total).toBe(999));

    act(() => {
      resolveFirst(buildResponse({ total: 1 }));
    });
    await Promise.resolve();
    expect(result.current.total).toBe(999);
  });
});
