/**
 * @description 中文语言包入口，合并通用文案与模块文案
 * @module locales
 */
import list from './zh-CN/list';

export default {
  'common.submit': '提交',
  'common.confirm': '确认',
  'common.cancel': '取消',
  'common.reset': '重置',
  'common.search': '查询',
  'common.delete': '删除',
  'common.edit': '编辑',
  'common.create': '新建',
  'common.success': '操作成功',
  'common.failed': '操作失败',
  'common.loading': '加载中...',
  'common.empty': '暂无数据',
  'common.error': '请求失败，请稍后重试',
  'common.keyword': '关键词',
  'common.keyword.placeholder': '请输入关键词',
  'common.status': '状态',
  'common.status.all': '全部',
  ...list,
};
