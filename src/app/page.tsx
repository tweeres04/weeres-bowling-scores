import { ChartControls } from "@/components/chart-controls";
import { ScoreChart } from "@/components/score-chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { parseChartParams } from "@/lib/chart-params";
import { SHEET_URL, WINDOWS, getBowlers, getWindowStats } from "@/lib/scores";

export default async function Home({ searchParams }: PageProps<"/">) {
  const [bowlers, chartParams] = await Promise.all([
    getBowlers(),
    searchParams.then(parseChartParams),
  ]);

  return (
    <main className="mx-auto w-full max-w-4xl space-y-12 px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">
        Weeres Bros Bowling
      </h1>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Averages and highs</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead rowSpan={2}>Bowler</TableHead>
              {WINDOWS.map((size) => (
                <TableHead key={size} colSpan={2} className="text-center">
                  Last {size}
                </TableHead>
              ))}
            </TableRow>
            <TableRow>
              {WINDOWS.flatMap((size) => [
                <TableHead key={`${size}-average`} className="text-right">
                  Average
                </TableHead>,
                <TableHead key={`${size}-high`} className="text-right">
                  High
                </TableHead>,
              ])}
            </TableRow>
          </TableHeader>
          <TableBody>
            {bowlers.map((bowler) => (
              <TableRow key={bowler.name}>
                <TableCell className="font-medium">{bowler.name}</TableCell>
                {getWindowStats(bowler.games).flatMap((stats) => [
                  <TableCell
                    key={`${stats.size}-average`}
                    className="text-right tabular-nums"
                  >
                    {stats.average.toFixed(1)}
                  </TableCell>,
                  <TableCell
                    key={`${stats.size}-high`}
                    className="text-right tabular-nums"
                  >
                    {stats.high}
                  </TableCell>,
                ])}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Scores over time</h2>
          <p className="text-muted-foreground">
            Each line is a bowler&apos;s rolling average. The faint dots show
            how they did each night.
          </p>
        </div>
        <ChartControls {...chartParams} />
        <ScoreChart bowlers={bowlers} {...chartParams} />
      </section>

      <footer>
        <a href={SHEET_URL} className="underline underline-offset-4">
          See all the scores in the spreadsheet
        </a>
      </footer>
    </main>
  );
}
