import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  CameraView,
  useCameraPermissions
} from 'expo-camera';

import {
  API_URL,
  WS_URL,
  api,
  money,
  productPrice
} from './src/api';


const C = {
  bg: '#F6F4F0',
  paper: '#FFFFFF',
  ink: '#1D1C1A',
  muted: '#6E6A63',
  line: '#E2DED6',
  softLine: '#ECE8E1',
  soft: '#CBC6BC',
  warm: '#F1ECE4',
  panel: '#EDE9E2',
  green: '#E4EFE3',
  greenText: '#2F6B48',
  accent: '#C4532D',
  accentDark: '#9F3F1E',
  tint: '#FBEEE7',
  danger: '#B0392C',
};


// same housemate colours as the Home Hub
const PEOPLE = {
  james: '#3A6EA5',
  alex: '#C0841A',
  jess: '#3F8D6E',
};


function personColour(name) {
  return PEOPLE[String(name || '').trim().toLowerCase()] || '#8A857C';
}


const PROTOTYPE_DEALS = [
  {
    id: 1,
    name: 'Chicken breast',
    usualPrice: 12,
    currentPrice: 8
  },
];


/*
  ======================================================
  SMALL COMPONENTS
  ======================================================
*/


function Box({
  children,
  style
}) {
  return (
    <View
      style={[
        styles.box,
        style
      ]}
    >
      {children}
    </View>
  );
}


function PersonTag({
  name,
  small = false
}) {
  const label = String(name || '').trim() || 'Household';

  return (
    <View style={styles.personTag}>
      <View
        style={[
          styles.personDot,
          small && styles.personDotSmall,
          { backgroundColor: personColour(label) }
        ]}
      >
        <Text style={styles.personInitial}>
          {label.charAt(0).toUpperCase()}
        </Text>
      </View>

      <Text
        style={[
          styles.personName,
          small && styles.personNameSmall
        ]}
      >
        {label}
      </Text>
    </View>
  );
}


function RuleTitle({
  children
}) {
  return (
    <View style={styles.ruleTitle}>
      <Text style={styles.ruleTitleText}>
        {children}
      </Text>
    </View>
  );
}


function Button({
  children,
  onPress,
  wide = false,
  accent = false,
  disabled = false
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}

      style={({
        pressed
      }) => [
        styles.button,

        wide &&
          styles.buttonWide,

        accent &&
          styles.buttonAccent,

        pressed &&
        !disabled &&
          styles.buttonPressed,

        disabled &&
          styles.buttonDisabled,
      ]}
    >
      <Text
        style={[
          styles.buttonText,
          accent && styles.buttonTextAccent
        ]}
      >
        {children}
      </Text>
    </Pressable>
  );
}


function MenuButton({
  symbol,
  title,
  note,
  onPress
}) {
  return (
    <Pressable
      style={styles.menuButton}
      onPress={onPress}
    >
      <View style={styles.menuTile}>
        <Text style={styles.menuSymbol}>
          {symbol}
        </Text>
      </View>

      <View style={styles.menuTextWrap}>
        <Text style={styles.menuTitle}>
          {title}
        </Text>

        <Text style={styles.menuNote}>
          {note}
        </Text>
      </View>

      <Text style={styles.menuArrow}>
        ›
      </Text>
    </Pressable>
  );
}


function CheckRow({
  item,
  onPress
}) {
  const done =
    item.status === 'bought';


  return (
    <Pressable
      style={styles.checkRow}
      onPress={onPress}
    >
      <View
        style={[
          styles.squareCheck,

          done &&
            styles.squareCheckDone
        ]}
      >
        {
          done
            ? (
                <Text style={styles.tick}>
                  ✓
                </Text>
              )
            : null
        }
      </View>


      <Text
        style={[
          styles.checkName,

          done &&
            styles.doneText
        ]}
      >
        {item.name}
      </Text>


      <Text
        style={[
          styles.checkQty,
          done && styles.doneFaded
        ]}
      >
        × {item.quantity || 1}
      </Text>


      <View
        style={[
          styles.checkOwner,
          done && styles.doneFaded
        ]}
      >
        <PersonTag
          small
          name={item.added_by}
        />
      </View>
    </Pressable>
  );
}


/*
  ======================================================
  PRODUCT HELPERS
  ======================================================
*/


function valueOrDash(
  value,
  suffix = ''
) {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return '—';
  }


  return `${value}${suffix}`;
}


function storedPrice(
  product
) {
  if (!product) {
    return null;
  }


  try {
    const result =
      productPrice(
        product
      );


    if (
      typeof result ===
      'number'
    ) {
      return {
        price: result
      };
    }


    return result || null;
  }
  catch {
    return null;
  }
}


/*
  Code 128 can contain our demo barcode numbers.

  If extra text ever comes through, this will try
  to extract the 8 to 14 digit barcode from it.
*/


function normaliseBarcode(
  rawValue
) {
  const value =
    String(
      rawValue ?? ''
    )
      .trim();


  if (
    /^\d{8,14}$/.test(
      value
    )
  ) {
    return value;
  }


  const numberMatch =
    value.match(
      /\d{8,14}/
    );


  if (numberMatch) {
    return numberMatch[0];
  }


  return value;
}


/*
  ======================================================
  PROTOTYPE NUTRITION
  ======================================================

  If the database already contains nutrition data,
  that data is kept.

  Missing values are filled using believable prototype
  ranges for the type of food.

  The same product always gets the same generated values.
*/


function textSeed(
  value = ''
) {
  let hash =
    0;


  for (
    let i = 0;
    i < value.length;
    i++
  ) {
    hash =
      (
        (
          hash << 5
        )
        -
        hash
      )
      +
      value.charCodeAt(
        i
      );


    hash |= 0;
  }


  return Math.abs(
    hash
  );
}


function seededNumber(
  seed,
  minimum,
  maximum,
  offset = 0
) {
  const value =
    Math.abs(
      Math.sin(
        seed +
        offset * 999
      )
      *
      10000
    );


  const decimal =
    value -
    Math.floor(
      value
    );


  return (
    minimum +
    decimal *
    (
      maximum -
      minimum
    )
  );
}


function roundNutrition(
  value
) {
  return (
    Math.round(
      value * 10
    )
    /
    10
  );
}


function detectFoodType(
  product
) {
  const text =
    `
      ${product?.name || ''}
      ${product?.category || ''}
      ${product?.brand || ''}
    `
      .toLowerCase();


  if (
    text.includes(
      'high protein yoghurt'
    )
    ||
    text.includes(
      'high protein yogurt'
    )
    ||
    text.includes(
      'greek yoghurt'
    )
    ||
    text.includes(
      'greek yogurt'
    )
  ) {
    return 'highProteinYoghurt';
  }


  if (
    text.includes('yoghurt')
    ||
    text.includes('yogurt')
  ) {
    return 'yoghurt';
  }


  if (
    text.includes('milk')
  ) {
    return 'milk';
  }


  if (
    text.includes('bread')
    ||
    text.includes('loaf')
  ) {
    return 'bread';
  }


  if (
    text.includes('cereal')
    ||
    text.includes('muesli')
    ||
    text.includes('granola')
  ) {
    return 'cereal';
  }


  if (
    text.includes('chicken')
  ) {
    return 'chicken';
  }


  if (
    text.includes('rice')
  ) {
    return 'rice';
  }


  if (
    text.includes('pasta')
    ||
    text.includes('spaghetti')
    ||
    text.includes('penne')
  ) {
    return 'pasta';
  }


  if (
    text.includes('bean')
    ||
    text.includes('lentil')
    ||
    text.includes('chickpea')
  ) {
    return 'beans';
  }


  if (
    text.includes('cheese')
  ) {
    return 'cheese';
  }


  if (
    text.includes('egg')
  ) {
    return 'eggs';
  }


  if (
    text.includes('tuna')
    ||
    text.includes('salmon')
    ||
    text.includes('fish')
  ) {
    return 'fish';
  }


  if (
    text.includes('juice')
  ) {
    return 'juice';
  }


  if (
    text.includes('cola')
    ||
    text.includes('soft drink')
    ||
    text.includes('soda')
  ) {
    return 'softDrink';
  }


  if (
    text.includes('protein bar')
    ||
    text.includes('protein snack')
  ) {
    return 'proteinSnack';
  }


  if (
    text.includes('chips')
    ||
    text.includes('crisps')
    ||
    text.includes('cracker')
    ||
    text.includes('snack')
  ) {
    return 'snack';
  }


  return 'general';
}


