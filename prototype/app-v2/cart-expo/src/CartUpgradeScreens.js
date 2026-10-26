// NutriCart app-v2: reusable screens deliberately declared OUTSIDE App().
// This keeps TextInput mounted between keystrokes rather than losing keyboard focus.
import React, { useState } from 'react';
import {
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
  Pressable, ScrollView, StyleSheet, Text, TextInput, View
} from 'react-native';
import { api } from './api';

const P = { bg:'#F6F4F0', white:'#FFFFFF', ink:'#1D1C1A', muted:'#6E6A63',
  line:'#E2DED6', orange:'#C4532D', warm:'#FBEEE7' };

function Button({title, onPress, disabled=false, subtle=false}) {
  return <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress}
    style={[s.button, subtle && s.subtle, disabled && s.disabled]}>
    <Text style={[s.buttonLabel, subtle && s.subtleLabel]}>{title}</Text>
  </Pressable>;
}
function Panel({children}) { return <View style={s.panel}>{children}</View>; }
function Field({label, value, onChangeText, placeholder='', numeric=false}) {
  return <View style={s.field}>
    <Text style={s.fieldLabel}>{label}</Text>
    <TextInput style={s.input} value={value} onChangeText={onChangeText}
      placeholder={placeholder} placeholderTextColor="#9B948B"
      keyboardType={numeric ? 'decimal-pad' : 'default'}
      autoCorrect={!numeric} autoCapitalize="sentences" />
  </View>;
}
function numericValue(text) {
  if (!String(text).trim()) return null;
  const n = Number(String(text).replace(',', '.'));
  return Number.isFinite(n) && n >= 0 ? n : NaN;
}

