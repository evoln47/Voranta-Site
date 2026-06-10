import { questions } from './framework.mjs';

export function createQuiz({ mountEl, progressFill, progressLabel, onComplete }) {
  const answers = [];
  let index = 0;

  function render() {
    const q = questions[index];
    progressLabel.textContent = `Question ${index + 1} of ${questions.length}`;
    progressFill.style.width = `${(index / questions.length) * 100}%`;
    mountEl.innerHTML = `
      <p class="dri-q-text">${q.text}</p>
      <div class="dri-options" role="group" aria-label="Answer choices">
        ${q.options.map((o, i) => `<button type="button" class="dri-option" data-choice="${i}">${o.label}</button>`).join('')}
      </div>`;
    mountEl.querySelectorAll('.dri-option').forEach((btn) => {
      btn.addEventListener('click', () => choose(parseInt(btn.dataset.choice, 10)));
    });
    const first = mountEl.querySelector('.dri-option');
    if (first) first.focus();
  }

  function choose(choiceIndex) {
    answers[index] = { questionId: questions[index].id, choiceIndex };
    if (index < questions.length - 1) {
      index += 1;
      render();
    } else {
      progressFill.style.width = '100%';
      onComplete(answers.slice());
    }
  }

  return { start: render };
}
