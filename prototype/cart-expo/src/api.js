export const API_URL = (process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.20:8000').replace(/\/$/, '');
export const WS_URL = API_URL.replace(/^http/, 'ws') + '/ws';

export async function api(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `HTTP ${response.status}`);
  }
  return response.json();
}

export const money = value => value === null || value === undefined ? 'No price' : `$${Number(value).toFixed(2)}`;
export const valueOrDash = value => value === null || value === undefined || value === '' ? '—' : String(value);

export function productPrice(product, store = 'Woolworths') {
  const prices = product?.prices || [];
  return prices.find(p => p.store === store) || prices[0] || null;
}
