"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Profile = {
  userId: string;
  displayName: string;
  pictureUrl?: string;
} | null;

type Friendship = { friendFlag: boolean } | null;

type LiffInstance = {
  init: (options: { liffId: string }) => Promise<void>;
  isLoggedIn: () => boolean;
  getProfile: () => Promise<NonNullable<Profile>>;
  getFriendship?: () => Promise<NonNullable<Friendship>>;
  login: () => void;
  logout: () => void;
};

type LiffCtx = {
  ready: boolean;
  loggedIn: boolean;
  profile: Profile;
  friendship: Friendship;
  error: string | null;
  login: () => void;
  logout: () => void;
  refreshFriendship: () => Promise<Friendship>;
};

const Ctx = createContext<LiffCtx>({
  ready: false,
  loggedIn: false,
  profile: null,
  friendship: null,
  error: null,
  login: () => {},
  logout: () => {},
  refreshFriendship: async () => null,
});

export function LiffProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [profile, setProfile] = useState<Profile>(null);
  const [friendship, setFriendship] = useState<Friendship>(null);
  const [error, setError] = useState<string | null>(null);
  const [liff, setLiff] = useState<LiffInstance | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
        if (!liffId) throw new Error("NEXT_PUBLIC_LIFF_ID is not set");
        const mod = await import("@line/liff");
        const L = mod.default;
        await L.init({ liffId });
        if (!mounted) return;
        setLiff(L);
        const isLoggedIn = L.isLoggedIn();
        setLoggedIn(isLoggedIn);
        if (isLoggedIn) {
          const p = await L.getProfile();
          setProfile(p);
          try {
            const f = await L.getFriendship?.();
            setFriendship(f ?? null);
          } catch {
            setFriendship(null);
          }
        }
      } catch (e: unknown) {
        if (mounted) setError(e instanceof Error ? e.message : "LIFF init failed");
      } finally {
        if (mounted) setReady(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Ctx.Provider
      value={{
        ready,
        loggedIn,
        profile,
        friendship,
        error,
        login: () => liff?.login(),
        logout: () => liff?.logout(),
        refreshFriendship: async () => {
          try {
            const f = await liff?.getFriendship?.();
            const nextFriendship = f ?? null;
            setFriendship(nextFriendship);
            return nextFriendship;
          } catch {
            setFriendship(null);
            return null;
          }
        },
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useLiff() {
  return useContext(Ctx);
}
