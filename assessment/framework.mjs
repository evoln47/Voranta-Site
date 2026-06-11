// The Demand Research Index (DRI) as data. Edit this file to change content.

export const meta = {
  name: 'Demand Research Index',
  short: 'DRI',
};

export const dimensions = [
  { key: 'pointOfView', label: 'Point of View', gap: 'You are renting the lens buyers research against. A named framework the market associates with you makes that lens yours.' },
  { key: 'conversionSurface', label: 'Conversion Surface', gap: 'You earn attention, but your primary call to action leaks it. A lower-friction path and real conversion measurement turn earned attention into identifiable pipeline.' },
  { key: 'trustAtCapture', label: 'Trust at Capture', gap: 'Your capture taxes trust instead of earning it. When the buyer gets something they value the moment they raise their hand, the exchange pays for itself.' },
  { key: 'signalToSales', label: 'Signal to Sales', gap: 'Your reps walk in cold. When the hand-off routes a prioritized, account-specific brief to the right rep in time to prep, the first call starts on the gap, not on discovery.' },
];

export const questions = [
  { id: 'pov1', dimension: 'pointOfView', text: 'When a buyer in your category researches the problem you solve, whose framework or point of view are they most likely using?', options: [
    { label: "A competitor's or an analyst's framework", points: 0 },
    { label: 'A mix, including some of our content, but nothing they would name as ours', points: 1 },
    { label: 'A named framework or point of view the market associates with us', points: 2 },
  ] },
  { id: 'pov2', dimension: 'pointOfView', text: 'Do you have a proprietary, opinionated methodology published under your brand?', options: [
    { label: 'No, our content is mostly best practices and product material', points: 0 },
    { label: 'We have strong thought leadership but no named, structured framework', points: 1 },
    { label: 'Yes, a named framework with a defined methodology buyers can apply', points: 2 },
  ] },
  { id: 'conv1', dimension: 'conversionSurface', text: 'Think about the main call to action on your best-performing content. How much friction stands between a reader and becoming an identifiable contact?', options: [
    { label: 'A long gated form or a high-commitment ask like book a demo, before any value', points: 0 },
    { label: 'A light, generic ask such as subscribe or contact us, not tied to what they just read', points: 1 },
    { label: 'A low-friction, relevant next step built to turn a reader into an identifiable contact', points: 2 },
  ] },
  { id: 'conv2', dimension: 'conversionSurface', text: 'How well can you measure the rate at which people who engage your best content convert into identifiable pipeline?', options: [
    { label: 'We cannot measure or attribute it with any confidence', points: 0 },
    { label: 'We can estimate it roughly, but the numbers are soft', points: 1 },
    { label: 'We track a clear, defensible conversion rate we can report on', points: 2 },
  ] },
  { id: 'trust1', dimension: 'trustAtCapture', text: 'At the moment a buyer hands over their information, what do they actually receive in return?', options: [
    { label: 'Access to a generic asset, or only the promise of a follow-up', points: 0 },
    { label: 'A useful resource, but the same one everyone else who fills the form gets', points: 1 },
    { label: 'Something tailored to their specific situation that they could not get elsewhere', points: 2 },
  ] },
  { id: 'trust2', dimension: 'trustAtCapture', text: 'How would a buyer honestly describe the trade of giving you their information?', options: [
    { label: 'A toll they grudgingly pay to get past the gate', points: 0 },
    { label: 'A fair, unremarkable exchange', points: 1 },
    { label: 'Worth it on its own, they would have wanted what they got even without the follow-up', points: 2 },
  ] },
  { id: 'signal1', dimension: 'signalToSales', text: "Before a rep's first conversation with a new lead, how much account-specific context do they actually have in hand?", options: [
    { label: 'A name and an email, the rep discovers the rest live on the call', points: 0 },
    { label: 'Firmographics and which asset was downloaded, but nothing about where this account stands', points: 1 },
    { label: 'A brief on where this account stands and what to lead with, delivered in time to prep', points: 2 },
  ] },
  { id: 'signal2', dimension: 'signalToSales', text: 'When leads arrive, how consistently are they prioritized and routed so reps know who to work first and why?', options: [
    { label: 'They land in one queue or inbox, reps pick by gut or recency', points: 0 },
    { label: 'Some scoring or rules exist, but routing and priority are inconsistent', points: 1 },
    { label: 'Every lead is prioritized on the same criteria and routed to the right rep automatically', points: 2 },
  ] },
];

export const archetypes = {
  renter: { key: 'renter', label: 'The Renter', blurb: "Your buyer's research runs on someone else's framework, and the attention you do earn leaks before it becomes pipeline." },
  publisher: { key: 'publisher', label: 'The Publisher', blurb: 'You earn the read, not the lead. Strong point of view, but the conversion path, the value at capture, or the hand-off to sales is letting it slip.' },
  operator: { key: 'operator', label: 'The Operator', blurb: 'You convert attention and brief your reps well, but you compete on the same lens as everyone else. No framework of your own.' },
  authority: { key: 'authority', label: 'The Authority', blurb: 'You own a framework buyers research against, your capture earns the lead, and your hand-off briefs sales. Lock it to your category before a competitor builds the same advantage.' },
};
