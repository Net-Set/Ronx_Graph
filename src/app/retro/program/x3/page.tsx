// src/app/retro/program/x3/page.tsx
'use client';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Dynamic import to prevent SSR issues
const X3Grid = dynamic(() => import('@/components/LevelCard/x3Card/X3Grid'), { ssr: false });

export default function X3Page() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <X3Grid />
      </Suspense>
    </div>
  );
}

//Data fetch in wallet connection address data fetch//:

