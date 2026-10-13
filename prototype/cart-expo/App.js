import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, Pressable, SafeAreaView,
  ScrollView, StatusBar, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { API_URL, WS_URL, api, money, productPrice, valueOrDash } from './src/api';
import { C } from './src/theme';

const TABS = ['Shop', 'Scan', 'List', 'Connect'];

function Pill({ children, tone = 'green' }) {
  return <View style={[s.pill, tone === 'sand' && s.pillSand]}><Text style={[s.pillText, tone === 'sand' && s.pillSandText]}>{children}</Text></View>;
}
function SectionTitle({ kicker, title, action, onAction }) {
  return <View style={s.sectionTitle}><View><Text style={s.kicker}>{kicker}</Text><Text style={s.h2}>{title}</Text></View>{action ? <Pressable onPress={onAction}><Text style={s.action}>{action}</Text></Pressable> : null}</View>;
}
function Card({ children, style }) { return <View style={[s.card, style]}>{children}</View>; }
function ProductImage({ uri }) {
  return uri ? <Image source={{ uri }} style={s.productImage} resizeMode="contain" /> : <View style={s.productPlaceholder}><Text style={s.productPlaceholderText}>▥</Text></View>;
}

function ProductCard({ product }) {
  if (!product) return <View style={s.empty}><Text style={s.emptyText}>Scan a product to begin.</Text></View>;
  const price = productPrice(product);
  const n = product.nutrition || {};
  return <View>
    <View style={s.productHead}>
      <ProductImage uri={product.image_url} />
      <View style={{ flex: 1 }}>
        <Pill>{valueOrDash(product.source)}</Pill>
        <Text style={s.productName}>{valueOrDash(product.name)}</Text>
        <Text style={s.productMeta}>{valueOrDash(product.brand)} · {valueOrDash(product.quantity)}</Text>
        <Text style={s.barcode}>{valueOrDash(product.barcode)}</Text>
        {price ? <Text style={s.price}>{money(price.price)} <Text style={s.priceStore}>{price.store}</Text></Text> : <Pill tone="sand">No shelf price saved</Pill>}
      </View>
    </View>
    <View style={s.metrics}>
      <Metric value={n.protein_100g} label="Protein /100g" />
      <Metric value={n.sugars_100g} label="Sugar /100g" />
      <Metric value={n.fat_100g} label="Fat /100g" />
      <Metric value={n.energy_kj_100g} label="kJ /100g" />
    </View>
  </View>;
}
function Metric({ value, label }) { return <View style={s.metric}><Text style={s.metricValue}>{valueOrDash(value)}</Text><Text style={s.metricLabel}>{label}</Text></View>; }

function CompareList({ comparison }) {
  const target = comparison?.target;
  const alternatives = comparison?.alternatives || [];
  if (!alternatives.length) return <View style={s.empty}><Text style={s.emptyText}>No comparable products yet. Add products with the same category on the Home Hub.</Text></View>;
  const targetPrice = productPrice(target)?.price;
  const targetProtein = target?.nutrition?.protein_100g;
  const targetSugar = target?.nutrition?.sugars_100g;
  return <View>{alternatives.map((a, index) => {
    const price = a.best_price?.price;
    const tags = [];
    if (targetPrice && price && price < targetPrice) tags.push('CHEAPER');
    if (typeof targetProtein === 'number' && typeof a.nutrition?.protein_100g === 'number' && a.nutrition.protein_100g > targetProtein) tags.push('MORE PROTEIN');
    if (typeof targetSugar === 'number' && typeof a.nutrition?.sugars_100g === 'number' && a.nutrition.sugars_100g < targetSugar) tags.push('LESS SUGAR');
    if (!tags.length && index === 0) tags.push('ALTERNATIVE');
    return <View key={a.barcode} style={s.compareRow}>
      <View style={{ flex: 1 }}><View style={s.tagRow}>{tags.map(t => <Pill key={t}>{t}</Pill>)}</View><Text style={s.compareName}>{a.name}</Text><Text style={s.productMeta}>{valueOrDash(a.brand)} · {valueOrDash(a.quantity)}</Text><Text style={s.compareSmall}>{valueOrDash(a.nutrition?.protein_100g)}g protein · {valueOrDash(a.nutrition?.sugars_100g)}g sugar /100g</Text></View>
      <Text style={s.comparePrice}>{price ? money(price) : '—'}</Text>
    </View>;
  })}</View>;
}

