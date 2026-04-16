/**
 * @description 列表页组合测试：组件编排、错误/正常分支渲染与交互
 * @module tests/pages/list
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const getListMock = vi.fn();
vi.mock('@/features/list/api/listApi', () => ({
  getList: (...args: unknown[]) => getListMock(...args),
}));

vi.mock('@umijs/max', () => ({
  useIntl: () => ({
    formatMessage: ({ id }: { id: string }, values?: Record<string, unknown>) =>
      values ? `${id}:${JSON.stringify(values)}` : id,
  }),
}));

vi.mock('@/features/list/components/SearchForm.module.less', () => ({ default: {} }));

import ListPage from '@/pages/list';
import { PAGE_SIZE } from '@/features/list/constants';

const okResponse = (overrides = {}) => ({
  data: [
    { id: '1', title: '标题A', description: '描述A', status: 1, createdAt: '', updatedAt: '' },
  ],
  total: 1,
  page: 1,
  pageSize: PAGE_SIZE,
  ...overrides,
});

describe('ListPage', () => {
  beforeEach(() => {
    getListMock.mockReset();
  });

  it('挂载时加载并渲染列表数据', async () => {
    getListMock.mockResolvedValue(okResponse());
    render(<ListPage />);

    await waitFor(() => {
      expect(screen.getByText('标题A')).toBeInTheDocument();
    });
    expect(getListMock).toHaveBeenCalledWith({ page: 1, pageSize: PAGE_SIZE });
  });

  it('请求报错时展示 Result 错误页并可点击重试', async () => {
    getListMock.mockRejectedValueOnce(new Error('fail'));
    render(<ListPage />);

    await waitFor(() => {
      expect(screen.getByText('list.error.title')).toBeInTheDocument();
    });

    getListMock.mockResolvedValueOnce(
      okResponse({
        data: [
          { id: '2', title: '重试后', description: 'd', status: 1, createdAt: '', updatedAt: '' },
        ],
      }),
    );
    await userEvent.setup().click(screen.getByRole('button', { name: 'list.error.retry' }));

    await waitFor(() => {
      expect(screen.getByText('重试后')).toBeInTheDocument();
    });
  });

  it('提交查询时携带关键词并重置到第 1 页', async () => {
    getListMock.mockResolvedValue(okResponse());
    const user = userEvent.setup();
    render(<ListPage />);
    await waitFor(() => expect(getListMock).toHaveBeenCalledTimes(1));

    await user.type(screen.getByPlaceholderText('common.keyword.placeholder'), 'foo');
    await user.click(screen.getByRole('button', { name: /common\.search/ }));

    await waitFor(() => {
      expect(getListMock).toHaveBeenLastCalledWith(
        expect.objectContaining({ keyword: 'foo', page: 1 }),
      );
    });
  });

  it('重置按钮恢复为默认查询并刷新', async () => {
    getListMock.mockResolvedValue(okResponse());
    const user = userEvent.setup();
    render(<ListPage />);
    await waitFor(() => expect(getListMock).toHaveBeenCalledTimes(1));

    await user.type(screen.getByPlaceholderText('common.keyword.placeholder'), 'foo');
    await user.click(screen.getByRole('button', { name: /common\.search/ }));
    await waitFor(() =>
      expect(getListMock).toHaveBeenLastCalledWith(
        expect.objectContaining({ keyword: 'foo' }),
      ),
    );

    await user.click(screen.getByRole('button', { name: /common\.reset/ }));

    await waitFor(() => {
      expect(getListMock).toHaveBeenLastCalledWith({ page: 1, pageSize: PAGE_SIZE });
    });
  });

  it('空数据时展示 Empty 空状态', async () => {
    getListMock.mockResolvedValue(okResponse({ data: [], total: 0 }));
    render(<ListPage />);

    await waitFor(() => {
      expect(screen.getByText('common.empty')).toBeInTheDocument();
    });
  });
});
