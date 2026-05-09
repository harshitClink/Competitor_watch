export const nearbyRecommendations = [
  {
    id: "r1",
    category: "Fine dining",
    name: "The Gilded Fork",
    rating: 4.8,
    distance: "0.4 miles away",
    price: "$$$$",
    footerLabel: "Trending: +12%",
    footerClass: "text-emerald-600 font-semibold",
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "r2",
    category: "Bistro",
    name: "Urban Greens",
    rating: 4.6,
    distance: "0.6 miles away",
    price: "$$$",
    footerLabel: "Volume: High",
    footerClass: "text-red-600 font-semibold",
    image:
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "r3",
    category: "Asian fusion",
    name: "Sakura Zen",
    rating: 4.9,
    distance: "0.8 miles away",
    price: "$$$$",
    footerLabel: "Defend status",
    footerClass: "text-teal-700 font-semibold",
    image:
      "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80",
  },
];

export const trackedCompetitors = [
  {
    id: "t1",
    name: "Blue Lagoon",
    status: "WATCH",
    statusClass: "text-amber-800 bg-amber-50 border-amber-200",
    icon: "utensils",
  },
  {
    id: "t2",
    name: "Espresso Lab",
    status: "DEFEND",
    statusClass: "text-red-800 bg-red-50 border-red-200",
    icon: "coffee",
  },
  {
    id: "t3",
    name: "Crust & Co.",
    status: "IGNORE",
    statusClass: "text-zinc-700 bg-zinc-100 border-zinc-200",
    icon: "chef",
  },
];

export const trackedMeta = {
  title: "Currently tracked",
  subtitle: "You are monitoring 4 out of 10 competitors in your current plan.",
  avatarOverflow: "+1",
};
