// NutriCart Cart Unit (Expo Go). v0.2 by James Olbes: camera barcode scanning, product compare, shared list.
// v0.3 adds the household layer to match the Home Dock: who is shopping, running budget, requests,
// Ask home, Split Shop, off-list items and the return summary with a cost split.
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator, Alert, Image, KeyboardAvoidingView, Modal, Platform, Pressable, SafeAreaView,
  ScrollView, StatusBar, StyleSheet, Text, TextInput, Vibration, View,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { API_URL, WS_URL, api, money, patch, post, productPrice, shopSpent, valueOrDash, whoLabel } from './src/api';
import { C } from './src/theme';

const TABS = [['list', 'List', '✓'], ['ask', 'Ask home', '?'], ['scan', 'Scan', '▥'], ['finish', 'Finish', '⌂']];
const TEMPLATES = [
  ['Do we still have ___?', 'Yes, No, Not sure'],
  ['Brand A or brand B?', "A, B, Don't mind"],
  ['Anything else you need?', "No thanks, I'll add it"],
];
const PRIORITIES = [['price', 'Price'], ['protein', 'Protein'], ['sugar', 'Less sugar']];

function Pill({ children, tone = 'green' }) {
  return <View style={[s.pill, tone === 'sand' && s.pillSand, tone === 'blue' && s.pillBlue]}><Text style={[s.pillText, tone === 'sand' && s.pillSandText, tone === 'blue' && s.pillBlueText]}>{children}</Text></View>;
}
function Card({ children, style }) { return <View style={[s.card, style]}>{children}</View>; }
function Kicker({ children }) { return <Text style={s.kicker}>{children}</Text>; }
function Dot({ colour }) { return <View style={[s.dot, { backgroundColor: colour || '#9AA49F' }]} />; }
function Button({ title, onPress, kind = 'primary', style }) {
  return <Pressable onPress={onPress} style={[kind === 'primary' ? s.primaryButton : s.secondaryButton, style]}><Text style={kind === 'primary' ? s.primaryButtonText : s.secondaryButtonText}>{title}</Text></Pressable>;
}
function Seg({ options, value, onChange }) {
  return <View style={s.seg}>{options.map(([k, l]) => <Pressable key={k} onPress={() => onChange(k)} style={[s.segBtn, value === k && s.segOn]}><Text style={[s.segText, value === k && s.segTextOn]}>{l}</Text></Pressable>)}</View>;
}

function ProductCard({ product }) {
  if (!product) return <View style={s.empty}><Text style={s.emptyText}>Scan a product only when you're unsure between options.</Text></View>;
  const price = productPrice(product);
  const n = product.nutrition || {};
  return <View>
    <View style={s.productHead}>
      {product.image_url ? <Image source={{ uri: product.image_url }} style={s.productImage} resizeMode="contain" /> : <View style={s.productPlaceholder}><Text style={s.productPlaceholderText}>▥</Text></View>}
      <View style={{ flex: 1 }}>
        <Pill>{valueOrDash(product.source)}</Pill>
        <Text style={s.productName}>{valueOrDash(product.name)}</Text>
        <Text style={s.productMeta}>{valueOrDash(product.brand)} · {valueOrDash(product.quantity)}</Text>
        {price ? <Text style={s.price}>{money(price.price)} <Text style={s.priceStore}>{price.store}</Text></Text> : <Pill tone="sand">No shelf price saved</Pill>}
      </View>
    </View>
    <View style={s.metrics}>
      {[['protein_100g', 'Protein /100g'], ['sugars_100g', 'Sugar /100g'], ['fat_100g', 'Fat /100g'], ['energy_kj_100g', 'kJ /100g']].map(([k, l]) =>
        <View key={k} style={s.metric}><Text style={s.metricValue}>{valueOrDash(n[k])}</Text><Text style={s.metricLabel}>{l}</Text></View>)}
    </View>
  </View>;
}

// Facts only, in the order the shopper chose. Never a "healthier" verdict.
function CompareList({ comparison }) {
  const alternatives = comparison?.alternatives || [];
  if (!alternatives.length) return <View style={s.empty}><Text style={s.emptyText}>No comparable products yet. Add products with the same category in the Dock's Product library.</Text></View>;
  const target = comparison.target;
  const tp = productPrice(target)?.price, tpro = target?.nutrition?.protein_100g, tsug = target?.nutrition?.sugars_100g;
  return <View>{alternatives.map(a => {
    const price = a.best_price?.price; const tags = [];
    if (tp && price && price < tp) tags.push(`$${(tp - price).toFixed(2)} CHEAPER`);
    if (typeof tpro === 'number' && typeof a.nutrition?.protein_100g === 'number' && a.nutrition.protein_100g > tpro) tags.push('MORE PROTEIN');
    if (typeof tsug === 'number' && typeof a.nutrition?.sugars_100g === 'number' && a.nutrition.sugars_100g < tsug) tags.push('LESS SUGAR');
    return <View key={a.barcode} style={s.compareRow}>
      <View style={{ flex: 1 }}><View style={s.tagRow}>{tags.map(t => <Pill key={t}>{t}</Pill>)}</View><Text style={s.compareName}>{a.name}</Text><Text style={s.compareSmall}>{valueOrDash(a.nutrition?.protein_100g)}g protein · {valueOrDash(a.nutrition?.sugars_100g)}g sugar /100g{a.best_price?.unit_price ? ` · ${a.best_price.unit_price}` : ''}</Text></View>
      <Text style={s.comparePrice}>{price ? money(price) : '—'}</Text>
    </View>;
  })}</View>;
}

