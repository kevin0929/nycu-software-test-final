import { useEffect, useState } from "react";
import { type Card } from "@/components/FlipCard";

const STORAGE_KEY = "kashi:deck";
const DEFAULT_LIMIT = 40;

export type AddDeckResult =
  | { ok: true }
  | { ok: false; reason: "limit" | "duplicate" | "uninitialized" };

export function useDeck(limit: number = DEFAULT_LIMIT) {
  const [cards, setCards] = useState<Card[]>([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setCards(JSON.parse(stored));
      } catch (error) {
        console.warn("Failed to parse deck from localStorage", error);
      }
    }
    setInitialized(true);
  }, []);

  const persist = (next: Card[]) => {
    setCards(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
  };

  const addCard = (card: Card): AddDeckResult => {
    if (!initialized) {
      return { ok: false, reason: "uninitialized" };
    }

    let result: AddDeckResult = { ok: false, reason: "uninitialized" };

    setCards((prev) => {
      if (prev.length >= limit) {
        result = { ok: false, reason: "limit" };
        return prev;
      }

      if (prev.some((item) => item.id === card.id && item.term === card.term)) {
        result = { ok: false, reason: "duplicate" };
        return prev;
      }

      const next = [...prev, card];
      result = { ok: true };
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      }
      return next;
    });

    return result;
  };

  const removeCard = (id: number) => {
    setCards((prev) => {
      const next = prev.filter((item) => item.id !== id);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      }
      return next;
    });
  };

  return {
    cards,
    initialized,
    remaining: Math.max(0, limit - cards.length),
    addCard,
    removeCard,
    limit,
  };
}
