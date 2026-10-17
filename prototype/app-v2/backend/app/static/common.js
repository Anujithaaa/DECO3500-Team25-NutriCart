const api = async (path, opts = {}) => {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};
const fmt = x => (x === null || x === undefined || x === '' ? '—' : x);
const money = x => (x === null || x === undefined ? 'No price' : `$${Number(x).toFixed(2)}`);
const escapeHtml = str => String(str ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

function wsConnect(onMessage) {
  const scheme = location.protocol === 'https:' ? 'wss' : 'ws';
  const ws = new WebSocket(`${scheme}://${location.host}/ws`);
  ws.onmessage = e => onMessage(JSON.parse(e.data));
  ws.onclose = () => setTimeout(() => wsConnect(onMessage), 1500);
  ws.onopen = () => setInterval(() => { try { ws.send('ping'); } catch (e) {} }, 15000);
}

function productPrice(p, store = 'Woolworths') {
  const prices = p?.prices || [];
  return prices.find(x => x.store === store) || prices[0] || null;
}

function productCard(p, compact = false) {
  if (!p) return `<div class="empty">Nothing scanned yet.</div>`;
  const n = p.nutrition || {};
  const price = productPrice(p);
  const image = p.image_url
    ? `<img class="product-image" src="${escapeHtml(p.image_url)}" alt="">`
    : `<div class="product-placeholder">▥</div>`;
  return `<div class="product-head">${image}<div class="product-copy"><div class="eyebrow">${escapeHtml(fmt(p.source))}</div><h2>${escapeHtml(fmt(p.name))}</h2><p>${escapeHtml(fmt(p.brand))} · ${escapeHtml(fmt(p.quantity))}</p><p class="barcode">${escapeHtml(fmt(p.barcode))}</p>${price ? `<div class="hero-price">${money(price.price)} <span>${escapeHtml(price.store || '')}</span></div>` : `<div class="no-price">No shelf price saved</div>`}</div></div>${compact ? '' : `<div class="metrics"><div><b>${fmt(n.protein_100g)}</b><span>Protein /100g</span></div><div><b>${fmt(n.sugars_100g)}</b><span>Sugar /100g</span></div><div><b>${fmt(n.fat_100g)}</b><span>Fat /100g</span></div><div><b>${fmt(n.energy_kj_100g)}</b><span>kJ /100g</span></div></div>`}`;
}

function alternativesHtml(data) {
  if (!data?.alternatives?.length) return `<div class="empty">No comparable products yet. Add products with the same category in Product Library.</div>`;
  const targetPrice = productPrice(data.target)?.price;
  const targetProtein = data.target?.nutrition?.protein_100g;
  const targetSugar = data.target?.nutrition?.sugars_100g;
  return data.alternatives.map((a, index) => {
    const p = a.best_price?.price;
    const protein = a.nutrition?.protein_100g;
    const sugar = a.nutrition?.sugars_100g;
    const tags = [];
    if (targetPrice && p && p < targetPrice) tags.push('Cheaper');
    if (typeof targetProtein === 'number' && typeof protein === 'number' && protein > targetProtein) tags.push('More protein');
    if (typeof targetSugar === 'number' && typeof sugar === 'number' && sugar < targetSugar) tags.push('Less sugar');
    if (!tags.length && index === 0) tags.push('Alternative');
    return `<div class="compare-row"><div><div class="compare-tags">${tags.map(t => `<span>${escapeHtml(t)}</span>`).join('')}</div><strong>${escapeHtml(a.name)}</strong><p>${escapeHtml(fmt(a.brand))} · ${escapeHtml(fmt(a.quantity))}</p><small>${fmt(protein)}g protein · ${fmt(sugar)}g sugar /100g</small></div><div class="compare-price">${p ? money(p) : '—'}</div></div>`;
  }).join('');
}