function Summary({ summary, colourOf }) {
  if (!summary) return null;
  return <View>
    <Text style={s.bigMoney}>{money(summary.total)}</Text>
    <Text style={s.body}>spent by {summary.shopper}{summary.helpers?.length ? ` with ${summary.helpers.join(', ')}` : ''}{summary.budget != null ? ` · ${summary.under_budget >= 0 ? money(summary.under_budget) + ' under' : money(-summary.under_budget) + ' over'} the ${money(summary.budget)} budget` : ''}</Text>
    <View style={{ marginTop: 12, gap: 8 }}>
      {(summary.owes || []).length ? summary.owes.map(o => <View key={o.from} style={s.oweRow}><Dot colour={colourOf(o.from)} /><Text style={s.oweText}><Text style={{ fontWeight: '900' }}>{o.from}</Text> owes {o.to} <Text style={{ fontWeight: '900' }}>{money(o.amount)}</Text></Text></View>)
        : <Text style={s.body}>Nobody owes anything for this shop.</Text>}
    </View>
    {summary.unpriced?.length ? <Text style={[s.body, { marginTop: 10 }]}>No price recorded for: {summary.unpriced.join(', ')}.</Text> : null}
    {summary.still_needed?.length ? <Text style={[s.body, { marginTop: 6 }]}>Still on the list for next time: {summary.still_needed.join(', ')}.</Text> : null}
  </View>;
}

