import { dimensions } from './framework.mjs';
import { renderRadar, setActiveDimension, setActiveDimensionVisual, renderQuadrant } from './scorecard-viz.mjs';

const CALENDLY_BASE = 'https://calendly.com/evoln47/30min';

export function renderScorecard(result, els) {
  els.archetypeName.textContent = result.archetype.label;
  els.archetypeBlurb.textContent = result.archetype.blurb;

  // Final framing labels (conversion-copywriter finalized wording).
  // focus.tier 'deficit' = a gap to close; 'edge' = the next lever to extend.
  // focus is null only when all four dimensions are exactly equal (evenTier set).
  const f = result.focus;

  // B28: CTA text - primary Calendly button text based on result state
  if (els.cta) {
    let ctaText;
    if (f) {
      ctaText = f.tier === 'edge' ? 'Book a call to extend your lead' : 'Book a call to close the gap';
    } else if (result.evenTier === 'high') {
      ctaText = 'Book a call to extend your lead';
    } else {
      ctaText = 'Book a call to sequence the build';
    }
    els.cta.textContent = ctaText;

    // B26: Append UTM params encoding result context to Calendly URL
    const focusDim = f ? f.dimension : 'even';
    const focusTier = f ? f.tier : (result.evenTier || 'low');
    const utmContent = `${encodeURIComponent(focusDim)}-${encodeURIComponent(focusTier)}`;
    const href =
      CALENDLY_BASE +
      '?utm_source=dri-assessment' +
      `&utm_campaign=${encodeURIComponent(result.archetype.key)}` +
      `&utm_content=${utmContent}` +
      `&score=${encodeURIComponent(result.score)}`;
    els.cta.href = href;
  }

  // Animate score number
  animateScore(els.score, result.score);

  // Sr-only dimension list for screen readers (primary data source since radar is group).
  // Append <li>s directly to the <ul> container; no nested wrapper.
  if (els.dimensionList) {
    els.dimensionList.innerHTML = '';
    dimensions.forEach((dim) => {
      const raw = result.dimensionScores[dim.key];
      const li = document.createElement('li');
      li.textContent = `${dim.label}: ${raw} out of 4`;
      els.dimensionList.appendChild(li);
    });
  }

  // Radar chart
  if (els.radarSvg) {
    // Determine default dimension to show in callout:
    // If there is a focus dimension, default to it. If even-tier, default to first dim.
    const defaultDim = f ? f.dimension : dimensions[0].key;

    renderRadar(
      els.radarSvg,
      result.dimensionScores,
      result.focus,
      // Visual-only callback (hover/focus)
      (dimKey) => setActiveDimensionVisual(els.radarSvg, dimKey),
      // Live update callback (click/Enter/Space)
      (dimKey) => setActiveDimension(
        els.radarSvg,
        dimKey,
        result.dimensionScores,
        result,
        els.radarCalloutName,
        els.radarCalloutScore,
        els.radarCalloutReading
      )
    );

    // Default: set visual highlight and populate callout with focus/default dim
    setActiveDimensionVisual(els.radarSvg, defaultDim);

    // Populate the callout text with the focus dimension (or even-tier message)
    if (f) {
      // Show the focus dimension details in the callout
      const frameworkDim = dimensions.find((d) => d.key === f.dimension);
      const raw = result.dimensionScores[f.dimension];
      const blurb = frameworkDim ? (raw >= 3 ? frameworkDim.edge : frameworkDim.gap) : '';
      if (els.radarCalloutName) {
        els.radarCalloutName.textContent = f.tier === 'edge' ? 'Your strongest next move' : 'Where you are leaking';
      }
      if (els.radarCalloutScore) els.radarCalloutScore.textContent = `${f.label} · ${raw} / 4`;
      if (els.radarCalloutReading) els.radarCalloutReading.textContent = blurb;
    } else if (result.evenTier === 'high') {
      if (els.radarCalloutName) els.radarCalloutName.textContent = 'Strong across every dimension';
      if (els.radarCalloutScore) els.radarCalloutScore.textContent = '';
      if (els.radarCalloutReading) els.radarCalloutReading.textContent = 'All four dimensions score in the high band. That is a real position. The call is about extending the lead before a competitor reverse-engineers it.';
    } else {
      if (els.radarCalloutName) els.radarCalloutName.textContent = 'A systemic opportunity';
      if (els.radarCalloutScore) els.radarCalloutScore.textContent = '';
      if (els.radarCalloutReading) els.radarCalloutReading.textContent = 'No single dimension drags the others down, which means there is no one fix to isolate. The opportunity is to sequence the whole build deliberately. The call scopes that sequence.';
    }
  }

  // Quadrant
  if (els.quadrantGrid && els.quadrantCallout) {
    renderQuadrant(els.quadrantGrid, els.quadrantCallout, result);
  }
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
