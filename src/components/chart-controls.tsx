"use client";

import Form from "next/form";
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PERIODS, ROLLING_WINDOWS, type ChartParams } from "@/lib/chart-params";

// A GET form: submitting writes the fields into the URL (?rolling=20&period=3).
// `replace` keeps control changes out of history, so the URL only changes
// through this form and the uncontrolled defaults stay in sync with it.
export function ChartControls({ rolling, period }: ChartParams) {
  return (
    <Form
      action="/"
      replace
      scroll={false}
      onChange={(event) => event.currentTarget.requestSubmit()}
      className="space-y-4"
    >
      <NativeSelect
        name="period"
        aria-label="Time period"
        defaultValue={period}
      >
        {PERIODS.map((option) => (
          <NativeSelectOption key={option.value} value={option.value}>
            {option.label}
          </NativeSelectOption>
        ))}
      </NativeSelect>
      <div className="space-y-2">
        <p id="rolling-label" className="text-sm font-medium">
          Rolling average
        </p>
        <RadioGroup
          name="rolling"
          aria-labelledby="rolling-label"
          defaultValue={rolling}
          className="flex w-auto gap-4"
        >
          {ROLLING_WINDOWS.map((size) => (
            <Label key={size}>
              <RadioGroupItem value={size} />
              Last {size} games
            </Label>
          ))}
        </RadioGroup>
      </div>
    </Form>
  );
}
