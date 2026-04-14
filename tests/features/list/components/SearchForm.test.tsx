/**
 * @description SearchForm 组件单元测试
 * @module tests/features/list/components
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@umijs/max', () => ({
  useIntl: () => ({
    formatMessage: ({ id }: { id: string }) => id,
  }),
}));

vi.mock('@/features/list/components/SearchForm.module.less', () => ({ default: {} }));

import SearchForm from '@/features/list/components/SearchForm';

const setup = (props?: Partial<React.ComponentProps<typeof SearchForm>>) => {
  const onSearch = vi.fn();
  const onReset = vi.fn();
  render(
    <SearchForm onSearch={onSearch} onReset={onReset} loading={false} {...props} />,
  );
  return { onSearch, onReset };
};

describe('SearchForm', () => {
  it('正常渲染关键词输入框、状态下拉、查询与重置按钮', () => {
    setup();
    expect(screen.getByPlaceholderText('common.keyword.placeholder')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'common.search' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'common.reset' })).toBeInTheDocument();
  });

  it('loading 为 true 时查询按钮进入 loading 态', () => {
    setup({ loading: true });
    const btn = screen.getByRole('button', { name: /common\.search/ });
    expect(btn).toHaveClass('ant-btn-loading');
  });

  it('输入关键词并点击查询触发 onSearch 并携带值', async () => {
    const user = userEvent.setup();
    const { onSearch } = setup();

    await user.type(screen.getByPlaceholderText('common.keyword.placeholder'), 'hello');
    await user.click(screen.getByRole('button', { name: 'common.search' }));

    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch.mock.calls[0][0]).toMatchObject({ keyword: 'hello' });
  });

  it('空输入点击查询仍然触发 onSearch', async () => {
    const user = userEvent.setup();
    const { onSearch } = setup();

    await user.click(screen.getByRole('button', { name: 'common.search' }));

    expect(onSearch).toHaveBeenCalledTimes(1);
  });

  it('点击重置按钮清空表单并触发 onReset', async () => {
    const user = userEvent.setup();
    const { onReset } = setup();

    const input = screen.getByPlaceholderText('common.keyword.placeholder') as HTMLInputElement;
    await user.type(input, 'foo');
    await user.click(screen.getByRole('button', { name: 'common.reset' }));

    expect(onReset).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      const current = screen.getByPlaceholderText(
        'common.keyword.placeholder',
      ) as HTMLInputElement;
      expect(current.value).toBe('');
    });
  });

  it('支持超长关键词输入', async () => {
    const user = userEvent.setup();
    const { onSearch } = setup();
    const longText = 'a'.repeat(200);

    await user.type(screen.getByPlaceholderText('common.keyword.placeholder'), longText);
    await user.click(screen.getByRole('button', { name: 'common.search' }));

    expect(onSearch.mock.calls[0][0].keyword).toBe(longText);
  });
});