const NUTRITION_PROFILES = {

  highProteinYoghurt: {
    protein: [8, 15],
    sugar: [3, 8],
    fat: [0.5, 5],
    energy: [300, 550]
  },


  yoghurt: {
    protein: [4, 8],
    sugar: [4, 12],
    fat: [1, 7],
    energy: [300, 650]
  },


  milk: {
    protein: [3, 4],
    sugar: [4, 6],
    fat: [0.2, 4],
    energy: [170, 300]
  },


  bread: {
    protein: [7, 12],
    sugar: [2, 7],
    fat: [1, 6],
    energy: [900, 1200]
  },


  cereal: {
    protein: [6, 14],
    sugar: [6, 25],
    fat: [2, 12],
    energy: [1400, 1800]
  },


  chicken: {
    protein: [20, 31],
    sugar: [0, 1],
    fat: [2, 12],
    energy: [450, 850]
  },


  rice: {
    protein: [6, 9],
    sugar: [0, 1],
    fat: [0.5, 3],
    energy: [1400, 1600]
  },


  pasta: {
    protein: [10, 15],
    sugar: [1, 4],
    fat: [1, 4],
    energy: [1400, 1650]
  },


  beans: {
    protein: [6, 10],
    sugar: [1, 5],
    fat: [0.5, 3],
    energy: [400, 750]
  },


  cheese: {
    protein: [20, 30],
    sugar: [0, 3],
    fat: [20, 35],
    energy: [1300, 1800]
  },


  eggs: {
    protein: [12, 14],
    sugar: [0, 1],
    fat: [9, 12],
    energy: [550, 700]
  },


  fish: {
    protein: [20, 28],
    sugar: [0, 1],
    fat: [1, 15],
    energy: [400, 900]
  },


  juice: {
    protein: [0, 1],
    sugar: [7, 12],
    fat: [0, 0.5],
    energy: [140, 240]
  },


  softDrink: {
    protein: [0, 0.2],
    sugar: [8, 12],
    fat: [0, 0.1],
    energy: [140, 210]
  },


  snack: {
    protein: [4, 10],
    sugar: [2, 15],
    fat: [15, 35],
    energy: [1800, 2400]
  },


  proteinSnack: {
    protein: [15, 30],
    sugar: [2, 12],
    fat: [5, 18],
    energy: [1200, 1900]
  },


  general: {
    protein: [4, 15],
    sugar: [2, 15],
    fat: [2, 15],
    energy: [600, 1500]
  },

};


function addPrototypeNutrition(
  product
) {
  if (!product) {
    return product;
  }


  const existing =
    product.nutrition
    ||
    {};


  const type =
    detectFoodType(
      product
    );


  const profile =
    NUTRITION_PROFILES[type]
    ||
    NUTRITION_PROFILES.general;


  const seed =
    textSeed(
      `${product.barcode || ''}-${product.name || ''}`
    );


  let usedPrototype =
    false;


  function getValue(
    existingValue,
    range,
    offset
  ) {
    if (
      existingValue !== null &&
      existingValue !== undefined &&
      existingValue !== ''
    ) {
      return existingValue;
    }


    usedPrototype =
      true;


    return roundNutrition(
      seededNumber(
        seed,
        range[0],
        range[1],
        offset
      )
    );
  }


  return {
    ...product,

    nutrition: {
      ...existing,

      protein_100g:
        getValue(
          existing.protein_100g,
          profile.protein,
          1
        ),

      sugars_100g:
        getValue(
          existing.sugars_100g,
          profile.sugar,
          2
        ),

      fat_100g:
        getValue(
          existing.fat_100g,
          profile.fat,
          3
        ),

      energy_kj_100g:
        getValue(
          existing.energy_kj_100g,
          profile.energy,
          4
        ),
    },

    prototypeNutrition:
      usedPrototype,

    detectedFoodType:
      type,
  };
}


/*
  ======================================================
  PRICE PER 100 G
  ======================================================
*/


function productWeightGrams(
  product
) {
  const text =
    String(
      product?.quantity
      ||
      ''
    )
      .toLowerCase()
      .replace(
        /\s+/g,
        ''
      );


  const kg =
    text.match(
      /([\d.]+)kg/
    );


  if (kg) {
    return (
      Number(
        kg[1]
      )
      *
      1000
    );
  }


  const grams =
    text.match(
      /([\d.]+)g/
    );


  if (grams) {
    return Number(
      grams[1]
    );
  }


  return null;
}


function pricePer100g(
  product,
  price
) {
  const weight =
    productWeightGrams(
      product
    );


  if (
    !weight ||
    !Number.isFinite(
      price
    )
  ) {
    return '—';
  }


  const value =
    (
      price /
      weight
    )
    *
    100;


  return `${money(value)} / 100 g`;
}


/*
  ======================================================
  COMPARE TABLE
  ======================================================
*/


function CompareTable({
  productA,
  productB,
  priceA,
  priceB
}) {
  if (
    !productA ||
    !productB
  ) {
    return (
      <Text style={styles.emptyText}>
        Scan Product A and Product B to compare them.
      </Text>
    );
  }


  const storedA =
    storedPrice(
      productA
    );


  const storedB =
    storedPrice(
      productB
    );


  const finalPriceA =
    priceA !== ''
      ? Number(
          priceA
        )
      : Number(
          storedA?.price
        );


  const finalPriceB =
    priceB !== ''
      ? Number(
          priceB
        )
      : Number(
          storedB?.price
        );


  const rows = [

    [
      'Price',

      Number.isFinite(
        finalPriceA
      )
        ? money(
            finalPriceA
          )
        : '—',

      Number.isFinite(
        finalPriceB
      )
        ? money(
            finalPriceB
          )
        : '—'
    ],


    [
      'Per 100 g',

      pricePer100g(
        productA,
        finalPriceA
      ),

      pricePer100g(
        productB,
        finalPriceB
      )
    ],


    [
      'Protein',

      valueOrDash(
        productA
          ?.nutrition
          ?.protein_100g,
        ' g'
      ),

      valueOrDash(
        productB
          ?.nutrition
          ?.protein_100g,
        ' g'
      )
    ],


    [
      'Sugar',

      valueOrDash(
        productA
          ?.nutrition
          ?.sugars_100g,
        ' g'
      ),

      valueOrDash(
        productB
          ?.nutrition
          ?.sugars_100g,
        ' g'
      )
    ],


    [
      'Fat',

      valueOrDash(
        productA
          ?.nutrition
          ?.fat_100g,
        ' g'
      ),

      valueOrDash(
        productB
          ?.nutrition
          ?.fat_100g,
        ' g'
      )
    ],


    [
      'Energy',

      valueOrDash(
        productA
          ?.nutrition
          ?.energy_kj_100g,
        ' kJ'
      ),

      valueOrDash(
        productB
          ?.nutrition
          ?.energy_kj_100g,
        ' kJ'
      )
    ],

  ];


  const prototypeValues =
    productA.prototypeNutrition
    ||
    productB.prototypeNutrition;


  return (
    <View>

      <View style={styles.table}>

        <View style={styles.tableRow}>

          <Text
            style={[
              styles.tableCell,
              styles.tableKey
            ]}
          />


          <Text
            style={[
              styles.tableCell,
              styles.tableHead
            ]}
          >
            A
          </Text>


          <Text
            style={[
              styles.tableCell,
              styles.tableHead
            ]}
          >
            B
          </Text>

        </View>


        {
          rows.map(
            row => (

              <View
                key={
                  row[0]
                }
                style={
                  styles.tableRow
                }
              >

                <Text
                  style={[
                    styles.tableCell,
                    styles.tableKey
                  ]}
                >
                  {row[0]}
                </Text>


                <Text style={styles.tableCell}>
                  {row[1]}
                </Text>


                <Text style={styles.tableCell}>
                  {row[2]}
                </Text>

              </View>

            )
          )
        }


        <View style={styles.productNames}>

          <Text style={styles.productCaption}>
            A: {productA.name}
          </Text>


          <Text style={styles.productCaption}>
            B: {productB.name}
          </Text>

        </View>

      </View>


      {
        prototypeValues
          ? (
              <Text style={styles.prototypeNutritionNote}>
                Some nutrition values are simulated for prototype testing.
              </Text>
            )
          : null
      }

    </View>
  );
}


