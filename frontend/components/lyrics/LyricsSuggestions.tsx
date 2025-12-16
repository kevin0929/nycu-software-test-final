"use client";

import { useMemo, useState } from "react";
import { type Card } from "@/components/FlipCard";
import { useDeck } from "@/hooks/useDeck";

type Props = {
  suggestions: Card[];
};

type DifficultyFilter = "all" | Card["difficulty"];
type ToastState =
  | { kind: "success" | "error" | "info"; message: string }
  | null;

export function LyricsSuggestions({ suggestions }: Props) {
  const [filter, setFilter] = useState<DifficultyFilter>("all");
  const [toast, setToast] = useState<ToastState>(null);
  const { addCard, cards, limit } = useDeck();

  const filtered = useMemo(() => {
    if (filter === "all") return suggestions;
    return suggestions.filter((item) => item.difficulty === filter);
  }, [filter, suggestions]);

  const dismissAfterDelay = () => {
    window.setTimeout(() => setToast(null), 2400);
  };

  const handleAdd = (card: Card) => {
    const result = addCard(card);
    if (!result.ok) {
      if (result.reason === "limit") {
        setToast({
          kind: "error",
          message: `Deck limit reached (${limit} cards). Remove some cards before adding more.`,
        });
      } else if (result.reason === "duplicate") {
        setToast({ kind: "info", message: "Card is already in your deck." });
      } else {
        setToast({ kind: "error", message: "Deck not ready yet. Try again." });
      }
      dismissAfterDelay();
      return;
    }

    setToast({ kind: "success", message: "Added to deck." });
    dismissAfterDelay();
  };

  const isInDeck = (id: number) => cards.some((c) => c.id === id);

  return (
    <aside className="relative flex flex-col rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_14px_28px_rgba(0,0,0,0.08)] lg:max-h-[calc(100vh-180px)] lg:overflow-y-auto">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-red-500">Words</p>
          <h3 className="text-lg font-semibold text-slate-900">Suggested cards</h3>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as DifficultyFilter)}
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 shadow-sm"
        >
          <option value="all">All</option>
          <option value="N4~N5">N4~N5</option>
          <option value="N3">N3</option>
          <option value="N1~N2">N1~N2</option>
        </select>
      </div>

      <div className="mt-4 space-y-3">
        {filtered.map((item) => {
          const alreadyAdded = isInDeck(item.id);
          return (
            <div
              key={`${item.id}-${item.term}`}
              className="rounded-2xl border border-slate-100 bg-[var(--surface-muted,#f8fafc)] p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-800">
                  {item.term}
                </span>
                <span className="rounded-full bg-slate-200 px-2.5 py-1 text-[0.7rem] font-semibold text-slate-700">
                  {item.difficulty}
                </span>
              </div>
              <p className="text-sm text-red-600">{item.reading}</p>
              <p className="mt-2 text-sm text-slate-700">{item.meaning}</p>
              <p className="mt-2 text-xs text-slate-500">{item.usage}</p>
              <p className="text-xs text-slate-500">→ {item.translation}</p>
              <button
                type="button"
                onClick={() => handleAdd(item)}
                disabled={alreadyAdded}
                className={`mt-3 w-full rounded-xl px-3 py-2 text-sm font-semibold transition ${
                  alreadyAdded
                    ? "cursor-not-allowed bg-slate-200 text-slate-500"
                    : "bg-red-500 text-white hover:bg-red-600"
                }`}
              >
                {alreadyAdded ? "Added" : "Add to deck"}
              </button>
            </div>
          );
        })}
      </div>

      {toast && (
        <div
          className={`pointer-events-none absolute left-4 right-4 bottom-4 rounded-xl px-4 py-3 text-sm font-semibold shadow-lg ${
            toast.kind === "success"
              ? "bg-emerald-50 text-emerald-700"
              : toast.kind === "info"
              ? "bg-blue-50 text-blue-700"
              : "bg-amber-50 text-amber-700"
          }`}
        >
          {toast.message}
        </div>
      )}
    </aside>
  );
}
