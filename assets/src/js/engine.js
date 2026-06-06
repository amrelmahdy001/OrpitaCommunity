'use strict';

class MosaicEngine {
  constructor(bandEl, options = {}) {
    if (!bandEl) throw new Error('MosaicEngine: bandEl is required');

    this.band = bandEl;
    this.config = {
      gapPx: 3,                  // يجب أن تطابق --mosaic-gap في CSS
      mobileBreakpoint: 768,
      resizeDebounce: 250,
      ...options,
    };

    this._resizeTimer = null;
    this._onResize = this._handleResize.bind(this);
    this._init();
    window.addEventListener('resize', this._onResize);
  }

  rebuild() {
    this._init();
  }

  destroy() {
    window.removeEventListener('resize', this._onResize);
    this.band.innerHTML = '';
  }

  _init() {
    this.band.innerHTML = '';

    const { cols, rows } = this._gridDimensions();
    const panelWidth = this._calcPanelWidth(cols, rows);
    const GAP = this.config.gapPx;
    this.band.style.width = `${panelWidth * 2 + GAP}px`;

    const { panel: panelA, placements } = this._buildPanel(cols, rows);
    const { panel: panelB } = this._buildPanel(cols, rows, placements);
    panelB.setAttribute('aria-hidden', 'true');

    this._applyPanelSize(panelA, panelWidth);
    this._applyPanelSize(panelB, panelWidth);

    this.band.appendChild(panelA);
    this.band.appendChild(panelB);
  }

  _calcPanelWidth(cols, rows) {
    const parentHeight = this.band.parentNode
      ? this.band.parentNode.clientHeight
      : window.innerHeight;
    return parentHeight * (cols / rows);
  }

  _applyPanelSize(panel, width) {
    panel.style.width = `${width}px`;
    panel.style.flex = `0 0 ${width}px`;
  }

  _gridDimensions() {
    const isPortrait = window.innerHeight > window.innerWidth;
    return {
      cols: isPortrait ? 4 : 8,
      rows: isPortrait ? 6 : 4,
    };
  }

  _buildPanel(cols, rows, existingPlacements = null) {
    const items = ORPITA.shuffleArray(ORPITA.CONTENT_ITEMS);
    const placements = existingPlacements || this._computePlacements(cols, rows, items);

    const panel = document.createElement('div');
    panel.className = 'hero__mosaic-panel';
    panel.style.setProperty('--cols', cols);
    panel.style.setProperty('--rows', rows);

    placements.forEach(p => panel.appendChild(this._createTileElement(p)));

    return { panel, placements };
  }

