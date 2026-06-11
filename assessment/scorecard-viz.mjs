/**
 * DRI scorecard visualizations: radar chart + 2x2 archetype quadrant.
 * Ported and adapted from the AIPQ inline script. No top-level DOM access
 * (all functions are called explicitly so Node.js tests can import scorecard.mjs
 * without crashing).
 */

import { dimensions } from './framework.mjs';

// Dimension display config: order, label lines, short reading blurb.
// Lines are the two-word splits used as SVG axis labels (mono uppercase).
// Reading uses the dimension's existing gap/edge blurb from framework.mjs
// (passed in at render time so no copy duplication here).
const RADAR_DIMS = [
  { key: 'pointOfView',       label: 'Point of View',      lines: ['Point of',  'View'] },
  { key: 'conversionSurface', label: 'Conversion Surface', lines: ['Conversion','Surface'] },
  { key: 'trustAtCapture',    label: 'Trust at Capture',   lines: ['Trust at',  'Capture'] },
  { key: 'signalToSales',     label: 'Signal to Sales',    lines: ['Signal to', 'Sales'] },
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

// Archetype descriptions for quadrant hover callout.
const QUADRANT_DESC = {
  authority:  'You own the lens buyers use to research the problem, and the rest of your demand engine is broadly strong. That combination is hard to build and easy to copy once it is visible.',
  publisher:  'You have built a genuine point of view and buyers read it. The conversion path, the value at capture, or the hand-off to sales is not closing the gap between earned attention and identifiable pipeline.',
  operator:   'You have built a broadly strong demand engine. What it is missing is the lens. You compete on a framework someone else defined.',
  renter:     'Your content reaches buyers who then research the problem using someone else\'s framework. Owning the framework the market researches against turns your content into pipeline you can claim.',
};

/**
 * Render the radar chart into the given SVG element.
 * @param {SVGElement} svgEl - The .sc-radar-svg element
 * @param {Object} dimensionScores - {pointOfView,conversionSurface,trustAtCapture,signalToSales} each 0-4
 * @param {Object} focusDim - result.focus (may be null)
 * @param {Function} onActivate - called with dimension key when a point/label is focused
 */
export function renderRadar(svgEl, dimensionScores, focusDim, onActivate) {
  const cx = 220, cy = 210, maxR = 130;
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
    // Start hidden for animation
    fillEl.setAttribute('points', pts);
    fillEl.setAttribute('data-target-points', pts);
    // Begin collapsed at center for animate-in
    const centerPts = angles.map(() => `${cx},${cy}`).join(' ');
    fillEl.setAttribute('points', centerPts);
  }

  // Score points (interactive circles)
  const pointsG = svgEl.querySelector('#dri-score-points');
  if (pointsG) {
    pointsG.innerHTML = '';
    RADAR_DIMS.forEach((dim, i) => {
      const frac = dimensionScores[dim.key] / 4;
      const pt = polar(angles[i], maxR * frac);
      const circle = document.createElementNS(SVG_NS, 'circle');
      circle.setAttribute('cx', pt.x.toFixed(1));
      circle.setAttribute('cy', pt.y.toFixed(1));
      circle.setAttribute('r', '9');
      circle.setAttribute('class', 'sc-radar-point');
      circle.setAttribute('data-dim', dim.key);
      // Accessibility
      circle.setAttribute('tabindex', '0');
      circle.setAttribute('role', 'button');
      circle.setAttribute('aria-label', `${dim.label}: ${dimensionScores[dim.key]} of 4`);
      // Start off-center for animate-in
      circle.setAttribute('data-target-cx', pt.x.toFixed(1));
      circle.setAttribute('data-target-cy', pt.y.toFixed(1));
      circle.setAttribute('cx', cx);
      circle.setAttribute('cy', cy);

      circle.addEventListener('mouseenter', () => onActivate(dim.key));
      circle.addEventListener('click', () => onActivate(dim.key));
      circle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onActivate(dim.key);
        }
      });
      circle.addEventListener('focus', () => onActivate(dim.key));
      pointsG.appendChild(circle);
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
      const gap = anchor === 'middle' ? 28 : 14;
      const lpt = polar(a, maxR + gap);
      const lineHeight = 13;
      const totalHeight = (dim.lines.length - 1) * lineHeight;
      dim.lines.forEach((lineText, idx) => {
        const t = document.createElementNS(SVG_NS, 'text');
        t.setAttribute('x', lpt.x.toFixed(1));
        t.setAttribute('y', (lpt.y + idx * lineHeight - totalHeight / 2 + 4).toFixed(1));
        t.setAttribute('text-anchor', anchor);
        t.setAttribute('class', 'sc-radar-label');
        t.setAttribute('data-dim', dim.key);
        t.textContent = lineText;
        t.addEventListener('mouseenter', () => onActivate(dim.key));
        t.addEventListener('click', () => onActivate(dim.key));
        labelsG.appendChild(t);
      });
    });
  }

  // Animate in after next frame
  animateRadarIn(svgEl, angles, maxR, dimensionScores);
}

