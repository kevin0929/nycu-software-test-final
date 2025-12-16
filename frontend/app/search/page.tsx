"use client";

import Image from "next/image";
import { useState } from "react";
import { NavigationBar } from "@/components/NavigationBar";
import { SearchBar } from "@/components/search/SearchBar";
import { SearchResult } from "@/types/search";

export default function SearchPage() {
  const [selected, setSelected] = useState<SearchResult | null>(null);

  return (
    <div className="flex min-h-screen bg-[#f5f5f7] text-slate-900">
      <NavigationBar />

      <main className="flex-1 bg-[#fdfdfd] px-8 py-10 sm:px-12 lg:px-16">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.35em] text-red-600/80">
            Search
          </p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight text-slate-900">
            Find something new
          </h1>
          <p className="mt-3 text-lg text-slate-600">
            Explore episodes and artists, then add them to your deck.
          </p>

          <div className="mt-8 w-full flex justify-center items-center">
            <SearchBar maxResults={5} onSelect={(item) => setSelected(item)} />
          </div>

          {selected && (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-[0_14px_28px_rgba(0,0,0,0.08)]">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-slate-100">
                  <Image
                    src={selected.albumImageUrl}
                    alt={`${selected.song} album cover`}
                    fill
                    sizes="48px"
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-900">
                    {selected.song}
                  </span>
                  <span>{selected.artist}</span>
                </div>
                <span className="ml-auto rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                  Selected
                </span>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
