const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function wireCapture(form, msgEl, getResult) {
  if (!form) return;
  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = form.elements.email.value.trim();
    const website = form.elements.website.value; // honeypot

    if (!EMAIL_RE.test(email)) {
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
      // Placeholder copy: conversion-copywriter to refine.
      showMsg(msgEl, 'Check your inbox for the full breakdown. When you are ready to act on it, book a call with Evan above.', true);
      form.hidden = true;
      msgEl.focus();
    } catch (err) {
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
