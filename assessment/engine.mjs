import { questions, dimensions } from './framework.mjs';

const DIMENSION_LABELS = Object.fromEntries(dimensions.map((d) => [d.key, d.label]));

// Pause between a first answer and the automatic advance. The selected
// state needs a moment to register before the next question appears.
const AUTO_ADVANCE_MS = 500;

export function createQuiz({ mountEl, progressFill, progressLabel, onComplete }) {
  const answers = [];
  let index = 0;
  let pendingAdvance = null;

  function clearPendingAdvance() {
    if (pendingAdvance !== null) {
      clearTimeout(pendingAdvance);
      pendingAdvance = null;
    }
  }

  function render() {
    clearPendingAdvance();
    const q = questions[index];
    const qId = `dri-q-${index}`;
    progressLabel.textContent = `Question ${index + 1} of ${questions.length}`;
    // Fill reflects questions COMPLETED, not reached, so the bar never reads 100%
    // before the final answer is submitted. advance() sets 100% on completion.
    progressFill.style.width = `${(index / questions.length) * 100}%`;

    const selectedIndex = answers[index] !== undefined ? answers[index].choiceIndex : null;

    mountEl.innerHTML = `
      <span class="dri-q-tag">${DIMENSION_LABELS[q.dimension] || ''}</span>
      <p class="dri-q-text" id="${qId}">${q.text}</p>
      <div class="dri-options" role="group" aria-labelledby="${qId}">
        ${q.options.map((o, i) => `<button type="button" class="dri-option${selectedIndex === i ? ' is-selected' : ''}" data-choice="${i}" aria-pressed="${selectedIndex === i ? 'true' : 'false'}"><span class="dri-radio-dot" aria-hidden="true"></span><span>${o.label}</span></button>`).join('')}
      </div>
      <div class="dri-nav">
        ${index > 0 ? `<button type="button" class="btn btn-ghost btn-lg dri-back">Back</button>` : `<span></span>`}
        <button type="button" class="btn btn-lg dri-next"${selectedIndex === null ? ' disabled aria-disabled="true"' : ''}>${index < questions.length - 1 ? 'Continue' : 'See my results'}</button>
      </div>`;

    mountEl.querySelectorAll('.dri-option').forEach((btn) => {
      btn.addEventListener('click', () => choose(parseInt(btn.dataset.choice, 10)));
    });

    const backBtn = mountEl.querySelector('.dri-back');
    if (backBtn) {
      backBtn.addEventListener('click', () => goBack());
    }

    const nextBtn = mountEl.querySelector('.dri-next');
    nextBtn.addEventListener('click', () => {
      if (nextBtn.disabled) return;
      advance();
    });

    // Move focus: if an answer is pre-selected (Back path), focus that option; otherwise the first option.
    const focusTarget = selectedIndex !== null
      ? mountEl.querySelectorAll('.dri-option')[selectedIndex]
      : mountEl.querySelector('.dri-option');
    if (focusTarget) focusTarget.focus();
  }

  function choose(choiceIndex) {
    // A question reached again through Back already holds an answer.
    // Picking there updates the answer and waits for Continue, which
    // matches how the product flow treats a screen that was already
    // answered. A first answer advances on its own after a short pause.
    const returning = answers[index] !== undefined;
    // Overwrite by index, idempotent, never double-counts.
    answers[index] = { questionId: questions[index].id, choiceIndex };

    // Update button states in place (no full re-render to avoid focus loss).
    mountEl.querySelectorAll('.dri-option').forEach((btn, i) => {
      const selected = i === choiceIndex;
      btn.classList.toggle('is-selected', selected);
      btn.setAttribute('aria-pressed', selected ? 'true' : 'false');
    });

    const nextBtn = mountEl.querySelector('.dri-next');
    if (nextBtn) {
      nextBtn.disabled = false;
      nextBtn.removeAttribute('aria-disabled');
    }

    clearPendingAdvance();
    if (!returning) {
      pendingAdvance = setTimeout(() => {
        pendingAdvance = null;
        advance();
      }, AUTO_ADVANCE_MS);
    }
  }

  function advance() {
    clearPendingAdvance();
    if (answers[index] === undefined) return; // guard: no answer selected
    if (index < questions.length - 1) {
      index += 1;
      render();
    } else {
      progressFill.style.width = '100%';
      onComplete(answers.slice());
    }
  }

  function goBack() {
    if (index === 0) return;
    index -= 1;
    render(); // render() reads answers[index] to restore the pre-selected state
  }

  return { start: render };
}
