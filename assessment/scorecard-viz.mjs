/**
 * DRI scorecard visualizations: radar chart + 2x2 archetype quadrant.
 * Ported and adapted from the AIPQ inline script. No top-level DOM access
 * (all functions are called explicitly so Node.js tests can import scorecard.mjs
 * without crashing).
 */

import { dimensions, archetypes } from './framework.mjs';

// Dimension display config: order, label lines, short reading blurb.
// Lines are the two-word splits used as SVG axis labels (mono uppercase).
const RADAR_DIMS = [
  { key: 'pointOfView',       label: 'Point of View',      lines: ['POINT', 'OF VIEW'] },
  { key: 'conversionSurface', label: 'Conversion Surface', lines: ['CONVERSION', 'SURFACE'] },
  { key: 'trustAtCapture',    label: 'Trust at Capture',   lines: ['TRUST AT', 'CAPTURE'] },
  { key: 'signalToSales',     label: 'Signal to Sales',    lines: ['SIGNAL', 'TO SALES'] },
];

// Quadrant cell order in the 2x2 grid (HTML row-major: top-left, top-right,
// bottom-left, bottom-right). Grid rows: top = POV high, bottom = POV low.
// Grid cols: left = execution low, right = execution high.
const QUADRANT_ORDER = [
  { archetype: 'publisher', num: '02', name: 'The Publisher' },   // top-left
  { archetype: 'authority', num: '01', name: 'The Authority' },   // top-right
  { archetype: 'renter',    num: '04', name: 'The Renter' },      // bottom-left
  { archetype: 'operator',  num: '03', name: 'The Operator' },    // bottom-right
];

/**
 * Render the radar chart into the given SVG element.
 * @param {SVGElement} svgEl - The .sc-radar-svg element
 * @param {Object} dimensionScores - {pointOfView,conversionSurface,trustAtCapture,signalToSales} each 0-4
 * @param {Object} focusDim - result.focus (may be null)
 * @param {Function} onVisualActivate - called with dimension key on hover/focus (visual update only)
 * @param {Function} onLiveActivate - called with dimension key on click/Enter/Space (updates aria-live)
 */
