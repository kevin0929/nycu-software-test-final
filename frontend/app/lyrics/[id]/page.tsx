import Image from "next/image";
import { notFound } from "next/navigation";
import { NavigationBar } from "@/components/NavigationBar";
import { getSongById } from "@/lib/api/getSongById";
import { getSuggestionCard } from "@/lib/api/getSuggestionCard";
import { LyricsSuggestions } from "@/components/lyrics/LyricsSuggestions";
import { type Card } from "@/components/FlipCard";

type LyricsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function LyricsPage({ params }: LyricsPageProps) {
  const { id } = await params;
  const song = await getSongById(id);
  const suggestionCards = await getSuggestionCard(id);

  console.log(suggestionCards);

  if (!song) {
    return notFound();
  }

  return (
    <div className="flex min-h-screen bg-[#f5f5f7] text-slate-900">
      <NavigationBar />

      <main className="flex-1 bg-[#fdfdfd] px-8 py-10 sm:px-12 lg:px-16">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
          <div className="max-w-4xl">
            <p className="text-xs uppercase tracking-[0.35em] text-red-600/80">
              Lyrics
            </p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight text-slate-900">
              {song.song}
            </h1>
            <p className="mt-1 text-lg text-slate-600">{song.artist}</p>

            <div className="mt-6 flex items-center gap-5">
              <div className="relative h-24 w-24 overflow-hidden rounded-2xl bg-slate-200">
                <Image
                  src={song.albumImageUrl}
                  alt={`${song.song} album cover`}
                  fill
                  sizes="96px"
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                Last searched {new Date(song.lastSearchedAt).toLocaleDateString()}
              </div>
            </div>

            <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_44px_rgba(0,0,0,0.08)]">
              <pre className="whitespace-pre-wrap text-base leading-relaxed text-slate-800">
                {song.lyrics}
              </pre>
            </div>
          </div>

          <LyricsSuggestions suggestions={suggestionCards} />
        </div>
      </main>
    </div>
  );
}
