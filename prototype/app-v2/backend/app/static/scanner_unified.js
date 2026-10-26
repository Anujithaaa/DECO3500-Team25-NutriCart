
// NUTRICART_NEUTRAL_SCANNER_V3

(() => {
  'use strict';

  if (
    document.getElementById(
      'nutricart-neutral-scanner-style-v3'
    )
  ) return;

  const style = document.createElement('style');

  style.id = 'nutricart-neutral-scanner-style-v3';

  style.textContent = `

    #nutri-camera-holder,
    #lscan-viewport {
      position: relative !important;
      overflow: hidden !important;
      isolation: isolate;
      border-radius: 12px !important;
      background: #242828 !important;
    }

    #nutri-camera-holder {
      margin: 12px 0 !important;
    }

    #nutri-camera-holder #nutri-camera-reader {
      max-width: none !important;
      margin: 0 !important;
      border-radius: 0 !important;
    }

    /* Hide old green scanner effects */

    #nutri-unified-overlay,
    #lscan-aim,
    #lscan-live-indicator,
    #lscan-camera-label,
    .nutri-mirror-btn {
      display: none !important;
    }

    /* Hide built-in scanner outline */

    #nutri-camera-reader #qr-shaded-region,
    #lscan-reader #qr-shaded-region {
      opacity: 0 !important;
      pointer-events: none !important;
    }

    /* Mirror laptop camera preview only */

    #nutri-camera-reader video,
    #lscan-reader video {
      transform: scaleX(-1) !important;
    }

    /* Neutral scanner overlay */

    .nc-neutral-guide {
      position: absolute;
      inset: 0;
      z-index: 50;

      pointer-events: none;
      display: none;

      grid-template-columns:
        1fr 78% 1fr;

      grid-template-rows:
        1fr 118px 1fr;
    }

    /* Only show when camera is active */

    #nutri-camera-holder:has(
      #nutri-camera-reader video
    ) > .nc-neutral-guide,

    #lscan-viewport[data-active="true"]
      > .nc-neutral-guide {
      display: grid !important;
    }

    /* Transparent grey background */

    .nc-neutral-guide .nc-shade {
      background: rgba(48, 50, 51, .64);
    }

    .nc-neutral-guide .nc-shade-top {
      grid-area: 1 / 1 / 2 / 4;
    }

    .nc-neutral-guide .nc-shade-left {
      grid-area: 2 / 1 / 3 / 2;
    }

    .nc-neutral-guide .nc-shade-right {
      grid-area: 2 / 3 / 3 / 4;
    }

    .nc-neutral-guide .nc-shade-bottom {
      grid-area: 3 / 1 / 4 / 4;
    }

    /* Clear barcode rectangle */

    .nc-neutral-guide .nc-centre {
      grid-area: 2 / 2 / 3 / 3;

      border: 2px solid rgba(250,250,250,.9);
      border-radius: 6px;
      background: transparent;
    }

    @media (max-width: 480px) {
      .nc-neutral-guide {
        grid-template-rows:
          1fr 105px 1fr;
      }
    }

  `;

  document.head.appendChild(style);


  // ======================================
  // REMOVE OLD SCANNER CONTROLS
  // ======================================

  document.querySelectorAll(
    '.nutri-mirror-btn'
  ).forEach(x => x.remove());

  document.getElementById(
    'nutri-unified-overlay'
  )?.remove();

  document.getElementById(
    'lscan-aim'
  )?.remove();


  // ======================================
  // CREATE NEUTRAL SCANNER GUIDE
  // ======================================

  function addNeutralGuide(host) {

    if (
      !host ||
      host.querySelector(
        ':scope > .nc-neutral-guide'
      )
    ) {
      return;
    }

    const guide = document.createElement('div');

    guide.className = 'nc-neutral-guide';

    guide.setAttribute(
      'aria-hidden',
      'true'
    );

    guide.innerHTML = `
      <div class="nc-shade nc-shade-top"></div>

      <div class="nc-shade nc-shade-left"></div>

      <div class="nc-centre"></div>

      <div class="nc-shade nc-shade-right"></div>

      <div class="nc-shade nc-shade-bottom"></div>
    `;

    host.appendChild(guide);
  }


  // ======================================
  // SCANNER 1: SCAN & NUTRITION
  // ======================================

  const nutritionReader =
    document.getElementById(
      'nutri-camera-reader'
    );

  if (nutritionReader) {

    let holder =
      document.getElementById(
        'nutri-camera-holder'
      );

    if (!holder) {

      holder = document.createElement('div');

      holder.id = 'nutri-camera-holder';

      nutritionReader.before(holder);

      holder.appendChild(nutritionReader);
    }

    addNeutralGuide(holder);
  }


  // ======================================
  // SCANNER 2: SHOPPING LIST
  // ======================================

  addNeutralGuide(
    document.getElementById(
      'lscan-viewport'
    )
  );

})();
