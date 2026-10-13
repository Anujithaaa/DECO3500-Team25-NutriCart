// Shared helpers for the Home Dock and the web Cart Unit.
const api = async (path, opts = {}) => {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts,
  });
  if (!res.ok) {
    let detail = await res.text();
    try { detail = JSON.parse(detail).detail || detail; } catch (e) {}
    throw new Error(detail);
  }
  return res.json();
};
// After this screen changes something, refresh it straight away (other screens hear it live).
const afterWrite = r => { try { if (typeof window.onWrite === 'function') window.onWrite(); } catch (e) {} return r; };
const post = (path, body) => api(path, { method: 'POST', body: JSON.stringify(body || {}) }).then(afterWrite);
const patch = (path, body) => api(path, { method: 'PATCH', body: JSON.stringify(body || {}) }).then(afterWrite);
const del = path => api(path, { method: 'DELETE' }).then(afterWrite);

const fmt = x => (x === null || x === undefined || x === '' ? '—' : x);
const money = x => (x === null || x === undefined ? 'No price' : `$${Number(x).toFixed(2)}`);
const escapeHtml = str => String(str ?? '').replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));
const $ = sel => document.querySelector(sel);

// Small per-device memory (which housemate this Cart Unit belongs to, etc).
const store = {
  get(k, d = null) { try { const v = localStorage.getItem('nc_' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('nc_' + k, JSON.stringify(v)); } catch (e) {} },
};

// Live updates: WebSocket first; if it drops (e.g. on locked-down Wi-Fi) we poll every 4 s.
function live(onChange) {
  let ws = null, open = false, pingTimer = null;
  const setStatus = on => { const el = document.getElementById('liveStatus'); if (el) { el.textContent = on ? 'Live' : 'Reconnecting…'; el.parentElement.classList.toggle('off', !on); } };
  function connect() {
    try {
      const scheme = location.protocol === 'https:' ? 'wss' : 'ws';
      ws = new WebSocket(`${scheme}://${location.host}/ws`);
      ws.onopen = () => { open = true; setStatus(true); clearInterval(pingTimer); pingTimer = setInterval(() => { try { ws.send('ping'); } catch (e) {} }, 15000); };
      ws.onmessage = e => { let msg = {}; try { msg = JSON.parse(e.data); } catch (err) {} onChange(msg); };
      ws.onclose = () => { open = false; clearInterval(pingTimer); setTimeout(connect, 2000); };
      ws.onerror = () => { try { ws.close(); } catch (e) {} };
    } catch (e) { setTimeout(connect, 4000); }
  }
  connect();
  setInterval(() => {
    if (open) return;
    const el = document.getElementById('liveStatus');
    if (el && el.textContent !== 'Server offline') { el.textContent = 'Live (polling)'; el.parentElement.classList.remove('off'); }
    onChange({ type: 'poll' });
  }, 4000);
}

function toast(text, ms = 3200) {
  let el = document.getElementById('toast');
  if (!el) { el = document.createElement('div'); el.id = 'toast'; document.body.appendChild(el); }
  el.textContent = text; el.classList.add('show');
  clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('show'), ms);
}

function memberOf(state, name) { return (state.members || []).find(m => m.name === name); }
function dot(state, name) {
  const m = memberOf(state, name);
  return `<span class="mdot" style="background:${m ? m.colour : '#9aa49f'}"></span>`;
}
function whoLabel(name) { return name === 'Household' || !name ? 'Household' : name; }

function shopSpent(state) {
  if (!state.shop) return 0;
  return (state.shopping_items || []).filter(i => i.status === 'bought' && i.shop_id === state.shop.id && i.price_paid != null)
    .reduce((a, i) => a + Number(i.price_paid), 0);
}

function productPrice(p, storeName = 'Woolworths') {
  const prices = p?.prices || [];
  return prices.find(x => x.store === storeName) || prices[0] || null;
}

