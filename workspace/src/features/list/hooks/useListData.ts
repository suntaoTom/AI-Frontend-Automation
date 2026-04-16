/**
 * @description 列表数据逻辑 hook：管理 loading/error/data 状态，封装查询、分页、重置
 * @module features/list/hooks
 * @dependencies getList, ListItem, ListQueryParams
 * @returns { data, total, loading, error, queryParams, onSearch, onPageChange, onReset }
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ListItem, ListQueryParams } from '../types/types';
import { getList } from '../api/listApi';
import { PAGE_SIZE } from '../constants';

const DEFAULT_PARAMS: ListQueryParams = {
  page: 1,
  pageSize: PAGE_SIZE,
};

export function useListData() {
  const [data, setData] = useState<ListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [queryParams, setQueryParams] = useState<ListQueryParams>(DEFAULT_PARAMS);
  const requestIdRef = useRef(0);

  const fetchData = useCallback(async (params: ListQueryParams) => {
    const reqId = ++requestIdRef.current;
    setLoading(true);
    setError(null);
    try {
      const res = await getList(params);
      if (reqId !== requestIdRef.current) return;
      setData(res.data);
      setTotal(res.total);
    } catch (err) {
      if (reqId !== requestIdRef.current) return;
      setError(err instanceof Error ? err : new Error(String(err)));
      setData([]);
      setTotal(0);
    } finally {
      if (reqId === requestIdRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(queryParams);
  }, [queryParams, fetchData]);

  /** 重新发起当前参数的请求，用于错误重试 */
  const refetch = useCallback(() => {
    fetchData(queryParams);
  }, [fetchData, queryParams]);

  /** 搜索时重置到第 1 页 */
  const onSearch = useCallback((values: Partial<ListQueryParams>) => {
    setQueryParams((prev) => ({
      ...prev,
      ...values,
      page: 1,
    }));
  }, []);

  /** 分页切换，保留当前筛选条件 */
  const onPageChange = useCallback((page: number, pageSize: number) => {
    setQueryParams((prev) => ({
      ...prev,
      page,
      pageSize,
    }));
  }, []);

  /** 重置所有查询条件 */
  const onReset = useCallback(() => {
    setQueryParams(DEFAULT_PARAMS);
  }, []);

  return {
    data,
    total,
    loading,
    error,
    queryParams,
    onSearch,
    onPageChange,
    onReset,
    refetch,
  };
}
