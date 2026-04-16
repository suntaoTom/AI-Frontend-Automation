/**
 * @description 列表模块常量：分页大小、状态枚举、表格列配置
 * @module features/list
 * @dependencies features/list/types
 */

/** 默认分页大小 */
export const PAGE_SIZE = 10;

/** 状态枚举 */
export const STATUS = {
  ENABLED: 1,
  DISABLED: 0,
} as const;

/** 状态下拉选项，label 为国际化 key */
export const STATUS_OPTIONS = [
  { label: 'list.status.enabled', value: STATUS.ENABLED },
  { label: 'list.status.disabled', value: STATUS.DISABLED },
] as const;

/** 表格列配置，title 为国际化 key */
export const TABLE_COLUMNS = [
  { titleKey: 'list.column.title', dataIndex: 'title' },
  { titleKey: 'list.column.description', dataIndex: 'description' },
  { titleKey: 'list.column.status', dataIndex: 'status' },
  { titleKey: 'list.column.createdAt', dataIndex: 'createdAt' },
  { titleKey: 'list.column.updatedAt', dataIndex: 'updatedAt' },
] as const;

/** API 端点 */
export const API_ENDPOINTS = {
  LIST: '/api/list',
} as const;
