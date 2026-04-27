const BASE = "/images/gacha";

export const ASSETS = {
  bg: {
    stage: `${BASE}/game-stage-bg.png`,
    hills: `${BASE}/game-hills-landscape.png`,
    poster: `${BASE}/full-event-poster.png`,
  },
  machine: {
    full: `${BASE}/game-machine-main.png`,
    empty: `${BASE}/game-machine-empty.png`,
  },
  mascots: {
    cat: `${BASE}/game-cat-mascot.png`,
    monkey: `${BASE}/game-monkey-mascot.png`,
    bird: `${BASE}/game-bird-mascot.png`,
  },
  capsules: {
    blue: `${BASE}/game-capsule-blue.png`,
    pink: `${BASE}/game-capsule-pink.png`,
    yellowRare: `${BASE}/game-capsule-yellow-rare.png`,
    cluster: `${BASE}/game-capsule-cluster.png`,
    eggPatterns: `${BASE}/game-pet-egg-patterns.png`,
    loadingEgg: `${BASE}/game-loading-egg.png`,
  },
  rewards: {
    popup: `${BASE}/game-reward-popup.png`,
    cardCommon: `${BASE}/game-reward-card-common.png`,
    cardRare: `${BASE}/game-reward-card-rare.png`,
    ticketCoupon: `${BASE}/game-ticket-coupon.png`,
    glow: `${BASE}/game-prize-glow.png`,
  },
  currency: {
    coin: `${BASE}/game-single-coin.png`,
    coinPile: `${BASE}/game-coin-pile.png`,
    diamonds: `${BASE}/game-diamond-cluster.png`,
    giftBox: `${BASE}/game-gift-box.png`,
  },
  ui: {
    playButton: `${BASE}/game-play-button.png`,
    logoSign: `${BASE}/game-logo-wood-sign.png`,
    subtitlePlank: `${BASE}/game-subtitle-wood-plank.png`,
    infoBanner: `${BASE}/game-bottom-info-banner.png`,
    storeButton: `${BASE}/game-small-store-button.png`,
    woodFrame: `${BASE}/game-wood-frame-foreground.png`,
    confetti: `${BASE}/game-confetti.png`,
  },
  props: {
    shop: `${BASE}/game-building-shop.png`,
    school: `${BASE}/game-building-school.png`,
    trees: `${BASE}/game-tree-bush-set.png`,
    fence: `${BASE}/game-fence.png`,
  },
} as const;

export type CapsuleColor = "blue" | "pink" | "yellowRare";

export const CAPSULE_COLORS: CapsuleColor[] = ["blue", "pink", "yellowRare"];

export function capsuleAsset(color: CapsuleColor): string {
  return ASSETS.capsules[color];
}

export function rewardCardAsset(isPremium: boolean): string {
  return isPremium ? ASSETS.rewards.cardRare : ASSETS.rewards.cardCommon;
}

export type MascotType = "cat" | "monkey" | "bird";

export function mascotAsset(mascot: MascotType): string {
  return ASSETS.mascots[mascot];
}

export function preloadCriticalAssets(): void {
  const critical = [
    ASSETS.bg.poster,
    ASSETS.machine.full,
    ASSETS.mascots.cat,
    ASSETS.capsules.blue,
    ASSETS.capsules.pink,
    ASSETS.capsules.yellowRare,
    ASSETS.ui.playButton,
    ASSETS.ui.logoSign,
  ];
  critical.forEach((src) => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = src;
    document.head.appendChild(link);
  });
}
