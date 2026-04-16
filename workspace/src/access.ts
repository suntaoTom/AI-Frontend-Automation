/**
 * @description 权限配置，定义全局权限策略
 * @module src
 */
export default function access(initialState: Record<string, unknown>) {
  return {
    canAdmin: initialState?.role === 'admin',
  };
}
