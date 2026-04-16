/**
 * @description 列表页面：组合 SearchForm + DataTable，通过 useListData 获取数据
 * @module pages/list
 * @dependencies useListData, SearchForm, DataTable, antd Card/Result
 */
import { Button, Card, Result } from 'antd';
import { useIntl } from '@umijs/max';
import { useListData } from '@/features/list/hooks/useListData';
import SearchForm from '@/features/list/components/SearchForm';
import DataTable from '@/features/list/components/DataTable';

const ListPage: React.FC = () => {
  const intl = useIntl();
  const { data, total, loading, error, queryParams, onSearch, onPageChange, onReset, refetch } =
    useListData();

  return (
    <Card>
      <SearchForm onSearch={onSearch} onReset={onReset} loading={loading} />
      {error ? (
        <Result
          status="error"
          title={intl.formatMessage({ id: 'list.error.title' })}
          subTitle={intl.formatMessage({ id: 'list.error.subtitle' })}
          extra={
            <Button type="primary" onClick={refetch}>
              {intl.formatMessage({ id: 'list.error.retry' })}
            </Button>
          }
        />
      ) : (
        <DataTable
          dataSource={data}
          total={total}
          current={queryParams.page}
          pageSize={queryParams.pageSize}
          loading={loading}
          onPageChange={onPageChange}
        />
      )}
    </Card>
  );
};

export default ListPage;
