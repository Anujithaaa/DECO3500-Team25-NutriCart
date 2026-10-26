// NUTRICART_STABLE_CAMERA_V1
// A top-level React component stays mounted when the main App refreshes.
import React, {useState} from 'react';
import {View, Text, Pressable} from 'react-native';
import {CameraView} from 'expo-camera';

export default function NutriCartStableCamera({
  scanSlot, permission, scanLockRef, onBarcodeScanned, onCancel
}) {
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const grey = 'rgba(48,50,51,0.64)';

  return (
    <View style={{flex:1, padding:16, backgroundColor:'#F6F4F0'}}>
      <Text style={{fontSize:27, fontWeight:'800', color:'#242D26', marginBottom:7}}>
        Scan Product {scanSlot || ''}
      </Text>
      <Text style={{fontSize:14, color:'#6E6A63', marginBottom:15}}>
        Hold the barcode inside the clear rectangle.
      </Text>

      <View style={{flex:1, minHeight:280, overflow:'hidden', borderRadius:14,
        backgroundColor:'#222626', marginBottom:11}}>
        {permission?.granted ? (
          <CameraView
            style={{flex:1, width:'100%'}}
            active={true}
            facing="front"
            barcodeScannerSettings={{
              barcodeTypes:['ean13','ean8','upc_a','upc_e','code128']
            }}
            onCameraReady={() => {setCameraReady(true); setCameraError('');}}
            onMountError={event => {
              setCameraError(event?.message || 'Camera failed to start.');
              setCameraReady(false);
            }}
            onBarcodeScanned={({data,type}) => {
              if (!scanLockRef.current) onBarcodeScanned(data,type);
            }}
          />
        ) : (
          <View style={{flex:1, alignItems:'center', justifyContent:'center', padding:20}}>
            <Text style={{color:'white', textAlign:'center'}}>
              Camera permission is required. Enable camera access for Expo Go.
            </Text>
          </View>
        )}

        {/* Transparent grey outside; clear centre. No animation or green line. */}
        {permission?.granted && (
          <View pointerEvents="none" style={{position:'absolute', top:0, right:0,
            bottom:0, left:0}}>
            <View style={{flex:1, backgroundColor:grey}} />
            <View style={{height:118, flexDirection:'row'}}>
              <View style={{flex:1, backgroundColor:grey}} />
              <View style={{width:'78%', borderWidth:2,
                borderColor:'rgba(250,250,250,0.90)', borderRadius:6}} />
              <View style={{flex:1, backgroundColor:grey}} />
            </View>
            <View style={{flex:1, backgroundColor:grey}} />
          </View>
        )}
      </View>

      {cameraError ? (
        <Text style={{color:'#B0392C', marginBottom:12}}>
          Camera error: {cameraError}
        </Text>
      ) : permission?.granted && !cameraReady ? (
        <Text style={{color:'#6E6A63', marginBottom:12}}>
          Starting phone camera…
        </Text>
      ) : null}

      <Pressable
        onPress={onCancel}
        style={{height:52, borderWidth:1, borderColor:'#D9D4CB',
          borderRadius:11, backgroundColor:'white',
          alignItems:'center', justifyContent:'center'}}>
        <Text style={{fontSize:16, fontWeight:'700', color:'#242D26'}}>
          Cancel scan
        </Text>
      </Pressable>
    </View>
  );
}