function animateRadarIn(svgEl, angles, maxR, dimensionScores) {
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
  const cx = 220, cy = 210;
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
 * Set the active dimension in the radar callout and update visual state.
 * @param {SVGElement} svgEl
 * @param {string} dimKey
 * @param {Object} dimensionScores
 * @param {Object} result - full result object for blurb lookup
 * @param {HTMLElement} calloutNameEl
 * @param {HTMLElement} calloutScoreEl
 * @param {HTMLElement} calloutReadingEl
 */
export function setActiveDimension(svgEl, dimKey, dimensionScores, result, calloutNameEl, calloutScoreEl, calloutReadingEl) {
  // Find the dimension data
  const dimData = RADAR_DIMS.find((d) => d.key === dimKey);
  if (!dimData) return;

  // Find blurb from framework dimensions
  const frameworkDim = dimensions.find((d) => d.key === dimKey);
  const raw = dimensionScores[dimKey];
  // Use edge blurb if high band (>=3), gap blurb otherwise
  const blurb = frameworkDim ? (raw >= 3 ? frameworkDim.edge : frameworkDim.gap) : '';

  if (calloutNameEl) calloutNameEl.textContent = dimData.label;
  if (calloutScoreEl) calloutScoreEl.textContent = `${raw} / 4`;
  if (calloutReadingEl) calloutReadingEl.textContent = blurb;

  // Update SVG visual state
  svgEl.querySelectorAll('.sc-radar-point').forEach((el) => {
    el.classList.toggle('is-active', el.getAttribute('data-dim') === dimKey);
  });
  svgEl.querySelectorAll('.sc-radar-label').forEach((el) => {
    el.classList.toggle('is-active', el.getAttribute('data-dim') === dimKey);
  });
}

/**
 * Render the 2x2 archetype quadrant.
 * @param {HTMLElement} gridEl - the .sc-matrix-grid element
 * @param {HTMLElement} calloutEl - the .sc-quadrant-callout element
 * @param {Object} result - full result with archetype + dimensionScores
 */
export function renderQuadrant(gridEl, calloutEl, result) {
  const { archetype, dimensionScores } = result;

  // Compute execution score (0-12) and pov (0-4)
  const exec = dimensionScores.conversionSurface + dimensionScores.trustAtCapture + dimensionScores.signalToSales;
  const pov = dimensionScores.pointOfView;

  // Build quadrant cells
  gridEl.innerHTML = '';
  QUADRANT_ORDER.forEach((q) => {
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
    cell.setAttribute('tabindex', '0');
    cell.setAttribute('aria-label', q.name + (q.archetype === archetype.key ? ' (your archetype)' : ''));

    const numSpan = document.createElement('span');
    numSpan.className = 'q-num';
    numSpan.textContent = q.num;

    const nameSpan = document.createElement('span');
    nameSpan.className = 'q-name';
    nameSpan.textContent = q.name;

    cell.appendChild(numSpan);
    cell.appendChild(nameSpan);

    cell.addEventListener('mouseenter', () => setActiveQuadrant(gridEl, calloutEl, q.archetype));
    cell.addEventListener('click', () => setActiveQuadrant(gridEl, calloutEl, q.archetype));
    cell.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setActiveQuadrant(gridEl, calloutEl, q.archetype);
      }
    });
    cell.addEventListener('focus', () => setActiveQuadrant(gridEl, calloutEl, q.archetype));

    gridEl.appendChild(cell);
  });

  // Buyer dot - piecewise-linear mapping so the dot accurately reflects quadrant boundaries.
  // Execution threshold: >=8 is high (clusterHigh). Range 0-12, divider at 8.
  //   exec <  8: left = exec/8 * 50         (maps 0-7.99 to 0-49.9%)
  //   exec >= 8: left = 50 + (exec-8)/4*50  (maps 8-12 to 50-100%)
  // POV threshold: >=3 is high. Range 0-4, divider at 3. CSS bottom=0 is bottom of grid.
  //   pov <  3: bottom = pov/3 * 50         (maps 0-2.99 to 0-49.9%)
  //   pov >= 3: bottom = 50 + (pov-3)*50    (maps 3-4 to 50-100%)
  // Exact threshold values (exec=8, pov=3) land at 50% which could render on the divider;
  // nudge 3% into the correct (high) half so the dot is clearly inside the right cell.
  // Final clamp keeps dot away from the outer border edges.
  const MIN_PCT = 8, MAX_PCT = 92, THRESHOLD_NUDGE = 3;

  let leftPct, bottomPct;
  if (exec < 8) {
    leftPct = (exec / 8) * 50;
  } else {
    // exec >= 8 is execution-high: right half. At exactly 8 nudge slightly past midpoint.
    leftPct = exec === 8 ? 50 + THRESHOLD_NUDGE : 50 + ((exec - 8) / 4) * 50;
  }
  if (pov < 3) {
    bottomPct = (pov / 3) * 50;
  } else {
    // pov >= 3 is pov-high: top half. At exactly 3 nudge slightly past midpoint.
    bottomPct = pov === 3 ? 50 + THRESHOLD_NUDGE : 50 + ((pov - 3) / 1) * 50;
  }
  // Clamp to keep dot visually inside the grid
  leftPct = Math.max(MIN_PCT, Math.min(MAX_PCT, leftPct));
  bottomPct = Math.max(MIN_PCT, Math.min(MAX_PCT, bottomPct));

  const dot = document.createElement('div');
  dot.className = 'sc-buyer-dot';
  dot.style.left = `${leftPct}%`;
  dot.style.bottom = `${bottomPct}%`;
  dot.setAttribute('aria-hidden', 'true');
  gridEl.appendChild(dot);

  // Set initial callout to the user's archetype
  setActiveQuadrant(gridEl, calloutEl, archetype.key);

  // Reset to user's archetype on mouse leave
  gridEl.addEventListener('mouseleave', () => {
    gridEl.querySelectorAll('.sc-quadrant').forEach((el) => el.classList.remove('is-active'));
    const buyerCell = gridEl.querySelector('[data-archetype="' + archetype.key + '"]');
    if (buyerCell) buyerCell.classList.add('is-buyer');
    setCalloutText(calloutEl, archetype.key);
  });
}

function setActiveQuadrant(gridEl, calloutEl, archetypeKey) {
  gridEl.querySelectorAll('.sc-quadrant').forEach((el) => {
    const isTarget = el.getAttribute('data-archetype') === archetypeKey;
    el.classList.toggle('is-active', isTarget);
  });
  setCalloutText(calloutEl, archetypeKey);
}

function setCalloutText(calloutEl, archetypeKey) {
  if (!calloutEl) return;
  const q = QUADRANT_ORDER.find((x) => x.archetype === archetypeKey);
  const desc = QUADRANT_DESC[archetypeKey] || '';
  if (!q) return;
  calloutEl.textContent = '';
  const strong = document.createElement('strong');
  strong.textContent = q.name;
  calloutEl.appendChild(strong);
  calloutEl.appendChild(document.createTextNode(' · ' + desc));
}
