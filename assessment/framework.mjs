// The Demand Research Index (DRI) as data. Edit this file to change content.

export const meta = {
  name: 'Demand Research Index',
  short: 'DRI',
};

export const dimensions = [
  { key: 'pointOfView', label: 'Point of View', gap: 'You are renting the lens buyers research against. A framework licensed to your category makes that lens yours.' },
  { key: 'conversionSurface', label: 'Conversion Surface', gap: 'You earn attention but your capture leaks it. An assessment converts where a gated PDF cannot.' },
  { key: 'trustAtCapture', label: 'Trust at Capture', gap: 'Your form taxes trust instead of earning it. A diagnosis gives the buyer a reason to raise their hand.' },
  { key: 'signalToSales', label: 'Signal to Sales', gap: 'Your reps cold-qualify. A scored, archetyped lead puts the diagnosis on the table before the first call.' },
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
  { id: 'conv1', dimension: 'conversionSurface', text: 'What does your highest-value content typically ask the reader to do?', options: [
    { label: 'Download a gated PDF or fill a form before they get value', points: 0 },
    { label: 'Read freely, with a generic contact-us or newsletter CTA', points: 1 },
    { label: 'Engage with something interactive that returns a personalized result', points: 2 },
  ] },
  { id: 'conv2', dimension: 'conversionSurface', text: 'Roughly what share of people who engage your best content become identifiable pipeline?', options: [
    { label: 'Under about 3 percent, or we cannot tell', points: 0 },
    { label: 'A modest, hard-to-attribute slice', points: 1 },
    { label: 'A meaningful, measured share we can point to', points: 2 },
  ] },
  { id: 'trust1', dimension: 'trustAtCapture', text: 'When you ask a buyer for their information, what do they get in return?', options: [
    { label: 'Access to a download or a demo request', points: 0 },
    { label: 'A useful resource, but nothing specific to them', points: 1 },
    { label: 'A personalized diagnosis or result they could not get elsewhere', points: 2 },
  ] },
  { id: 'trust2', dimension: 'trustAtCapture', text: 'How would a buyer describe filling out your form?', options: [
    { label: 'A toll they pay to reach the content', points: 0 },
    { label: 'Neutral, a reasonable ask', points: 1 },
    { label: 'Worth it on its own, the result is the value', points: 2 },
  ] },
  { id: 'signal1', dimension: 'signalToSales', text: 'When a lead reaches your sales team, what context comes with it?', options: [
    { label: 'A name and an email', points: 0 },
    { label: 'Basic firmographics and the asset they downloaded', points: 1 },
    { label: 'A diagnosed profile: where they stand and the specific gap to close', points: 2 },
  ] },
  { id: 'signal2', dimension: 'signalToSales', text: 'How does a typical first sales conversation open?', options: [
    { label: 'Cold qualification, figuring out who they are and what they need', points: 0 },
    { label: 'Some context, but reps still re-discover the basics', points: 1 },
    { label: "With the buyer's result on the table, straight to the gap", points: 2 },
  ] },
];

export const archetypes = {
  renter: { key: 'renter', label: 'The Renter', blurb: "Your buyer's research runs on someone else's framework, and your funnel leaks the attention you earn." },
  publisher: { key: 'publisher', label: 'The Publisher', blurb: 'You earn the read, not the lead. Strong point of view, weak conversion and hand-off.' },
  operator: { key: 'operator', label: 'The Operator', blurb: 'You convert attention well, but you compete on the same lens as everyone else. No framework of your own.' },
  authority: { key: 'authority', label: 'The Authority', blurb: 'You own a framework buyers research against, it converts, and it briefs sales. Lock it to your category before a competitor licenses it first.' },
};
