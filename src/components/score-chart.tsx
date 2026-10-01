"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { ChartParams } from "@/lib/chart-params";
import { formatDate, type Bowler, type Game } from "@/lib/scores";

// Validated for colorblind-safe separation across all pairs (light mode)
const COLORS = ["#2a78d6", "#eb6834", "#1baf7a", "#4a3aa7"];

type NightRow = { date: string; time: number } & Record<
  string,
  number | string
>;

function average(games: Game[]) {
  const total = games.reduce((sum, game) => sum + game.score, 0);
  return Math.round((total / games.length) * 10) / 10;
}

// Per bowler per night: that night's average (`${name}-night`) and the
// rolling average of their last games as of the end of that night (`name`)
function getChartRows(bowlers: Bowler[], rollingGames: number): NightRow[] {
  const nights = new Map<string, NightRow>();
  for (const bowler of bowlers) {
    const chronological = bowler.games.toReversed();
    chronological.forEach((game, i) => {
      const isLastGameOfNight = chronological[i + 1]?.date !== game.date;
      if (!isLastGameOfNight) return;
      const row = nights.get(game.date) ?? {
        date: game.date,
        time: Date.parse(game.date),
      };
      row[`${bowler.name}-night`] = average(
        chronological.filter((other) => other.date === game.date),
      );
      row[bowler.name] = average(
        chronological.slice(Math.max(0, i + 1 - rollingGames), i + 1),
      );
      nights.set(game.date, row);
    });
  }
  return [...nights.values()].sort((a, b) => a.time - b.time);
}

function getPeriodStart(period: string) {
  const start = new Date();
  start.setMonth(start.getMonth() - Number(period));
  return Date.parse(start.toISOString().slice(0, 10));
}

// Short periods label days ("Sep 18"); longer ones label months ("Sep 26")
function formatTick(time: number, period: string) {
  const showDay = period === "1" || period === "3";
  return new Date(time).toLocaleDateString("en-CA", {
    month: "short",
    ...(showDay ? { day: "numeric" } : { year: "2-digit" }),
    timeZone: "UTC",
  });
}

export function ScoreChart({
  bowlers,
  rolling,
  period,
}: { bowlers: Bowler[] } & ChartParams) {
  // Periods narrow the x-axis instead of dropping rows, so lines enter from
  // the left edge and rolling averages still count earlier games
  const periodStart = period === "all" ? "dataMin" : getPeriodStart(period);

  const config: ChartConfig = Object.fromEntries(
    bowlers.flatMap((bowler, i) => [
      [bowler.name, { label: bowler.name, color: COLORS[i] }],
      [
        `${bowler.name}-night`,
        { label: `${bowler.name} (that night)`, color: COLORS[i] },
      ],
    ]),
  );

  return (
    <ChartContainer config={config} className="aspect-auto h-80 w-full">
      <LineChart
        data={getChartRows(bowlers, rolling)}
        margin={{ left: -16, right: 8 }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="time"
          type="number"
          scale="time"
          domain={[periodStart, "dataMax"]}
          allowDataOverflow
          tickFormatter={(time) => formatTick(time, period)}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          domain={["dataMin - 10", "dataMax + 10"]}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(_, payload) =>
                formatDate(payload[0].payload.date)
              }
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        {bowlers.flatMap((bowler) => [
          <Line
            key={bowler.name}
            dataKey={bowler.name}
            stroke={`var(--color-${bowler.name})`}
            strokeWidth={2}
            dot={false}
            connectNulls
          />,
          <Line
            key={`${bowler.name}-night`}
            dataKey={`${bowler.name}-night`}
            stroke="none"
            dot={{
              r: 4,
              strokeWidth: 0,
              fill: `var(--color-${bowler.name})`,
              fillOpacity: 0.35,
            }}
            legendType="none"
          />,
        ])}
      </LineChart>
    </ChartContainer>
  );
}
