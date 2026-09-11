import { mockApiResponse } from './axios';
import { mockSearchItems } from '../data/mockData';

export const searchService = {
  query: async (term, category = 'All') => {
    if (!term || !term.trim()) return mockApiResponse([]);

    const lower = term.toLowerCase();
    let results = mockSearchItems.filter(
      (item) =>
        item.title.toLowerCase().includes(lower) ||
        item.category.toLowerCase().includes(lower) ||
        item.description.toLowerCase().includes(lower)
    );

    if (category !== 'All') {
      results = results.filter((i) => i.category === category);
    }

    return mockApiResponse(results);
  },
  getRecentSearches: () => [
    'Generative AI RAG Architecture',
    'Kubernetes RBAC Policy',
    'Data & AI Department',
    'Alex Rivera',
  ],
  getPopularSearches: () => [
    'React 19 Migration Guide',
    'Zero Trust Security Blueprint',
    'Python AI Pipelines',
    'Cloud Cost Optimization',
  ],
};
