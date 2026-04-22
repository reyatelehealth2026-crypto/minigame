export const PP_THEME = {
  bg: {
    deep: "#063A2A",
    forest: "#0F5A3D",
    velvet: "#0A4632",
    night: "#03261C",
  },
  gold: {
    champagne: "#D4AF7A",
    warm: "#E8C994",
    deep: "#9C7A3F",
    glow: "rgba(212, 175, 122, 0.45)",
  },
  ink: {
    cream: "#F5EFE0",
    muted: "#C8C0A8",
    deep: "#1A2520",
  },
  glass: "rgba(245,239,224,0.08)",
  border: "rgba(212,175,122,0.4)",
} as const;

export const PP_GRADIENTS = {
  page: "linear-gradient(180deg, #063A2A 0%, #0F5A3D 50%, #03261C 100%)",
  card: "linear-gradient(180deg, rgba(245,239,224,0.06), rgba(245,239,224,0.02))",
  goldButton:
    "linear-gradient(180deg, #E8C994 0%, #D4AF7A 50%, #9C7A3F 100%)",
  goldShimmer:
    "linear-gradient(120deg, transparent 30%, rgba(255,245,220,0.55) 48%, transparent 60%)",
} as const;

export type RewardTier = "standard" | "premium";

export function classifyReward(title: string): RewardTier {
  const amount = Number(title.match(/\d+/)?.[0] ?? 0);
  return amount >= 100 ? "premium" : "standard";
}