/*
  ======================================================
  APP
  ======================================================
*/


export default function App() {

  const [
    permission,
    requestPermission
  ] =
    useCameraPermissions();


  const [
    screen,
    setScreen
  ] =
    useState(
      'shop'
    );


  const [
    connected,
    setConnected
  ] =
    useState(
      false
    );


  const [
    loading,
    setLoading
  ] =
    useState(
      false
    );


  const [
    notice,
    setNotice
  ] =
    useState(
      ''
    );


  const [
    lastScan,
    setLastScan
  ] =
    useState(
      ''
    );


  const [
    state,
    setState
  ] =
    useState({
      shopping_items: [],
      recent_scans: [],
      settings: {},
      meals: [],
      selected_meal: null,
      household_requests: [],
      inventory: [],
    });


  const [
    selectedItem,
    setSelectedItem
  ] =
    useState(
      null
    );


  const [
    itemPrice,
    setItemPrice
  ] =
    useState(
      ''
    );


  const [
    itemPrices,
    setItemPrices
  ] =
    useState(
      {}
    );


  const [
    spent,
    setSpent
  ] =
    useState(
      0
    );


  const [
    compareA,
    setCompareA
  ] =
    useState(
      null
    );


  const [
    compareB,
    setCompareB
  ] =
    useState(
      null
    );


  const [
    comparePriceA,
    setComparePriceA
  ] =
    useState(
      ''
    );


  const [
    comparePriceB,
    setComparePriceB
  ] =
    useState(
      ''
    );


  const [
    scanSlot,
    setScanSlot
  ] =
    useState(
      null
    );


  const scanSlotRef =
    useRef(
      null
    );


  const scanLockRef =
    useRef(
      false
    );


  const wsRef =
    useRef(
      null
    );


  const [
    recommendationIndex,
    setRecommendationIndex
  ] =
    useState(
      0
    );


  const [
    shopperOne,
    setShopperOne
  ] =
    useState(
      []
    );


  const [
    shopperTwo,
    setShopperTwo
  ] =
    useState(
      []
    );


  const needed =
    useMemo(
      () =>
        state
          .shopping_items
          .filter(
            item =>
              item.status ===
              'needed'
          ),

      [
        state.shopping_items
      ]
    );


  const bought =
    useMemo(
      () =>
        state
          .shopping_items
          .filter(
            item =>
              item.status ===
              'bought'
          ),

      [
        state.shopping_items
      ]
    );


  const budget =
    Number(
      state
        .settings
        ?.budget
      ??
      60
    );


  const budgetRemaining =
    budget -
    spent;


  /*
    ======================================================
    NOTICE
    ======================================================
  */


  function showNotice(
    message
  ) {
    setNotice(
      message
    );


    setTimeout(
      () => {
        setNotice(
          ''
        );
      },
      3000
    );
  }


  /*
    ======================================================
    LIVE STATE
    ======================================================
  */


  const refreshState =
    useCallback(
      async () => {

        try {

          const next =
            await api(
              '/api/state'
            );


          setState(
            next
          );


          setConnected(
            true
          );

        }
        catch {

          setConnected(
            false
          );

        }

      },
      []
    );


  useEffect(
    () => {

      refreshState();


      const timer =
        setInterval(
          refreshState,
          5000
        );


      return () => {
        clearInterval(
          timer
        );
      };

    },
    [
      refreshState
    ]
  );


  useEffect(
    () => {

      let stopped =
        false;


      function connect() {

        if (stopped) {
          return;
        }


        try {

          const ws =
            new WebSocket(
              WS_URL
            );


          wsRef.current =
            ws;


          ws.onopen =
            () => {
              setConnected(
                true
              );
            };


          ws.onmessage =
            event => {

              try {

                const message =
                  JSON.parse(
                    event.data
                  );


                if (
                  [
                    'list_updated',
                    'settings_updated',
                    'requests_updated',
                    'inventory_updated',
                    'meals_updated'
                  ]
                    .includes(
                      message.type
                    )
                ) {
                  refreshState();
                }

              }
              catch {
                // Ignore malformed websocket messages.
              }

            };


          ws.onclose =
            () => {

              setConnected(
                false
              );


              if (!stopped) {

                setTimeout(
                  connect,
                  1800
                );

              }

            };

        }
        catch {

          setConnected(
            false
          );

        }
      }


      connect();


      return () => {

        stopped =
          true;


        try {
          wsRef.current
            ?.close();
        }
        catch {
          // Ignore close errors.
        }

      };

    },
    [
      refreshState
    ]
  );


  /*
    ======================================================
    SHOPPING LIST
    ======================================================
  */


  function openShoppingItem(
    item
  ) {

    if (
      item.status ===
      'bought'
    ) {

      uncheckItem(
        item
      );


      return;
    }


    setSelectedItem(
      item
    );


    setItemPrice(
      itemPrices[item.id]
        ?.toString()
      ||
      ''
    );


    setScreen(
      'item'
    );
  }


  async function uncheckItem(
    item
  ) {

    try {

      await api(
        `/api/list/${item.id}`,
        {

          method:
            'PATCH',

          body:
            JSON.stringify({
              status:
                'needed'
            }),

        }
      );


      const oldPrice =
        Number(
          itemPrices[item.id]
          ||
          0
        );


      setSpent(
        current =>
          Math.max(
            0,
            current -
            oldPrice
          )
      );


      setItemPrices(
        current => {

          const next = {
            ...current
          };


          delete next[item.id];


          return next;

        }
      );


      await refreshState();

    }
    catch {

      showNotice(
        'Could not update item.'
      );

    }
  }


  async function addItemToBasket() {

    if (!selectedItem) {
      return;
    }


    const price =
      itemPrice.trim() === ''
        ? 0
        : Number(
            itemPrice
          );


    if (
      !Number.isFinite(
        price
      )
      ||
      price < 0
    ) {

      showNotice(
        'Enter a valid price.'
      );


      return;
    }


    try {

      await api(
        `/api/list/${selectedItem.id}`,
        {

          method:
            'PATCH',

          body:
            JSON.stringify({
              status:
                'bought'
            }),

        }
      );


      setSpent(
        current =>
          current +
          price
      );


      setItemPrices(
        current => ({
          ...current,

          [selectedItem.id]:
            price
        })
      );


      await refreshState();


      setScreen(
        'item-added'
      );

    }
    catch {

      showNotice(
        'Could not add item.'
      );

    }
  }


  /*
    ======================================================
    CODE 128 SCANNING
    ======================================================
  */


  async function startCompareScan(
    slot
  ) {

    if (
      !permission?.granted
    ) {

      const result =
        await requestPermission();


      if (
        !result.granted
      ) {

        showNotice(
          'Camera permission is required.'
        );


        return;
      }

    }


    scanSlotRef.current =
      slot;


    setScanSlot(
      slot
    );


    scanLockRef.current =
      false;


    setLastScan(
      ''
    );


    setScreen(
      'scanner'
    );
  }


  async function handleBarcodeScan(
    rawData,
    scanType
  ) {

    if (
      scanLockRef.current
    ) {
      return;
    }


    scanLockRef.current =
      true;


    const barcode =
      normaliseBarcode(
        rawData
      );


    const slot =
      scanSlotRef.current;


    console.log(
      'SCAN TYPE:',
      scanType
    );


    console.log(
      'RAW SCAN:',
      rawData
    );


    console.log(
      'BARCODE:',
      barcode
    );


    console.log(
      'SLOT:',
      slot
    );


    setLastScan(
      barcode
    );


    /*
      As soon as a barcode is detected, leave the camera.

      This stops the same Code 128 barcode from being
      detected repeatedly.
    */

    setScreen(
      'compare'
    );


    setLoading(
      true
    );


    try {

      if (!barcode) {

        throw new Error(
          'No barcode data detected.'
        );

      }


      const result =
        await api(
          '/api/scan',
          {

            method:
              'POST',

            body:
              JSON.stringify({
                barcode,
                device:
                  'Cart Unit',
                store:
                  'Woolworths'
              }),

          }
        );


      console.log(
        'SCAN API RESULT:',
        result
      );


      const returnedProduct =
        result?.product
        ||
        result;


      if (
        !returnedProduct
        ||
        !returnedProduct.name
      ) {

        throw new Error(
          'Product was not returned by the Home Dock.'
        );

      }


      const scanned =
        addPrototypeNutrition(
          returnedProduct
        );


      const priceInfo =
        storedPrice(
          scanned
        );


      const price =
        priceInfo?.price;


      if (
        slot ===
        'A'
      ) {

        setCompareA(
          scanned
        );


        setComparePriceA(
          price !== null &&
          price !== undefined
            ? String(
                price
              )
            : ''
        );

      }


      else if (
        slot ===
        'B'
      ) {

        setCompareB(
          scanned
        );


        setComparePriceB(
          price !== null &&
          price !== undefined
            ? String(
                price
              )
            : ''
        );

      }


      else {

        throw new Error(
          'No comparison slot was selected.'
        );

      }


      showNotice(
        `${scanned.name} scanned as Product ${slot}.`
      );

    }

    catch (error) {

      console.log(
        'SCAN ERROR:',
        error
      );


      showNotice(
        `Scan failed: ${
          error?.message
          ||
          'Could not look up product.'
        }`
      );

    }

    finally {

      setLoading(
        false
      );


      setTimeout(
        () => {

          scanLockRef.current =
            false;

        },
        800
      );

    }
  }


  function resetCompare() {

    setCompareA(
      null
    );


    setCompareB(
      null
    );


    setComparePriceA(
      ''
    );


    setComparePriceB(
      ''
    );


    setScanSlot(
      null
    );


    scanSlotRef.current =
      null;


    scanLockRef.current =
      false;


    setLastScan(
      ''
    );
  }


  function chooseComparedProduct(
    slot
  ) {

    const product =
      slot === 'A'
        ? compareA
        : compareB;


    if (!product) {
      return;
    }


    showNotice(
      `${product.name} selected.`
    );


    setScreen(
      'shop'
    );
  }


  /*
    ======================================================
    DEALS
    ======================================================
  */


  async function addDealToList(
    deal
  ) {

    const exists =
      state
        .shopping_items
        .some(
          item =>
            item.name
              .trim()
              .toLowerCase()
            ===
            deal.name
              .trim()
              .toLowerCase()
        );


    if (exists) {

      showNotice(
        `${deal.name} is already on the list.`
      );


      return;
    }


    try {

      await api(
        '/api/list',
        {

          method:
            'POST',

          body:
            JSON.stringify({
              name:
                deal.name,

              quantity:
                1,

              added_by:
                'Deal alert'
            }),

        }
      );


      await refreshState();


      showNotice(
        `${deal.name} added.`
      );

    }
    catch {

      showNotice(
        'Could not add deal.'
      );

    }
  }


  /*
    ======================================================
    SPLIT SHOP
    ======================================================
  */


  function openSplitShop() {

    const one =
      [];


    const two =
      [];


    needed.forEach(
      (
        item,
        index
      ) => {

        if (
          index % 2 ===
          0
        ) {
          one.push(
            item
          );
        }
        else {
          two.push(
            item
          );
        }

      }
    );


    setShopperOne(
      one
    );


    setShopperTwo(
      two
    );


    setScreen(
      'split'
    );
  }


  function moveToShopperTwo(
    item
  ) {

    setShopperOne(
      current =>
        current.filter(
          value =>
            value.id !==
            item.id
        )
    );


    setShopperTwo(
      current => [
        ...current,
        item
      ]
    );
  }


  function moveToShopperOne(
    item
  ) {

    setShopperTwo(
      current =>
        current.filter(
          value =>
            value.id !==
            item.id
        )
    );


    setShopperOne(
      current => [
        ...current,
        item
      ]
    );
  }


  /*
    ======================================================
    END SHOP
    ======================================================
  */


  const mealComplete =
    useMemo(
      () => {

        const meal =
          state.selected_meal;


        if (
          !meal ||
          !Array.isArray(
            meal.ingredients
          ) ||
          meal.ingredients.length ===
          0
        ) {
          return null;
        }


        const available =
          new Set();


        bought.forEach(
          item => {

            available.add(
              item.name
                .trim()
                .toLowerCase()
            );

          }
        );


        state
          .inventory
          .forEach(
            item => {

              available.add(
                item.name
                  .trim()
                  .toLowerCase()
              );

            }
          );


        return meal
          .ingredients
          .every(
            ingredient =>
              available.has(
                ingredient
                  .trim()
                  .toLowerCase()
              )
          );

      },
      [
        state.selected_meal,
        state.inventory,
        bought
      ]
    );


  async function finishShop() {

    try {

      await api(
        '/api/settings',
        {

          method:
            'PATCH',

          body:
            JSON.stringify({
              shopping_active:
                false
            }),

        }
      );


      await refreshState();


      showNotice(
        'Shopping trip finished.'
      );

    }
    catch {

      showNotice(
        'Could not finish shop.'
      );

    }
  }


  /*
    ======================================================
    TODAY'S SHOP
    ======================================================
  */


  function ShopScreen() {

    return (
      <ScrollView
        contentContainerStyle={
          styles.page
        }
      >

        <RuleTitle>
          Today’s Shop
        </RuleTitle>


        <View style={styles.budgetBlock}>

          <View style={styles.budgetTop}>
            <Text style={styles.budgetSpent}>
              {money(spent)}
            </Text>

            <Text style={styles.budgetOf}>
              of {money(budget)}
            </Text>
          </View>

          <View style={styles.budgetBar}>
            <View
              style={[
                styles.budgetFill,
                Number(spent) > Number(budget) && styles.budgetFillOver,
                {
                  width: `${Math.min(100, Number(budget) > 0 ? (Number(spent) / Number(budget)) * 100 : 0)}%`
                }
              ]}
            />
          </View>

          {
            state.selected_meal
              ? (
                  <Text style={styles.tripMeal}>
                    Tonight · {state.selected_meal.name}
                  </Text>
                )
              : null
          }

        </View>


        <Box style={styles.listPlain}>

          {
            state
              .shopping_items
              .length
              ? (

                  state
                    .shopping_items
                    .map(
                      item => (

                        <CheckRow
                          key={
                            item.id
                          }

                          item={
                            item
                          }

                          onPress={
                            () =>
                              openShoppingItem(
                                item
                              )
                          }
                        />

                      )
                    )

                )
              : (

                  <Text style={styles.emptyText}>
                    No items have been added from the Home Dock yet.
                  </Text>

                )
          }

        </Box>


        <View style={styles.summaryRow}>

          <Text style={styles.summaryText}>
            {needed.length} remaining
          </Text>


          <Text style={styles.summaryText}>
            {bought.length} collected
          </Text>

        </View>


        <View style={styles.twoButtons}>

          <Button
            wide
            accent

            onPress={
              () =>
                setScreen(
                  'compare'
                )
            }
          >
            Compare
          </Button>


          <Button
            wide

            onPress={
              () =>
                setScreen(
                  'menu'
                )
            }
          >
            More
          </Button>

        </View>

      </ScrollView>
    );
  }


  /*
    ======================================================
    ITEM SCREEN
    ======================================================
  */


  function ItemScreen() {

    if (!selectedItem) {
      return null;
    }


    return (
      <ScrollView
        contentContainerStyle={
          styles.page
        }

        keyboardShouldPersistTaps=
          "handled"
      >

        <RuleTitle>
          {selectedItem.name}
        </RuleTitle>


        <Box>

          <Text style={styles.largeItemName}>
            {selectedItem.name}
          </Text>


          <Text style={styles.itemMeta}>
            Added by {selectedItem.added_by || 'Household'}
          </Text>


          <Text style={styles.itemMeta}>
            Quantity: {selectedItem.quantity || 1}
          </Text>


          <Text style={styles.fieldLabel}>
            Shelf price
          </Text>


          <View style={styles.moneyInputRow}>

            <Text style={styles.moneySymbol}>
              $
            </Text>


            <TextInput
              value={
                itemPrice
              }

              onChangeText={
                setItemPrice
              }

              keyboardType=
                "decimal-pad"

              placeholder=
                "0.00"

              style={
                styles.input
              }
            />

          </View>


          <Button
            wide
            accent

            onPress={
              addItemToBasket
            }
          >
            Add to basket
          </Button>

        </Box>


        <Button
          wide

          onPress={
            () =>
              setScreen(
                'shop'
              )
          }
        >
          Back to list
        </Button>

      </ScrollView>
    );
  }


  /*
    ======================================================
    ITEM ADDED
    ======================================================
  */


  function ItemAddedScreen() {

    if (!selectedItem) {
      return null;
    }


    const price =
      Number(
        itemPrices[selectedItem.id]
        ||
        0
      );


    return (
      <ScrollView
        contentContainerStyle={
          styles.page
        }
      >

        <RuleTitle>
          {selectedItem.name}
        </RuleTitle>


        <Box>

          <Text style={styles.largeItemName}>
            {selectedItem.name}
          </Text>


          <Text style={styles.addedLine}>
            Price: {money(price)}
          </Text>


          <Text style={styles.addedLine}>
            Added to basket
          </Text>


          <View style={styles.divider} />


          <Text style={styles.addedLine}>
            Budget: {money(spent)} / {money(budget)}
          </Text>


          <Text style={styles.addedLine}>
            Remaining: {needed.length} items
          </Text>

        </Box>


        <Button
          wide
          accent

          onPress={
            () =>
              setScreen(
                'shop'
              )
          }
        >
          Back to list
        </Button>

      </ScrollView>
    );
  }


  /*
    ======================================================
    COMPARE
    ======================================================
  */


  function CompareScreen() {

    return (
      <ScrollView
        contentContainerStyle={
          styles.page
        }

        keyboardShouldPersistTaps=
          "handled"
      >

        <RuleTitle>
          Compare
        </RuleTitle>


        {
          loading
            ? (

                <Box style={styles.loadingBox}>

                  <ActivityIndicator
                    size="large"
                    color={
                      C.ink
                    }
                  />


                  <Text style={styles.loadingText}>
                    Looking up product...
                  </Text>


                  {
                    lastScan
                      ? (
                          <Text style={styles.scanDebug}>
                            {lastScan}
                          </Text>
                        )
                      : null
                  }

                </Box>

              )
            : null
        }


        <View style={styles.compareScanners}>

          <Box style={styles.compareSlot}>

            <Text style={styles.compareLetter}>
              A
            </Text>


            <Text style={styles.compareProductName}>
              {
                compareA?.name
                ||
                'No product scanned'
              }
            </Text>


            <Button
              wide

              disabled={
                loading
              }

              onPress={
                () =>
                  startCompareScan(
                    'A'
                  )
              }
            >
              {
                compareA
                  ? 'Scan A again'
                  : 'Scan Product A'
              }
            </Button>

          </Box>


          <Box style={styles.compareSlot}>

            <Text style={styles.compareLetter}>
              B
            </Text>


            <Text style={styles.compareProductName}>
              {
                compareB?.name
                ||
                'No product scanned'
              }
            </Text>


            <Button
              wide

              disabled={
                loading
              }

              onPress={
                () =>
                  startCompareScan(
                    'B'
                  )
              }
            >
              {
                compareB
                  ? 'Scan B again'
                  : 'Scan Product B'
              }
            </Button>

          </Box>

        </View>


        <CompareTable
          productA={
            compareA
          }

          productB={
            compareB
          }

          priceA={
            comparePriceA
          }

          priceB={
            comparePriceB
          }
        />


        {
          compareA
            ? (

                <Box>

                  <Text style={styles.sectionLabel}>
                    Product A shelf price
                  </Text>


                  <TextInput
                    value={
                      comparePriceA
                    }

                    onChangeText={
                      setComparePriceA
                    }

                    keyboardType=
                      "decimal-pad"

                    placeholder=
                      "0.00"

                    style={
                      styles.input
                    }
                  />

                </Box>

              )
            : null
        }


        {
          compareB
            ? (

                <Box>

                  <Text style={styles.sectionLabel}>
                    Product B shelf price
                  </Text>


                  <TextInput
                    value={
                      comparePriceB
                    }

                    onChangeText={
                      setComparePriceB
                    }

                    keyboardType=
                      "decimal-pad"

                    placeholder=
                      "0.00"

                    style={
                      styles.input
                    }
                  />

                </Box>

              )
            : null
        }


        {
          compareA &&
          compareB
            ? (
                <>

                  <Text style={styles.smallNote}>
                    NutriCart is showing the information side by side. The choice is still yours.
                  </Text>


                  <View style={styles.twoButtons}>

                    <Button
                      wide

                      onPress={
                        () =>
                          chooseComparedProduct(
                            'A'
                          )
                      }
                    >
                      Choose A
                    </Button>


                    <Button
                      wide

                      onPress={
                        () =>
                          chooseComparedProduct(
                            'B'
                          )
                      }
                    >
                      Choose B
                    </Button>

                  </View>

                </>
              )
            : null
        }


        <View style={styles.twoButtons}>

          <Button
            wide

            onPress={
              resetCompare
            }
          >
            Clear
          </Button>


          <Button
            wide

            onPress={
              () =>
                setScreen(
                  'shop'
                )
            }
          >
            Back to list
          </Button>

        </View>

      </ScrollView>
    );
  }


  /*
    ======================================================
    CODE 128 SCANNER
    ======================================================
  */


  function ScannerScreen() {

    return (
      <View style={styles.scannerPage}>

        <RuleTitle>
          Scan Product {scanSlot || ''}
        </RuleTitle>


        <Text style={styles.scannerInstruction}>
          Hold the Code 128 barcode inside the guide.
        </Text>


        <Text style={styles.scannerSubtext}>
          Code 128 only
        </Text>


        <View style={styles.cameraWrap}>

          <CameraView
            style={
              styles.camera
            }

            facing=
              "back"

            autofocus=
              "on"

            barcodeScannerSettings={{
              barcodeTypes: [
                'code128'
              ]
            }}

            onBarcodeScanned={({
              data,
              type
            }) => {

              if (
                scanLockRef.current
              ) {
                return;
              }


              handleBarcodeScan(
                data,
                type
              );

            }}
          />


          <View
            pointerEvents=
              "none"

            style={
              styles.scanFrame
            }
          >

            <View style={styles.scanLine} />

          </View>


          <Text
            pointerEvents=
              "none"

            style={
              styles.scanHint
            }
          >
            Keep the whole barcode and some white space on both ends inside the box
          </Text>

        </View>


        <Button
          wide

          onPress={
            () => {

              scanLockRef.current =
                true;


              setScreen(
                'compare'
              );

            }
          }
        >
          Cancel
        </Button>

      </View>
    );
  }


  /*
    ======================================================
    MENU
    ======================================================
  */


  function MenuScreen() {

    return (
      <ScrollView
        contentContainerStyle={
          styles.menuPage
        }
      >

        <RuleTitle>
          Cart Unit
        </RuleTitle>


        <MenuButton
          symbol="☷"

          title="Today’s Shop"

          note="Shopping list and running budget"

          onPress={
            () =>
              setScreen(
                'shop'
              )
          }
        />


        <MenuButton
          symbol="⇄"

          title="Compare Products"

          note="Scan two products side by side"

          onPress={
            () =>
              setScreen(
                'compare'
              )
          }
        />


        <MenuButton
          symbol="✎"

          title="Housemate Requests"

          note="Notes left by people at home"

          onPress={
            () =>
              setScreen(
                'requests'
              )
          }
        />


        <MenuButton
          symbol="♡"

          title="Recommendation"

          note="Trusted household suggestion"

          onPress={
            () =>
              setScreen(
                'recommendation'
              )
          }
        />


        <MenuButton
          symbol="$"

          title="Deal Alert"

          note="Relevant specials for the shop"

          onPress={
            () =>
              setScreen(
                'deals'
              )
          }
        />


        <MenuButton
          symbol="⌂"

          title="Already at Home"

          note="Check before buying another one"

          onPress={
            () =>
              setScreen(
                'at-home'
              )
          }
        />


        <MenuButton
          symbol="↔"

          title="Split Shop"

          note="Divide the list between two shoppers"

          onPress={
            openSplitShop
          }
        />


        <MenuButton
          symbol="✓"

          title="End of Shop"

          note="Items, spending and remaining budget"

          onPress={
            () =>
              setScreen(
                'summary'
              )
          }
        />


        <Button
          wide

          onPress={
            () =>
              setScreen(
                'shop'
              )
          }
        >
          Back
        </Button>

      </ScrollView>
    );
  }


  /*
    ======================================================
    HOUSEMATE REQUESTS
    ======================================================
  */


  function RequestsScreen() {

    const requests =
      state.household_requests
      ||
      [];


    return (
      <ScrollView
        contentContainerStyle={
          styles.page
        }
      >

        <RuleTitle>
          Housemate Requests
        </RuleTitle>


        {
          requests.length
            ? requests.map(request => (
                <View
                  key={request.id}
                  style={[
                    styles.note,
                    { borderLeftColor: personColour(request.person) }
                  ]}
                >
                  <PersonTag name={request.person} />

                  <Text style={styles.requestText}>
                    {request.message}
                  </Text>
                </View>
              ))
            : (
                <Text style={styles.emptyText}>
                  No household requests right now.
                </Text>
              )
        }


        <Button
          wide
          onPress={
            () =>
              setScreen(
                'menu'
              )
          }
        >
          Back
        </Button>

      </ScrollView>
    );
  }


  /*
    ======================================================
    RECOMMENDATION
    ======================================================
  */


  function RecommendationScreen() {

    const requests =
      state.household_requests
      ||
      [];


    const recommendation =
      requests.length
        ? requests[
            recommendationIndex %
            requests.length
          ]
        : null;


    return (
      <ScrollView
        contentContainerStyle={
          styles.page
        }
      >

        <RuleTitle>
          Housemate Recommendation
        </RuleTitle>


        <Box style={styles.recommendationBox}>

          {
            recommendation
              ? (
                  <>

                    <Text style={styles.requestName}>
                      {recommendation.person}
                    </Text>


                    <Text style={styles.recommendationText}>
                      “{recommendation.message}”
                    </Text>


                    <View style={styles.twoButtons}>

                      <Button
                        wide
                        accent

                        onPress={
                          () => {

                            showNotice(
                              'Suggestion kept in mind.'
                            );


                            setScreen(
                              'shop'
                            );

                          }
                        }
                      >
                        Use suggestion
                      </Button>


                      <Button
                        wide

                        onPress={
                          () => {

                            if (
                              requests.length >
                              1
                            ) {

                              setRecommendationIndex(
                                current =>
                                  current + 1
                              );

                            }
                            else {

                              setScreen(
                                'shop'
                              );

                            }

                          }
                        }
                      >
                        Ignore
                      </Button>

                    </View>

                  </>
                )
              : (

                  <Text style={styles.emptyText}>
                    No housemate recommendations are available.
                  </Text>

                )
          }

        </Box>


        <Button
          wide

          onPress={
            () =>
              setScreen(
                'menu'
              )
          }
        >
          Back
        </Button>

      </ScrollView>
    );
  }


  /*
    ======================================================
    DEALS
    ======================================================
  */


  function DealsScreen() {

    return (
      <ScrollView
        contentContainerStyle={
          styles.page
        }
      >

        <RuleTitle>
          Deal Alert
        </RuleTitle>


        {
          PROTOTYPE_DEALS.map(
            deal => (

              <Box
                key={
                  deal.id
                }
              >

                <Text style={styles.largeItemName}>
                  {deal.name}
                </Text>


                <Text style={styles.dealOldPrice}>
                  Usually {money(deal.usualPrice)}
                </Text>


                <Text style={styles.dealPrice}>
                  Today {money(deal.currentPrice)}
                </Text>


                <Text style={styles.prototypeLabel}>
                  Prototype special
                </Text>


                <Button
                  wide
                  accent

                  onPress={
                    () =>
                      addDealToList(
                        deal
                      )
                  }
                >
                  Add to list
                </Button>

              </Box>

            )
          )
        }


        <Button
          wide

          onPress={
            () =>
              setScreen(
                'menu'
              )
          }
        >
          Back
        </Button>

      </ScrollView>
    );
  }


  /*
    ======================================================
    ALREADY AT HOME
    ======================================================
  */


  function AtHomeScreen() {

    const inventory =
      state.inventory
      ||
      [];


    return (
      <ScrollView
        contentContainerStyle={
          styles.page
        }
      >

        <RuleTitle>
          Already at Home
        </RuleTitle>


        <View style={styles.listPlain}>
          {
            inventory.length
              ? inventory.map(item => (
                  <View
                    key={item.id}
                    style={styles.homeRow}
                  >
                    <Text style={styles.homeName}>
                      {item.name}
                      {
                        item.quantity
                          ? <Text style={styles.homeQty}> · {item.quantity}</Text>
                          : null
                      }
                    </Text>

                    {
                      item.note || item.updated_by
                        ? (
                            <Text style={styles.homeSub}>
                              {[item.note, item.updated_by].filter(Boolean).join(' · ')}
                            </Text>
                          )
                        : null
                    }
                  </View>
                ))
              : (
                  <Text style={[styles.emptyText, { paddingVertical: 14 }]}>
                    Nothing is currently marked as already at home.
                  </Text>
                )
          }
        </View>


        <Button
          wide
          onPress={
            () =>
              setScreen(
                'menu'
              )
          }
        >
          Back
        </Button>

      </ScrollView>
    );
  }


  /*
    ======================================================
    SPLIT SHOP
    ======================================================
  */


  function SplitShopScreen() {

    return (
      <ScrollView
        contentContainerStyle={
          styles.page
        }
      >

        <RuleTitle>
          Split Shop
        </RuleTitle>


        <View style={styles.splitColumns}>

          <Box style={styles.splitColumn}>

            <Text style={styles.splitHeading}>
              Shopper 1
            </Text>


            {
              shopperOne.length
                ? (

                    shopperOne.map(
                      item => (

                        <Pressable
                          key={
                            item.id
                          }

                          style={
                            styles.splitItem
                          }

                          onPress={
                            () =>
                              moveToShopperTwo(
                                item
                              )
                          }
                        >

                          <Text style={styles.splitItemText}>
                            {item.name}
                          </Text>


                          <Text style={styles.moveArrow}>
                            ›
                          </Text>

                        </Pressable>

                      )
                    )

                  )
                : (

                    <Text style={styles.emptyText}>
                      No items
                    </Text>

                  )
            }

          </Box>


          <Box style={styles.splitColumn}>

            <Text style={styles.splitHeading}>
              Shopper 2
            </Text>


            {
              shopperTwo.length
                ? (

                    shopperTwo.map(
                      item => (

                        <Pressable
                          key={
                            item.id
                          }

                          style={
                            styles.splitItem
                          }

                          onPress={
                            () =>
                              moveToShopperOne(
                                item
                              )
                          }
                        >

                          <Text style={styles.moveArrow}>
                            ‹
                          </Text>


                          <Text style={styles.splitItemText}>
                            {item.name}
                          </Text>

                        </Pressable>

                      )
                    )

                  )
                : (

                    <Text style={styles.emptyText}>
                      No items
                    </Text>

                  )
            }

          </Box>

        </View>


        <Text style={styles.smallNote}>
          Tap an item to move it between shoppers.
        </Text>


        <View style={styles.twoButtons}>

          <Button
            wide

            onPress={
              openSplitShop
            }
          >
            Reset split
          </Button>


          <Button
            wide

            onPress={
              () =>
                setScreen(
                  'menu'
                )
            }
          >
            Back
          </Button>

        </View>

      </ScrollView>
    );
  }


  /*
    ======================================================
    SUMMARY
    ======================================================
  */


  function SummaryScreen() {

    return (
      <ScrollView
        contentContainerStyle={
          styles.page
        }
      >

        <RuleTitle>
          End of Shop
        </RuleTitle>


        <Box>

          <View style={styles.summaryLine}>

            <Text style={styles.summaryLabel}>
              Items completed
            </Text>


            <Text style={styles.summaryValue}>
              {bought.length} / {state.shopping_items.length}
            </Text>

          </View>


          <View style={styles.divider} />


          <View style={styles.summaryLine}>

            <Text style={styles.summaryLabel}>
              Total spent
            </Text>


            <Text style={styles.summaryValue}>
              {money(spent)}
            </Text>

          </View>


          <View style={styles.divider} />


          <View style={styles.summaryLine}>

            <Text style={styles.summaryLabel}>
              Budget remaining
            </Text>


            <Text style={styles.summaryValue}>
              {money(budgetRemaining)}
            </Text>

          </View>


          <View style={styles.divider} />


          <View style={styles.summaryLine}>

            <Text style={styles.summaryLabel}>
              Selected meal
            </Text>


            <Text style={styles.summaryValue}>
              {
                state
                  .selected_meal
                  ?.name
                ||
                'None'
              }
            </Text>

          </View>


          {
            mealComplete !== null
              ? (
                  <>

                    <View style={styles.divider} />


                    <View style={styles.summaryLine}>

                      <Text style={styles.summaryLabel}>
                        Meal ingredients
                      </Text>


                      <Text style={styles.summaryValue}>
                        {
                          mealComplete
                            ? 'Complete'
                            : 'Still missing items'
                        }
                      </Text>

                    </View>

                  </>
                )
              : null
          }


          <View style={styles.divider} />


          <View style={styles.summaryLine}>

            <Text style={styles.summaryLabel}>
              Household requests
            </Text>


            <Text style={styles.summaryValue}>
              {state.household_requests.length}
            </Text>

          </View>

        </Box>


        <Text style={styles.smallNote}>
          NutriCart does not score the shopper or judge their choices.
        </Text>


        <Button
          wide
          accent

          onPress={
            finishShop
          }
        >
          Finish shop
        </Button>


        <Button
          wide

          onPress={
            () =>
              setScreen(
                'shop'
              )
          }
        >
          Back to list
        </Button>

      </ScrollView>
    );
  }


  /*
    ======================================================
    MAIN APP
    ======================================================
  */


  return (

    <SafeAreaView style={styles.safe}>

      <StatusBar
        barStyle=
          "dark-content"
      />


      <View style={styles.deviceHeader}>

        <Pressable
          onPress={
            () =>
              setScreen(
                'shop'
              )
          }
        >

          <View style={styles.brandRow}>

            <View style={styles.brandMark}>
              <Text style={styles.brandMarkText}>
                N
              </Text>
            </View>

            <View>
              <Text style={styles.deviceName}>
                NutriCart
              </Text>

              <Text style={styles.deviceSub}>
                Cart Unit
              </Text>
            </View>

          </View>

        </Pressable>


        <View style={styles.headerRight}>

          <View style={styles.statusWrap}>

            <View
              style={[
                styles.statusDot,

                !connected &&
                  styles.statusOff
              ]}
            />


            <Text style={styles.statusText}>
              {
                connected
                  ? 'Connected'
                  : 'Offline'
              }
            </Text>

          </View>


          <Pressable
            style={styles.menuTopButton}

            onPress={
              () =>
                setScreen(
                  'menu'
                )
            }
          >

            <Text style={styles.menuTopText}>
              Menu
            </Text>

          </Pressable>

        </View>

      </View>


      {
        notice
          ? (

              <View style={styles.notice}>

                <Text style={styles.noticeText}>
                  {notice}
                </Text>

              </View>

            )
          : null
      }


      <KeyboardAvoidingView
        style={{
          flex: 1
        }}

        behavior={
          Platform.OS ===
          'ios'
            ? 'padding'
            : undefined
        }
      >

        {
          screen ===
          'shop'
          &&
          <ShopScreen />
        }


        {
          screen ===
          'item'
          &&
          <ItemScreen />
        }


        {
          screen ===
          'item-added'
          &&
          <ItemAddedScreen />
        }


        {
          screen ===
          'compare'
          &&
          <CompareScreen />
        }


        {
          screen ===
          'scanner'
          &&
          <ScannerScreen />
        }


        {
          screen ===
          'menu'
          &&
          <MenuScreen />
        }


        {
          screen ===
          'requests'
          &&
          <RequestsScreen />
        }


        {
          screen ===
          'recommendation'
          &&
          <RecommendationScreen />
        }


        {
          screen ===
          'deals'
          &&
          <DealsScreen />
        }


        {
          screen ===
          'at-home'
          &&
          <AtHomeScreen />
        }


        {
          screen ===
          'split'
          &&
          <SplitShopScreen />
        }


        {
          screen ===
          'summary'
          &&
          <SummaryScreen />
        }

      </KeyboardAvoidingView>


      <View style={styles.footer}>

        <Text style={styles.footerText}>
          {
            API_URL.replace(
              /^https?:\/\//,
              ''
            )
          }
        </Text>

      </View>

    </SafeAreaView>

  );
}


