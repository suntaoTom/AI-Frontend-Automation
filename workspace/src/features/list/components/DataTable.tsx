/**
 * @description 数据表格组件：antd Table + 受控分页 + 空状态 + loading
 * @module features/list/components
 * @dependencies antd Table/Tag/Empty, useIntl, TABLE_COLUMNS, STATUS
 * @example
 *   <DataTable dataSource={data} total={100} current={1} pageSize={10}
 *     loading={false} onPageChange={handlePageChange} />
 */
import { Empty, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useIntl } from '@umijs/max';
import type { ListItem } from '../types/types';
import { STATUS, TABLE_COLUMNS } from '../constants';

export interface DataTableProps {
  dataSource: ListItem[];
  total: number;
  current: number;
  pageSize: number;
  loading: boolean;
  onPageChange: (page: number, pageSize: number) => void;
}

const DataTable: React.FC<DataTableProps> = ({
  dataSource,
  total,
  current,
  pageSize,
  loading,
  onPageChange,
}) => {
  const intl = useIntl();

  const renderStatus = (status: number) => {
    const isEnabled = status === STATUS.ENABLED;
    return (
      <Tag color={isEnabled ? 'success' : 'default'}>
        {intl.formatMessage({
          id: isEnabled ? 'list.status.enabled' : 'list.status.disabled',
        })}
      </Tag>
    );
  };

  const columns: ColumnsType<ListItem> = TABLE_COLUMNS.map((col) => ({
    title: intl.formatMessage({ id: col.titleKey }),
    dataIndex: col.dataIndex,
    key: col.dataIndex,
    ...(col.dataIndex === 'status' ? { render: renderStatus } : {}),
  }));

  return (
    <Table<ListItem>
      rowKey="id"
      columns={columns}
      dataSource={dataSource}
      loading={loading}
      locale={{
        emptyText: <Empty description={intl.formatMessage({ id: 'common.empty' })} />,
      }}
      pagination={{
        current,
        pageSize,
        total,
        showTotal: (t) =>
          intl.formatMessage({ id: 'list.pagination.total' }, { total: t }),
        showSizeChanger: true,
        onChange: onPageChange,
      }}
    />
  );
};

export default DataTable;
