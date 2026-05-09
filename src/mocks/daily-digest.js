export const executiveBriefing = {
  title: "Market Intelligence Summary",
  body:
    "Bawarchi introduced three new chef specials this week with aggressive lunch pricing, pulling share-of-voice up 18% in your delivery radius. Urban Grill held steady while Pasta Palace tested a limited prix fixe—overall competitive intensity is up versus last period.",
  metrics: [
    { label: "Threat level", value: "Elevated", valueClass: "text-red-600" },
    { label: "Market sentiment", value: "Neutral", valueClass: "text-teal-600" },
    { label: "Active alerts", value: "12", valueClass: "text-[#2D2926]" },
  ],
};

export const aiCta = {
  title: "Ask DineIntel AI",
  subtitle: "Need a deep dive into the Bawarchi menu impact?",
  buttonLabel: "Start AI Chat",
};

export const competitorActivity = [
  {
    id: "a1",
    detailSlug: "bawarchi",
    accent: "red",
    competitor: "Bawarchi",
    statusLabel: "Critical Shift",
    statusIcon: "trend-down",
    whatChangedTitle: "New menu item",
    whatChangedBody:
      "Launched a $12.99 lunch thali bundle on UberEats and DoorDash with front-page placement in your zone.",
    whyItMatters:
      "Directly overlaps with your top-selling combo and may compress margin on lunch dayparts.",
    responseBadge: "Defend",
    responseBadgeClass: "bg-red-100 text-red-800 border-red-200",
    responseNote: "Counter-promo or bundle refresh within 48 hours recommended.",
  },
  {
    id: "a2",
    detailSlug: "urban-grill",
    accent: "amber",
    competitor: "Urban Grill",
    statusLabel: "Watch",
    statusIcon: "activity",
    whatChangedTitle: "Happy hour extension",
    whatChangedBody:
      "Extended drink specials by 90 minutes Thu–Sat; social mentions up 22% week over week.",
    whyItMatters:
      "Could siphon evening foot traffic from your bar seating during peak weekend windows.",
    responseBadge: "Watch",
    responseBadgeClass: "bg-amber-100 text-amber-900 border-amber-200",
    responseNote: "Monitor cover counts; consider targeted local ads if trend holds.",
  },
  {
    id: "a3",
    detailSlug: "pasta-palace",
    accent: "zinc",
    competitor: "Pasta Palace",
    statusLabel: "Stable",
    statusIcon: "minus",
    whatChangedTitle: "No material change",
    whatChangedBody:
      "Menu and pricing unchanged; one-off catering promo detected outside your core trade area.",
    whyItMatters: "Low immediate risk; keep on routine monitoring cadence.",
    responseBadge: "Hold",
    responseBadgeClass: "bg-zinc-100 text-zinc-700 border-zinc-200",
    responseNote: "No action required unless they expand delivery radius.",
  },
];

export const pricingVolatilityData = [
  { label: "Week 1", you: 2.1, bawarchi: 3.4 },
  { label: "Week 2", you: 2.4, bawarchi: 4.1 },
  { label: "Week 3", you: 2.8, bawarchi: 5.2 },
  { label: "Week 4", you: 3.1, bawarchi: 6.0 },
  { label: "Week 5", you: 3.5, bawarchi: 6.8 },
  { label: "Week 6", you: 3.9, bawarchi: 7.4 },
];
