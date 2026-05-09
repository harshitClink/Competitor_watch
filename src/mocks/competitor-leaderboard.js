export const leaderboardMeta = {
  portfolioLabel: "PORTFOLIO SNAPSHOT",
  title: "Competitor Leaderboard",
  subtitle:
    "Tracking 12 local competitors across 4 intelligence vectors. Your pilot location 'The Golden Spatula' is currently maintaining a defensive lead.",
  globalHealth: {
    label: "GLOBAL HEALTH INDEX",
    value: "84.2",
    delta: "+2.4%",
    progress: 0.92,
  },
  rankingsTitle: "Rankings",
  updatedAgo: "UPDATED 4M AGO",
  totalEntities: 12,
  showingCount: 4,
};

export const leaderboardRows = [
  {
    rank: "01",
    slug: "the-golden-spatula",
    name: "The Golden Spatula",
    pilot: true,
    location: "Downtown Core • Fine Dining",
    healthScore: 94.8,
    delta: 1.2,
    deltaDirection: "up",
    headline: "Maintaining dominance via price-stability.",
    risk: "DEFEND",
    riskVariant: "teal",
  },
  {
    rank: "02",
    slug: "bistro-22",
    name: "Bistro 22",
    pilot: false,
    location: "Westside • Casual Contemporary",
    healthScore: 89.2,
    delta: -0.4,
    deltaDirection: "down",
    headline: "Supply chain friction impacting margin.",
    risk: "IGNORE",
    riskVariant: "grey",
  },
  {
    rank: "03",
    slug: "the-iron-grill",
    name: "The Iron Grill",
    pilot: false,
    location: "Downtown Core • Steakhouse",
    healthScore: 84.1,
    delta: 4.8,
    deltaDirection: "up",
    headline: "New seasonal menu gaining traction.",
    risk: "WATCH",
    riskVariant: "watch",
  },
  {
    rank: "04",
    slug: "lessence",
    name: "L'Essence",
    pilot: false,
    location: "Riverfront • French Cuisine",
    healthScore: 78.5,
    delta: 0,
    deltaDirection: "flat",
    headline: "Static performance post-executive exit.",
    risk: "IGNORE",
    riskVariant: "grey",
  },
];

export const bottomCards = {
  marketShare: {
    label: "MARKET SHARE",
    pilotPct: 38,
    caption:
      "You currently hold 38% of the local high-end dining market, up from 36% last quarter.",
  },
  riskHeatmap: {
    label: "RISK HEATMAP",
    caption: "3 Emerging threats detected in the 5km radius cluster.",
    image:
      "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=60",
  },
  aiRecommendation: {
    label: "AI RECOMMENDATION",
    title: "Targeted Retention.",
    body:
      "Competitive analysis suggests an aggressive loyalty campaign targeting L'Essence regulars could yield a 5% shift in weekend foot traffic.",
    cta: "EXECUTE AI STRATEGY",
  },
};
