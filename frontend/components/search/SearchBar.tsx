"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";
import { useSearchSuggestions } from "@/hooks/useSearchSuggestions";
import { SearchResult } from "@/types/search";

interface SearchBarProps {
  maxResults?: number;
  onSelect?: (item: SearchResult) => void;
}

export function SearchBar({ maxResults = 5, onSelect }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const { data } = useSearchSuggestions(debouncedSearchQuery, maxResults);

  const suggestions = useMemo(() => data ?? [], [data]);
  const showDropdown =
    isFocused && searchQuery.trim().length > 0 && suggestions.length > 0;

  const handleSelect = (item: SearchResult) => {
    setQuery(`${item.song} — ${item.artist}`);
    setIsFocused(false);
    setActiveIndex(-1);
    onSelect?.(item);
    router.push(`/lyrics/${item.id}`);
  };

  const triggerSearch = () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setSearchQuery(trimmed);
    setActiveIndex(-1);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      triggerSearch();
      return;
    }

    if (!suggestions.length) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((prev) => (prev + 1) % suggestions.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
      return;
    }
  };

  return (
    <div className="w-full">
      <div className="relative">
        <div className="flex items-center gap-3 rounded-full border border-black/5 bg-white px-5 py-3 shadow-[0_16px_48px_rgba(0,0,0,0.12)] ring-1 ring-transparent transition focus-within:ring-black">
          <svg
            className="h-5 w-5 flex-shrink-0 text-slate-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>

          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(-1);
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 120)}
            onKeyDown={handleKeyDown}
            placeholder="Search songs or artists"
            className="w-full bg-transparent text-lg text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />

          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={triggerSearch}
            className="flex items-center text-black"
            aria-label="Search"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </div>

        <div
          className={`absolute left-0 right-0 z-10 mt-2 overflow-hidden rounded-3xl bg-white shadow-[0_24px_60px_rgba(0,0,0,0.18)] ring-1 ring-slate-100 transition-all duration-200 ease-out will-change-[opacity,transform] ${
            showDropdown
              ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
              : "pointer-events-none -translate-y-2 scale-95 opacity-0"
          }`}
          role="listbox"
          aria-label="Search suggestions"
          aria-hidden={!showDropdown}
        >
          {suggestions.map((item, index) => {
            const isActive = index === activeIndex;
            const coverSrc = item.albumImageUrl || "/placeholder.png";

            return (
              <button
                key={item.id}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(item)}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-[var(--surface-muted)] focus:bg-[var(--surface-muted)] ${
                  isActive
                    ? "bg-[var(--surface-muted)] shadow-[inset_0_0_0_2px_var(--color-primary-soft)]"
                    : ""
                }`}
                role="option"
                aria-selected={isActive}
              >
                <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-slate-100">
                  <Image
                    src={coverSrc}
                    alt={`${item.song} album cover`}
                    fill
                    sizes="48px"
                    className="object-cover"
                    unoptimized
                  />
                </div>

                <div className="flex flex-1 flex-col">
                  <span className="text-base font-semibold text-slate-900">
                    {item.song}
                  </span>
                  <span className="text-sm text-slate-500">{item.artist}</span>
                </div>

                <span className="text-[0.75rem] font-medium">Recent</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
