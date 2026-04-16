/**
 * @description English language pack entry, merging common and module texts
 * @module locales
 */
import list from './en-US/list';

export default {
  'common.submit': 'Submit',
  'common.confirm': 'Confirm',
  'common.cancel': 'Cancel',
  'common.reset': 'Reset',
  'common.search': 'Search',
  'common.delete': 'Delete',
  'common.edit': 'Edit',
  'common.create': 'Create',
  'common.success': 'Success',
  'common.failed': 'Failed',
  'common.loading': 'Loading...',
  'common.empty': 'No Data',
  'common.error': 'Request failed, please try again later',
  'common.keyword': 'Keyword',
  'common.keyword.placeholder': 'Enter keyword',
  'common.status': 'Status',
  'common.status.all': 'All',
  ...list,
};
