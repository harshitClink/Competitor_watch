/** @param {string} slug */
export function getCompetitorDetailHeader(slug) {
  const headers = {
    "the-butchers-table": {
      breadcrumbName: "THE BUTCHER'S TABLE",
      title: "The Butcher's Table",
      badge: "DEFEND",
      subtitle: "Premium Steakhouse | 0.4 miles away | Upper West Side",
    },
    "atlantic-social": {
      breadcrumbName: "ATLANTIC SOCIAL",
      title: "Atlantic Social",
      badge: "WATCH",
      subtitle: "Contemporary Fusion | 0.4 mi • Downtown",
    },
    "harbor-vine": {
      breadcrumbName: "HARBOR & VINE",
      title: "Harbor & Vine",
      badge: "DEFEND",
      subtitle: "Seafood Bistro | 1.1 mi • Waterfront",
    },
    "north-end-kitchen": {
      breadcrumbName: "NORTH END KITCHEN",
      title: "North End Kitchen",
      badge: "WATCH",
      subtitle: "Italian | 0.9 mi • Little Italy",
    },
    "velvet-lounge": {
      breadcrumbName: "VELVET LOUNGE",
      title: "Velvet Lounge",
      badge: "IGNORE",
      subtitle: "Cocktail Bar | 1.3 mi • Arts District",
    },
    "saffron-street": {
      breadcrumbName: "SAFFRON STREET",
      title: "Saffron Street",
      badge: "WATCH",
      subtitle: "Modern Indian | 0.6 mi • Midtown",
    },
    "the-golden-spatula": {
      breadcrumbName: "THE GOLDEN SPATULA",
      title: "The Golden Spatula",
      badge: "PILOT",
      subtitle: "Fine Dining | Downtown Core",
    },
    "bistro-22": {
      breadcrumbName: "BISTRO 22",
      title: "Bistro 22",
      badge: "IGNORE",
      subtitle: "Casual Contemporary | Westside",
    },
    "the-iron-grill": {
      breadcrumbName: "THE IRON GRILL",
      title: "The Iron Grill",
      badge: "WATCH",
      subtitle: "Steakhouse | Downtown Core",
    },
    "lessence": {
      breadcrumbName: "L'ESSENCE",
      title: "L'Essence",
      badge: "IGNORE",
      subtitle: "French Cuisine | Riverfront",
    },
    bawarchi: {
      breadcrumbName: "BAWARCHI",
      title: "Bawarchi",
      badge: "DEFEND",
      subtitle: "Indian | Delivery-heavy zone",
    },
    "urban-grill": {
      breadcrumbName: "URBAN GRILL",
      title: "Urban Grill",
      badge: "WATCH",
      subtitle: "American Grill | Capitol adjacent",
    },
    "pasta-palace": {
      breadcrumbName: "PASTA PALACE",
      title: "Pasta Palace",
      badge: "HOLD",
      subtitle: "Italian | Suburban corridor",
    },
  };

  const fallback = headers["the-butchers-table"];
  if (!slug) return fallback;
  const key = slug.toLowerCase().replace(/'/g, "").replace(/\s+/g, "-");
  return headers[key] || {
    ...fallback,
    breadcrumbName: slug.replace(/-/g, " ").toUpperCase(),
    title: slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" "),
    badge: "WATCH",
    subtitle: "Tracked competitor | Intelligence profile",
  };
}

export const threatAssessment = {
  overlapPct: "88%",
  overlapDelta: "+5.2% vs last month",
  metrics: [
    { label: "Menu similarity", value: 92 },
    { label: "Price convergence", value: 74 },
    { label: "Geo-proximity", value: 100 },
  ],
  insight:
    "Direct competitor targeting your prime dinner audience. High risk of guest churn due to similar pricing tiers.",
};

export const ratingTrendData = [
  { month: "JAN", competitor: 4.1, market: 3.95 },
  { month: "FEB", competitor: 4.15, market: 3.98 },
  { month: "MAR", competitor: 4.25, market: 4.0 },
  { month: "APR", competitor: 4.35, market: 4.02 },
  { month: "MAY", competitor: 4.45, market: 4.05 },
  { month: "JUN", competitor: 4.55, market: 4.08 },
];

export const ratingSummary = {
  sentiment: { label: "Sentiment", value: "Positive", sub: "Service & ambience", tone: "teal" },
  reviewVolume: { label: "Review volume", value: "1,248", delta: "+12% this week", deltaClass: "text-red-600" },
  avgRating: { label: "Avg rating", value: "4.6 ★", sub: "0.2 higher than pilot" },
};

export const menuActivity = [
  {
    id: "m1",
    name: "Wagyu Ribeye (16oz)",
    status: "REPRICED",
    date: "JUN 14",
    priceLine: "$68.00 → $74.00",
    tag: "MARGIN PUSH",
    tagClass: "bg-red-100 text-red-800 border-red-200",
  },
  {
    id: "m2",
    name: "Heirloom Tomato Salad",
    status: "ADDED",
    date: "JUN 12",
    priceLine: "$18.00",
    tag: "SEASONAL",
    tagClass: "bg-teal-50 text-teal-900 border-teal-200",
  },
  {
    id: "m3",
    name: "Truffle Pommes Frites",
    status: "REMOVED",
    date: "JUN 08",
    priceLine: "—",
    tag: "MENU TRIM",
    tagClass: "bg-zinc-100 text-zinc-700 border-zinc-200",
  },
];

export const priceBands = [
  { category: "Appetizers", pilot: 72, competitor: 58 },
  { category: "Main course", pilot: 85, competitor: 78 },
  { category: "Desserts", pilot: 45, competitor: 52 },
  { category: "Wine", pilot: 90, competitor: 65 },
];

export const priceBandFooter = {
  avgTicket: "$94.50",
  premiumGap: "+18.4%",
};

export const intelligenceSignals = [
  {
    id: "s1",
    filter: "operational",
    title: "Wait time increase reported",
    body: "Peak dinner wait times rose from ~25 min to 45 min across Yelp and Google reviews in the last 10 days.",
    icon: "amber",
  },
  {
    id: "s2",
    filter: "social",
    title: "'Secret menu' Instagram campaign",
    body: "Influencer-led reels targeting local foodies; estimated 240K impressions and strong save rate.",
    icon: "blue",
  },
  {
    id: "s3",
    filter: "operational",
    title: "Hiring: Executive pastry chef",
    body: "New job posting suggests dessert program expansion and possible afternoon tea service.",
    icon: "red",
  },
];
