/**
 * @description 列表模块 mock 数据，支持 keyword/status 筛选和分页
 * @module mock
 */

interface MockListItem {
  id: string;
  title: string;
  description: string;
  status: number;
  createdAt: string;
  updatedAt: string;
}

const generateMockData = (): MockListItem[] => {
  const items: MockListItem[] = [];
  for (let i = 1; i <= 56; i++) {
    items.push({
      id: `item-${String(i).padStart(3, '0')}`,
      title: `Item ${i}`,
      description: `This is the description for item ${i}`,
      status: i % 3 === 0 ? 0 : 1,
      createdAt: '2026-03-01',
      updatedAt: '2026-04-01',
    });
  }
  return items;
};

const mockData = generateMockData();

export default {
  'GET /api/list': (req: { query: Record<string, string> }, res: { json: (data: unknown) => void }) => {
    const { keyword, status, page = '1', pageSize = '10' } = req.query;
    const currentPage = Number(page);
    const currentPageSize = Number(pageSize);

    let filtered = [...mockData];

    if (keyword) {
      const lowerKeyword = keyword.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(lowerKeyword) ||
          item.description.toLowerCase().includes(lowerKeyword),
      );
    }

    if (status !== undefined && status !== '') {
      filtered = filtered.filter((item) => item.status === Number(status));
    }

    const total = filtered.length;
    const start = (currentPage - 1) * currentPageSize;
    const data = filtered.slice(start, start + currentPageSize);

    res.json({
      data,
      total,
      page: currentPage,
      pageSize: currentPageSize,
    });
  },
};
