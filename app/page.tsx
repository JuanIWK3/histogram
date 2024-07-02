"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { AxisOptions, Chart } from "react-charts";

type ValuePixels = {
  value: number;
  pixels: number;
};

type Series = {
  label: string;
  data: ValuePixels[];
};

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [redPixels, setRedPixels] = useState<number[]>([]);
  const [greenPixels, setGreenPixels] = useState<number[]>([]);
  const [bluePixels, setBluePixels] = useState<number[]>([]);
  const [isBlackAndWhite, setIsBlackAndWhite] = useState<boolean>(true);

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      if (typeof reader.result !== "string") {
        return;
      }

      setImage(reader.result as string);
    };

    reader.readAsDataURL(file);
  }

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

  useEffect(() => {
    if (!image) {
      return;
    }

    const img = new window.Image();
    img.src = image;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      if (!context) {
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;

      context.drawImage(img, 0, 0, img.width, img.height);

      const imageData = context.getImageData(0, 0, img.width, img.height).data;

      const redAmounts = Array.from({ length: 256 }, () => 0);
      const greenAmounts = Array.from({ length: 256 }, () => 0);
      const blueAmounts = Array.from({ length: 256 }, () => 0);

      for (let i = 0; i < imageData.length; i += 4) {
        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];

        redAmounts[r] += 1;
        greenAmounts[g] += 1;
        blueAmounts[b] += 1;
      }

      setRedPixels(redAmounts);
      setGreenPixels(greenAmounts);
      setBluePixels(blueAmounts);

      if (
        redAmounts.every((value, index) => value === greenAmounts[index]) &&
        redAmounts.every((value, index) => value === blueAmounts[index])
      ) {
        setIsBlackAndWhite(true);
      } else {
        setIsBlackAndWhite(false);
      }
    };
  }, [image]);

  return (
    <main className="flex h-screen flex-col items-center p-16">
      <div className="flex flex-col items-center space-y-4">
        <Input type="file" onChange={handleImageChange} />
        <div className="flex items-center space-x-2">
          <Checkbox
            id="terms"
            checked={isBlackAndWhite}
            defaultChecked={isBlackAndWhite}
            onCheckedChange={(checked) =>
              setIsBlackAndWhite(checked as boolean)
            }
          />
          <Label htmlFor="terms">Black and white</Label>
        </div>
        {image && (
          <Image
            src={image}
            alt="preview"
            className="w-auto h-full max-h-[400px]"
            width={200}
            height={200}
          />
        )}
      </div>
      <div className="w-full h-72">
        {image && isBlackAndWhite && redPixels.length > 0 && (
          <Chart
            options={{
              data: [createDataSeries(redPixels, "Gray")],
              primaryAxis,
              secondaryAxes,
              defaultColors: ["gray"],
            }}
          />
        )}
        {image && !isBlackAndWhite && (
          <Chart
            options={{
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
    </main>
  );
}