function App() {
  const [tab, setTab] = useState('Shop');
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [scanLocked, setScanLocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [state, setState] = useState({ shopping_items: [], recent_scans: [] });
  const [product, setProduct] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [manualBarcode, setManualBarcode] = useState('');
  const [shelfPrice, setShelfPrice] = useState('');
  const [connectionMessage, setConnectionMessage] = useState('Checking backend…');
  const wsRef = useRef(null);

  const needed = useMemo(() => state.shopping_items.filter(i => i.status === 'needed'), [state]);
  const bought = useMemo(() => state.shopping_items.filter(i => i.status === 'bought'), [state]);

  const refreshState = useCallback(async () => {
    try { const next = await api('/api/state'); setState(next); setConnected(true); setConnectionMessage('Connected to Home Hub'); }
    catch (e) { setConnected(false); setConnectionMessage('Cannot reach the Home Hub'); }
  }, []);

  useEffect(() => { refreshState(); const timer = setInterval(refreshState, 5000); return () => clearInterval(timer); }, [refreshState]);

  useEffect(() => {
    let cancelled = false;
    function connectWs() {
      if (cancelled) return;
      try {
        const ws = new WebSocket(WS_URL); wsRef.current = ws;
        ws.onopen = () => setConnected(true);
        ws.onmessage = event => {
          const msg = JSON.parse(event.data);
          if (msg.type === 'list_updated') refreshState();
          if (msg.type === 'product_updated' && product?.barcode === msg.product?.barcode) setProduct(msg.product);
        };
        ws.onclose = () => { if (!cancelled) setTimeout(connectWs, 1800); };
      } catch (e) {}
    }
    connectWs(); return () => { cancelled = true; try { wsRef.current?.close(); } catch (e) {} };
  }, [product?.barcode, refreshState]);

  async function scanBarcode(code) {
    if (!code || scanLocked || loading) return;
    setScanLocked(true); setLoading(true);
    try {
      const result = await api('/api/scan', { method: 'POST', body: JSON.stringify({ barcode: code, device: 'Expo Cart Unit', store: 'Woolworths' }) });
      setProduct(result.product); setComparison(result.comparison); setShelfPrice(productPrice(result.product)?.price?.toString() || ''); setScanning(false); setTab('Shop');
    } catch (e) { Alert.alert('Scan failed', String(e.message || e)); }
    finally { setLoading(false); setTimeout(() => setScanLocked(false), 900); }
  }

  async function saveShelfPrice() {
    if (!product?.barcode || !shelfPrice.trim()) return;
    const value = Number(shelfPrice);
    if (!Number.isFinite(value)) return Alert.alert('Invalid price', 'Enter a price like 4.50');
    try {
      const updated = await api(`/api/products/${product.barcode}/price`, { method: 'PUT', body: JSON.stringify({ store: 'Woolworths', price: value }) });
      setProduct(updated); const cmp = await api(`/api/compare/${product.barcode}?store=Woolworths`); setComparison(cmp);
    } catch (e) { Alert.alert('Could not save price', 'If this is an unknown product, add its name and category from the Home Hub first.'); }
  }

  async function toggleItem(item) {
    await api(`/api/list/${item.id}`, { method: 'PATCH', body: JSON.stringify({ status: item.status === 'needed' ? 'bought' : 'needed' }) });
    refreshState();
  }

  async function openScanner() {
    if (!permission?.granted) { const result = await requestPermission(); if (!result.granted) return; }
    setScanning(true); setTab('Scan');
  }

  return <SafeAreaView style={s.safe}>
    <StatusBar barStyle="dark-content" />
    <View style={s.top}>
      <View><Text style={s.kicker}>NUTRICART</Text><Text style={s.title}>Cart Unit</Text></View>
      <View style={[s.connection, connected ? s.connectionOn : s.connectionOff]}><View style={[s.connectionDot, { backgroundColor: connected ? '#43A96E' : '#C36B58' }]} /><Text style={s.connectionText}>{connected ? 'Hub live' : 'Offline'}</Text></View>
    </View>

    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {tab === 'Shop' && <ScrollView contentContainerStyle={s.scroll}>
        <Card style={s.runCard}><Text style={s.runKicker}>TODAY'S SHOP</Text><Text style={s.runCount}>{needed.length} items left</Text><Text style={s.runCopy}>This list came from the shared Home Hub. Scan a product when you need help comparing options.</Text><View style={s.runStats}><View><Text style={s.runStatValue}>{bought.length}</Text><Text style={s.runStatLabel}>Bought</Text></View><View><Text style={s.runStatValue}>{state.recent_scans.length}</Text><Text style={s.runStatLabel}>Scans</Text></View></View></Card>
        <SectionTitle kicker="CURRENT CHOICE" title="Product compare" action="Scan product" onAction={openScanner} />
        <Card><ProductCard product={product} />{product && !productPrice(product) ? <View style={s.priceEntry}><Text style={s.inputLabel}>Woolworths shelf price</Text><View style={s.priceRow}><TextInput value={shelfPrice} onChangeText={setShelfPrice} keyboardType="decimal-pad" placeholder="e.g. 6.50" placeholderTextColor="#9AA49F" style={[s.input,{flex:1}]} /><Pressable style={s.primaryButton} onPress={saveShelfPrice}><Text style={s.primaryButtonText}>Save</Text></Pressable></View></View> : null}</Card>
        {product ? <><SectionTitle kicker="OPTIONS" title="Better fit for your priority" /><Card><CompareList comparison={comparison} /></Card></> : null}
        <SectionTitle kicker="HOUSEHOLD" title="What is still needed" action="View list" onAction={() => setTab('List')} />
        <Card>{needed.slice(0,5).map(item => <ListRow key={item.id} item={item} onPress={() => toggleItem(item)} />)}{!needed.length && <View style={s.empty}><Text style={s.emptyText}>Everything is marked as bought.</Text></View>}</Card>
      </ScrollView>}

      {tab === 'Scan' && <View style={{ flex: 1 }}>
        {scanning && permission?.granted ? <View style={s.cameraWrap}><CameraView style={StyleSheet.absoluteFill} facing="back" barcodeScannerSettings={{ barcodeTypes: ['ean13','ean8','upc_a','upc_e','code128'] }} onBarcodeScanned={scanLocked ? undefined : e => scanBarcode(e.data)} /><View style={s.cameraShade}><View style={s.scanFrame} /><Text style={s.scanHint}>Line up the product barcode</Text></View><Pressable style={s.closeScan} onPress={() => setScanning(false)}><Text style={s.closeScanText}>Close</Text></Pressable></View> : <ScrollView contentContainerStyle={s.scroll}><SectionTitle kicker="BARCODE" title="Scan a grocery product" /><Card><Text style={s.body}>Use the real barcode printed on the product. Expo Camera works directly inside Expo Go.</Text><Pressable style={s.bigScan} onPress={openScanner}><Text style={s.bigScanIcon}>▥</Text><Text style={s.bigScanText}>Open camera scanner</Text></Pressable><Text style={s.inputLabel}>Or enter a barcode manually</Text><TextInput value={manualBarcode} onChangeText={setManualBarcode} keyboardType="number-pad" placeholder="9300000000019" placeholderTextColor="#9AA49F" style={s.input} /><Pressable style={s.secondaryButton} onPress={() => scanBarcode(manualBarcode.trim())}><Text style={s.secondaryButtonText}>Look up barcode</Text></Pressable></Card></ScrollView>}
      </View>}

      {tab === 'List' && <ScrollView contentContainerStyle={s.scroll}><SectionTitle kicker="SHARED HOUSEHOLD" title="Shopping list" /><Card>{state.shopping_items.length ? state.shopping_items.map(item => <ListRow key={item.id} item={item} onPress={() => toggleItem(item)} />) : <View style={s.empty}><Text style={s.emptyText}>Add items from the Home Hub.</Text></View>}</Card></ScrollView>}

      {tab === 'Connect' && <ScrollView contentContainerStyle={s.scroll}><SectionTitle kicker="CONNECTION" title="Home Hub backend" /><Card><Text style={s.connectTitle}>{connectionMessage}</Text><Text style={s.connectUrl}>{API_URL}</Text><Text style={s.body}>The phone calls the FastAPI backend running on your computer. For local testing, both devices should be on the same Wi‑Fi and the URL above must use your computer's LAN IPv4 address, not localhost.</Text><Pressable style={s.secondaryButton} onPress={refreshState}><Text style={s.secondaryButtonText}>Test connection</Text></Pressable></Card><Card style={{marginTop:14}}><Text style={s.inputLabel}>If it does not connect</Text><Text style={s.help}>1. Start backend/run.py on the computer.\n2. Find the computer IPv4 address.\n3. Put it in cart-expo/.env as EXPO_PUBLIC_API_URL=http://YOUR-IP:8000.\n4. Fully reload Expo Go after changing .env.\n5. Allow Python through your firewall if prompted.</Text></Card></ScrollView>}
    </KeyboardAvoidingView>

    <View style={s.tabbar}>{TABS.map(name => <Pressable key={name} style={s.tab} onPress={() => name === 'Scan' ? openScanner() : setTab(name)}><View style={[s.tabIcon, tab===name && s.tabIconOn]}><Text style={[s.tabIconText,tab===name&&s.tabIconTextOn]}>{name==='Shop'?'⌂':name==='Scan'?'▥':name==='List'?'✓':'↔'}</Text></View><Text style={[s.tabLabel,tab===name&&s.tabLabelOn]}>{name}</Text></Pressable>)}</View>

    {loading && <View style={s.loading}><ActivityIndicator size="large" color={C.green} /></View>}
  </SafeAreaView>;
}

function ListRow({ item, onPress }) {
  const done = item.status === 'bought';
  return <Pressable style={s.listRow} onPress={onPress}><View style={[s.checkbox, done && s.checkboxDone]}>{done ? <Text style={s.checkmark}>✓</Text> : null}</View><View style={{ flex:1 }}><Text style={[s.listName,done&&s.listNameDone]}>{item.name}</Text><Text style={s.listMeta}>{item.quantity} · added by {item.added_by}</Text></View><Text style={s.listAction}>{done?'Undo':'Bought'}</Text></Pressable>;
}

const s = StyleSheet.create({
  safe:{flex:1,backgroundColor:C.bg,paddingTop:Platform.OS==='android'?StatusBar.currentHeight||0:0},
  top:{paddingHorizontal:18,paddingVertical:14,backgroundColor:C.bg,flexDirection:'row',alignItems:'center',justifyContent:'space-between',borderBottomWidth:1,borderBottomColor:C.line},
  kicker:{fontSize:10,fontWeight:'900',letterSpacing:1.4,color:C.green},title:{fontSize:25,fontWeight:'900',color:C.ink,marginTop:2},
  connection:{flexDirection:'row',alignItems:'center',gap:7,paddingHorizontal:10,paddingVertical:7,borderRadius:99,borderWidth:1},connectionOn:{backgroundColor:'#EDF7F0',borderColor:'#D8EBDD'},connectionOff:{backgroundColor:'#F8ECE9',borderColor:'#EBCFC8'},connectionDot:{width:8,height:8,borderRadius:4},connectionText:{fontSize:11,fontWeight:'800',color:C.ink},
  scroll:{padding:14,paddingBottom:110},card:{backgroundColor:C.panel,borderWidth:1,borderColor:C.line,borderRadius:22,padding:16,shadowColor:'#183229',shadowOpacity:.06,shadowRadius:14,shadowOffset:{width:0,height:7},elevation:2},
  runCard:{backgroundColor:C.greenDark,borderColor:C.greenDark},runKicker:{fontSize:10,fontWeight:'900',letterSpacing:1.2,color:'#D9E8E1'},runCount:{fontSize:34,fontWeight:'900',color:'white',marginTop:18},runCopy:{fontSize:13,lineHeight:19,color:'#D8E5DF',marginTop:5,maxWidth:320},runStats:{flexDirection:'row',gap:26,marginTop:18},runStatValue:{fontSize:20,fontWeight:'900',color:C.lime},runStatLabel:{fontSize:10,color:'#D8E5DF'},
  sectionTitle:{flexDirection:'row',alignItems:'flex-end',justifyContent:'space-between',marginTop:22,marginBottom:9,paddingHorizontal:2},h2:{fontSize:19,fontWeight:'900',color:C.ink,marginTop:3},action:{fontSize:12,fontWeight:'900',color:C.green},
  pill:{alignSelf:'flex-start',backgroundColor:C.greenSoft,paddingHorizontal:7,paddingVertical:4,borderRadius:99},pillText:{fontSize:8,fontWeight:'900',letterSpacing:.4,color:C.green},pillSand:{backgroundColor:C.sand},pillSandText:{color:'#8B623D'},
  productHead:{flexDirection:'row',gap:13,alignItems:'center'},productImage:{width:84,height:84,borderRadius:17,backgroundColor:'#F7F8F6',borderWidth:1,borderColor:C.line},productPlaceholder:{width:84,height:84,borderRadius:17,backgroundColor:'#F7F8F6',borderWidth:1,borderColor:C.line,alignItems:'center',justifyContent:'center'},productPlaceholderText:{fontSize:30,color:'#8DA097'},productName:{fontSize:18,fontWeight:'900',color:C.ink,marginTop:7},productMeta:{fontSize:11,color:C.muted,marginTop:3},barcode:{fontFamily:Platform.select({ios:'Menlo',android:'monospace'}),fontSize:9,color:C.muted,marginTop:3},price:{fontSize:21,fontWeight:'900',color:C.green,marginTop:6},priceStore:{fontSize:10,fontWeight:'700',color:C.muted},
  metrics:{flexDirection:'row',flexWrap:'wrap',gap:7,marginTop:14},metric:{width:'48.5%',backgroundColor:'#F6F8F6',borderRadius:13,padding:10,alignItems:'center'},metricValue:{fontSize:16,fontWeight:'900',color:C.ink},metricLabel:{fontSize:9,color:C.muted,marginTop:3},
  empty:{padding:22,alignItems:'center',justifyContent:'center',borderWidth:1,borderStyle:'dashed',borderColor:'#CDD7D1',borderRadius:15},emptyText:{fontSize:12,lineHeight:18,textAlign:'center',color:C.muted},
  tagRow:{flexDirection:'row',gap:5,flexWrap:'wrap',marginBottom:6},compareRow:{flexDirection:'row',gap:10,paddingVertical:13,borderTopWidth:1,borderTopColor:C.line},compareName:{fontSize:14,fontWeight:'800',color:C.ink},compareSmall:{fontSize:10,color:C.muted,marginTop:5},comparePrice:{fontSize:17,fontWeight:'900',color:C.green},
  listRow:{flexDirection:'row',alignItems:'center',gap:11,paddingVertical:12,borderTopWidth:1,borderTopColor:C.line},checkbox:{width:24,height:24,borderWidth:2,borderColor:'#A8B7AF',borderRadius:7,alignItems:'center',justifyContent:'center'},checkboxDone:{backgroundColor:C.green,borderColor:C.green},checkmark:{fontSize:13,fontWeight:'900',color:'white'},listName:{fontSize:14,fontWeight:'800',color:C.ink},listNameDone:{textDecorationLine:'line-through',color:'#8F9994'},listMeta:{fontSize:10,color:C.muted,marginTop:3},listAction:{fontSize:10,fontWeight:'900',color:C.green},
  priceEntry:{marginTop:14,paddingTop:14,borderTopWidth:1,borderTopColor:C.line},inputLabel:{fontSize:10,fontWeight:'900',letterSpacing:.5,color:C.ink,marginBottom:7,textTransform:'uppercase'},priceRow:{flexDirection:'row',gap:8},input:{borderWidth:1,borderColor:C.line,backgroundColor:'#FAFBFA',borderRadius:12,paddingHorizontal:12,paddingVertical:11,fontSize:14,color:C.ink},primaryButton:{backgroundColor:C.green,borderRadius:12,paddingHorizontal:16,alignItems:'center',justifyContent:'center'},primaryButtonText:{color:'white',fontWeight:'900'},secondaryButton:{borderWidth:1,borderColor:C.line,backgroundColor:'#F7F9F7',borderRadius:12,padding:12,alignItems:'center',marginTop:10},secondaryButtonText:{color:C.ink,fontWeight:'900',fontSize:12},
  body:{fontSize:13,lineHeight:20,color:C.muted},bigScan:{height:180,borderRadius:20,backgroundColor:C.greenDark,marginVertical:16,alignItems:'center',justifyContent:'center'},bigScanIcon:{fontSize:48,color:C.lime},bigScanText:{fontSize:15,fontWeight:'900',color:'white',marginTop:8},
  cameraWrap:{flex:1,backgroundColor:'black'},cameraShade:{...StyleSheet.absoluteFillObject,alignItems:'center',justifyContent:'center',backgroundColor:'rgba(0,0,0,.12)'},scanFrame:{width:'82%',height:140,borderWidth:3,borderColor:C.lime,borderRadius:20,backgroundColor:'transparent'},scanHint:{color:'white',fontWeight:'800',marginTop:18,fontSize:13},closeScan:{position:'absolute',top:20,right:18,backgroundColor:'rgba(24,50,41,.85)',paddingHorizontal:14,paddingVertical:9,borderRadius:99},closeScanText:{color:'white',fontWeight:'900'},
  connectTitle:{fontSize:17,fontWeight:'900',color:C.ink},connectUrl:{fontFamily:Platform.select({ios:'Menlo',android:'monospace'}),fontSize:11,color:C.green,marginTop:7,marginBottom:12},help:{fontFamily:Platform.select({ios:'Menlo',android:'monospace'}),fontSize:11,lineHeight:18,color:C.muted},
  tabbar:{position:'absolute',left:10,right:10,bottom:10,height:72,borderRadius:22,backgroundColor:C.ink,flexDirection:'row',padding:8,shadowColor:'#000',shadowOpacity:.2,shadowRadius:15,shadowOffset:{width:0,height:8},elevation:8},tab:{flex:1,alignItems:'center',justifyContent:'center'},tabIcon:{width:31,height:31,borderRadius:10,alignItems:'center',justifyContent:'center'},tabIconOn:{backgroundColor:C.lime},tabIconText:{fontSize:16,color:'#AFC0B7',fontWeight:'900'},tabIconTextOn:{color:C.ink},tabLabel:{fontSize:9,color:'#AFC0B7',fontWeight:'800',marginTop:3},tabLabelOn:{color:'white'},
  loading:{...StyleSheet.absoluteFillObject,backgroundColor:'rgba(243,244,239,.68)',alignItems:'center',justifyContent:'center'},
});

export default App;
