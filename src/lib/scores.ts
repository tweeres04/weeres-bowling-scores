export const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1K8sh2g5yljUPjd_78H9zQWjUS28h__3eL6jIzMMtNyQ";

// Bowler names are in row 2; games start in row 11. Each bowler gets a
// 4-column block (date, score, label, spacer) starting at the name's column.
const NAMES_RANGE = "B2:P2";
const GAMES_RANGE = "B11:P";

export const WINDOWS = [5, 10, 20];

export type Game = { date: string; score: number };
export type Bowler = { name: string; games: Game[] };
export type WindowStats = { size: number; average: number; high: number };

type GvizCell = { v: string | number | null } | null;
type GvizTable = { rows: { c: GvizCell[] }[] };

async function fetchRange(range: string): Promise<GvizTable> {
  const params = new URLSearchParams({
    tqx: "out:json",
    sheet: "Scores",
    range,
    headers: "0",
  });
  const res = await fetch(`${SHEET_URL}/gviz/tq?${params}`, {
    next: { revalidate: 60 },
  });
  const text = await res.text();
  // gviz wraps the JSON in a callback: google.visualization.Query.setResponse({...});
  return JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1))
    .table;
}

// gviz sends dates as "Date(2026,4,29)" with a zero-based month
function parseGvizDate(value: string) {
  const [year, month, day] = value.match(/\d+/g)!.map(Number);
  return new Date(Date.UTC(year, month, day)).toISOString().slice(0, 10);
}

export async function getBowlers(): Promise<Bowler[]> {
  const [names, games] = await Promise.all([
    fetchRange(NAMES_RANGE),
    fetchRange(GAMES_RANGE),
  ]);

  return names.rows[0].c.flatMap((cell, column) => {
    if (typeof cell?.v !== "string") return [];
    const bowlerGames = games.rows.flatMap(({ c }) => {
      const date = c[column]?.v;
      const score = c[column + 1]?.v;
      return typeof date === "string" && typeof score === "number"
        ? [{ date: parseGvizDate(date), score }]
        : [];
    });
    return [
      {
        name: cell.v.charAt(0) + cell.v.slice(1).toLowerCase(),
        // Newest first. The sort is stable, so games on the same night keep sheet order.
        games: bowlerGames.sort((a, b) => b.date.localeCompare(a.date)),
      },
    ];
  });
}

export function getWindowStats(games: Game[]): WindowStats[] {
  return WINDOWS.map((size) => {
    const scores = games.slice(0, size).map((game) => game.score);
    return {
      size,
      average: scores.reduce((sum, score) => sum + score, 0) / scores.length,
      high: Math.max(...scores),
    };
  });
}

export function formatDate(date: string) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-CA", {
    dateStyle: "medium",
    timeZone: "UTC",
  });
}
