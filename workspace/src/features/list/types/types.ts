/**
 * @description 列表模块类型定义：列表项、查询参数、分页响应
 * @module features/list/types
 */

/** 列表项 */
export interface ListItem {
  id: string;
  title: string;
  description: string;
  status: number;
  createdAt: string;
  updatedAt: string;
}

/** 查询参数 */
export interface ListQueryParams {
  keyword?: string;
  status?: number;
  page: number;
  pageSize: number;
}

/** 分页响应 */
export interface ListResponse {
  data: ListItem[];
  total: number;
  page: number;
  pageSize: number;
}