export function renderRadar(svgEl, dimensionScores, focusDim, onVisualActivate, onLiveActivate) {
  const cx = 230, cy = 195, maxR = 145;
  const n = RADAR_DIMS.length; // 4
  // Angles: start at top (-PI/2) going clockwise
  const angles = RADAR_DIMS.map((_, i) => (-Math.PI / 2) + (i * 2 * Math.PI / n));

  function polar(angle, radius) {
    return { x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius };
  }

  function ringPoints(frac) {
    return angles.map((a) => {
      const p = polar(a, maxR * frac);
      return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    }).join(' ');
  }

  const SVG_NS = 'http://www.w3.org/2000/svg';

  // Rings at 25/50/75/100%
  [0.25, 0.5, 0.75, 1.0].forEach((frac, idx) => {
    const ring = svgEl.querySelector(`#dri-ring-${idx}`);
    if (ring) ring.setAttribute('points', ringPoints(frac));
  });

  // Axis lines
  const axesG = svgEl.querySelector('#dri-axes');
  if (axesG) {
    axesG.innerHTML = '';
    angles.forEach((a) => {
      const end = polar(a, maxR);
      const line = document.createElementNS(SVG_NS, 'line');
      line.setAttribute('x1', cx); line.setAttribute('y1', cy);
      line.setAttribute('x2', end.x.toFixed(1)); line.setAttribute('y2', end.y.toFixed(1));
      line.setAttribute('class', 'sc-radar-axis');
      axesG.appendChild(line);
    });
  }

  // Score polygon
  const fillEl = svgEl.querySelector('#dri-score-fill');
  if (fillEl) {
    const pts = RADAR_DIMS.map((dim, i) => {
      const frac = dimensionScores[dim.key] / 4;
      const p = polar(angles[i], maxR * frac);
      return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    }).join(' ');
    fillEl.setAttribute('points', pts);
    fillEl.setAttribute('data-target-points', pts);
    // Begin collapsed at center for animate-in
    const centerPts = angles.map(() => `${cx},${cy}`).join(' ');
    fillEl.setAttribute('points', centerPts);
  }

  // Score points (interactive circles) - roving tabindex: ONE tab stop for the group.
  const pointsG = svgEl.querySelector('#dri-score-points');
  if (pointsG) {
    pointsG.innerHTML = '';
    const circles = [];
    RADAR_DIMS.forEach((dim, i) => {
      const frac = dimensionScores[dim.key] / 4;
      const pt = polar(angles[i], maxR * frac);
      const circle = document.createElementNS(SVG_NS, 'circle');
      circle.setAttribute('cx', pt.x.toFixed(1));
      circle.setAttribute('cy', pt.y.toFixed(1));
      circle.setAttribute('r', '9');
      circle.setAttribute('class', 'sc-radar-point');
      circle.setAttribute('data-dim', dim.key);
      // Roving tabindex: first point gets tabindex=0, rest start at -1.
      circle.setAttribute('tabindex', i === 0 ? '0' : '-1');
      circle.setAttribute('role', 'button');
      circle.setAttribute('aria-label', `${dim.label}: ${dimensionScores[dim.key]} of 4`);
      // Start off-center for animate-in
      circle.setAttribute('data-target-cx', pt.x.toFixed(1));
      circle.setAttribute('data-target-cy', pt.y.toFixed(1));
      circle.setAttribute('cx', cx);
      circle.setAttribute('cy', cy);

      // Visual update only (no aria-live spam)
      circle.addEventListener('mouseenter', () => onVisualActivate(dim.key));
      circle.addEventListener('focus', () => onVisualActivate(dim.key));
      // Live update on intentional interaction
      circle.addEventListener('click', () => {
        onVisualActivate(dim.key);
        onLiveActivate(dim.key);
      });
      pointsG.appendChild(circle);
      circles.push(circle);
    });

    // Arrow key navigation within the radar group.
    pointsG.addEventListener('keydown', (e) => {
      const current = document.activeElement;
      const idx = circles.indexOf(current);
      if (idx === -1) return;

      let next = -1;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        next = (idx + 1) % circles.length;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        next = (idx - 1 + circles.length) % circles.length;
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const dim = RADAR_DIMS[idx];
        onVisualActivate(dim.key);
        onLiveActivate(dim.key);
        return;
      } else {
        return;
      }
      e.preventDefault();
      // Move roving tabindex.
      circles[idx].setAttribute('tabindex', '-1');
      circles[next].setAttribute('tabindex', '0');
      circles[next].focus();
      const nextDim = RADAR_DIMS[next];
      onVisualActivate(nextDim.key);
    });
  }

  // Axis labels
  const labelsG = svgEl.querySelector('#dri-axis-labels');
  if (labelsG) {
    labelsG.innerHTML = '';
    function anchorFor(angle) {
      const c = Math.cos(angle);
      if (c > 0.25) return 'start';
      if (c < -0.25) return 'end';
      return 'middle';
    }
    RADAR_DIMS.forEach((dim, i) => {
      const a = angles[i];
      const anchor = anchorFor(a);
      const gap = anchor === 'middle' ? 30 : 16;
      const lpt = polar(a, maxR + gap);
      const lineHeight = 14;
      const totalHeight = (dim.lines.length - 1) * lineHeight;
      dim.lines.forEach((lineText, idx) => {
        const t = document.createElementNS(SVG_NS, 'text');
        t.setAttribute('x', lpt.x.toFixed(1));
        t.setAttribute('y', (lpt.y + idx * lineHeight - totalHeight / 2 + 4).toFixed(1));
        t.setAttribute('text-anchor', anchor);
        t.setAttribute('class', 'sc-radar-label');
        t.setAttribute('data-dim', dim.key);
        t.textContent = lineText;
        // Labels respond to hover for visual only, no live update
        t.addEventListener('mouseenter', () => onVisualActivate(dim.key));
        t.addEventListener('click', () => {
          onVisualActivate(dim.key);
          onLiveActivate(dim.key);
        });
        labelsG.appendChild(t);
      });
    });
  }

  // Animate in after next frame
  animateRadarIn(svgEl, angles, maxR, dimensionScores, cx, cy);
}

