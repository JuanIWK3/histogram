"use client";

import { useTheme } from "next-themes";
import { useMemo } from "react";
import { AxisOptions, Chart } from "react-charts";

interface Props {
  redPixels: number[];
  greenPixels: number[];
  bluePixels: number[];
  isBlackAndWhite: boolean;
}

type ValuePixels = {
  value: number;
  pixels: number;
};

type Series = {
  label: string;
  data: ValuePixels[];
};

export function Histogram({
  redPixels,
  greenPixels,
  bluePixels,
  isBlackAndWhite,
}: Props) {
  const { theme } = useTheme();

  const createDataSeries = (pixels: number[], label: string): Series => ({
    label,
    data: pixels.map((value, index) => ({
      value: index,
      pixels: value,
    })),
  });

  const primaryAxis = useMemo(
    (): AxisOptions<ValuePixels> => ({
      getValue: (datum) => datum.value,
    }),
    []
  );

  const secondaryAxes = useMemo(
    (): AxisOptions<ValuePixels>[] => [
      {
        getValue: (datum) => datum.pixels,
      },
    ],
    []
  );

  const grayPixels = redPixels.map((value, index) => {
    return (value + greenPixels[index] + bluePixels[index]) / 3;
  });

  return (
    <div className="w-full h-72">
      {isBlackAndWhite && redPixels.length > 0 && (
        <Chart
          options={{
            dark: theme === "dark",
            data: [createDataSeries(grayPixels, "Gray")],
            primaryAxis,
            secondaryAxes,
            defaultColors: ["gray"],
          }}
          className=""
        />
      )}
      {!isBlackAndWhite &&
        redPixels.length > 0 &&
        greenPixels.length > 0 &&
        bluePixels.length > 0 && (
          <Chart
            options={{
              dark: theme === "dark",
              data: [
                createDataSeries(redPixels, "Red"),
                createDataSeries(greenPixels, "Green"),
                createDataSeries(bluePixels, "Blue"),
              ],
              primaryAxis,
              secondaryAxes,
              defaultColors: ["red", "green", "blue"],
            }}
          />
        )}
    </div>
  );
}
