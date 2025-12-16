"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SVGProps } from "react";

type NavItem = {
  id: "home" | "deck";
  label: string;
  href: string;
};

const navItems: NavItem[] = [
  { id: "home", label: "Home", href: "/search" },
  { id: "deck", label: "Deck", href: "/deck" },
];

export function NavigationBar() {
  const pathname = usePathname();

  return (
    <aside className="flex min-h-screen w-[320px] flex-col justify-between border-r border-slate-200 bg-white px-6 py-8 text-slate-900">
      <div>
        <div className="flex items-center gap-3">
          <span className="text-3xl font-semibold leading-none tracking-tight text-slate-900">
            Kashi
          </span>
        </div>

        <nav className="mt-10">
          <ul className="flex flex-col gap-3">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className={`flex w-full items-center gap-4 rounded-2xl px-4 py-3 text-left text-lg font-semibold tracking-tight transition ${
                      isActive
                        ? "bg-red-50 text-slate-900 shadow-[0_10px_30px_rgba(220,38,38,0.12)]"
                        : "text-slate-800 hover:bg-slate-100"
                    }`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <span
                      className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                        isActive ? "text-red-600" : "text-red-500"
                      }`}
                    >
                      {item.id === "home" ? (
                        <HomeIcon className="h-6 w-6" />
                      ) : (
                        <DeckIcon className="h-6 w-6" />
                      )}
                    </span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

    </aside>
  );
}

function HomeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5 10v8.5a1.5 1.5 0 0 0 1.5 1.5H9v-6h6v6h2.5a1.5 1.5 0 0 0 1.5-1.5V10" />
    </svg>
  );
}

function DeckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <rect x="3" y="4" width="8" height="8" rx="2" />
      <rect x="13" y="4" width="8" height="8" rx="2" />
      <rect x="3" y="14" width="8" height="8" rx="2" />
      <rect x="13" y="14" width="8" height="8" rx="2" />
    </svg>
  );
}