function animateRadarIn(svgEl, angles, maxR, dimensionScores, cx, cy) {
  // cx and cy are passed in from renderRadar to keep geometry in one place.
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduced) {
    // Skip animation: set points immediately
    const fillEl = svgEl.querySelector('#dri-score-fill');
    if (fillEl) {
      const pts = fillEl.getAttribute('data-target-points');
      if (pts) fillEl.setAttribute('points', pts);
    }
    svgEl.querySelectorAll('.sc-radar-point').forEach((c) => {
      c.setAttribute('cx', c.getAttribute('data-target-cx'));
      c.setAttribute('cy', c.getAttribute('data-target-cy'));
    });
    return;
  }

  const duration = 700;
  let start = null;

  function lerp(a, b, t) { return a + (b - a) * t; }

  function frame(ts) {
    if (!start) start = ts;
    const p = Math.min((ts - start) / duration, 1);
    const eased = p < 1 ? Math.sin((p * Math.PI) / 2) : 1;

    // Interpolate fill polygon
    const fillEl = svgEl.querySelector('#dri-score-fill');
    if (fillEl) {
      const targetPts = RADAR_DIMS.map((dim, i) => {
        const frac = dimensionScores[dim.key] / 4;
        const angle = (-Math.PI / 2) + (i * 2 * Math.PI / RADAR_DIMS.length);
        const tx = cx + Math.cos(angle) * maxR * frac;
        const ty = cy + Math.sin(angle) * maxR * frac;
        return `${lerp(cx, tx, eased).toFixed(1)},${lerp(cy, ty, eased).toFixed(1)}`;
      }).join(' ');
      fillEl.setAttribute('points', targetPts);
    }

    // Interpolate point positions
    svgEl.querySelectorAll('.sc-radar-point').forEach((c) => {
      const tx = parseFloat(c.getAttribute('data-target-cx'));
      const ty = parseFloat(c.getAttribute('data-target-cy'));
      c.setAttribute('cx', lerp(cx, tx, eased).toFixed(1));
      c.setAttribute('cy', lerp(cy, ty, eased).toFixed(1));
    });

    if (p < 1) requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

/**
 * Set the active dimension's VISUAL state only (hover/focus - no aria-live update).
 */
export function setActiveDimensionVisual(svgEl, dimKey) {
  if (!svgEl) return;
  svgEl.querySelectorAll('.sc-radar-point').forEach((el) => {
    el.classList.toggle('is-active', el.getAttribute('data-dim') === dimKey);
  });
  svgEl.querySelectorAll('.sc-radar-label').forEach((el) => {
    el.classList.toggle('is-active', el.getAttribute('data-dim') === dimKey);
  });
}

/**
 * Set the active dimension in the radar callout and update visual + aria-live text.
 * Call only on click/Enter/Space.
 * @param {SVGElement} svgEl
 * @param {string} dimKey
 * @param {Object} dimensionScores
 * @param {Object} result - full result object for blurb lookup
 * @param {HTMLElement} calloutNameEl
 * @param {HTMLElement} calloutScoreEl
 * @param {HTMLElement} calloutReadingEl
 */
export function setActiveDimension(svgEl, dimKey, dimensionScores, result, calloutNameEl, calloutScoreEl, calloutReadingEl) {
  const dimData = RADAR_DIMS.find((d) => d.key === dimKey);
  if (!dimData) return;

  const frameworkDim = dimensions.find((d) => d.key === dimKey);
  const raw = dimensionScores[dimKey];
  const blurb = frameworkDim ? (raw >= 3 ? frameworkDim.edge : frameworkDim.gap) : '';

  if (calloutNameEl) calloutNameEl.textContent = dimData.label;
  if (calloutScoreEl) calloutScoreEl.textContent = `${raw} / 4`;
  if (calloutReadingEl) calloutReadingEl.textContent = blurb;

  // Visual update
  setActiveDimensionVisual(svgEl, dimKey);
}

/**
 * Render the 2x2 archetype quadrant.
 * @param {HTMLElement} gridEl - the .sc-matrix-grid element
 * @param {HTMLElement} calloutEl - the .sc-quadrant-callout element (aria-live)
 * @param {Object} result - full result with archetype + dimensionScores
 */
export function renderQuadrant(gridEl, calloutEl, result) {
  const { archetype, dimensionScores } = result;

  // Compute execution score (0-12) and pov (0-4)
  const exec = dimensionScores.conversionSurface + dimensionScores.trustAtCapture + dimensionScores.signalToSales;
  const pov = dimensionScores.pointOfView;

  // Build quadrant cells - roving tabindex: ONE tab stop for the group.
  gridEl.innerHTML = '';
  const cells = [];
  QUADRANT_ORDER.forEach((q, cellIdx) => {
    const cell = document.createElement('div');
    cell.className = 'sc-quadrant';
    if (q.archetype === archetype.key) cell.classList.add('is-buyer');
    cell.setAttribute('data-archetype', q.archetype);
    // Quadrant borders (inner dividers)
    if (q.archetype === 'publisher') {
      cell.style.borderRight = '0.5px solid var(--color-border-subtle)';
      cell.style.borderBottom = '0.5px solid var(--color-border-subtle)';
    } else if (q.archetype === 'authority') {
      cell.style.borderBottom = '0.5px solid var(--color-border-subtle)';
    } else if (q.archetype === 'renter') {
      cell.style.borderRight = '0.5px solid var(--color-border-subtle)';
    }
    cell.setAttribute('role', 'button');
    // Roving tabindex: user's archetype cell starts as the one tab stop.
    const isOwn = q.archetype === archetype.key;
    cell.setAttribute('tabindex', isOwn ? '0' : '-1');
    cell.setAttribute('aria-label', q.name + (isOwn ? ' (your archetype)' : ''));

    const numSpan = document.createElement('span');
    numSpan.className = 'q-num';
    numSpan.textContent = q.num;

    const nameSpan = document.createElement('span');
    nameSpan.className = 'q-name';
    nameSpan.textContent = q.name;

    cell.appendChild(numSpan);
    cell.appendChild(nameSpan);

    // Visual update only on hover/focus
    cell.addEventListener('mouseenter', () => setActiveQuadrantVisual(gridEl, q.archetype));
    cell.addEventListener('focus', () => setActiveQuadrantVisual(gridEl, q.archetype));
    // aria-live update only on click/Enter/Space
    cell.addEventListener('click', () => setActiveQuadrant(gridEl, calloutEl, q.archetype));

    gridEl.appendChild(cell);
    cells.push(cell);
  });

  // Arrow key navigation within the quadrant group.
  gridEl.addEventListener('keydown', (e) => {
    const current = document.activeElement;
    const idx = cells.indexOf(current);
    if (idx === -1) return;

    // 2x2 grid layout: top-left(0), top-right(1), bottom-left(2), bottom-right(3)
    // Arrow keys move between adjacent cells; edges wrap within the group.
    let next = -1;
    if (e.key === 'ArrowRight') {
      // Move right within row, wrapping to opposite column.
      next = idx % 2 === 0 ? idx + 1 : idx - 1;
    } else if (e.key === 'ArrowLeft') {
      // Move left within row, wrapping to opposite column.
      next = idx % 2 === 0 ? idx + 1 : idx - 1;
    } else if (e.key === 'ArrowDown') {
      // Move down within column, wrapping to opposite row.
      next = idx < 2 ? idx + 2 : idx - 2;
    } else if (e.key === 'ArrowUp') {
      // Move up within column, wrapping to opposite row.
      next = idx < 2 ? idx + 2 : idx - 2;
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setActiveQuadrant(gridEl, calloutEl, QUADRANT_ORDER[idx].archetype);
      return;
    } else {
      return;
    }
    e.preventDefault();
    // Move roving tabindex.
    cells[idx].setAttribute('tabindex', '-1');
    cells[next].setAttribute('tabindex', '0');
    cells[next].focus();
    setActiveQuadrantVisual(gridEl, QUADRANT_ORDER[next].archetype);
  });

  // Buyer dot - piecewise-linear mapping so the dot accurately reflects quadrant boundaries.
  const MIN_PCT = 8, MAX_PCT = 92, THRESHOLD_NUDGE = 3;

  let leftPct, bottomPct;
  if (exec < 8) {
    leftPct = (exec / 8) * 50;
  } else {
    leftPct = exec === 8 ? 50 + THRESHOLD_NUDGE : 50 + ((exec - 8) / 4) * 50;
  }
  if (pov < 3) {
    bottomPct = (pov / 3) * 50;
  } else {
    bottomPct = pov === 3 ? 50 + THRESHOLD_NUDGE : 50 + ((pov - 3) / 1) * 50;
  }
  leftPct = Math.max(MIN_PCT, Math.min(MAX_PCT, leftPct));
  bottomPct = Math.max(MIN_PCT, Math.min(MAX_PCT, bottomPct));

  const dot = document.createElement('div');
  dot.className = 'sc-buyer-dot';
  dot.style.left = `${leftPct}%`;
  dot.style.bottom = `${bottomPct}%`;
  dot.setAttribute('aria-hidden', 'true');
  gridEl.appendChild(dot);

  // Set initial callout text to the user's archetype (intentional default, not hover spam)
  setCalloutText(calloutEl, archetype.key);

  // Reset to user's archetype visual+text on mouse leave
  gridEl.addEventListener('mouseleave', () => {
    // Visual reset: clear all is-active, restore is-buyer
    gridEl.querySelectorAll('.sc-quadrant').forEach((el) => {
      el.classList.remove('is-active');
    });
    const buyerCell = gridEl.querySelector('[data-archetype="' + archetype.key + '"]');
    if (buyerCell) {
      buyerCell.classList.add('is-buyer');
    }
    // Text reset is intentional on leave (user has left the component)
    setCalloutText(calloutEl, archetype.key);
  });
}

/** Update only the visual is-active state, no aria-live text change. */
function setActiveQuadrantVisual(gridEl, archetypeKey) {
  gridEl.querySelectorAll('.sc-quadrant').forEach((el) => {
    const isTarget = el.getAttribute('data-archetype') === archetypeKey;
    el.classList.toggle('is-active', isTarget);
  });
}

/** Update both visual state and aria-live callout text. */
function setActiveQuadrant(gridEl, calloutEl, archetypeKey) {
  setActiveQuadrantVisual(gridEl, archetypeKey);
  setCalloutText(calloutEl, archetypeKey);
}

function setCalloutText(calloutEl, archetypeKey) {
  if (!calloutEl) return;
  const q = QUADRANT_ORDER.find((x) => x.archetype === archetypeKey);
  if (!q) return;
  // Single source of truth: use archetypes[key].blurb from framework.mjs
  const desc = (archetypes[archetypeKey] && archetypes[archetypeKey].blurb) || '';
  calloutEl.textContent = '';
  const strong = document.createElement('strong');
  strong.textContent = q.name;
  calloutEl.appendChild(strong);
  calloutEl.appendChild(document.createTextNode(' ' + desc));
}
