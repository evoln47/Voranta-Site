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
    gap: 'You are renting the lens buyers research against. Every piece of content you publish builds authority for a framework someone else named. A proprietary, opinionated framework the market associates with your brand makes that lens yours and turns competitors\' positioning pressure into evidence for your category.',
    edge: 'Your point of view is your sharpest commercial asset. Buyers are already finding and using it. The next lever is structuring it into a named, opinionated framework the market associates with your brand. That move converts a content strength into a category position competitors cannot replicate by outspending you.' },
  { key: 'conversionSurface', label: 'Conversion Surface',
    gap: 'You earn attention but the primary action you ask for leaks it. Buyers who would have converted step off the path before you can identify them. A lower-friction, specifically relevant next step tied to real conversion measurement closes that gap and turns earned attention into attributable pipeline.',
    edge: 'Your conversion surface already works. Buyers who engage are converting to identifiable contacts at a measurable rate. The next lever is precision: sharper paths and tighter measurement so every point of earned attention becomes attributable pipeline, not just most of it.' },
  { key: 'trustAtCapture', label: 'Trust at Capture',
    gap: 'What you ask for and what you give in return are out of balance. Buyers tolerate the exchange rather than value it. When the first thing a buyer receives is a diagnosis tailored to their specific situation, the act of raising a hand becomes the beginning of the engagement rather than the price of admission.',
    edge: 'Capture already earns trust. Buyers get real value at the moment of exchange and the hand-raise pays for itself. The next lever is specificity: making what buyers receive so precisely calibrated to their situation that the first interaction positions every subsequent touchpoint as a continuation, not a follow-up.' },
  { key: 'signalToSales', label: 'Signal to Sales',
    gap: 'Your reps start from scratch on every first call. A hand-off that delivers a prioritized, account-specific brief to the right rep before they dial means the first call opens on the actual gap in the account, not on introductory discovery.',
    edge: 'Your hand-off already gives reps meaningful context before the first call. The next lever is sharpening the brief and the routing so every rep opens every call on the account-specific gap, not just when the system fires cleanly.' },
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
  // pov3: durability / proprietariness of the point of view. Distinct from pov1
  // (whose lens buyers use) and pov2 (do you have a named methodology). 2 keys
  // off a moat a competitor cannot quickly replicate; 1 a borrowable opinion;
  // 0 repackaged best practices.
  { id: 'pov3', dimension: 'pointOfView', text: 'If a well-funded competitor decided to out-publish you tomorrow, how defensible is your point of view?', options: [
    { label: 'Not defensible. Anyone with a content budget could publish something equivalent', points: 0 },
    { label: 'We have a distinct opinion, but it is a stance a competitor could adopt with enough effort', points: 1 },
    { label: 'It is grounded in proprietary data or original research a competitor cannot quickly reproduce', points: 2 },
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
  // conv3: relevance-matching of the next step. Distinct from conv1 (what the
  // CTA asks) and conv2 (can you measure conversion). 2 keys off a next step
  // that adapts to what the buyer just engaged with; 1 one generic CTA
  // sitewide; 0 the same hard ask everywhere.
  { id: 'conv3', dimension: 'conversionSurface', text: 'Does the action you ask for change based on what the buyer just read or watched?', options: [
    { label: 'No. We push the same high-commitment ask regardless of what they engaged with', points: 0 },
    { label: 'Mostly no. There is one standard call to action we use across the site', points: 1 },
    { label: 'Yes. The ask is matched to the specific topic or problem the buyer just engaged with', points: 2 },
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
  // trust3: immediacy of value at capture. Distinct from trust1/trust2. 2 keys
  // off value delivered in the moment of exchange (the interactive diagnosis),
  // not promised later; 1 useful but delayed; 0 a promise of follow-up. This
  // keeps the interactive-assessment artifact anchored to Trust at Capture only.
  { id: 'trust3', dimension: 'trustAtCapture', text: 'How quickly does a buyer receive real value after they give you their information?', options: [
    { label: 'They do not receive it at capture. The exchange is a promise that someone will reach out', points: 0 },
    { label: 'They receive something useful, but it lands later, not at the moment they hand it over', points: 1 },
    { label: 'Immediately. They complete an interactive diagnosis and get a personalized result on the spot', points: 2 },
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
  // signal3: timeliness / freshness of the brief. Distinct from signal1 (how
  // much context) and signal2 (prioritization/routing). 2 keys off a brief that
  // reaches the right rep before the first touch and reflects current account
  // behavior; 1 context that exists but is stale or arrives late; 0 no brief.
  { id: 'signal3', dimension: 'signalToSales', text: 'By the time a rep makes first contact, how current is the account intelligence they are working from?', options: [
    { label: 'There is no pre-call brief. The rep works from whatever they can pull before dialing', points: 0 },
    { label: 'A brief exists, but it reflects older behavior or arrives after outreach has already started', points: 1 },
    { label: 'The brief reflects recent account activity and lands before the rep makes first contact', points: 2 },
  ] },
];

export const archetypes = {
  renter: { key: 'renter', label: 'The Renter', blurb: "Your content reaches buyers who then research the problem using someone else's framework. The lead goes to whoever owns that lens, and right now that is not you. Owning the framework the market researches against is what turns your content into pipeline you can claim. The call is about how you get there." },
  publisher: { key: 'publisher', label: 'The Publisher', blurb: 'You have built a genuine point of view and buyers read it. The leak is what happens next. The conversion path, the value at capture, or the hand-off to sales is not closing the gap between earned attention and identifiable pipeline.' },
  operator: { key: 'operator', label: 'The Operator', blurb: 'You have built a broadly strong demand engine. What it is missing is the lens. You compete on a framework someone else defined, which means a well-resourced rival can outspend you on the category point of view you are currently renting. The call is about making that lens yours before they do.' },
  authority: { key: 'authority', label: 'The Authority', blurb: 'You own the lens buyers use to research the problem, and the rest of your demand engine is broadly strong. That combination is hard to build and easy to copy once it is visible. The question is how quickly you can extend the lead before a rival reverse-engineers it.' },
};
