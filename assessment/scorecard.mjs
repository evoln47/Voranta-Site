import { dimensions } from './framework.mjs';

export function renderScorecard(result, els) {
  els.archetypeName.textContent = result.archetype.label;
  els.archetypeBlurb.textContent = result.archetype.blurb;

  // Provisional framing labels (conversion-copywriter owns final wording).
  // focus.tier 'deficit' = a gap to close; 'edge' = the next lever to extend.
  // focus is null only when all four dimensions are exactly equal (evenTier set).
  const f = result.focus;
  if (f) {
    els.gapName.textContent = f.tier === 'edge' ? 'Your next lever' : 'Your #1 gap';
    els.gapLabel.textContent = f.label;
    els.gapBlurb.textContent = f.blurb;
  } else if (result.evenTier === 'high') {
    els.gapName.textContent = 'Strong and even';
    els.gapLabel.textContent = '';
    els.gapBlurb.textContent = 'No single dimension lags. Press this advantage before a competitor builds the same one.';
  } else {
    els.gapName.textContent = 'Even across the board';
    els.gapLabel.textContent = '';
    els.gapBlurb.textContent = 'No single weak link, which means the opportunity is systemic. The whole build can move together.';
  }

  if (els.cta) {
    els.cta.textContent = f
      ? (f.tier === 'edge' ? 'Book a call to extend your lead' : 'Book a call to close the gap')
      : 'Book a call to talk through your result';
  }

  els.bars.innerHTML = dimensions.map((dim) => {
    const raw = result.dimensionScores[dim.key]; // 0-4
    const pct = (raw / 4) * 100;
    const band = raw <= 1 ? 'low' : raw === 2 ? 'mid' : 'high';
    const isFocus = f && dim.key === f.dimension;
    const focusTag = isFocus ? (f.tier === 'edge' ? ' &middot; next lever' : ' &middot; your gap') : '';
    return `
      <div class="dri-bar${isFocus ? ' is-gap' : ''}">
        <div class="dri-bar-head">
          <span class="dri-bar-name">${dim.label}</span>
          <span class="dri-bar-band">${band}${focusTag}</span>
        </div>
        <div class="dri-bar-track"><span class="dri-bar-fill" data-pct="${pct}"></span></div>
      </div>`;
  }).join('');

  // Animate bars on the next frame so the width transition runs.
  requestAnimationFrame(() => {
    els.bars.querySelectorAll('.dri-bar-fill').forEach((el) => { el.style.width = `${el.dataset.pct}%`; });
  });

  animateScore(els.score, result.score);
}

function animateScore(el, target) {
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) { el.textContent = String(target); return; }
  const duration = 900;
  let start = null;
  function frame(ts) {
    if (!start) start = ts;
    const p = Math.min((ts - start) / duration, 1);
    const eased = Math.sin((p * Math.PI) / 2);
    el.textContent = String(Math.round(eased * target));
    if (p < 1) requestAnimationFrame(frame);
    else el.textContent = String(target);
  }
  requestAnimationFrame(frame);
}
