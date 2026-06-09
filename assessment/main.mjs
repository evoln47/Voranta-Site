import { scoreAnswers } from './scoring.mjs';
import { createQuiz } from './engine.mjs';
import { renderScorecard } from './scorecard.mjs';
import { wireCapture } from './capture.mjs';

const app = document.getElementById('dri-app');
const screens = {};
app.querySelectorAll('[data-screen]').forEach((el) => { screens[el.dataset.screen] = el; });

function show(name) {
  Object.entries(screens).forEach(([key, el]) => { el.hidden = key !== name; });
}

let lastResult = null;

const quiz = createQuiz({
  mountEl: document.getElementById('dri-question'),
  progressFill: document.getElementById('dri-progress-fill'),
  progressLabel: document.getElementById('dri-progress-label'),
  onComplete(answers) {
    lastResult = scoreAnswers(answers);
    renderScorecard(lastResult, {
      score: document.getElementById('dri-score'),
      archetypeName: document.getElementById('dri-archetype-name'),
      archetypeBlurb: document.getElementById('dri-archetype-blurb'),
      gapLabel: document.getElementById('dri-gap-label'),
      gapBlurb: document.getElementById('dri-gap-blurb'),
      bars: document.getElementById('dri-bars'),
    });
    show('results');
    app.scrollIntoView({ behavior: 'smooth', block: 'start' });
  },
});

document.getElementById('dri-start').addEventListener('click', () => {
  show('quiz');
  quiz.start();
});

wireCapture(
  document.getElementById('dri-capture-form'),
  document.getElementById('dri-capture-msg'),
  () => lastResult,
);
