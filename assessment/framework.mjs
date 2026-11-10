// The Research Conversion Index (RCI) as data. Edit this file to change content.
//
// MODEL: 10 questions, 5 dimensions, TWO questions per dimension. Each question
// has SIX options valued 0,20,40,60,80,100 in ascending maturity. A dimension's
// /100 score is the MEAN of its two questions' chosen values, so dimension
// scores land in steps of 10. Within each dimension the first question covers
// the practice (what exists today) and the second covers the system around it
// (ownership, cadence, measurement, or what happens next). Order: the five
// practice questions in funnel order, then the five system questions in the
// same order, so a dimension's two questions are never adjacent.
// The RCI total is a WEIGHTED mean of the five dimension values.

export const meta = {
  name: 'Research Conversion Index',
  short: 'RCI',
};

// Each dimension carries two band-adaptive blurbs (provisional copy; final
// wording comes from conversion-copywriter, construct and point values fixed):
//   gap  - shown when this dimension is the focus AND in the low/mid band: a
//          deficit to close.
//   edge - shown when this dimension is the focus AND already in the high band:
//          a relative strength to extend, the taker's next lever. NOT a deficit,
//          so it never contradicts a strong archetype.
//
// Funnel order (also the tie-break order for focus selection):
//   pointOfView -> buyerResearchSensing -> conversionSurface -> trustAtCapture
//   -> signalToSales
export const dimensions = [
  { key: 'pointOfView', label: 'Point of View',
    gap: 'Buyers research the problem using a framework someone else named. Every piece of content you publish builds authority for that framework, not yours. A proprietary, opinionated framework the market associates with your brand changes that. It turns your competitors\' positioning pressure into evidence for a category point of view only you can claim.',
    edge: 'Your point of view is already reaching buyers and shaping how they think about the problem. The next step is formalizing it into a named, structured framework the market associates with your brand. That move lifts a content strength into a category position a competitor cannot replicate by outspending you.' },
  // buyerResearchSensing is MARKET/strategy-facing: how you learn what buyers
  // research and feed it back into positioning and content. It pairs with
  // pointOfView to form the UPSTREAM (strategy) cluster. It is deliberately kept
  // distinct from signalToSales, which is ACCOUNT/rep-facing and downstream.
  { key: 'buyerResearchSensing', label: 'Buyer Research Sensing',
    gap: 'You are publishing without a reliable read on what your buyers are actually researching. The market moves and your positioning does not follow, because nothing systematically tells it to. A measured loop, where buyer research behavior is captured and feeds back into what you publish and how you frame the problem, turns guesswork into a steering signal for the whole engine.',
    edge: 'You already read what buyers are researching and let it shape your marketing. The next step is closing the loop fully, so buyer behavior does not just inform a campaign but continuously revises the framework itself. That is what keeps your point of view current as the category moves, instead of aging into yesterday\'s answer.' },
  { key: 'conversionSurface', label: 'Conversion Surface',
    gap: 'You earn attention, but the action you ask for leaks it. Buyers who were ready to engage step off the path before you can identify them. A lower-friction, relevant next step tied to clear measurement closes that leak and turns earned attention into attributable pipeline.',
    edge: 'Your conversion surface is working. Buyers who engage are becoming identifiable contacts at a measurable rate. The next step is precision: tighter paths and sharper measurement so every point of earned attention becomes attributable pipeline, not just most of it.' },
  { key: 'trustAtCapture', label: 'Trust at Capture',
    gap: 'What you ask for and what you give back are out of balance. Buyers tolerate the exchange rather than value it. When the first thing a buyer receives is a diagnosis specific to their situation, giving you their information stops feeling like a toll and starts being worth it on its own terms.',
    edge: 'The exchange at capture already earns its keep. Buyers get real value the moment they engage and the hand-raise pays for itself. The next step is specificity: making what buyers receive so precisely matched to their situation that the first interaction sets up every conversation that follows.' },
  { key: 'signalToSales', label: 'Signal to Sales',
    gap: 'Your reps start from scratch on every first call. Delivering a prioritized, account-specific brief to the right rep before they dial means the first conversation opens on the actual gap in that account, not on introductory discovery.',
    edge: 'Reps already have meaningful context before the first call. The next step is sharpening the brief and the routing so every rep opens every conversation on the account-specific gap, not just when the system fires cleanly.' },
];

