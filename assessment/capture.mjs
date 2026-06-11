const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function wireCapture(form, msgEl, getResult) {
  if (!form) return;
  const emailInput = form.elements.email;
  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    const website = form.elements.website.value; // honeypot

    if (!EMAIL_RE.test(email)) {
      // Mark the field invalid so assistive technology announces the error.
      emailInput.setAttribute('aria-invalid', 'true');
      emailInput.setAttribute('aria-describedby', msgEl.id);
      showMsg(msgEl, 'Please enter a valid email.', false);
      return;
    }

    submitBtn.disabled = true;
    const original = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';

    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, website, ...getResult() }),
      });
      if (!res.ok) throw new Error(`bad status ${res.status}`);
      // Clear invalid state on success before hiding the form.
      emailInput.removeAttribute('aria-invalid');
      emailInput.removeAttribute('aria-describedby');
      showMsg(msgEl, 'Your breakdown is on its way. Book a call above to turn it into a plan.', true);
      form.hidden = true;
      msgEl.focus();
    } catch (err) {
      // Network error: the address itself is not invalid, so do not mark the field.
      showMsg(msgEl, 'We could not send that. Email evan@voranta.co and we will get it to you.', false);
      submitBtn.disabled = false;
      submitBtn.textContent = original;
    }
  });
}

function showMsg(el, text, ok) {
  el.textContent = text;
  el.hidden = false;
  el.classList.toggle('is-ok', ok);
  el.classList.toggle('is-error', !ok);
}