export default function App() {
  const [S, setS] = useState({ members: [], shopping_items: [], questions: [], settings: {} });
  const [me, setMe] = useState(null);
  const [tab, setTab] = useState('list');
  const [filter, setFilter] = useState('mine');
  const [priority, setPriority] = useState('price');
  const [connected, setConnected] = useState(false);
  const [notice, setNotice] = useState(null);
  const [lastSummary, setLastSummary] = useState(null);
  const [sheetItem, setSheetItem] = useState(null);
  const [priceText, setPriceText] = useState('');
  const [offName, setOffName] = useState('');
  const [qText, setQText] = useState('');
  const [qOpts, setQOpts] = useState('Yes, No');
  const [budgetText, setBudgetText] = useState('');
  const [storeText, setStoreText] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  // scanning (James's v0.2)
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [scanLocked, setScanLocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [manualBarcode, setManualBarcode] = useState('');
  const [shelfPrice, setShelfPrice] = useState('');

  const prevRef = useRef(null);
  const meRef = useRef(null);
  const noticeTimer = useRef(null);
  meRef.current = me;

  const say = useCallback((text, ms = 3500) => {
    setNotice(text); clearTimeout(noticeTimer.current); noticeTimer.current = setTimeout(() => setNotice(null), ms);
  }, []);

  const refresh = useCallback(async () => {
    let next;
    try { next = await api('/api/state'); } catch (e) { setConnected(false); return; }
    const prev = prevRef.current; const who = meRef.current;
    if (prev && who) {
      const wasIn = prev.shop && prev.shop.shoppers.includes(who);
      const oldAnswered = new Set((prev.questions || []).filter(q => q.answer).map(q => q.id));
      (next.questions || []).filter(q => q.asked_by === who && q.answer && !oldAnswered.has(q.id)).forEach(q => { say(`${q.answered_by}: ${q.answer}`, 6000); Vibration.vibrate(120); });
      if (wasIn && next.shop) {
        const oldIds = new Set((prev.shopping_items || []).map(i => i.id));
        (next.shopping_items || []).filter(i => !oldIds.has(i.id) && i.source === 'dock').forEach(i => say(`New on the list: ${i.name} (for ${whoLabel(i.added_by)})`));
      }
      if (wasIn && !next.shop && next.last_shop?.summary) setLastSummary(next.last_shop.summary);
    }
    prevRef.current = next; setS(next); setConnected(true);
  }, [say]);

  // One WebSocket for the life of the app (v0.2 reconnected on every scan); poll if it drops.
  useEffect(() => {
    let cancelled = false, ws = null, open = false, ping = null;
    function connect() {
      if (cancelled) return;
      try {
        ws = new WebSocket(WS_URL);
        ws.onopen = () => { open = true; ping = setInterval(() => { try { ws.send('ping'); } catch (e) {} }, 15000); };
        ws.onmessage = () => refresh();
        ws.onclose = () => { open = false; clearInterval(ping); if (!cancelled) setTimeout(connect, 2000); };
        ws.onerror = () => { try { ws.close(); } catch (e) {} };
      } catch (e) { setTimeout(connect, 4000); }
    }
    connect(); refresh();
    const poll = setInterval(() => { if (!open) refresh(); }, 4000);
    return () => { cancelled = true; clearInterval(poll); clearInterval(ping); try { ws && ws.close(); } catch (e) {} };
  }, [refresh]);

  const colourOf = name => S.members.find(m => m.name === name)?.colour;
  const inShop = !!(S.shop && me && S.shop.shoppers.includes(me));
  const spent = shopSpent(S);
  const needed = useMemo(() => S.shopping_items.filter(i => i.status === 'needed'), [S]);
  const run = async (fn) => { try { await fn(); await refresh(); } catch (e) { Alert.alert('Something went wrong', String(e.message || e)); } };

  // ------------------------------------------------------------- actions
  const startShop = () => run(() => post('/api/shop/start', { shopper: me, budget: Number(budgetText) || null, store: storeText.trim() || null }));
  const joinShop = () => run(async () => { await post('/api/shop/join', { shopper: me }); setFilter('mine'); say('Joined. Tap "Split the list" to divide it.'); });
  const splitList = () => run(() => post('/api/shop/split'));
  const addOff = () => { const n = offName.trim(); if (!n) return; run(async () => { await post('/api/list', { name: n, added_by: me, source: 'cart' }); setOffName(''); say(`${n} added for you`); }); };
  const markBought = withPrice => {
    const item = sheetItem; const v = Number(priceText); setSheetItem(null);
    const body = { status: 'bought', bought_by: me };
    if (withPrice && Number.isFinite(v) && v > 0) body.price_paid = v;
    run(() => patch(`/api/list/${item.id}`, body));
  };
  const couldntGet = () => { const item = sheetItem; setSheetItem(null); setTab('ask'); setQText(`They're out of ${item.name}. Get something else?`); setQOpts('Yes, Skip it'); };
  const undo = item => run(() => patch(`/api/list/${item.id}`, { status: 'needed' }));
  const ask = () => { const t = qText.trim(); if (!t) return; run(async () => { await post('/api/questions', { asked_by: me, text: t, options: qOpts.split(',').map(x => x.trim()).filter(Boolean) }); setQText(''); say('Sent to the Home Dock'); }); };
  const finish = () => Alert.alert('Finish the shop?', 'The summary and cost split go to the Home Dock.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Finish', onPress: () => run(async () => { setLastSummary(await post('/api/shop/finish')); }) },
  ]);

  async function scanBarcode(code, pri = priority) {
    if (!code || scanLocked || loading) return;
    setScanLocked(true); setLoading(true);
    try {
      const result = await post('/api/scan', { barcode: code, device: `Expo Cart Unit (${me || 'shopper'})`, store: 'Woolworths', priority: pri });
      setProduct(result.product); setComparison(result.comparison); setShelfPrice(productPrice(result.product)?.price?.toString() || ''); setScanning(false);
    } catch (e) { Alert.alert('Scan failed', String(e.message || e)); }
    finally { setLoading(false); setTimeout(() => setScanLocked(false), 900); }
  }
  async function changePriority(p) { setPriority(p); if (product) { try { setComparison(await api(`/api/compare/${product.barcode}?store=Woolworths&priority=${p}`)); } catch (e) {} } }
  async function saveShelfPrice() {
    const value = Number(shelfPrice);
    if (!product?.barcode || !Number.isFinite(value)) return Alert.alert('Invalid price', 'Enter a price like 4.50');
    try {
      const updated = await api(`/api/products/${product.barcode}/price`, { method: 'PUT', body: JSON.stringify({ store: 'Woolworths', price: value }) });
      setProduct(updated); setComparison(await api(`/api/compare/${product.barcode}?store=Woolworths&priority=${priority}`));
    } catch (e) { Alert.alert('Could not save price', 'If this is an unknown product, add its name and category in the Dock\'s Product library first.'); }
  }
  async function openScanner() {
    if (!permission?.granted) { const result = await requestPermission(); if (!result.granted) return; }
    setScanning(true);
  }

  // ------------------------------------------------------------- screens
  // Screens are called as plain functions (not <Components/>) so TextInputs keep focus while typing.
  function itemRow(item) {
    const done = item.status === 'bought';
    return <Pressable key={item.id} style={s.listRow} onPress={() => { if (done) undo(item); else { setPriceText(item.price_paid != null ? String(item.price_paid) : ''); setSheetItem(item); } }}>
      <View style={[s.checkbox, done && s.checkboxDone]}>{done ? <Text style={s.checkmark}>✓</Text> : null}</View>
      <View style={{ flex: 1 }}>
        <Text style={[s.listName, done && s.listNameDone]}>{item.name}{item.quantity > 1 ? ` ×${item.quantity}` : ''}</Text>
        <View style={s.tagRow}>
          {item.at_home ? <Pill tone="sand">HOME SAYS: ALREADY HAVE?</Pill> : null}
          {item.claimed_by && item.claimed_by !== me ? <Pill tone="blue">{`${item.claimed_by.toUpperCase()}'S HALF`}</Pill> : null}
          {item.source === 'off-list' ? <Pill tone="sand">OFF-LIST</Pill> : null}
        </View>
        <View style={s.whoRow}><Dot colour={colourOf(item.added_by)} /><Text style={s.listMeta}>for {whoLabel(item.added_by)}{item.note ? ` · "${item.note}"` : ''}{done && item.price_paid != null ? ` · ${money(item.price_paid)}` : ''}</Text></View>
      </View>
    </Pressable>;
  }

  function Who() {
    return <ScrollView contentContainerStyle={s.scroll}>
      <Text style={s.h2}>Who's using this Cart Unit?</Text>
      <View style={s.tokenGrid}>{S.members.map((m, i) => <Pressable key={m.id} style={s.token} onPress={() => setMe(m.name)}><View style={[s.disc, { backgroundColor: m.colour }]}><Text style={s.discText}>{i + 1}</Text></View><Text style={s.tokenText}>{m.name}</Text></Pressable>)}</View>
      {!connected ? <Card style={{ marginTop: 16 }}><Text style={s.body}>Can't reach the Home Dock yet. Long-press the "Cart Unit" title for connection help.</Text></Card> : null}
    </ScrollView>;
  }
  function Start() {
    return <ScrollView contentContainerStyle={s.scroll}><Card>
      <Kicker>G3 HAND OVER THE BATON</Kicker><Text style={s.h2}>Take the household shop?</Text>
      <Text style={s.body}>{needed.length} item{needed.length === 1 ? '' : 's'} on the shared list. Everyone at home will see that you're shopping.</Text>
      <Text style={s.inputLabel}>Budget</Text><TextInput value={budgetText} onChangeText={setBudgetText} placeholder={String(S.settings?.budget || 60)} keyboardType="decimal-pad" style={s.input} placeholderTextColor="#9AA49F" />
      <Text style={s.inputLabel}>Store</Text><TextInput value={storeText} onChangeText={setStoreText} placeholder={S.settings?.store || 'Store'} style={s.input} placeholderTextColor="#9AA49F" />
      <Button title="Start shop" onPress={startShop} style={{ marginTop: 14 }} />
    </Card><Pressable onPress={() => setMe(null)}><Text style={s.link}>Not {me}? Switch</Text></Pressable></ScrollView>;
  }
  function Join() {
    return <ScrollView contentContainerStyle={s.scroll}><Card>
      <Kicker>G5 SPLIT SHOP</Kicker><Text style={s.h2}>{S.shop.shopper} is already shopping</Text>
      <Text style={s.body}>Shopping together? Join and the list can be split between your two Cart Units, ticking off live on both.</Text>
      <Button title={`Join as ${me}`} onPress={joinShop} style={{ marginTop: 14 }} />
    </Card><Pressable onPress={() => setMe(null)}><Text style={s.link}>Not {me}? Switch</Text></Pressable></ScrollView>;
  }
  function ListTab() {
    const split = S.shop.helpers.length > 0;
    const shown = split && filter === 'mine' ? needed.filter(i => !i.claimed_by || i.claimed_by === me) : needed;
    const bought = S.shopping_items.filter(i => i.status === 'bought' && i.shop_id === S.shop.id);
    const unclaimed = needed.some(i => !i.claimed_by);
    return <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
      {split ? <Seg options={[['mine', 'My half'], ['all', 'Everything']]} value={filter} onChange={setFilter} /> : null}
      {split && unclaimed ? <Button kind="secondary" title={`Split the list between ${S.shop.shoppers.join(' & ')}`} onPress={splitList} style={{ marginBottom: 12 }} /> : null}
      <Card>{shown.length ? shown.map(itemRow) : <View style={s.empty}><Text style={s.emptyText}>Nothing left here. 🎉</Text></View>}</Card>
      <Card style={{ marginTop: 12 }}><Kicker>NOT ON THE LIST?</Kicker>
        <View style={s.priceRow}><TextInput value={offName} onChangeText={setOffName} placeholder="e.g. avocados on special" placeholderTextColor="#9AA49F" style={[s.input, { flex: 1 }]} /><Button title="Add" onPress={addOff} /></View></Card>
      {bought.length ? <Card style={{ marginTop: 12 }}><Kicker>IN THE BASKET ({bought.length})</Kicker>{bought.map(itemRow)}</Card> : null}
    </ScrollView>;
  }
  function AskTab() {
    const mine = (S.questions || []).filter(q => q.asked_by === me);
    return <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
      <Card><Kicker>G4 ONE QUICK QUESTION HOME</Kicker>
        <Text style={[s.body, { marginVertical: 8 }]}>Shows up on the Home Dock. Whoever's in the kitchen answers with one tap. Keep it to the questions that matter.</Text>
        <View style={s.tagRow}>{TEMPLATES.map(([t, o]) => <Pressable key={t} style={s.chip} onPress={() => { setQText(t); setQOpts(o); }}><Text style={s.chipText}>{t}</Text></Pressable>)}</View>
        <TextInput value={qText} onChangeText={setQText} placeholder="Your question" placeholderTextColor="#9AA49F" style={[s.input, { marginTop: 8 }]} maxLength={140} />
        <TextInput value={qOpts} onChangeText={setQOpts} placeholder="Answer buttons, comma separated" placeholderTextColor="#9AA49F" style={[s.input, { marginTop: 8 }]} />
        <Button title="Send to the Dock" onPress={ask} style={{ marginTop: 10 }} />
      </Card>
      <Card style={{ marginTop: 12 }}>{mine.length ? mine.map(q => <View key={q.id} style={s.qa}><Text style={s.listName}>{q.text}</Text>
        {q.answer ? <View style={s.whoRow}><Dot colour={colourOf(q.answered_by)} /><Text style={s.body}><Text style={{ fontWeight: '900' }}>{q.answered_by}:</Text> {q.answer}</Text></View> : <Text style={s.listMeta}>Waiting for someone at home…</Text>}</View>)
        : <Text style={s.body}>No questions yet this shop.</Text>}</Card>
    </ScrollView>;
  }
  function ScanTab() {
    if (scanning && permission?.granted) {
      return <View style={s.cameraWrap}>
        <CameraView style={StyleSheet.absoluteFill} facing="back" barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128'] }} onBarcodeScanned={scanLocked ? undefined : e => scanBarcode(e.data)} />
        <View style={s.cameraShade}><View style={s.scanFrame} /><Text style={s.scanHint}>Line up the product barcode</Text></View>
        <Pressable style={s.closeScan} onPress={() => setScanning(false)}><Text style={s.closeScanText}>Close</Text></Pressable>
      </View>;
    }
    return <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
      <Card><Kicker>OPTIONAL COMPARE</Kicker>
        <Text style={[s.body, { marginVertical: 8 }]}>Only when you're unsure. It shows facts in the order you choose and never says which one is "healthier".</Text>
        <Seg options={PRIORITIES} value={priority} onChange={changePriority} />
        <Pressable style={s.bigScan} onPress={openScanner}><Text style={s.bigScanIcon}>▥</Text><Text style={s.bigScanText}>Scan a barcode</Text></Pressable>
        <View style={s.priceRow}><TextInput value={manualBarcode} onChangeText={setManualBarcode} keyboardType="number-pad" placeholder="…or type it, e.g. 9300000000019" placeholderTextColor="#9AA49F" style={[s.input, { flex: 1 }]} /><Button kind="secondary" title="Go" onPress={() => scanBarcode(manualBarcode.trim())} style={{ marginTop: 0 }} /></View>
      </Card>
      {product ? <Card style={{ marginTop: 12 }}><ProductCard product={product} />
        {!productPrice(product) ? <View style={s.priceEntry}><Text style={s.inputLabel}>Shelf price</Text><View style={s.priceRow}><TextInput value={shelfPrice} onChangeText={setShelfPrice} keyboardType="decimal-pad" placeholder="e.g. 6.50" placeholderTextColor="#9AA49F" style={[s.input, { flex: 1 }]} /><Button title="Save" onPress={saveShelfPrice} /></View></View> : null}
      </Card> : null}
      {product ? <Card style={{ marginTop: 12 }}><CompareList comparison={comparison} /></Card> : null}
    </ScrollView>;
  }
  function FinishTab() {
    const bought = S.shopping_items.filter(i => i.status === 'bought' && i.shop_id === S.shop.id).length;
    return <ScrollView contentContainerStyle={s.scroll}><Card>
      <Kicker>G6 RE-DOCK</Kicker><Text style={s.h2}>Back home?</Text>
      <Text style={s.body}>{bought} bought · {needed.length} still on the list (they stay for next time).</Text>
      <Text style={[s.body, { marginTop: 6 }]}>Finishing sends the summary and the cost split to the Home Dock, and marks what you bought as "already at home".</Text>
      <Button title="Finish shop" onPress={finish} style={{ marginTop: 14 }} />
    </Card></ScrollView>;
  }
  function SummaryScreen() {
    return <ScrollView contentContainerStyle={s.scroll}><Card><Kicker>SHOP DONE</Kicker><Text style={s.h2}>Here's what goes to the Dock</Text><Summary summary={lastSummary} colourOf={colourOf} /></Card>
      <Button kind="secondary" title="Done" onPress={() => setLastSummary(null)} style={{ marginTop: 12 }} /></ScrollView>;
  }

  let screen;
  if (lastSummary && !S.shop) screen = SummaryScreen();
  else if (!me) screen = Who();
  else if (!S.shop) screen = Start();
  else if (!inShop) screen = Join();
  else screen = ({ list: ListTab, ask: AskTab, scan: ScanTab, finish: FinishTab })[tab]();

  const budget = S.shop?.budget || 0; const left = budget - spent;
  const unseenAnswer = (S.questions || []).some(q => q.asked_by === me && q.answer) && tab !== 'ask';

  return <SafeAreaView style={s.safe}>
    <StatusBar barStyle="light-content" />
    <View style={s.top}>
      <View style={s.topRow}>
        <Pressable onLongPress={() => setShowSettings(true)}><Text style={s.topKicker}>NUTRICART · CART UNIT</Text><Text style={s.title}>{me ? (inShop ? `Shopping as ${me}` : `Hi ${me}`) : 'Cart Unit'}</Text></Pressable>
        <View style={[s.connection, !connected && s.connectionOff]}><View style={[s.connectionDot, { backgroundColor: connected ? '#43A96E' : '#C36B58' }]} /><Text style={s.connectionText}>{connected ? 'Dock live' : 'Offline'}</Text></View>
      </View>
      {S.shop ? <View style={{ marginTop: 12 }}>
        <View style={s.budgetRow}><Text style={[s.left, left < 0 && { color: '#F0A77A' }]}>{money(Math.abs(left))} <Text style={s.of}>{left < 0 ? 'over budget' : 'left'}</Text></Text><Text style={s.of}>{money(spent)} of {money(budget)}</Text></View>
        <View style={s.bar}><View style={[s.barFill, { width: `${budget ? Math.min(100, spent / budget * 100) : 0}%` }]} /></View>
      </View> : null}
    </View>

    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>{screen}</KeyboardAvoidingView>

    {inShop && !(lastSummary && !S.shop) ? <View style={s.tabbar}>{TABS.map(([key, label, icon]) => <Pressable key={key} style={s.tab} onPress={() => setTab(key)}>
      <View style={[s.tabIcon, tab === key && s.tabIconOn]}><Text style={[s.tabIconText, tab === key && s.tabIconTextOn]}>{icon}</Text>{key === 'ask' && unseenAnswer ? <View style={s.pip} /> : null}</View>
      <Text style={[s.tabLabel, tab === key && s.tabLabelOn]}>{label}</Text></Pressable>)}</View> : null}

    {notice ? <View style={s.notice} pointerEvents="none"><Text style={s.noticeText}>{notice}</Text></View> : null}
    {loading ? <View style={s.loading}><ActivityIndicator size="large" color={C.green} /></View> : null}

    <Modal visible={!!sheetItem} transparent animationType="slide" onRequestClose={() => setSheetItem(null)}>
      <Pressable style={s.sheetShade} onPress={() => setSheetItem(null)}>
        <Pressable style={s.sheet} onPress={() => {}}>
          <Kicker>GOT IT</Kicker><Text style={s.h2}>{sheetItem?.name}</Text>
          <Text style={s.body}>Price is optional. It's only used to split the cost when you're home.</Text>
          <View style={[s.priceRow, { marginTop: 10 }]}><TextInput value={priceText} onChangeText={setPriceText} keyboardType="decimal-pad" placeholder="Price, e.g. 4.50" placeholderTextColor="#9AA49F" style={[s.input, { flex: 1 }]} autoFocus /><Button title="Save" onPress={() => markBought(true)} /></View>
          <View style={[s.priceRow, { marginTop: 8 }]}><Button kind="secondary" title="No price, just tick" onPress={() => markBought(false)} style={{ flex: 1, marginTop: 0 }} /><Button kind="secondary" title="Couldn't get it" onPress={couldntGet} style={{ flex: 1, marginTop: 0 }} /></View>
        </Pressable>
      </Pressable>
    </Modal>

    <Modal visible={showSettings} transparent animationType="fade" onRequestClose={() => setShowSettings(false)}>
      <Pressable style={s.sheetShade} onPress={() => setShowSettings(false)}>
        <View style={s.sheet}><Kicker>TEAM ONLY · CONNECTION</Kicker><Text style={s.connectUrl}>{API_URL}</Text>
          <Text style={s.help}>1. Start the backend (backend/run.py) or use the hosted link.{'\n'}2. Put its address in cart-expo/.env as EXPO_PUBLIC_API_URL.{'\n'}3. Fully reload Expo Go after changing .env.{'\n'}4. On uni Wi-Fi, use a phone hotspot or the hosted link.</Text>
          <Button kind="secondary" title="Test connection" onPress={() => refresh().then(() => say(connected ? 'Connected' : 'Still offline'))} />
        </View>
      </Pressable>
    </Modal>
  </SafeAreaView>;
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0 },
  top: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 16, backgroundColor: C.ink, borderBottomLeftRadius: 22, borderBottomRightRadius: 22 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  topKicker: { fontSize: 10, fontWeight: '900', letterSpacing: 1.4, color: C.lime }, title: { fontSize: 21, fontWeight: '900', color: 'white', marginTop: 2 },
  connection: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 99, backgroundColor: 'rgba(255,255,255,.1)' }, connectionOff: { backgroundColor: 'rgba(195,107,88,.25)' },
  connectionDot: { width: 8, height: 8, borderRadius: 4 }, connectionText: { fontSize: 11, fontWeight: '800', color: 'white' },
  budgetRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }, left: { fontSize: 30, fontWeight: '900', color: C.lime }, of: { fontSize: 12, fontWeight: '600', color: '#C8D5CE' },
  bar: { height: 10, borderRadius: 99, backgroundColor: 'rgba(255,255,255,.18)', overflow: 'hidden', marginTop: 8 }, barFill: { height: '100%', backgroundColor: C.lime, borderRadius: 99 },
  scroll: { padding: 14, paddingBottom: 120 },
  card: { backgroundColor: C.panel, borderWidth: 1, borderColor: C.line, borderRadius: 20, padding: 16 },
  kicker: { fontSize: 10, fontWeight: '900', letterSpacing: 1.2, color: C.green }, h2: { fontSize: 21, fontWeight: '900', color: C.ink, marginTop: 4, marginBottom: 8 },
  body: { fontSize: 13, lineHeight: 19, color: C.muted }, link: { color: C.green, fontWeight: '800', padding: 14 },
  tokenGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8 },
  token: { width: '48%', flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 2, borderColor: C.line, backgroundColor: C.panel, borderRadius: 99, padding: 10, minHeight: 64 },
  disc: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' }, discText: { color: 'white', fontWeight: '900' }, tokenText: { fontSize: 17, fontWeight: '800', color: C.ink },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 }, whoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  pill: { alignSelf: 'flex-start', backgroundColor: C.greenSoft, paddingHorizontal: 7, paddingVertical: 4, borderRadius: 6 }, pillText: { fontSize: 9, fontWeight: '900', letterSpacing: .4, color: C.green },
  pillSand: { backgroundColor: C.sand }, pillSandText: { color: '#8B623D' }, pillBlue: { backgroundColor: '#E8EEFB' }, pillBlueText: { color: '#2E5AA8' },
  tagRow: { flexDirection: 'row', gap: 5, flexWrap: 'wrap', marginTop: 4 },
  seg: { flexDirection: 'row', backgroundColor: '#EEF1EE', borderRadius: 12, padding: 4, gap: 4, marginBottom: 12 }, segBtn: { flex: 1, paddingVertical: 9, borderRadius: 9, alignItems: 'center' },
  segOn: { backgroundColor: 'white' }, segText: { fontWeight: '800', color: C.muted }, segTextOn: { color: C.ink },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, borderTopWidth: 1, borderTopColor: C.line, minHeight: 62 },
  checkbox: { width: 28, height: 28, borderWidth: 2, borderColor: '#A8B7AF', borderRadius: 8, alignItems: 'center', justifyContent: 'center' }, checkboxDone: { backgroundColor: C.green, borderColor: C.green },
  checkmark: { fontSize: 14, fontWeight: '900', color: 'white' }, listName: { fontSize: 17, fontWeight: '800', color: C.ink }, listNameDone: { textDecorationLine: 'line-through', color: '#8F9994' }, listMeta: { fontSize: 12, color: C.muted },
  chip: { backgroundColor: '#F2F5F2', borderWidth: 1, borderColor: C.line, borderRadius: 99, paddingHorizontal: 12, paddingVertical: 8 }, chipText: { fontSize: 13, fontWeight: '700', color: C.ink },
  qa: { paddingVertical: 10, borderTopWidth: 1, borderTopColor: C.line },
  inputLabel: { fontSize: 10, fontWeight: '900', letterSpacing: .5, color: C.ink, marginTop: 12, marginBottom: 6, textTransform: 'uppercase' },
  input: { borderWidth: 1, borderColor: C.line, backgroundColor: '#FAFBFA', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 11, fontSize: 15, color: C.ink },
  priceRow: { flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 8 }, priceEntry: { marginTop: 14, paddingTop: 6, borderTopWidth: 1, borderTopColor: C.line },
  primaryButton: { backgroundColor: C.green, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' }, primaryButtonText: { color: 'white', fontWeight: '900', fontSize: 15 },
  secondaryButton: { borderWidth: 1, borderColor: C.line, backgroundColor: '#F7F9F7', borderRadius: 12, padding: 13, alignItems: 'center', marginTop: 10 }, secondaryButtonText: { color: C.ink, fontWeight: '900', fontSize: 13 },
  productHead: { flexDirection: 'row', gap: 13, alignItems: 'center' }, productImage: { width: 84, height: 84, borderRadius: 17, backgroundColor: '#F7F8F6', borderWidth: 1, borderColor: C.line },
  productPlaceholder: { width: 84, height: 84, borderRadius: 17, backgroundColor: '#F7F8F6', borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center' }, productPlaceholderText: { fontSize: 30, color: '#8DA097' },
  productName: { fontSize: 18, fontWeight: '900', color: C.ink, marginTop: 7 }, productMeta: { fontSize: 11, color: C.muted, marginTop: 3 }, price: { fontSize: 21, fontWeight: '900', color: C.green, marginTop: 6 }, priceStore: { fontSize: 10, fontWeight: '700', color: C.muted },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 14 }, metric: { width: '48.5%', backgroundColor: '#F6F8F6', borderRadius: 13, padding: 10, alignItems: 'center' }, metricValue: { fontSize: 16, fontWeight: '900', color: C.ink }, metricLabel: { fontSize: 9, color: C.muted, marginTop: 3 },
  empty: { padding: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderStyle: 'dashed', borderColor: '#CDD7D1', borderRadius: 15 }, emptyText: { fontSize: 12, lineHeight: 18, textAlign: 'center', color: C.muted },
  compareRow: { flexDirection: 'row', gap: 10, paddingVertical: 13, borderTopWidth: 1, borderTopColor: C.line }, compareName: { fontSize: 14, fontWeight: '800', color: C.ink, marginTop: 4 }, compareSmall: { fontSize: 10, color: C.muted, marginTop: 5 }, comparePrice: { fontSize: 17, fontWeight: '900', color: C.green },
  bigScan: { height: 130, borderRadius: 20, backgroundColor: C.greenDark, marginVertical: 8, alignItems: 'center', justifyContent: 'center' }, bigScanIcon: { fontSize: 40, color: C.lime }, bigScanText: { fontSize: 15, fontWeight: '900', color: 'white', marginTop: 6 },
  cameraWrap: { flex: 1, backgroundColor: 'black' }, cameraShade: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,.12)' },
  scanFrame: { width: '82%', height: 140, borderWidth: 3, borderColor: C.lime, borderRadius: 20 }, scanHint: { color: 'white', fontWeight: '800', marginTop: 18, fontSize: 13 },
  closeScan: { position: 'absolute', top: 20, right: 18, backgroundColor: 'rgba(24,50,41,.85)', paddingHorizontal: 14, paddingVertical: 9, borderRadius: 99 }, closeScanText: { color: 'white', fontWeight: '900' },
  bigMoney: { fontSize: 34, fontWeight: '900', color: C.green }, oweRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F6F8F6', borderRadius: 12, padding: 10 }, oweText: { fontSize: 14, color: C.ink },
  tabbar: { position: 'absolute', left: 10, right: 10, bottom: 10, height: 72, borderRadius: 22, backgroundColor: C.ink, flexDirection: 'row', padding: 8 },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center' }, tabIcon: { width: 34, height: 31, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }, tabIconOn: { backgroundColor: C.lime },
  tabIconText: { fontSize: 16, color: '#AFC0B7', fontWeight: '900' }, tabIconTextOn: { color: C.ink }, tabLabel: { fontSize: 10, color: '#AFC0B7', fontWeight: '800', marginTop: 3 }, tabLabelOn: { color: 'white' },
  pip: { position: 'absolute', top: 2, right: 2, width: 9, height: 9, borderRadius: 5, backgroundColor: '#E0A526' },
  notice: { position: 'absolute', left: 20, right: 20, bottom: 96, backgroundColor: C.ink, borderRadius: 14, padding: 13 }, noticeText: { color: 'white', fontWeight: '800', textAlign: 'center' },
  loading: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(243,244,239,.68)', alignItems: 'center', justifyContent: 'center' },
  sheetShade: { flex: 1, backgroundColor: 'rgba(24,50,41,.45)', justifyContent: 'flex-end' }, sheet: { backgroundColor: 'white', borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 18, paddingBottom: 34 },
  connectUrl: { fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }), fontSize: 12, color: C.green, marginVertical: 10 },
  help: { fontSize: 12, lineHeight: 19, color: C.muted, marginBottom: 6 },
});
