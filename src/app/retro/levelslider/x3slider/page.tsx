'use client'
import { Suspense } from "react";
import LevelSliderx3 from "@/components/LevelSlider/x3LevelSlider/x3LevelSlider";

export default function LiquidityPageRetro() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div>
        <LevelSliderx3 />
      </div>
    </Suspense>
  );
}