export function RegisterProductScreen({barcode, initialProduct=null, onSaved, onCancel}) {
  const [name, setName] = useState(
    initialProduct?.name === 'Unknown product' ? '' : (initialProduct?.name || '')
  );
  const [brand, setBrand] = useState(initialProduct?.brand || '');
  const [quantity, setQuantity] = useState(initialProduct?.quantity || '');
  const [category, setCategory] = useState(initialProduct?.category || '');
  const initialPrice = initialProduct?.prices?.[0]?.price;
  const [price, setPrice] = useState(initialPrice == null ? '' : String(initialPrice));
  const [protein, setProtein] = useState(
    initialProduct?.nutrition?.protein_100g == null ? '' : String(initialProduct.nutrition.protein_100g)
  );
  const [sugar, setSugar] = useState(
    initialProduct?.nutrition?.sugars_100g == null ? '' : String(initialProduct.nutrition.sugars_100g)
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function save() {
    if (saving) return;
    if (!name.trim()) { setError('Please enter a product name.'); return; }
    const numbers = [price, protein, sugar].map(numericValue);
    if (numbers.some(Number.isNaN)) {
      setError('Prices and nutrition must be valid non-negative numbers.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      // Same endpoint and fields used by Home Hub's product form.
      const product = await api('/api/products/' + encodeURIComponent(barcode), {
        method:'POST',
        body:JSON.stringify({
          name:name.trim(), brand:brand.trim() || null,
          quantity:quantity.trim() || null, category:category.trim() || null,
          store:'Woolworths', price:numbers[0],
          nutrition:{ protein_100g:numbers[1], sugars_100g:numbers[2] }
        })
      });
      onSaved(product);
    } catch(e) {
      setError('Unable to save product to Home Hub: ' + (e.message || 'Network error'));
    } finally { setSaving(false); }
  }

  return <KeyboardAvoidingView style={{flex:1}}
    behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.page}>
      <Text style={s.eyebrow}>HOME HUB PRODUCT LIBRARY</Text>
      <Text style={s.heading}>New product found</Text>
      <Text style={s.info}>This barcode is not in the library. Add its details once and it will be available on the Home Hub and both Cart Units.</Text>
      <Panel>
        <Text style={s.fieldLabel}>Scanned barcode</Text>
        <Text selectable style={s.barcode}>{barcode}</Text>
        <Field label="Product name *" value={name} onChangeText={setName} placeholder="e.g. Greek yoghurt" />
        <Field label="Brand" value={brand} onChangeText={setBrand} placeholder="e.g. Farmers Union" />
        <Field label="Size" value={quantity} onChangeText={setQuantity} placeholder="e.g. 1 kg" />
        <Field label="Category" value={category} onChangeText={setCategory} placeholder="e.g. yoghurt" />
        <Field label="Woolworths price ($)" value={price} onChangeText={setPrice} numeric placeholder="0.00" />
        <Field label="Protein per 100 g" value={protein} onChangeText={setProtein} numeric placeholder="Optional" />
        <Field label="Sugar per 100 g" value={sugar} onChangeText={setSugar} numeric placeholder="Optional" />
        {Boolean(error) && <Text style={s.error}>{error}</Text>}
        {saving && <ActivityIndicator color={P.orange} />}
        <Button title={saving ? 'Saving…' : 'Save to Home Hub'} disabled={saving} onPress={save} />
        <Button title="Cancel registration" disabled={saving} subtle onPress={onCancel} />
      </Panel>
    </ScrollView>
  </KeyboardAvoidingView>;
}

export function CartIdlePanel() {
  return <View style={s.idle}>
    <View style={s.bigMark}><Text style={s.bigMarkText}>N</Text></View>
    <Text style={s.idleTitle}>NutriCart</Text>
    <Text style={s.idleSub}>CART UNIT</Text>
    <View style={s.idleRule}/>
    <Text style={s.idleMessage}>Shopping finished</Text>
    <Text style={s.idleHint}>Cart Unit is idle. Start a new shopping trip from the Home Hub to unlock it.</Text>
  </View>;
}

export function SplitSetupPanel({pair, role, ready, act, onClose}) {
  return <ScrollView contentContainerStyle={s.page}>
    <Text style={s.eyebrow}>TWO-PHONE CART UNIT</Text>
    <Text style={s.heading}>Split Shop</Text>
    <Text style={s.info}>When together, Phone 1 runs the full Cart Unit. Phone 2 waits. Split to shop separately, then both confirm to rejoin.</Text>
    <Panel>
      {pair.mode === 'idle' && <>
        <Text style={s.subheading}>Choose the main phone</Text>
        <Text style={s.info}>On Phone 1, press below. Then open Split Shop on Phone 2.</Text>
        <Button title="Make this the main phone" disabled={!ready}
          onPress={() => act('/api/split/pair', {role:'primary'})} />
      </>}
      {pair.mode === 'waiting' && <>
        <Text style={s.subheading}>{role === 'primary' ? 'Waiting for Phone 2' : 'Join the pair'}</Text>
        {role === 'primary' ? <>
          <Text style={s.info}>Open Split Shop on the second phone and choose Join.</Text>
          <Button subtle title="Cancel pairing" onPress={() => act('/api/split/reset')}/>
        </> : <Button title="Join as the second phone" disabled={!ready}
          onPress={() => act('/api/split/pair', {role:'secondary'})} />}
      </>}
      {pair.mode === 'paired' && <>
        <Text style={s.subheading}>Both phones connected</Text>
        <Text style={s.info}>Phone 2 is in standby. Start splitting when you physically separate the Cart Units.</Text>
        {role === 'primary' && <>
          <Button title="Start split shopping" onPress={() => act('/api/split/start')}/>
          <Button subtle title="Unpair phones" onPress={() =>
            Alert.alert('Unpair both phones?', 'You can connect them again later.', [
              {text:'Cancel'},
              {text:'Unpair', onPress:() => act('/api/split/reset')}
            ])}/>
        </>}
        {!role && <Text style={s.info}>This pair belongs to other phones.</Text>}
      </>}
      {pair.mode === 'split' && <Text style={s.info}>Split active. Each phone has its own checklist.</Text>}
    </Panel>
    <Button title="Back to shopping" subtle onPress={onClose} />
  </ScrollView>;
}

export function SplitStandbyPanel() {
  return <View style={[s.idle, {backgroundColor:P.bg}]}>
    <View style={s.bigMark}><Text style={s.bigMarkText}>2</Text></View>
    <Text style={s.idleTitle}>Standby</Text>
    <Text style={s.idleMessage}>Cart Units together</Text>
    <Text style={s.idleHint}>Phone 1 has the full shopping controls. When Phone 1 starts Split Shop, your own shopping list will open automatically.</Text>
  </View>;
}

export function SplitOnlyPanel({pair, role, act, requests=[]}) {
  const [busy, setBusy] = useState(null);
  const [showRequests, setShowRequests] = useState(false);
  const items = pair.items || [];
  const mine = items.filter(i => i.role === role);
  const partner = items.filter(i => i.role !== role);
  const myRemaining = mine.filter(i => i.status === 'needed').length;
  const myBought = mine.length - myRemaining;
  const confirms = pair.confirmation || {};
  const otherRole = role === 'primary' ? 'secondary' : 'primary';
  async function change(id, method) {
    if (busy !== null) return;
    setBusy(id);
    try { await act('/api/split/items/' + id + '/' + method); }
    finally { setBusy(null); }
  }
  return <ScrollView contentContainerStyle={s.page}>
    <Text style={s.eyebrow}>{role === 'primary' ? 'SHOPPER 1' : 'SHOPPER 2'}</Text>
    <Text style={s.heading}>My shopping list</Text>
    <View style={s.progress}>
      <Text style={s.count}>{myRemaining}</Text>
      <Text style={s.progressLabel}>left for you</Text>
      <Text style={s.progressFoot}>{myBought} collected · {partner.filter(i=>i.status==='needed').length} left for partner</Text>
    </View>
    <Panel>
      <Text style={s.subheading}>Assigned items</Text>
      {mine.length === 0 && <Text style={s.info}>Your list is empty.</Text>}
      {mine.map(item => <View key={item.id} style={s.item}>
        <Pressable style={s.itemContent} disabled={busy !== null}
          onPress={() => change(item.id,'toggle')}>
          <Text style={s.check}>{item.status === 'bought' ? '☑' : '☐'}</Text>
          <Text style={[s.itemName, item.status === 'bought' && s.strike]}>
            {item.name}{item.quantity > 1 ? ' ×' + item.quantity : ''}
          </Text>
        </Pressable>
        {item.status === 'needed' && <Pressable disabled={busy !== null}
          onPress={() => change(item.id,'transfer')}>
          <Text style={s.send}>Send ↗</Text>
        </Pressable>}
      </View>)}
    </Panel>
    <Text style={s.info}>Together: {items.filter(i=>i.status==='bought').length} of {items.length} items collected.</Text>
    {requests.length > 0 && <Panel>
      <Pressable onPress={()=>setShowRequests(v=>!v)}><Text style={s.subheading}>Housemate requests {showRequests ? '▲' : '▼'}</Text></Pressable>
      {showRequests && requests.slice(0,8).map((r,index)=><Text style={s.info} key={r.id ?? index}>
        {r.requested_by || r.added_by || r.person || 'Housemate'}: {r.message || r.text || r.request || r.note || ''}
      </Text>)}
    </Panel>}
    <Panel>
      <Text style={s.subheading}>Return the Cart Units together</Text>
      <Text style={s.info}>Press End split on both phones within {pair.confirm_window_seconds || 20} seconds. This is a software confirmation; physical contact isn't detected.</Text>
      <Button disabled={Boolean(confirms[role])}
        title={confirms[role] ? 'Waiting for partner…' : 'End split · I confirm'}
        onPress={()=>act('/api/split/end-confirm')} />
      {confirms[otherRole] && !confirms[role] && <Text style={s.success}>Your partner confirmed. Your turn!</Text>}
      {confirms[role] && <Text style={s.info}>Waiting: {confirms.seconds_left || 0}s remaining.</Text>}
    </Panel>
  </ScrollView>;
}

const s = StyleSheet.create({
  page:{padding:17,paddingBottom:38,gap:14,backgroundColor:P.bg},
  eyebrow:{fontSize:11,fontWeight:'800',letterSpacing:1.5,color:P.orange},
  heading:{fontSize:30,fontWeight:'800',color:P.ink},
  subheading:{fontSize:18,fontWeight:'800',color:P.ink},
  info:{fontSize:14,lineHeight:21,color:P.muted},
  panel:{padding:16,gap:13,backgroundColor:P.white,borderRadius:8,borderWidth:1,borderColor:P.line},
  button:{minHeight:50,padding:13,borderRadius:6,backgroundColor:P.orange,justifyContent:'center',alignItems:'center'},
  buttonLabel:{fontSize:15,fontWeight:'700',color:'#FFFFFF',textAlign:'center'},
  subtle:{backgroundColor:P.white,borderColor:P.line,borderWidth:1},
  subtleLabel:{color:P.ink},disabled:{opacity:.4},
  field:{gap:5},fieldLabel:{fontSize:13,fontWeight:'700',color:P.muted},
  input:{minHeight:48,borderWidth:1,borderColor:P.line,borderRadius:6,paddingHorizontal:12,fontSize:16,color:P.ink,backgroundColor:P.white},
  barcode:{fontSize:17,color:P.ink,fontWeight:'700'},error:{color:'#B0392C',fontWeight:'700'},
  idle:{flex:1,backgroundColor:P.ink,padding:28,alignItems:'center',justifyContent:'center',gap:13},
  bigMark:{width:72,height:72,borderRadius:18,backgroundColor:P.orange,alignItems:'center',justifyContent:'center'},
  bigMarkText:{fontSize:37,color:P.white,fontWeight:'900'},
  idleTitle:{fontSize:39,fontWeight:'900',color:P.orange,textAlign:'center'},
  idleSub:{fontSize:12,letterSpacing:3,fontWeight:'700',color:P.muted},
  idleRule:{height:1,width:150,backgroundColor:P.line,marginVertical:9},
  idleMessage:{fontSize:21,fontWeight:'800',color:P.orange,textAlign:'center'},
  idleHint:{fontSize:14,lineHeight:22,color:P.muted,textAlign:'center',maxWidth:280},
  progress:{borderRadius:8,padding:18,backgroundColor:P.ink,flexDirection:'row',alignItems:'baseline',gap:9,flexWrap:'wrap'},
  count:{fontSize:39,fontWeight:'900',color:P.white},progressLabel:{fontSize:16,color:P.white},
  progressFoot:{width:'100%',fontSize:13,color:'#DDD4CB'},
  item:{minHeight:62,borderBottomWidth:1,borderBottomColor:P.line,flexDirection:'row',alignItems:'center',gap:10},
  itemContent:{flex:1,flexDirection:'row',alignItems:'center',gap:10,paddingVertical:8},
  check:{fontSize:26,color:P.orange},itemName:{fontSize:16,fontWeight:'700',color:P.ink,flex:1},
  strike:{textDecorationLine:'line-through',color:P.muted},
  send:{color:P.orange,fontSize:13,fontWeight:'800',paddingVertical:10},
  success:{fontSize:14,fontWeight:'800',color:'#23823D'}
});
