/** Static assistant payload — returned for every user message (mock). */
export const staticAiAnalysis = {
  sectionLabel: "MARKET INTELLIGENCE ANALYSIS",
  body:
    "Bawarchi is demonstrating strong resilience in the current quarter. Their performance indicators suggest a strategic shift towards high-margin premium offerings, leading to a significant increase in Average Order Value (AOV).",
  metrics: [
    {
      label: "Monthly Revenue",
      value: "$142.5K",
      delta: "+12%",
      deltaClass: "text-red-600",
    },
    {
      label: "Order Volume",
      value: "3.8K",
      delta: "-4%",
      deltaClass: "text-teal-600",
    },
    {
      label: "Sentiment Score",
      value: "4.8",
      badge: "EXCELLENT",
      badgeClass: "bg-teal-100 text-teal-800 border border-teal-200/80",
    },
  ],
  recommendationsTitle: "Strategic Recommendations",
  recommendations: [
    {
      n: 1,
      variant: "gold",
      text: "Aggressive Defensive Positioning: Bawarchi's 'weekend specials' are capturing 15% of your core demographic. Consider a loyalty-based dinner incentive on Fridays.",
    },
    {
      n: 2,
      variant: "grey",
      text: "Price Sensitivity Watch: Their recent 5% hike has not deterred customers. This indicates a low price elasticity in your shared delivery zone.",
    },
  ],
};