function productCard(p, compact = false) {
  if (!p) return `<div class="empty">Nothing scanned yet.</div>`;
  const n = p.nutrition || {};
  const price = productPrice(p);
  const image = p.image_url ? `<img class="product-image" src="${escapeHtml(p.image_url)}" alt="">` : `<div class="product-placeholder">▥</div>`;
  return `<div class="product-head">${image}<div class="product-copy"><div class="eyebrow">${escapeHtml(fmt(p.source))}</div><h2>${escapeHtml(fmt(p.name))}</h2><p>${escapeHtml(fmt(p.brand))} · ${escapeHtml(fmt(p.quantity))}</p><p class="barcode">${escapeHtml(fmt(p.barcode))}</p>${price ? `<div class="hero-price">${money(price.price)} <span>${escapeHtml(price.store || '')}</span></div>` : `<div class="no-price">No shelf price saved</div>`}</div></div>${compact ? '' : `<div class="metrics"><div><b>${fmt(n.protein_100g)}</b><span>Protein /100g</span></div><div><b>${fmt(n.sugars_100g)}</b><span>Sugar /100g</span></div><div><b>${fmt(n.fat_100g)}</b><span>Fat /100g</span></div><div><b>${fmt(n.energy_kj_100g)}</b><span>kJ /100g</span></div></div>`}`;
}

// Neutral comparison: facts only, ordered by the priority the shopper picked. No "healthier" verdict.
function alternativesHtml(data) {
  if (!data?.alternatives?.length) return `<div class="empty">No comparable products yet. Add products with the same category in the Product library.</div>`;
  const targetPrice = productPrice(data.target)?.price;
  const targetProtein = data.target?.nutrition?.protein_100g;
  const targetSugar = data.target?.nutrition?.sugars_100g;
  return data.alternatives.map(a => {
    const p = a.best_price?.price;
    const protein = a.nutrition?.protein_100g;
    const sugar = a.nutrition?.sugars_100g;
    const tags = [];
    if (targetPrice && p && p < targetPrice) tags.push(`$${(targetPrice - p).toFixed(2)} cheaper`);
    if (typeof targetProtein === 'number' && typeof protein === 'number' && protein > targetProtein) tags.push('More protein');
    if (typeof targetSugar === 'number' && typeof sugar === 'number' && sugar < targetSugar) tags.push('Less sugar');
    return `<div class="compare-row"><div><div class="compare-tags">${tags.map(t => `<span>${escapeHtml(t)}</span>`).join('')}</div><strong>${escapeHtml(a.name)}</strong><p>${escapeHtml(fmt(a.brand))} · ${escapeHtml(fmt(a.quantity))}</p><small>${fmt(protein)}g protein · ${fmt(sugar)}g sugar /100g${a.best_price?.unit_price ? ' · ' + escapeHtml(a.best_price.unit_price) : ''}</small></div><div class="compare-price">${p ? money(p) : '—'}</div></div>`;
  }).join('');
}

function summaryHtml(s, state) {
  if (!s) return '';
  const owes = (s.owes || []).map(o => `<li>${dot(state, o.from)}<b>${escapeHtml(o.from)}</b> owes ${escapeHtml(o.to)} <b>${money(o.amount)}</b></li>`).join('') || '<li>Nobody owes anything for this shop.</li>';
  const bought = (s.bought || []).map(b => `<span class="chip">${escapeHtml(b.name)}${b.price != null ? ' · ' + money(b.price) : ''}${b.off_list ? ' · off-list' : ''}</span>`).join('');
  return `<div class="summary-grid">
    <div><div class="big">${money(s.total)}</div><div class="muted">spent by ${escapeHtml(s.shopper)}${s.helpers?.length ? ' with ' + s.helpers.map(escapeHtml).join(', ') : ''}${s.budget != null ? ` · ${s.under_budget >= 0 ? money(s.under_budget) + ' under' : money(-s.under_budget) + ' over'} the ${money(s.budget)} budget` : ''}</div></div>
    <ul class="owes">${owes}</ul></div>
    <div class="chips" style="margin-top:12px">${bought}</div>
    ${s.unpriced?.length ? `<p class="muted small">No price recorded for: ${s.unpriced.map(escapeHtml).join(', ')}. Settle these by hand.</p>` : ''}
    ${s.still_needed?.length ? `<p class="muted small">Still on the list for next time: ${s.still_needed.map(escapeHtml).join(', ')}.</p>` : ''}`;
}
