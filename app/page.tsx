"use client";

import { Histogram } from "@/components/histogram";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [redPixels, setRedPixels] = useState<number[]>([]);
  const [greenPixels, setGreenPixels] = useState<number[]>([]);
  const [bluePixels, setBluePixels] = useState<number[]>([]);
  const [isBlackAndWhite, setIsBlackAndWhite] = useState<boolean>(true);

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      if (typeof reader.result !== "string") return;
      setImage(reader.result as string);
    };

    reader.readAsDataURL(file);
  }

  useEffect(() => {
    function isImageBlackAndWhite(
      redAmounts: number[],
      greenAmounts: number[],
      blueAmounts: number[]
    ): boolean {
      return (
        redAmounts.every((value, index) => value === greenAmounts[index]) &&
        redAmounts.every((value, index) => value === blueAmounts[index])
      );
    }

    if (!image) return;

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

      const reds = Array.from({ length: 256 }, () => 0);
      const greens = Array.from({ length: 256 }, () => 0);
      const blues = Array.from({ length: 256 }, () => 0);

      for (let i = 0; i < imageData.length; i += 4) {
        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];

        reds[r] += 1;
        greens[g] += 1;
        blues[b] += 1;
      }

      setRedPixels(reds);
      setGreenPixels(greens);
      setBluePixels(blues);

      if (isImageBlackAndWhite(reds, greens, blues)) {
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

      <Histogram
        redPixels={redPixels}
        greenPixels={greenPixels}
        bluePixels={bluePixels}
        isBlackAndWhite={isBlackAndWhite}
      />
    </main>
  );
}
