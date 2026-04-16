/**
 * @description DataTable 组件单元测试
 * @module tests/features/list/components
 */
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@umijs/max', () => ({
  useIntl: () => ({
    formatMessage: ({ id }: { id: string }, values?: Record<string, unknown>) =>
      values ? `${id}:${JSON.stringify(values)}` : id,
  }),
}));

import DataTable from '@/features/list/components/DataTable';
import type { ListItem } from '@/features/list/types/types';

const makeItem = (overrides: Partial<ListItem> = {}): ListItem => ({
  id: '1',
  title: '标题1',
  description: '描述1',
  status: 1,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-02',
  ...overrides,
});

const defaultProps = {
  dataSource: [makeItem()],
  total: 1,
  current: 1,
  pageSize: 10,
  loading: false,
  onPageChange: vi.fn(),
};

describe('DataTable', () => {
  it('渲染数据行与列标题', () => {
    render(<DataTable {...defaultProps} />);
    expect(screen.getByText('list.column.title')).toBeInTheDocument();
    expect(screen.getByText('标题1')).toBeInTheDocument();
    expect(screen.getByText('描述1')).toBeInTheDocument();
  });

  it('启用状态行渲染为 enabled 文案', () => {
    render(<DataTable {...defaultProps} dataSource={[makeItem({ status: 1 })]} />);
    expect(screen.getByText('list.status.enabled')).toBeInTheDocument();
  });

  it('禁用状态行渲染为 disabled 文案', () => {
    render(<DataTable {...defaultProps} dataSource={[makeItem({ status: 0 })]} />);
    expect(screen.getByText('list.status.disabled')).toBeInTheDocument();
  });

  it('数据为空时展示 Empty 空状态', () => {
    render(<DataTable {...defaultProps} dataSource={[]} total={0} />);
    expect(screen.getByText('common.empty')).toBeInTheDocument();
  });

  it('loading 为 true 时展示加载指示器', () => {
    const { container } = render(<DataTable {...defaultProps} loading />);
    expect(container.querySelector('.ant-spin')).toBeTruthy();
  });

  it('分页器显示总条数文案', () => {
    render(<DataTable {...defaultProps} total={123} />);
    expect(screen.getByText(/list\.pagination\.total/)).toBeInTheDocument();
  });

  it('切换分页触发 onPageChange', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    const dataSource = Array.from({ length: 10 }, (_, i) =>
      makeItem({ id: String(i + 1), title: `t${i + 1}` }),
    );
    render(
      <DataTable
        {...defaultProps}
        dataSource={dataSource}
        total={25}
        current={1}
        pageSize={10}
        onPageChange={onPageChange}
      />,
    );

    const pagination = document.querySelector('.ant-pagination') as HTMLElement;
    const nextBtn = within(pagination).getByTitle('2');
    await user.click(nextBtn);

    expect(onPageChange).toHaveBeenCalledWith(2, 10);
  });

  it('每行使用 id 作为 rowKey 正常渲染多条数据', () => {
    const data = [
      makeItem({ id: 'a', title: 'A' }),
      makeItem({ id: 'b', title: 'B' }),
    ];
    render(<DataTable {...defaultProps} dataSource={data} total={2} />);
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
  });

  it('能够渲染超长文本与特殊字符', () => {
    const longTitle = '长'.repeat(100);
    const special = '<script>&"\'';
    render(
      <DataTable
        {...defaultProps}
        dataSource={[makeItem({ title: longTitle, description: special })]}
      />,
    );
    expect(screen.getByText(longTitle)).toBeInTheDocument();
    expect(screen.getByText(special)).toBeInTheDocument();
  });
});
