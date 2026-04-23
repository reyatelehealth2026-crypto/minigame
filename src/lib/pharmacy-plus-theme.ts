export const PP_THEME = {
  bg: {
    deep: "#F1E6CC",
    forest: "#F5EDD8",
    velvet: "#E8D9B5",
    night: "#E1D0A5",
  },
  gold: {
    champagne: "#B8944A",
    warm: "#C9A55E",
    deep: "#8A6A2E",
    glow: "rgba(184,148,74,0.35)",
  },
  ink: {
    cream: "#F5EDD8",
    muted: "#7A6A4E",
    deep: "#3A2A18",
  },
  herb: {
    sage: "#6B7E5A",
    forest: "#2E4A33",
    sprig: "#8FA074",
  },
  burgundy: {
    wine: "#8E3B53",
    seal: "#A2243B",
  },
  glass: "rgba(58,42,24,0.06)",
  border: "rgba(58,42,24,0.35)",
} as const;

export const PP_GRADIENTS = {
  page: "linear-gradient(180deg, #F5EDD8 0%, #F1E6CC 50%, #E8D9B5 100%)",
  card: "linear-gradient(180deg, rgba(255,250,235,0.65), rgba(241,230,204,0.35))",
  goldButton:
    "linear-gradient(180deg, #C9A55E 0%, #B8944A 55%, #8A6A2E 100%)",
  goldShimmer:
    "linear-gradient(120deg, transparent 30%, rgba(247,230,190,0.7) 48%, transparent 60%)",
} as const;

export type RewardTier = "standard" | "premium";

export function classifyReward(title: string): RewardTier {
  const amount = Number(title.match(/\d+/)?.[0] ?? 0);
  return amount >= 100 ? "premium" : "standard";
}
