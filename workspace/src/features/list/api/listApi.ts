/**
 * @description 列表模块 API 请求封装
 * @module features/list/api
 * @dependencies @umijs/max request, ListQueryParams, ListResponse
 */
import { request } from '@umijs/max';
import type { ListQueryParams, ListResponse } from '../types/types';
import { API_ENDPOINTS } from '../constants';

/** 获取列表数据 */
export async function getList(params: ListQueryParams): Promise<ListResponse> {
  return request<ListResponse>(API_ENDPOINTS.LIST, {
    method: 'GET',
    params,
  });
}
