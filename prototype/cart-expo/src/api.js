export const API_URL = (process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.20:8000').replace(/\/$/, '');
export const WS_URL = API_URL.replace(/^http/, 'ws') + '/ws';

export async function api(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  if (!response.ok) {
    let text = await response.text();
    try { text = JSON.parse(text).detail || text; } catch (e) {}
    throw new Error(text || `HTTP ${response.status}`);
  }
  return response.json();
}
export const post = (path, body) => api(path, { method: 'POST', body: JSON.stringify(body || {}) });
export const patch = (path, body) => api(path, { method: 'PATCH', body: JSON.stringify(body || {}) });

export const money = value => value === null || value === undefined ? 'No price' : `$${Number(value).toFixed(2)}`;
export const valueOrDash = value => value === null || value === undefined || value === '' ? '—' : String(value);
export const whoLabel = name => (!name || name === 'Household' ? 'Household' : name);

export function productPrice(product, store = 'Woolworths') {
  const prices = product?.prices || [];
  return prices.find(p => p.store === store) || prices[0] || null;
}

export function shopSpent(state) {
  if (!state?.shop) return 0;
  return (state.shopping_items || [])
    .filter(i => i.status === 'bought' && i.shop_id === state.shop.id && i.price_paid != null)
    .reduce((a, i) => a + Number(i.price_paid), 0);
}
