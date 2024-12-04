// src/app/retro/program/x4/page.tsx
'use client';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const X4Grid = dynamic(() => import('@/components/LevelCard/x4Card/X4Grid'), { ssr: false });

export default function X4Page() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <X4Grid />
      </Suspense>
    </div>
  );
}
