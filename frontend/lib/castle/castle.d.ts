/** 0–1 的緩動函式 */
export type Ease = (progress: number) => number;

/**
 * 依時間畫出古堡場景（480 × 270 像素）。
 * time 為 0–12 秒；12 秒是動畫結束後的靜態交誼廳。
 */
export function drawCastle(context: CanvasRenderingContext2D, time: number, ease: Ease, still?: boolean): void;