  _computePlacements(cols, rows, items) {
    const occupied = Array.from({ length: rows }, () => new Array(cols).fill(false));
    const placements = [];
    let cursor = 0;

    const canFit = (r, c, cs, rs) => {
      if (c + cs > cols || r + rs > rows) return false;
      for (let i = r; i < r + rs; i++) {
        for (let j = c; j < c + cs; j++) {
          if (occupied[i][j]) return false;
        }
      }
      return true;
    };

    const mark = (r, c, cs, rs) => {
      for (let i = r; i < r + rs; i++) {
        for (let j = c; j < c + cs; j++) {
          occupied[i][j] = true;
        }
      }
    };

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (occupied[r][c]) continue;

        const item = items[cursor % items.length];
        cursor++;

        let colSpan = item.type === 'department' ? 1 : Math.min(item.colSpan, cols);
        let rowSpan = item.type === 'department' ? 1 : Math.min(item.rowSpan, rows);

        if (!canFit(r, c, colSpan, rowSpan)) {
          if (colSpan > 1 && rowSpan > 1 && canFit(r, c, 2, 1)) {
            colSpan = 2; rowSpan = 1;
          } else if (colSpan > 1 && rowSpan > 1 && canFit(r, c, 1, 2)) {
            colSpan = 1; rowSpan = 2;
          } else {
            colSpan = 1; rowSpan = 1;
          }
        }

        if (!canFit(r, c, colSpan, rowSpan)) continue;

        mark(r, c, colSpan, rowSpan);
        placements.push({ item, row: r, col: c, colSpan, rowSpan });
      }
    }

    return placements;
  }

  _createTileElement({ item, row, col, colSpan, rowSpan }) {
    const tile = document.createElement('div');
    tile.className = `hero__tile hero__tile--${item.type}`;
    tile.style.gridColumn = `${col + 1} / span ${colSpan}`;
    tile.style.gridRow = `${row + 1} / span ${rowSpan}`;

    if (item.type === 'member') {
      this._populateMemberTile(tile, item);
    } else {
      this._populateDeptTile(tile, item);
    }
    return tile;
  }

  _populateMemberTile(tile, item) {
    const fallback = document.createElement('div');
    fallback.className = 'hero__tile-fallback';
    fallback.style.setProperty('--dept-color', item.deptColor);
    const initials = document.createElement('span');
    initials.className = 'hero__tile-initials';
    initials.textContent = item.initials;
    initials.setAttribute('aria-hidden', 'true');
    fallback.appendChild(initials);

    const img = document.createElement('img');
    img.src = item.src;
    img.alt = item.name;
    img.decoding = 'async';
    img.className = 'hero__tile-image';

    img.addEventListener('load', () => img.classList.add('hero__tile-image--loaded'));
    img.addEventListener('error', () => {
      img.style.display = 'none';
      fallback.classList.add('hero__tile-fallback--visible');
    });
    if (img.complete && !img.naturalWidth) {
      img.dispatchEvent(new Event('error'));
    }

    const label = document.createElement('div');
    label.className = 'hero__tile-label';
    label.setAttribute('aria-hidden', 'true');
    const nameSpan = document.createElement('span');
    nameSpan.textContent = item.name;
    const deptSpan = document.createElement('span');
    deptSpan.className = 'hero__tile-dept';
    deptSpan.textContent = item.deptLabel;
    label.appendChild(nameSpan);
    label.appendChild(deptSpan);

    tile.appendChild(fallback);
    tile.appendChild(img);
    tile.appendChild(label);
  }

  _populateDeptTile(tile, item) {
    const wrapper = document.createElement('div');
    wrapper.className = 'hero__tile-icon-wrapper';
    wrapper.style.setProperty('--dept-color', item.color);

    const img = document.createElement('img');
    img.src = item.src;
    img.alt = item.label;
    img.className = 'hero__tile-dept-icon';

    img.addEventListener('error', () => {
      img.style.display = 'none';
      const svgEl = this._deptSVG(item.id);
      if (svgEl) {
        svgEl.classList.add('hero__tile-dept-svg');
        wrapper.insertBefore(svgEl, img);
      } else {
        const sym = document.createElement('div');
        sym.className = 'hero__tile-dept-fallback';
        sym.textContent = item.symbol || item.label[0];
        wrapper.insertBefore(sym, img);
      }
    });
    if (img.complete && !img.naturalWidth) {
      img.dispatchEvent(new Event('error'));
    }

    const labelEl = document.createElement('div');
    labelEl.className = 'hero__tile-dept-label';
    labelEl.textContent = item.label;
    labelEl.setAttribute('aria-hidden', 'true');

    wrapper.appendChild(img);
    tile.appendChild(wrapper);
    tile.appendChild(labelEl);
  }

  _deptSVG(deptKey) {
    const ns = 'http://www.w3.org/2000/svg';
    const paths = {
      HR: `<circle cx="12" cy="7" r="4"/><path d="M4 21v-1a8 8 0 0116 0v1" fill="none" stroke-linecap="round"/>`,
      MEDIA: `<circle cx="12" cy="12" r="9" fill="none"/><polygon points="10,8 18,12 10,16"/>`,
      GAME_DEV: `<polyline points="8,6 2,12 8,18" fill="none" stroke-linecap="round" stroke-linejoin="round"/><polyline points="16,6 22,12 16,18" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
      GAME_ART: `<rect x="9" y="2" width="6" height="6" rx="1" transform="rotate(45 12 5)"/><circle cx="12" cy="17" r="4" fill="none"/><line x1="12" y1="13" x2="12" y2="8"/>`,
      WRITING: `<path d="M17 3a2.85 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
      MANAGEMENT: `<rect x="3" y="3" width="7" height="7" rx="1" fill="none"/><rect x="14" y="3" width="7" height="7" rx="1" fill="none"/><rect x="3" y="14" width="7" height="7" rx="1" fill="none"/><rect x="14" y="14" width="7" height="7" rx="1" fill="none"/>`,
    };

    const markup = paths[deptKey];
    if (!markup) return null;

    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'currentColor');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '1.5');
    svg.setAttribute('aria-hidden', 'true');
    svg.style.color = 'rgba(255,255,255,0.85)';
    svg.innerHTML = markup;
    return svg;
  }

  _handleResize() {
    clearTimeout(this._resizeTimer);
    this._resizeTimer = setTimeout(() => this._init(), this.config.resizeDebounce);
  }
}

window.ORPITA = window.ORPITA || {};
window.ORPITA.MosaicEngine = MosaicEngine;