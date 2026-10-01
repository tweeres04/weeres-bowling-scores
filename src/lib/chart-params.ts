import { WINDOWS } from "@/lib/scores";

// Longest window first, and the default
export const ROLLING_WINDOWS = WINDOWS.toReversed();

export const PERIODS = [
  { value: "all", label: "All time" },
  { value: "1", label: "Last month" },
  { value: "3", label: "Last 3 months" },
  { value: "6", label: "Last 6 months" },
  { value: "12", label: "Last year" },
];

export type ChartParams = { rolling: number; period: string };

// The URL is the source of truth; anything unrecognized falls back to the defaults
export function parseChartParams(
  searchParams: Record<string, string | string[] | undefined>,
): ChartParams {
  const rolling = Number(searchParams.rolling);
  const period = PERIODS.find((option) => option.value === searchParams.period);
  return {
    rolling: ROLLING_WINDOWS.includes(rolling) ? rolling : ROLLING_WINDOWS[0],
    period: period ? period.value : PERIODS[0].value,
  };
}
