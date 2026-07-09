export const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000/api';

// Simple delay to simulate network
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function fetchWithMockFallback<T>(
  endpoint: string,
  options: RequestInit = {},
  mockStorageKey: string
): Promise<{ data: T; total?: number; last_page?: number }> {
  try {
    const url = `${API_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    }
    throw new Error('API Response not OK');
  } catch (error) {
    console.warn(`[API Fallback] Using local storage for ${endpoint}`);
    await delay(500); // simulate network

    let storage = JSON.parse(localStorage.getItem(mockStorageKey) || '[]');
    const method = options.method || 'GET';

    if (method === 'GET') {
      return { data: storage as T, total: storage.length, last_page: 1 };
    } 
    
    if (method === 'POST') {
      const body = JSON.parse(options.body as string);
      const newItem = { ...body, id: Date.now() };
      storage.unshift(newItem);
      localStorage.setItem(mockStorageKey, JSON.stringify(storage));
      return { data: newItem as T };
    }

    if (method === 'PUT') {
      const body = JSON.parse(options.body as string);
      // Assuming URL has ID at the end like /customers/123
      const id = parseInt(endpoint.split('/').pop() || '0');
      storage = storage.map((item: any) => item.id === id ? { ...item, ...body } : item);
      localStorage.setItem(mockStorageKey, JSON.stringify(storage));
      return { data: body as T };
    }

    if (method === 'DELETE') {
      const id = parseInt(endpoint.split('/').pop() || '0');
      storage = storage.filter((item: any) => item.id !== id);
      localStorage.setItem(mockStorageKey, JSON.stringify(storage));
      return { data: null as any };
    }

    throw new Error('Unsupported mock method');
  }
}
