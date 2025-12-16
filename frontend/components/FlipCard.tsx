"use client";

import { useState } from "react";

export type Card = {
  id: number;
  term: string;
  reading: string;
  part: string;
  meaning: string;
  usage: string;
  translation: string;
  difficulty: "N4~N5" | "N3" | "N1~N2";
};

interface FlipCardProps {
  card: Card;
}

export function FlipCard({ card }: FlipCardProps) {
  const [flipped, setFlipped] = useState(false);
  const difficultyStyles: Record<Card["difficulty"], { bg: string; text: string }> =
    {
      "N4~N5": { bg: "bg-emerald-50", text: "text-emerald-700" },
      N3: { bg: "bg-amber-50", text: "text-amber-700" },
      "N1~N2": { bg: "bg-red-50", text: "text-red-700" },
    };

  return (
    <button
      type="button"
      onClick={() => setFlipped((prev) => !prev)}
      className="group relative flex h-full min-h-[280px] w-full cursor-pointer rounded-2xl border border-slate-200 text-left outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
      aria-pressed={flipped}
    >
      <div
        className="relative flex h-full w-full rounded-2xl"
        style={{ perspective: "1200px" }}
      >
        <div
          className={`relative h-full w-full rounded-2xl transition-transform duration-500 ease-out [transform-style:preserve-3d] ${
            flipped ? "[transform:rotateY(180deg)]" : ""
          }`}
        >
          <div className="absolute inset-0 flex flex-col rounded-2xl bg-white p-4 shadow-[0_12px_26px_rgba(0,0,0,0.06)] [backface-visibility:hidden]">
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span className="font-semibold text-slate-700">{card.part}</span>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${difficultyStyles[card.difficulty].bg} ${difficultyStyles[card.difficulty].text}`}
                >
                  {card.difficulty}
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                  Card {card.id}
                </span>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-3xl font-semibold text-slate-900">
                {card.term}
              </p>
              <p className="mt-1 text-lg text-red-600">{card.reading}</p>
              <p className="mt-4 text-sm text-slate-600">{card.meaning}</p>
            </div>

            <p className="mt-auto text-xs uppercasetext-slate-400">
              Front
            </p>
          </div>

          <div className="absolute inset-0 flex flex-col rounded-2xl border border-red-100 bg-red-50 p-4 text-slate-900 shadow-inner [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <p className="text-xs uppercase text-red-600">
              Back
            </p>

            <div className="mt-3 space-y-2 text-sm">
              <p className="font-semibold text-slate-900">Example</p>
              <p className="rounded-xl bg-white/60 px-3 py-2 text-slate-800 shadow-inner">
                {card.usage}
              </p>
              <p className="text-slate-700">→ {card.translation}</p>
            </div>

            <p className="mt-auto text-xs text-red-500">Click to flip back</p>
          </div>
        </div>
      </div>
    </button>
  );
}
