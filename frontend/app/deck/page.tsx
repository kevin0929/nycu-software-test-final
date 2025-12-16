"use client";

import { useState } from "react";
import { NavigationBar } from "@/components/NavigationBar";
import { FlipCard } from "@/components/FlipCard";
import { useDeck } from "@/hooks/useDeck";

export default function DeckPage() {
  const { cards, removeCard, initialized } = useDeck();
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  };

  return (
    <div className="flex min-h-screen bg-[#f5f5f7] text-slate-900">
      <NavigationBar />

      <main className="flex-1 bg-[#fdfdfd] px-8 py-10 sm:px-12 lg:px-16">
        <div className="max-w-4xl">
          <p className="text-xs uppercase tracking-[0.35em] text-red-600/80">
            Deck
          </p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight text-slate-900">
            Your Deck
          </h1>
          <p className="mt-3 text-lg text-slate-600">
            Cards you saved while browsing lyrics.
          </p>

          <div className="mt-12">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                {cards.length} cards
              </span>
            </div>

            {!initialized ? (
              <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
                Loading your deck...
              </div>
            ) : cards.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-slate-600">
                No cards yet. Add some from the lyrics suggestions.
              </div>
            ) : (
              <div className="mt-6 grid auto-rows-fr gap-5 md:grid-cols-3">
                {cards.map((card) => (
                  <div key={card.id} className="relative">
                    <FlipCard card={card} />

                    <div className="absolute right-3 bottom-3">
                      <button
                        type="button"
                        className="rounded-full bg-white/90 p-2 text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-100"
                        onClick={() =>
                          setMenuOpenId((prev) => (prev === card.id ? null : card.id))
                        }
                        aria-label="Card actions"
                      >
                        <DotsIcon />
                      </button>

                      {menuOpenId === card.id && (
                        <div className="absolute bottom-12 right-0 w-36 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                          <button
                            type="button"
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                            onClick={() => {
                              removeCard(card.id);
                              setMenuOpenId(null);
                              showToast("Card deleted");
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {toast && (
        <div className="pointer-events-none fixed bottom-6 left-6 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-2xl">
          {toast}
        </div>
      )}
    </div>
  );
}

function DotsIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden
    >
      <circle cx="12" cy="5" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="12" cy="19" r="1.5" />
    </svg>
  );
}
