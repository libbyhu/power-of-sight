'use client';

import { useEffect, useRef } from 'react';
import { drawCastle } from '@/lib/castle/castle';

/** 靜態的古堡交誼廳（動畫最後一格），用在登入、註冊等頁面。 */
export function CastleScene({ label }: { label: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const context = canvasRef.current?.getContext('2d');
    if (context) drawCastle(context, 12, (x) => Math.min(1, Math.max(0, x)), true);
  }, []);

  return (
    <div className="castle-stage aspect-video w-full overflow-hidden border border-edge bg-[#18141d] shadow-pixel-lg">
      <canvas ref={canvasRef} width={480} height={270} role="img" aria-label={label} />
    </div>
  );
}
