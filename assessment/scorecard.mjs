import { dimensions } from './framework.mjs';

export function renderScorecard(result, els) {
  els.archetypeName.textContent = result.archetype.label;
  els.archetypeBlurb.textContent = result.archetype.blurb;

  if (result.gap) {
    els.gapName.textContent = 'Your #1 gap';
    els.gapLabel.textContent = result.gap.label;
    els.gapBlurb.textContent = result.gap.blurb;
  } else {
    els.gapName.textContent = 'A balanced profile';
    els.gapLabel.textContent = '';
    els.gapBlurb.textContent = 'Your funnel scores evenly across all four dimensions, no single gap stands out.';
  }

  els.bars.innerHTML = dimensions.map((dim) => {
    const raw = result.dimensionScores[dim.key]; // 0-4
    const pct = (raw / 4) * 100;
    const band = raw <= 1 ? 'low' : raw === 2 ? 'mid' : 'high';
    const isGap = result.gap && dim.key === result.gap.dimension;
    return `
      <div class="dri-bar${isGap ? ' is-gap' : ''}">
        <div class="dri-bar-head">
          <span class="dri-bar-name">${dim.label}</span>
          <span class="dri-bar-band">${band}${isGap ? ' &middot; your gap' : ''}</span>
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