// TWO questions per dimension. options[i].points is the item value for
// choiceIndex i; the dimension /100 is the mean of its two items' values.
// Six rungs: 0, 20, 40, 60, 80, 100 ascending maturity, no neutral midpoint,
// no vanity top rung. Wording was revised in the 10-question overhaul
// (2026-11-09); the constructs and the per-rung values are LOCKED.
export const questions = [
  { id: 'pov', dimension: 'pointOfView', text: 'When buyers in your category research the problem you solve, whose way of framing it are they most likely using?', options: [
    { label: "A competitor's or an analyst's framing. Ours is not in the conversation", points: 0 },
    { label: 'Mostly generic best practices. No one owns the framing, including us', points: 20 },
    { label: 'Some of our content appears, but nothing the market would name as ours', points: 40 },
    { label: 'We have a recognizable point of view, but a competitor could adopt it', points: 60 },
    { label: 'We have a named framework buyers can apply, associated with our brand', points: 80 },
    { label: 'A named framework, grounded in proprietary data, that the market researches against', points: 100 },
  ] },
  { id: 'sensing', dimension: 'buyerResearchSensing', text: 'How do you learn what your buyers are actually researching?', options: [
    { label: 'We do not systematically track it. We go on instinct', points: 0 },
    { label: 'Anecdotes from sales and support, passed along when someone remembers', points: 20 },
    { label: 'We pull search or intent data periodically, usually when a campaign is being planned', points: 40 },
    { label: 'A named owner reviews buyer research signals on a set cadence', points: 60 },
    { label: 'Signals from search, sales calls, and community channels are combined into one view', points: 80 },
    { label: 'Buyer research behavior is measured continuously, including questions buyers ask that nobody in the category answers yet', points: 100 },
  ] },
  { id: 'conv', dimension: 'conversionSurface', text: 'When someone engages your best content, what happens next?', options: [
    { label: 'Nothing. The content ends and the reader leaves', points: 0 },
    { label: 'A generic ask, such as book a demo or contact us, the same whatever they read', points: 20 },
    { label: 'One standard next step sitewide, such as a newsletter signup or a gated download', points: 40 },
    { label: 'A next step matched to the topic they engaged with', points: 60 },
    { label: 'A low-friction next step matched to the topic, which identifies the reader when they take it', points: 80 },
    { label: 'A diagnostic that scores the reader against what they engaged with and routes them on the result', points: 100 },
  ] },
  { id: 'trust', dimension: 'trustAtCapture', text: 'At the moment a buyer gives you their information, what do they actually receive in return?', options: [
    { label: 'Only a promise of follow-up. No value at the exchange', points: 0 },
    { label: 'Access to a generic asset anyone could find', points: 20 },
    { label: 'A useful resource, the same one everyone gets', points: 40 },
    { label: 'A resource matched to the content they came from', points: 60 },
    { label: 'Something genuinely useful delivered immediately at capture', points: 80 },
    { label: 'Something tailored to their specific situation, delivered on the spot, that they could not get elsewhere', points: 100 },
  ] },
  { id: 'signal', dimension: 'signalToSales', text: "Before a rep's first conversation with a new lead, what do they know about that account?", options: [
    { label: 'A name and an email. The rep discovers everything live', points: 0 },
    { label: 'Firmographics and the downloaded asset, nothing about where the account stands', points: 20 },
    { label: "A brief covering the account's engagement with our content", points: 40 },
    { label: 'A brief that names the gap the account is likely facing, built from their engagement', points: 60 },
    { label: 'A current account-specific brief naming the gap and the evidence behind it', points: 80 },
    { label: "A current account-specific brief naming the gap, the evidence, and the buyer's own words where they gave them", points: 100 },
  ] },
  { id: 'pov2', dimension: 'pointOfView', text: 'Where does your point of view come from, and what keeps it current?', options: [
    { label: 'Leadership opinion. Nothing tests it and nobody owns it', points: 0 },
    { label: 'Customer anecdotes and a watch on what competitors publish', points: 20 },
    { label: 'Our own sales and product data, reviewed when someone asks', points: 40 },
    { label: 'Original research, run when a launch or a campaign needs it', points: 60 },
    { label: 'A standing research program that tests our claims, with a named owner keeping them current', points: 80 },
    { label: 'Proprietary data feeds it continuously, and a named owner has revised it as the evidence moved', points: 100 },
  ] },
  { id: 'sensing2', dimension: 'buyerResearchSensing', text: 'Once you know what buyers are researching, what does that knowledge change?', options: [
    { label: 'Nothing. Publishing plans are set without it', points: 0 },
    { label: 'A topic joins the content calendar now and then', points: 20 },
    { label: 'It shapes individual campaigns. Positioning stays the same', points: 40 },
    { label: 'It shapes what we publish and how we position, reviewed on a regular cycle', points: 60 },
    { label: 'It revises the framework itself: the claims, the categories, the questions we ask', points: 80 },
    { label: 'The loop runs continuously. Recent framework changes trace back to specific buyer signals', points: 100 },
  ] },
  { id: 'conv2', dimension: 'conversionSurface', text: 'How well can you measure what your best content produces?', options: [
    { label: 'We cannot connect content engagement to pipeline at all', points: 0 },
    { label: 'We count views and downloads and report those as the result', points: 20 },
    { label: 'We estimate conversion from engagement to contact, roughly and after the fact', points: 40 },
    { label: 'We track conversion from key content to identified contacts', points: 60 },
    { label: 'We track conversion from engagement to pipeline and review it on a set cadence', points: 80 },
    { label: 'We report a defensible conversion-to-pipeline rate by asset, and it steers budget decisions', points: 100 },
  ] },
  { id: 'trust2', dimension: 'trustAtCapture', text: 'After a buyer gives you their information, what reaches them before a salesperson does?', options: [
    { label: 'A sales call within the day, whatever they asked for', points: 0 },
    { label: 'A generic nurture sequence, the same for every lead', points: 20 },
    { label: 'Follow-ups matched to the topic they engaged with', points: 40 },
    { label: 'Their own results, ahead of any sales outreach', points: 60 },
    { label: 'Their results plus a read on what they mean, before sales reaches out', points: 80 },
    { label: "A personal brief built from their answers reaches them first, and the rep's first conversation opens from it", points: 100 },
  ] },
  { id: 'signal2', dimension: 'signalToSales', text: 'How are new leads prioritized and routed to reps?', options: [
    { label: 'They land in one queue. Reps choose for themselves, with no priority order', points: 0 },
    { label: 'They are assigned by rotation or territory, with no priority order', points: 20 },
    { label: 'A score based on firmographics alone sets the order', points: 40 },
    { label: 'Engagement and fit set the order', points: 60 },
    { label: 'Prioritized on consistent criteria and routed to the right rep before first contact', points: 80 },
    { label: 'Prioritized on consistent criteria, routed with a current brief before first contact, and reviewed when a handoff misses', points: 100 },
  ] },
];

