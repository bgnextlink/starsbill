export const API_URL = (import.meta as any).env?.VITE_API_URL || '/api';

export async function fetchWithMockFallback<T>(
  endpoint: string,
  options: RequestInit = {},
  mockStorageKey: string // retained for backwards compatibility with function signature
): Promise<{ data: T; total?: number; last_page?: number }> {
  const url = `${API_URL}${endpoint.replace('/api', '')}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();
    if (response.ok) {
      return data;
    } else {
      throw new Error(data.error || 'Terjadi kesalahan pada server.');
    }
  } catch (error: any) {
    console.error('API Error:', error);
    throw new Error(error.message || 'Koneksi API / Database gagal.');
  }
}
