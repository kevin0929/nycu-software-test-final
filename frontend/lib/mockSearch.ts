import { SearchResult } from "@/types/search";
import { getSearchResults } from "./api/getSearchResults";

const STORAGE_KEY = "musiccard.searchResults";

function saveToStorage(results: SearchResult[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
}

function loadFromStorage(): SearchResult[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as SearchResult[];
  } catch {
    return [];
  }
}

export const mockSearchResults: SearchResult[] = [
  {
    id: "itte",
    song: "言って",
    artist: "ヨルシカ",
    albumImageUrl:
      "https://images.unsplash.com/photo-1521123845560-14093637aa7d?auto=format&fit=crop&w=200&q=80",
    lastSearchedAt: "2024-05-08T12:00:00Z",
    lyrics: `言って
あのね 私 実は気付いてるの
ほら 君がいったこと
あまり考えたいと思えなくて
忘れてたんだけど
盲目的に 盲動的に 妄想的に生きて
衝動的な 焦燥的な 消極的なままじゃ駄目だったんだ
きっと 人生最後の日を前に思うのだろう
全部 全部言い足りなくて惜しいけど
あぁ いつか人生最後の日 君がいないことを
もっと もっと もっと
もっと ちゃんと言って
あのね 空が青いのって どうやって伝えればいいんだろうね
夜の雲が高いのって どうすれば君もわかるんだろう
言って
あのね 私 実はわかってるの
もう君が逝ったこと
あのね わからず屋って言うんだろうね
忘れたいんだけど
もっとちゃんと言ってよ 忘れないようメモにしてよ
明日十時にホームで待ち合わせとかしよう
牡丹は散っても花だ
夏が去っても追慕は切だ
口に出して 声に出して 君が言って
そして人生最後の日 君が見えるのなら
きっと 人生最後の日も愛をうたうのだろう
全部 全部無駄じゃなかったって言うから
あぁ いつか人生最後の日 君がいないことがまだ信じられないけど
もっと もっと もっと もっと
もっと もっと もっと 君が
もっと もっと もっと もっと
もっと ちゃんと言って`,
  },
  {
    id: "darma-grand-prix",
    song: "Darma Grand Prix",
    artist: "RADWIMPS",
    albumImageUrl:
      "https://images.unsplash.com/photo-1502772066658-300479764f8e?auto=format&fit=crop&w=200&q=80",
    lastSearchedAt: "2024-05-08T12:30:00Z",
    lyrics: `さぁ今日はどちらでいこう 全部世界のせいにして
被害者ヘブンで管巻くか 加害者思想で謝罪大会
前者選んだ君は正解 試しに一つ差し出してみな
この世で一番の不幸者を 今なら素通りしてみせるよ
止まらぬ涙の感動 空前絶後の大ヒット
なんともめでたいことだけど その涙の出所は誰?
知らぬ誰かの涙まで 信じれるようになるまで
あとどれだけつまらない奴と 話せるようになれば
いいのかだけを命題に さぁ 今日も目覚めてみるけども
このプールは泳ぐにゃもう 吐きそうなくらい
えぐいよ
君の愛も僕の意固地も 明日を越えてゆけるかな
世界最終日その日の午後に残ってる方を 勝者としようさ
あんたに嫌われるのは 一向に構いやしないけど
犬ッコロに吠えられるのはさ なぜかずいぶんと応えるんだ
この世は 眠れぬ夜と死体 多忙 貧乏 退屈と期待から
いかにして逃げ遂せるかの だるまさん転んだの 逆再生
誰が何をどうしたって どんなんなってんでどうなろうが
んでどれだけ気になるようなその素振りを振りまいても
あなたがする全ては そのあなたのその欲望の
そのどれかを満たすためだけにあるなんてさ
すごいよ
君の「デモ」も僕の「ダケド」も 明日を越えてゆけるかな
一度でいいさ 純度百度の 自己犠牲なんてやつをしたいもんだ
君の愛も僕の意固地も 明日を越えてゆけるかな
世界最終日その日の午後に残ってる方を 勝者として
この世でいざ今無敵なのは 被害者 敗者復活の時
自分消滅の3秒前に 笑うのはそう この僕のほうさ`,
  },
];

export async function searchSongs(
  term: string,
  limit: number = 5
): Promise<SearchResult[]> {
  const normalized = term.trim().toLowerCase();

  const searchResults = await getSearchResults(term, limit);
  saveToStorage(searchResults);

  const sorted = [...searchResults].sort(
    (a, b) =>
      new Date(b.lastSearchedAt).getTime() - new Date(a.lastSearchedAt).getTime()
  );

  const filtered = normalized
    ? sorted.filter(
        (item) =>
          item.song.toLowerCase().includes(normalized) ||
          item.artist.toLowerCase().includes(normalized)
      )
    : sorted;

  const sliced = filtered.slice(0, limit || 5);

  // Simulate a small network delay.
  await new Promise((resolve) => setTimeout(resolve, 200));

  return sliced;
}

export function getSongById(id: string) {
  const searchResults = loadFromStorage();
  console.log(searchResults);
  return searchResults.find((item) => item.id === id);
}