// Archetype blurbs. The 2x2 is UPSTREAM (Point of View + Buyer Research Sensing,
// the strategy cluster) x DOWNSTREAM (Conversion Surface + Trust at Capture +
// Signal to Sales, the execution cluster).
//
// Coherence rules baked into the prose:
//   - Publisher and Authority require upstreamHigh, so they may claim STRATEGY
//     (a point of view AND the sensing loop behind it), never just point of view.
//   - Renter, Operator, and Authority must be CLUSTER-SILENT: upstreamHigh /
//     downstreamHigh are aggregates and never guarantee any single downstream
//     dimension (conversion / trust / signal) works, so these blurbs may not
//     claim a specific downstream dimension is strong.
export const archetypes = {
  renter: { key: 'renter', label: 'The Renter', blurb: "Buyers read your content, then research the problem using someone else's framework. That framework sets the vocabulary, shapes the shortlist, and earns the referral. Until you own the framework buyers research against and read what they are researching, your content spend builds authority for whoever does." },
  publisher: { key: 'publisher', label: 'The Publisher', blurb: 'You have built real strategy: a point of view the market engages with and a read on what your buyers are researching. The gap is downstream. The path from earned attention to identifiable, sales-ready pipeline is not closing the distance the strategy has already opened.' },
  operator: { key: 'operator', label: 'The Operator', blurb: 'You have built a broadly strong downstream engine. The structural gap is upstream. You compete on a framework someone else defined, and you are not systematically reading what buyers research, which means a well-resourced rival can claim the category position you are currently borrowing.' },
  authority: { key: 'authority', label: 'The Authority', blurb: 'You own the framework buyers research against, you read what they are researching and feed it back, and the rest of your engine is broadly strong. That combination is hard to build and harder to sustain. The question is how quickly you can deepen the position before a well-resourced rival makes it worth challenging.' },
};