/*
  ======================================================
  STYLES
  ======================================================
*/


const R = 8;      // box corners
const R_SM = 6;   // buttons and inputs


const styles =
  StyleSheet.create({

    safe: { flex: 1, backgroundColor: C.bg },


    /* ---------- header ---------- */

    deviceHeader: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderColor: C.line,
      backgroundColor: C.paper,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    brandMark: { width: 32, height: 32, borderRadius: R_SM, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' },
    brandMarkText: { color: '#FFFFFF', fontSize: 17, fontWeight: '900' },
    deviceName: { fontSize: 18, fontWeight: '800', color: C.ink, letterSpacing: -0.3 },
    deviceSub: { fontSize: 11, color: C.muted, marginTop: 0 },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    statusWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#5C8F5A' },
    statusOff: { backgroundColor: C.danger },
    statusText: { fontSize: 11, color: C.muted },
    menuTopButton: { backgroundColor: C.ink, borderRadius: R_SM, paddingHorizontal: 14, paddingVertical: 8 },
    menuTopText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },

    notice: { backgroundColor: C.ink, paddingHorizontal: 14, paddingVertical: 9 },
    noticeText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600', textAlign: 'center' },


    /* ---------- page + titles ---------- */

    page: { padding: 16, gap: 14, paddingBottom: 34 },
    menuPage: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 34 },
    scannerPage: { flex: 1, padding: 16, gap: 10 },

    ruleTitle: { paddingTop: 4, paddingBottom: 2 },
    ruleTitleText: { fontSize: 30, fontWeight: '800', color: C.ink, letterSpacing: -0.8 },


    /* ---------- today's shop ---------- */

    budget: { fontSize: 15, color: C.ink },
    budgetBlock: { backgroundColor: C.ink, borderRadius: R, padding: 16, gap: 10 },
    budgetTop: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
    budgetSpent: { fontSize: 34, fontWeight: '800', color: '#FFFFFF', letterSpacing: -1 },
    budgetOf: { fontSize: 15, color: 'rgba(255,255,255,0.65)', fontWeight: '600' },
    budgetBar: { height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.18)', overflow: 'hidden' },
    budgetFill: { height: 6, borderRadius: 3, backgroundColor: '#E8875F' },
    budgetFillOver: { backgroundColor: '#FF5A4A' },
    tripMeal: { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },

    box: { backgroundColor: C.paper, borderWidth: 1, borderColor: C.line, borderRadius: R, padding: 14 },
    listPlain: { backgroundColor: 'transparent', borderWidth: 0, borderTopWidth: 2, borderColor: C.ink, borderRadius: 0, padding: 0 },

    loadingBox: { alignItems: 'center', justifyContent: 'center', minHeight: 100 },
    loadingText: { marginTop: 10, color: C.muted, fontSize: 13 },
    scanDebug: { marginTop: 6, color: C.muted, fontSize: 10 },

    checkRow: { minHeight: 54, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderColor: C.line, gap: 12, paddingHorizontal: 2 },
    squareCheck: { width: 24, height: 24, borderWidth: 2, borderColor: C.soft, borderRadius: 5, alignItems: 'center', justifyContent: 'center', backgroundColor: C.paper },
    squareCheckDone: { backgroundColor: C.accent, borderColor: C.accent },
    tick: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },
    checkName: { flex: 1, fontSize: 17, fontWeight: '600', color: C.ink },
    doneText: { textDecorationLine: 'line-through', color: C.muted, fontWeight: '500' },
    doneFaded: { opacity: 0.45 },
    checkOwner: { width: 82 },
    checkQty: { width: 30, fontSize: 13, color: C.muted, textAlign: 'right' },

    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 2 },
    summaryText: { fontSize: 13, color: C.muted, fontWeight: '600' },


    /* ---------- housemate tag ---------- */

    personTag: { flexDirection: 'row', alignItems: 'center', gap: 7 },
    personDot: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    personDotSmall: { width: 20, height: 20, borderRadius: 10 },
    personInitial: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
    personName: { fontSize: 14, fontWeight: '700', color: C.ink },
    personNameSmall: { fontSize: 12, fontWeight: '600', color: C.muted },


    /* ---------- buttons + inputs ---------- */

    twoButtons: { flexDirection: 'row', gap: 10 },
    button: { borderWidth: 1, borderColor: C.soft, borderRadius: R_SM, backgroundColor: C.paper, minHeight: 50, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
    buttonAccent: { backgroundColor: C.accent, borderColor: C.accent },
    buttonWide: { flex: 1 },
    buttonPressed: { opacity: 0.8 },
    buttonDisabled: { opacity: 0.4 },
    buttonText: { color: C.ink, fontSize: 15, fontWeight: '700' },
    buttonTextAccent: { color: '#FFFFFF' },

    emptyText: { color: C.muted, fontSize: 15, lineHeight: 21 },
    largeItemName: { color: C.ink, fontSize: 26, fontWeight: '800', letterSpacing: -0.5, marginBottom: 6 },
    itemMeta: { color: C.muted, fontSize: 14, marginBottom: 4 },
    fieldLabel: { marginTop: 16, marginBottom: 7, fontSize: 13, fontWeight: '700', color: C.muted },
    moneyInputRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
    moneySymbol: { fontSize: 24, fontWeight: '800', color: C.ink },
    input: { flex: 1, minHeight: 48, borderWidth: 1, borderColor: C.soft, borderRadius: R_SM, backgroundColor: C.paper, paddingHorizontal: 12, fontSize: 17, fontWeight: '600', color: C.ink },
    addedLine: { fontSize: 18, fontWeight: '700', color: C.ink, marginBottom: 10 },
    divider: { height: 1, backgroundColor: C.line, marginVertical: 14 },


    /* ---------- compare ---------- */

    compareScanners: { flexDirection: 'row', gap: 10 },
    compareSlot: { flex: 1, backgroundColor: C.panel, borderWidth: 0, padding: 10 },
    compareLetter: { fontSize: 13, fontWeight: '800', color: C.accent, marginBottom: 4, letterSpacing: 1 },
    compareProductName: { minHeight: 38, fontSize: 14, fontWeight: '600', color: C.ink, marginBottom: 10 },
    table: { borderWidth: 1, borderColor: C.line, borderRadius: R, backgroundColor: C.paper, overflow: 'hidden' },
    tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderColor: C.line },
    tableCell: { flex: 1, paddingVertical: 11, paddingHorizontal: 8, fontSize: 14, color: C.ink, textAlign: 'right' },
    tableKey: { textAlign: 'left', color: C.muted, fontWeight: '600' },
    tableHead: { fontWeight: '800', backgroundColor: C.warm },
    productNames: { padding: 10, gap: 3 },
    productCaption: { fontSize: 11, color: C.muted },
    prototypeNutritionNote: { marginTop: 8, fontSize: 11, lineHeight: 15, color: C.muted },
    sectionLabel: { fontWeight: '800', fontSize: 16, marginBottom: 8, color: C.ink },
    smallNote: { fontSize: 13, lineHeight: 19, color: C.muted },


    /* ---------- scanner ---------- */

    scannerInstruction: { fontSize: 17, fontWeight: '700', color: C.ink },
    scannerSubtext: { fontSize: 13, color: C.muted, marginBottom: 3 },
    cameraWrap: { flex: 1, minHeight: 420, overflow: 'hidden', borderRadius: R, backgroundColor: '#111', position: 'relative' },
    camera: { flex: 1 },
    /* Wide horizontal reader guide for Code 128. */
    scanFrame: { position: 'absolute', left: 18, right: 18, top: '41%', height: 92, borderWidth: 3, borderColor: C.accent, borderRadius: R_SM, justifyContent: 'center' },
    scanLine: { height: 2, marginHorizontal: 12, backgroundColor: 'rgba(255,255,255,0.8)' },
    scanHint: { position: 'absolute', left: 28, right: 28, top: '66%', color: '#fff', fontSize: 13, fontWeight: '600', textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: R_SM, overflow: 'hidden', paddingVertical: 7, paddingHorizontal: 10 },


    /* ---------- menu ---------- */

    menuButton: { minHeight: 70, borderBottomWidth: 1, borderColor: C.line, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 14 },
    menuTile: { width: 42, height: 42, borderRadius: R_SM, backgroundColor: C.panel, alignItems: 'center', justifyContent: 'center' },
    menuSymbol: { fontSize: 20, textAlign: 'center', color: C.ink },
    menuTextWrap: { flex: 1 },
    menuTitle: { fontSize: 17, fontWeight: '700', color: C.ink },
    menuNote: { fontSize: 13, color: C.muted, marginTop: 2 },
    menuArrow: { fontSize: 24, color: C.soft },


    /* ---------- requests / recommendation / deals / home ---------- */

    note: { backgroundColor: C.paper, borderWidth: 1, borderColor: C.line, borderLeftWidth: 4, borderRadius: R_SM, padding: 14, gap: 8 },
    requestName: { fontSize: 14, fontWeight: '700', color: C.ink, marginBottom: 4 },
    requestText: { fontSize: 17, lineHeight: 24, color: C.ink },
    recommendationBox: { gap: 20, borderLeftWidth: 4, borderLeftColor: C.accent },
    recommendationText: { fontSize: 24, lineHeight: 32, fontWeight: '700', color: C.ink, paddingVertical: 12 },
    dealOldPrice: { fontSize: 15, color: C.muted, textDecorationLine: 'line-through', marginBottom: 2 },
    dealPrice: { fontSize: 30, fontWeight: '800', color: C.accent, letterSpacing: -0.5, marginBottom: 10 },
    prototypeLabel: { fontSize: 11, color: C.muted, marginBottom: 14 },
    atHomeAmount: { fontSize: 16, color: C.ink, marginBottom: 14 },
    homeRow: { paddingVertical: 14, borderBottomWidth: 1, borderColor: C.line, gap: 3 },
    homeName: { fontSize: 18, fontWeight: '700', color: C.ink },
    homeQty: { fontWeight: '500', color: C.muted },
    homeSub: { fontSize: 14, color: C.muted },


    /* ---------- split shop ---------- */

    splitColumns: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
    splitColumn: { flex: 1, padding: 10 },
    splitHeading: { fontSize: 15, fontWeight: '800', paddingBottom: 8, borderBottomWidth: 2, borderColor: C.ink, marginBottom: 4, color: C.ink },
    splitItem: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderColor: C.line, paddingHorizontal: 2 },
    splitItemText: { flex: 1, fontSize: 15, fontWeight: '600', color: C.ink },
    moveArrow: { width: 22, fontSize: 20, color: C.accent, textAlign: 'center' },


    /* ---------- end of shop ---------- */

    summaryLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 15, paddingVertical: 4 },
    summaryLabel: { flex: 1, fontSize: 14, color: C.muted },
    summaryValue: { flex: 1, fontSize: 16, fontWeight: '700', color: C.ink, textAlign: 'right' },


    footer: { borderTopWidth: 1, borderColor: C.line, paddingVertical: 5, paddingHorizontal: 12, backgroundColor: C.bg },
    footerText: { fontSize: 9, color: C.muted, textAlign: 'center' },

  });
