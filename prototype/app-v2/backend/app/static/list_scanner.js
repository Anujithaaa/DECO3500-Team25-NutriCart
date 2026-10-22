
/*
  NUTRICART - SHARED LIST BARCODE SCANNER

  Features:
  - Live laptop camera preview
  - Green barcode aiming rectangle
  - Automatic barcode detection
  - Scan & add product to shared list
  - Scan exact product to replace a generic entry
  - Manual barcode entry
  - Real product lookup through NutriCart API
  - Duplicate product protection
  - Updates Home Hub and Cart Unit automatically
*/

(() => {
  "use strict";

  const root = document.getElementById("view-list");
  const list = document.getElementById("fullList");
  const addRow = root?.querySelector(".l3-add");

  if (!root || !list || !addRow) {
    console.warn("NutriCart shopping list not found.");
    return;
  }

  if (document.getElementById("lscan-overlay")) {
    return;
  }

  // ========================================
  // STYLES
  // ========================================

  const css = document.createElement("style");

  css.textContent = `
    .lscan-add {
      background: #24543d !important;
      color: white !important;
      border: 1px solid #24543d !important;
      border-radius: 9px !important;
      padding: 0 16px !important;
      min-height: 46px;
      white-space: nowrap;
      font-weight: 800;
      cursor: pointer;
    }

    .lscan-row {
      background: #eff6f0 !important;
      color: #24533f !important;
      border: 1px solid #ceded2 !important;
      border-radius: 8px !important;
      padding: 8px 11px !important;
      font-weight: 700;
      white-space: nowrap;
      cursor: pointer;
    }

    #lscan-overlay,
    #lscan-overlay * {
      box-sizing: border-box;
    }

    #lscan-overlay[hidden] {
      display: none !important;
    }

    #lscan-overlay {
      position: fixed;
      inset: 0;
      z-index: 99999;
      background: rgba(15, 31, 21, 0.72);
      display: grid;
      place-items: center;
      padding: 18px;
      overflow-y: auto;
    }

    #lscan-card {
      width: min(650px, 100%);
      max-height: calc(100vh - 36px);
      overflow-y: auto;
      background: #fafbf8;
      color: #25372b;
      border-radius: 18px;
      padding: 23px;
      box-shadow: 0 25px 80px rgba(0,0,0,.3);
      font-family: inherit;
    }

    .lscan-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 15px;
      margin-bottom: 12px;
    }

    .lscan-kicker {
      font-size: 11px;
      letter-spacing: 1.7px;
      color: #668371;
      font-weight: 800;
    }

    #lscan-title {
      font-size: 27px !important;
      margin: 5px 0 4px !important;
      letter-spacing: -.6px;
      color: #213b2a;
    }

    #lscan-description {
      font-size: 14px;
      line-height: 1.5;
      color: #65776b;
      margin: 0 0 15px;
    }

    #lscan-card button {
      font-family: inherit;
      font-weight: 750;
      border-radius: 9px;
      cursor: pointer;
      min-height: 43px;
      padding: 10px 14px;
      border: 1px solid #d1dcd3;
      background: white;
      color: #254a36;
    }

    #lscan-card button:disabled {
      opacity: .5;
      cursor: not-allowed;
    }

    #lscan-close {
      width: 40px;
      min-width: 40px;
      height: 40px;
      padding: 0 !important;
      font-size: 24px;
    }

    /* ==================================
       LIVE CAMERA AREA
       ================================== */

    #lscan-viewport {
      width: 100%;
      min-height: 280px;
      position: relative;
      overflow: hidden;
      background: #132119;
      border-radius: 13px;
      isolation: isolate;
    }

    #lscan-reader {
      width: 100% !important;
      min-height: 280px;
      background: #132119;
      overflow: hidden;
    }

    #lscan-reader video {
      display: block !important;
      width: 100% !important;
      height: 300px !important;
      object-fit: cover !important;
      background: #132119;
    }

    #lscan-reader img {
      max-width: 100%;
    }

    /* Green targeting overlay */

    #lscan-aim {
      display: none;
      position: absolute;
      inset: 0;
      z-index: 10;
      align-items: center;
      justify-content: center;
      pointer-events: none;
    }

    #lscan-viewport[data-active="true"] #lscan-aim {
      display: flex;
    }

    #lscan-frame {
      width: min(82%, 390px);
      height: 130px;
      border: 3px solid #86f5a3;
      border-radius: 13px;
      position: relative;
      box-shadow:
        0 0 20px rgba(114,255,150,.35),
        0 0 0 999px rgba(0,0,0,.09);
    }

    #lscan-frame::before {
      content: "";
      position: absolute;
      top: -4px;
      left: 18px;
      width: 36px;
      height: 4px;
      background: #ccffda;
    }

    #lscan-frame::after {
      content: "";
      position: absolute;
      left: 10%;
      right: 10%;
      top: 12%;
      height: 2px;
      background: #bdffca;
      box-shadow: 0 0 9px #b0ffbd;
      animation: lscan-sweep 2s ease-in-out
        infinite alternate;
    }

    @keyframes lscan-sweep {
      from { top: 12%; }
      to { top: 88%; }
    }

    #lscan-camera-label {
      position: absolute;
      bottom: 14px;
      left: 12px;
      right: 12px;
      text-align: center;
      font-size: 12px;
      font-weight: 750;
      color: white;
      background: rgba(10,25,15,.65);
      border-radius: 7px;
      padding: 8px;
      text-shadow: 0 1px 4px black;
    }

    #lscan-live-indicator {
      position: absolute;
      top: 13px;
      left: 13px;
      display: flex;
      align-items: center;
      gap: 7px;
      color: white;
      background: rgba(10,25,15,.72);
      border-radius: 6px;
      padding: 7px 10px;
      font-size: 11px;
      font-weight: 800;
    }

    #lscan-live-indicator::before {
      content: "";
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #75e79c;
      box-shadow: 0 0 8px #75e79c;
    }

    #lscan-placeholder {
      position: absolute;
      inset: 0;
      z-index: 3;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #c7e5d1;
      font-size: 13px;
      text-align: center;
      padding: 20px;
      gap: 10px;
      pointer-events: none;
    }

    #lscan-placeholder strong {
      font-size: 18px;
      color: white;
    }

    #lscan-viewport[data-active="true"]
    #lscan-placeholder {
      display: none;
    }

    /* ==================================
       CONTROLS
       ================================== */

    .lscan-controls {
      display: flex;
      gap: 10px;
      margin: 12px 0;
    }

    #lscan-start {
      background: #24543d !important;
      color: white !important;
      border: 0 !important;
      flex: 1;
    }

    .lscan-divider {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 16px 0;
      font-size: 11px;
      letter-spacing: 1px;
      font-weight: 800;
      color: #8c9d91;
    }

    .lscan-divider::before,
    .lscan-divider::after {
      content: "";
      height: 1px;
      background: #dce5dd;
      flex: 1;
    }

    .lscan-manual {
      display: flex;
      gap: 9px;
    }

    #lscan-input {
      flex: 1;
      min-width: 0;
      background: white;
      border: 1px solid #cfdacf;
      border-radius: 9px;
      padding: 11px 13px;
      font-size: 16px;
      color: #203b29;
    }

    #lscan-search {
      background: #eef4ef !important;
      font-weight: 800 !important;
    }

    #lscan-status {
      background: #eef4ef;
      color: #2b6343;
      border-radius: 10px;
      padding: 13px 14px;
      min-height: 46px;
      margin-top: 15px;
      line-height: 1.5;
      font-size: 13px;
    }

    #lscan-status[data-type="error"] {
      background: #fff0ec;
      color: #a04539;
    }

    #lscan-status[data-type="success"] {
      background: #e4f4e7;
      color: #216b3c;
    }

    #lscan-result {
      margin-top: 12px;
      font-size: 16px;
      font-weight: 800;
      color: #264e37;
    }

    @media (max-width: 750px) {
      .l3-add {
        flex-wrap: wrap;
      }

      #lscan-card {
        padding: 16px;
      }
    }

    @media (max-width: 460px) {
      #lscan-title {
        font-size: 23px !important;
      }

      .lscan-manual {
        flex-direction: column;
      }

      #lscan-reader video {
        height: 245px !important;
      }

      #lscan-viewport {
        min-height: 245px;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      #lscan-frame::after {
        animation: none;
        top: 50%;
      }
    }
  `;

  document.head.appendChild(css);

  // ========================================
  // CREATE SCANNER POPUP
  // ========================================

  const overlay = document.createElement("div");

  overlay.id = "lscan-overlay";
  overlay.hidden = true;

  overlay.innerHTML = `
    <section
      id="lscan-card"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lscan-title"
    >

      <div class="lscan-top">

        <div>
          <span class="lscan-kicker">
            NUTRICART / SHOPPING LIST
          </span>

          <h2 id="lscan-title">
            Scan a product
          </h2>
        </div>

        <button
          id="lscan-close"
          type="button"
          aria-label="Close scanner"
        >
          ×
        </button>

      </div>

      <p id="lscan-description">
        Scan the barcode of a product.
      </p>

      <div id="lscan-viewport" data-active="false">

        <div id="lscan-reader"></div>

        <div id="lscan-placeholder">
          <strong>Live camera preview</strong>
          Starting your camera...
        </div>

        <div id="lscan-aim" aria-hidden="true">

          <div id="lscan-frame"></div>

          <div id="lscan-live-indicator">
            LIVE SCANNING
          </div>

          <div id="lscan-camera-label">
            Align the barcode inside the green box
          </div>

        </div>

      </div>

      <div class="lscan-controls">
        <button id="lscan-start" type="button">
          Start camera
        </button>
      </div>

      <div class="lscan-divider">
        OR ENTER BARCODE
      </div>

      <div class="lscan-manual">

        <input
          id="lscan-input"
          type="text"
          inputmode="numeric"
          autocomplete="off"
          maxlength="14"
          placeholder="Enter EAN / UPC barcode"
        />

        <button id="lscan-search" type="button">
          Look up
        </button>

      </div>

      <div
        id="lscan-status"
        role="status"
        aria-live="polite"
      >
        Ready to scan.
      </div>

      <div id="lscan-result"></div>

    </section>
  `;

  document.body.appendChild(overlay);

  const $ = id => document.getElementById(id);

  // ========================================
  // VARIABLES
  // ========================================

  let mode = "new";
  let targetId = null;
  let scanner = null;
  let starting = false;
  let busy = false;

  // Prevent starting a camera after the popup closes.
  let session = 0;

  function setStatus(message, type = "normal") {
    $("lscan-status").textContent = message;
    $("lscan-status").dataset.type = type;
  }

  function getItems() {
    if (typeof stateCache === "undefined") {
      return [];
    }

    return stateCache.shopping_items || [];
  }

  // ========================================
  // ADD SCANNER BUTTONS
  // ========================================

  const addScanButton = document.createElement("button");

  addScanButton.type = "button";
  addScanButton.className = "lscan-add";
  addScanButton.textContent = "▣ Scan & add";

  addScanButton.onclick = () => {
    openScanner("new");
  };

  addRow.appendChild(addScanButton);

  function addButtonsToList() {
    const rows = list.querySelectorAll(".l3-row");

    rows.forEach(row => {
      if (row.querySelector(".lscan-row")) {
        return;
      }

      const editButton = Array.from(
        row.querySelectorAll("button")
      ).find(button => {
        return /editListItem\(\d+\)/.test(
          button.getAttribute("onclick") || ""
        );
      });

      if (!editButton) {
        return;
      }

      const match = (
        editButton.getAttribute("onclick") || ""
      ).match(/editListItem\((\d+)\)/);

      if (!match) {
        return;
      }

      const id = Number(match[1]);

      const scanButton = document.createElement("button");

      scanButton.type = "button";
      scanButton.className = "lscan-row";
      scanButton.textContent = "Scan exact";

      scanButton.onclick = () => {
        openScanner("replace", id);
      };

      editButton.before(scanButton);
    });
  }

  const listObserver = new MutationObserver(() => {
    addButtonsToList();
  });

  listObserver.observe(list, {
    childList: true,
    subtree: true
  });

  addButtonsToList();

  // ========================================
  // OPEN SCANNER
  // ========================================

  function openScanner(selectedMode, id = null) {
    mode = selectedMode;
    targetId = id;

    session++;

    const current = getItems().find(
      item => item.id === id
    );

    $("lscan-title").textContent =
      mode === "new"
        ? "Scan & add product"
        : "Scan exact product";

    $("lscan-description").textContent =
      mode === "new"
        ? "Point the camera at a product barcode to add its exact name to the shared shopping list."
        : `Scan the exact product you want instead of "${current?.name || "this item"}".`;

    $("lscan-search").textContent =
      mode === "new"
        ? "Look up & add"
        : "Look up & replace";

    $("lscan-input").value = "";
    $("lscan-result").textContent = "";

    setStatus("Opening camera...");

    overlay.hidden = false;

    // Automatically start the live video feed.
    startCamera();
  }

  // ========================================
  // STOP CAMERA
  // ========================================

  async function stopCamera() {
    const activeScanner = scanner;

    scanner = null;

    $("lscan-viewport").dataset.active = "false";

    if (activeScanner) {
      try {
        await activeScanner.stop();
      } catch (error) {
        console.warn("Camera stop:", error);
      }

      try {
        activeScanner.clear();
      } catch (error) {
        console.warn("Camera clear:", error);
      }
    }

    $("lscan-reader").replaceChildren();

    $("lscan-start").textContent = "Start camera";
  }

  // ========================================
  // CLOSE SCANNER
  // ========================================

  async function closeScanner() {
    session++;

    overlay.hidden = true;

    await stopCamera();
  }

  $("lscan-close").onclick = closeScanner;

  overlay.addEventListener("click", event => {
    if (event.target === overlay) {
      closeScanner();
    }
  });

  document.addEventListener("keydown", event => {
    if (
      event.key === "Escape" &&
      !overlay.hidden
    ) {
      closeScanner();
    }
  });

  // ========================================
  // LOAD BARCODE SCANNER LIBRARY
  // ========================================

  async function loadScannerLibrary() {
    if (window.Html5Qrcode) {
      return;
    }

    // Reuse the existing NutriCart scanner library.
    if (
      typeof nutriLoadScannerLibrary === "function"
    ) {
      await nutriLoadScannerLibrary();

      if (window.Html5Qrcode) {
        return;
      }
    }

    // Otherwise load it directly.
    await new Promise((resolve, reject) => {
      const existing = document.querySelector(
        'script[data-list-scanner-library="true"]'
      );

      if (existing) {
        existing.addEventListener(
          "load",
          resolve,
          { once: true }
        );

        existing.addEventListener(
          "error",
          () => reject(
            new Error("Scanner library failed to load.")
          ),
          { once: true }
        );

        return;
      }

      const script = document.createElement("script");

      script.dataset.listScannerLibrary = "true";

      script.src =
        "https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js";

      script.onload = resolve;

      script.onerror = () => {
        script.remove();

        reject(
          new Error(
            "Cannot load barcode scanner library."
          )
        );
      };

      document.head.appendChild(script);
    });

    if (!window.Html5Qrcode) {
      throw new Error(
        "Barcode scanner is unavailable."
      );
    }
  }

  // ========================================
  // START LIVE CAMERA
  // ========================================

  async function startCamera() {
    if (
      starting ||
      busy ||
      scanner ||
      overlay.hidden
    ) {
      return;
    }

    starting = true;

    const currentSession = session;

    $("lscan-start").disabled = true;

    setStatus("Requesting camera access...");

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error(
          "Open the Home Hub through http://localhost:8000/hub"
        );
      }

      // Avoid competing with the Nutrition scanner.
      if (
        typeof nutriScanner !== "undefined" &&
        nutriScanner
      ) {
        throw new Error(
          "Stop the Scan & Nutrition camera first."
        );
      }

      await loadScannerLibrary();

      if (
        overlay.hidden ||
        currentSession !== session
      ) {
        return;
      }

      const cameras = await Html5Qrcode.getCameras();

      if (!cameras.length) {
        throw new Error(
          "No laptop camera was detected."
        );
      }

      // Prefer a rear camera when available,
      // otherwise use the laptop webcam.
      const selected =
        cameras.find(camera =>
          /back|rear|environment/i.test(camera.label)
        ) || cameras[0];

      const newScanner = new Html5Qrcode(
        "lscan-reader",
        { verbose: false }
      );

      scanner = newScanner;

      await newScanner.start(
        selected.id,
        {
          fps: 8,
          qrbox: (width, height) => ({
            width: Math.min(260, Math.floor(width * 0.78)),
            height: Math.min(135, Math.floor(height * 0.45))
          })
        },

        async decodedText => {
          if (busy || overlay.hidden) {
            return;
          }

          const barcode = String(
            decodedText || ""
          ).trim();

          if (!/^\d{8,14}$/.test(barcode)) {
            return;
          }

          busy = true;

          $("lscan-input").value = barcode;

          setStatus(
            "Barcode detected: " + barcode +
            ". Looking up product..."
          );

          await stopCamera();

          await lookupAndSave(barcode, true);
        },

        () => {
          // No barcode in this frame.
          // Keep the live preview open.
        }
      );

      if (
        overlay.hidden ||
        currentSession !== session
      ) {
        await stopCamera();
        return;
      }

      // Show the green targeting box
      // over the live video.
      $("lscan-viewport").dataset.active = "true";

      $("lscan-start").textContent = "Stop camera";

      setStatus(
        "Camera active. Hold the barcode steady inside the green box."
      );

    } catch (error) {
      await stopCamera();

      if (!overlay.hidden) {
        setStatus(
          "Camera error: " + error.message,
          "error"
        );
      }

    } finally {
      starting = false;

      $("lscan-start").disabled = false;
    }
  }

  // ========================================
  // START / STOP BUTTON
  // ========================================

  $("lscan-start").onclick = async () => {
    if (starting) {
      return;
    }

    if (scanner) {
      await stopCamera();

      setStatus("Camera stopped.");
    } else {
      await startCamera();
    }
  };

  // ========================================
  // PRODUCT LOOKUP
  // ========================================

  async function lookupProduct(barcode) {
    let response = await fetch(
      "/api/nutrition/" +
      encodeURIComponent(barcode),
      {
        cache: "no-store"
      }
    );

    // Support the older NutriCart backend too.
    if (response.status === 404) {
      response = await fetch(
        "/api/products/" +
        encodeURIComponent(barcode),
        {
          cache: "no-store"
        }
      );
    }

    if (!response.ok) {
      throw new Error(
        "API request failed: HTTP " +
        response.status
      );
    }

    const data = await response.json();

    const product = data.product || data;

    const name = String(
      product.name || ""
    ).trim();

    const source = String(
      product.source || ""
    ).toLowerCase();

    const unknown =
      !name ||
      name.toLowerCase() === "unknown product" ||
      name.toLowerCase() ===
        ("product " + barcode).toLowerCase() ||
      source === "unmatched" ||
      source === "not_found";

    if (unknown) {
      return null;
    }

    const brand = String(
      product.brand || ""
    ).trim();

    const fullName =
      brand &&
      !name.toLowerCase().includes(
        brand.toLowerCase()
      )
        ? brand + " " + name
        : name;

    return {
      name: fullName,
      barcode,
      brand
    };
  }

  // ========================================
  // ADD / REPLACE SHOPPING LIST ITEM
  // ========================================

  async function lookupAndSave(
    rawBarcode,
    alreadyBusy = false
  ) {
    if (busy && !alreadyBusy) {
      return;
    }

    const barcode = String(
      rawBarcode || ""
    ).trim();

    if (!/^\d{8,14}$/.test(barcode)) {
      setStatus(
        "Enter a valid 8–14 digit barcode.",
        "error"
      );

      busy = false;
      return;
    }

    busy = true;

    $("lscan-search").disabled = true;
    $("lscan-result").textContent = "";

    setStatus("Looking up product " + barcode + "...");

    try {
      const product = await lookupProduct(barcode);

      if (!product) {
        setStatus(
          "Product not found in the database. Nothing was added.",
          "error"
        );

        return;
      }

      // Refresh the shared list before checking duplicates.
      if (
        typeof refreshState === "function"
      ) {
        await refreshState();
      }

      const existing = getItems().find(
        item =>
          String(item.barcode || "") === barcode
      );

      let response;

      // ------------------------------------
      // MODE 1: ADD NEW PRODUCT
      // ------------------------------------

      if (mode === "new") {
        if (existing) {
          setStatus(
            "This product is already in your shopping list: " +
            existing.name,
            "error"
          );

          return;
        }

        const quantity = Math.max(
          1,
          Math.floor(
            Number(
              document.getElementById(
                "itemQuantity"
              )?.value
            ) || 1
          )
        );

        const addedBy =
          document.getElementById(
            "addedBy"
          )?.value.trim() ||
          "Household";

        response = await fetch(
          "/api/list",
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json"
            },

            body: JSON.stringify({
              name: product.name,
              barcode: product.barcode,
              quantity,
              added_by: addedBy
            })
          }
        );
      }

      // ------------------------------------
      // MODE 2: REPLACE EXISTING ITEM
      // ------------------------------------

      else {
        const target = getItems().find(
          item => item.id === targetId
        );

        if (!target) {
          throw new Error(
            "The original item is no longer in the list."
          );
        }

        if (
          existing &&
          existing.id !== targetId
        ) {
          setStatus(
            "This exact product is already on your list.",
            "error"
          );

          return;
        }

        response = await fetch(
          "/api/list/" + targetId,
          {
            method: "PATCH",

            headers: {
              "Content-Type": "application/json"
            },

            body: JSON.stringify({
              name: product.name,
              barcode: product.barcode
            })
          }
        );
      }

      if (!response.ok) {
        throw new Error(
          "Could not save the list: HTTP " +
          response.status
        );
      }

      // Refresh Home Hub.
      if (
        typeof refreshState === "function"
      ) {
        await refreshState();
      }

      $("lscan-result").textContent =
        product.name;

      setStatus(
        mode === "new"
          ? "Product added to your shared shopping list!"
          : "Shopping list updated with the exact product!",
        "success"
      );

    } catch (error) {
      setStatus(
        "Unable to save: " + error.message,
        "error"
      );

    } finally {
      busy = false;

      $("lscan-search").disabled = false;
    }
  }

  // ========================================
  // MANUAL BARCODE ENTRY
  // ========================================

  $("lscan-search").onclick = async () => {
    if (busy) {
      return;
    }

    await stopCamera();

    await lookupAndSave(
      $("lscan-input").value
    );
  };

  $("lscan-input").addEventListener(
    "keydown",
    async event => {
      if (event.key === "Enter") {
        event.preventDefault();

        if (busy) return;

        await stopCamera();

        await lookupAndSave(
          event.currentTarget.value
        );
      }
    }
  );

})();



// NUTRICART_LIST_AUTOCLOSE_V1
// The existing scanner reports success only after POST/PATCH succeeded.
// Closing is delayed to let its async finally block finish first.
(() => {
  function attachAutoClose() {
    const box = document.getElementById('lscan-overlay');
    const status = document.getElementById('lscan-status');
    const closeButton = document.getElementById('lscan-close');
    if (!box || !status || !closeButton) return;

    let pending = null;
    const observe = () => {
      if (pending !== null) {
        clearTimeout(pending);
        pending = null;
      }
      if (box.hidden || status.dataset.type !== 'success') return;
      pending = setTimeout(() => {
        pending = null;
        if (!box.hidden && status.dataset.type === 'success') {
          closeButton.click();
        }
      }, 650);
    };
    new MutationObserver(observe).observe(status, {
      attributes:true, attributeFilter:['data-type'],
      childList:true, subtree:true, characterData:true
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachAutoClose, {once:true});
  } else {
    attachAutoClose();
  }
})();

