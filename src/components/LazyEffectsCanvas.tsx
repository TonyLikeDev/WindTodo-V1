'use client';

import dynamic from 'next/dynamic';

// EffectsCanvas uses AudioContext + canvas — defer until after first paint
const EffectsCanvas = dynamic(() => import('./EffectsCanvas'), { ssr: false });

export default function LazyEffectsCanvas() {
  return <EffectsCanvas />;
}
