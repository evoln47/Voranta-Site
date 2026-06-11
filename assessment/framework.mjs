// The Demand Research Index (DRI) as data. Edit this file to change content.

export const meta = {
  name: 'Demand Research Index',
  short: 'DRI',
};

// Each dimension carries two band-adaptive blurbs (provisional copy; final
// wording comes from conversion-copywriter, construct and point values fixed):
//   gap  - shown when this dimension is the focus AND in the low/mid band: a
//          deficit to close.
//   edge - shown when this dimension is the focus AND already in the high band:
//          a relative strength to extend, the taker's next lever. NOT a deficit,
//          so it never contradicts a strong archetype.
export const dimensions = [
  { key: 'pointOfView', label: 'Point of View',
    gap: 'You are renting the lens buyers research against. A named framework the market associates with you makes that lens yours.',
    edge: 'Your point of view is strong, and it is your sharpest lever. Naming and structuring it into a framework buyers research against turns a strength into a category position competitors cannot copy.' },
  { key: 'conversionSurface', label: 'Conversion Surface',
    gap: 'You earn attention, but your primary call to action leaks it. A lower-friction, relevant path and real conversion measurement turn earned attention into identifiable pipeline.',
    edge: 'Your conversion surface already works. The next lever is precision: tightening the path and the measurement so every point of earned attention is accounted for as identifiable pipeline.' },
  { key: 'trustAtCapture', label: 'Trust at Capture',
    gap: 'Your capture taxes trust instead of earning it. When the buyer receives something tailored to their situation the moment they raise their hand, the exchange pays for itself.',
    edge: 'Capture already earns trust rather than taxing it. The next lever is to make the moment of exchange so tailored that raising a hand feels like the start of the engagement, not a toll.' },
  { key: 'signalToSales', label: 'Signal to Sales',
    gap: 'Your reps walk in cold. A hand-off that routes a prioritized, account-specific brief to the right rep in time to prep means the first call starts on the gap, not on discovery.',
    edge: 'Your hand-off already arms reps with context. The next lever is sharpening the brief and the routing so the first call opens on the account-specific gap every time, not just most of the time.' },
];

export const questions = [
  { id: 'pov1', dimension: 'pointOfView', text: 'When a buyer in your category researches the problem you solve, whose framework or point of view are they most likely using?', options: [
    { label: "A competitor's or an analyst's framework", points: 0 },
    { label: 'A mix that includes some of our content, but nothing the market would name as ours', points: 1 },
    { label: 'A named framework or point of view the market associates with us', points: 2 },
  ] },
  { id: 'pov2', dimension: 'pointOfView', text: 'Do you have a proprietary, opinionated methodology published under your brand?', options: [
    { label: 'No. Our content is mostly best practices and product material', points: 0 },
    { label: 'We have strong thought leadership but no named, structured framework', points: 1 },
    { label: 'Yes. A named framework with a defined methodology buyers can apply', points: 2 },
  ] },
  { id: 'conv1', dimension: 'conversionSurface', text: 'What does the main call to action on your best-performing content ask a reader to do?', options: [
    { label: 'Submit a long gated form or commit to a high-friction ask like book a demo, before receiving any value', points: 0 },
    { label: 'Take a light, generic action such as subscribe or contact us, unconnected to what they just read', points: 1 },
    { label: 'Take a low-friction, relevant next step designed to turn a reader into an identifiable contact', points: 2 },
  ] },
  { id: 'conv2', dimension: 'conversionSurface', text: 'How confidently can you measure the rate at which people who engage your best content convert into identifiable pipeline?', options: [
    { label: 'We cannot measure or attribute it with any confidence', points: 0 },
    { label: 'We can estimate it roughly, but the numbers are soft', points: 1 },
    { label: 'We track a clear, defensible conversion rate we can report on', points: 2 },
  ] },
  { id: 'trust1', dimension: 'trustAtCapture', text: 'At the moment a buyer hands over their information, what do they actually receive in return?', options: [
    { label: 'Access to a generic asset, or only the promise of a follow-up', points: 0 },
    { label: 'A useful resource, but the same one everyone else who fills the form gets', points: 1 },
    { label: 'Something tailored to their specific situation that they could not get anywhere else', points: 2 },
  ] },
  { id: 'trust2', dimension: 'trustAtCapture', text: 'How would a buyer honestly describe giving you their information?', options: [
    { label: 'A toll they grudgingly pay to get past the gate', points: 0 },
    { label: 'A fair, unremarkable exchange', points: 1 },
    { label: 'Worth it on its own terms. They would have wanted what they got even without the follow-up', points: 2 },
  ] },
  { id: 'signal1', dimension: 'signalToSales', text: "Before a rep's first conversation with a new lead, how much account-specific context do they actually have?", options: [
    { label: 'A name and an email. The rep discovers everything else live on the call', points: 0 },
    { label: 'Firmographics and which asset was downloaded, but nothing about where this account stands', points: 1 },
    { label: 'A brief on where this account stands and what to lead with, delivered in time to prep', points: 2 },
  ] },
  { id: 'signal2', dimension: 'signalToSales', text: 'When leads arrive, how consistently are they prioritized and routed so reps know who to work first and why?', options: [
    { label: 'They land in one queue or inbox. Reps pick by gut or recency', points: 0 },
    { label: 'Some scoring or rules exist, but routing and priority are inconsistent', points: 1 },
    { label: 'Every lead is prioritized on the same criteria and routed to the right rep automatically', points: 2 },
  ] },
];

export const archetypes = {
  renter: { key: 'renter', label: 'The Renter', blurb: "Your buyer's research runs on someone else's framework. The attention you do earn leaks before it becomes pipeline." },
  publisher: { key: 'publisher', label: 'The Publisher', blurb: 'You earn the read, not the lead. Strong point of view, but the conversion path, the value at capture, or the hand-off to sales is letting it slip.' },
  operator: { key: 'operator', label: 'The Operator', blurb: 'Your demand engine is broadly strong, but you compete on the same lens as everyone else. No framework of your own.' },
  authority: { key: 'authority', label: 'The Authority', blurb: 'You own a framework buyers research against, and your demand engine is broadly strong behind it. Lock this to your category before a competitor builds the same advantage.' },
};
