/**
 * @description 查询表单组件：关键词输入、状态下拉、查询/重置按钮
 * @module features/list/components
 * @dependencies antd Form/Input/Select/Button, useIntl, STATUS_OPTIONS
 * @example
 *   <SearchForm onSearch={handleSearch} onReset={handleReset} loading={loading} />
 */
import { Button, Col, Form, Input, Row, Select } from 'antd';
import { useIntl } from '@umijs/max';
import type { ListQueryParams } from '../types/types';
import { STATUS_OPTIONS } from '../constants';
import styles from './SearchForm.module.less';

export interface SearchFormProps {
  onSearch: (values: Partial<ListQueryParams>) => void;
  onReset: () => void;
  loading: boolean;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch, onReset, loading }) => {
  const [form] = Form.useForm();
  const intl = useIntl();

  const handleFinish = (values: Partial<ListQueryParams>) => {
    onSearch(values);
  };

  const handleReset = () => {
    form.resetFields();
    onReset();
  };

  const statusOptions = STATUS_OPTIONS.map((opt) => ({
    label: intl.formatMessage({ id: opt.label }),
    value: opt.value,
  }));

  return (
    <Form form={form} layout="inline" onFinish={handleFinish}>
      <Row gutter={16}>
        <Col>
          <Form.Item name="keyword">
            <Input
              placeholder={intl.formatMessage({ id: 'common.keyword.placeholder' })}
              allowClear
            />
          </Form.Item>
        </Col>
        <Col>
          <Form.Item name="status">
            <Select
              placeholder={intl.formatMessage({ id: 'common.status.all' })}
              allowClear
              options={statusOptions}
              className={styles.statusSelect}
            />
          </Form.Item>
        </Col>
        <Col>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              {intl.formatMessage({ id: 'common.search' })}
            </Button>
          </Form.Item>
        </Col>
        <Col>
          <Form.Item>
            <Button onClick={handleReset}>
              {intl.formatMessage({ id: 'common.reset' })}
            </Button>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

export default SearchForm;
