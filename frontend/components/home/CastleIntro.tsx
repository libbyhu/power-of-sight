'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { drawCastle } from '@/lib/castle/castle';

const DURATION = 12000; // 動畫總長（毫秒）
const SETTLE_AT = 10700; // 從這裡開始，全螢幕畫面縮回首頁的位置
const SEEN_KEY = 'pos_intro_seen'; // 看過一次就不再自動播放

const ease = (value: number) => {
  const x = Math.min(1, Math.max(0, value));
  return x * x * (3 - 2 * x);
};

/** localStorage 在無痕模式或被封鎖時會丟錯，讀寫都要包起來。 */
function hasSeenIntro() {
  try {
    return window.localStorage.getItem(SEEN_KEY) === '1';
  } catch {
    return false;
  }
}
function markIntroSeen() {
  try {
    window.localStorage.setItem(SEEN_KEY, '1');
  } catch {
    // 存不了就下次再播一次，不影響使用
  }
}

/**
 * 首頁開場動畫：小旅人爬上紅磚樓梯 → 推開木門 → 鏡頭拉遠看見交誼廳 → 縮回首頁主視覺。
 * - 第一次造訪自動播放，之後顯示靜態畫面，可按「重播動畫」。
 * - 系統開啟「減少動態效果」時不播放，直接顯示靜態畫面。
 * - 播放中可按「跳過動畫」或 Esc。
 * 全螢幕與隱藏頁面內容由 body 上的 intro-playing class 控制（樣式在 globals.css）。
 */
export function CastleIntro() {
  const t = useTranslations('intro');
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const transition = useRef<Animation | null>(null);
  const playingRef = useRef(false);
  const settlingRef = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const drawStill = useCallback(() => {
    const context = canvasRef.current?.getContext('2d');
    if (context) drawCastle(context, 12, ease, true);
  }, []);

  const finish = useCallback(() => {
    // 真的播過（播完或按了跳過）才記住，下次不再自動播放
    if (playingRef.current) markIntroSeen();
    playingRef.current = false;
    cancelAnimationFrame(frame.current);
    transition.current?.cancel();
    transition.current = null;
    document.body.classList.remove('intro-playing');
    if (stageRef.current) stageRef.current.style.zIndex = '';
    setPlaying(false);
    drawStill();
  }, [drawStill]);

  /** 從全螢幕縮回首頁原本的位置：先算出全螢幕時畫面的實際範圍，再用動畫過渡回去。 */
  const shrinkIntoPlace = useCallback((remaining: number) => {
    const stage = stageRef.current;
    if (!stage) return;
    const width = Math.min(stage.clientWidth, (stage.clientHeight * 16) / 9);
    const height = (width * 9) / 16;
    const left = (stage.clientWidth - width) / 2;
    const top = (stage.clientHeight - height) / 2;
    document.body.classList.remove('intro-playing');
    if (typeof stage.animate !== 'function') return;

    const target = stage.getBoundingClientRect();
    stage.style.zIndex = '50';
    transition.current = stage.animate(
      [
        {
          transformOrigin: '0 0',
          transform: `translate(${left - target.left}px, ${top - target.top}px) scale(${width / target.width})`,
        },
        { transformOrigin: '0 0', transform: 'none' },
      ],
      { duration: remaining, easing: 'cubic-bezier(.22,.75,.27,1)' },
    );
    transition.current.onfinish = () => {
      stage.style.zIndex = '';
    };
  }, []);

  const play = useCallback(() => {
    const context = canvasRef.current?.getContext('2d');
    if (!context) return;
    finish();
    window.scrollTo(0, 0);
    document.body.classList.add('intro-playing');
    settlingRef.current = false;
    playingRef.current = true;
    setPlaying(true);
    const started = performance.now();

    const tick = (now: number) => {
      if (!playingRef.current) return;
      const elapsed = now - started;
      if (elapsed >= DURATION) {
        finish();
        return;
      }
      if (elapsed >= SETTLE_AT && !settlingRef.current) {
        settlingRef.current = true;
        shrinkIntoPlace(DURATION - elapsed);
      }
      progressRef.current?.style.setProperty('transform', `scaleX(${elapsed / DURATION})`);
      drawCastle(context, elapsed / 1000, ease);
      frame.current = requestAnimationFrame(tick);
    };
    drawCastle(context, 0, ease);
    frame.current = requestAnimationFrame(tick);
  }, [finish, shrinkIntoPlace]);

  // 第一次進來：沒看過、也沒開「減少動態效果」才自動播放
  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(motionQuery.matches);
    drawStill();
    if (!motionQuery.matches && !hasSeenIntro()) play();
    const onMotionChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
      if (e.matches) finish();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && playingRef.current) finish();
    };
    motionQuery.addEventListener('change', onMotionChange);
    document.addEventListener('keydown', onKey);
    return () => {
      motionQuery.removeEventListener('change', onMotionChange);
      document.removeEventListener('keydown', onKey);
      // 離開頁面時停止播放，但不算「看過」
      playingRef.current = false;
      cancelAnimationFrame(frame.current);
      transition.current?.cancel();
      document.body.classList.remove('intro-playing');
    };
  }, [drawStill, finish, play]);

  return (
    <div
      ref={stageRef}
      className="castle-stage relative isolate aspect-video w-full overflow-hidden border border-edge bg-[#18141d]"
    >
      <canvas ref={canvasRef} width={480} height={270} role="img" aria-label={t('alt')} />

      {!reducedMotion && (
        <div className="absolute bottom-3 right-3">
          <button
            type="button"
            onClick={() => (playing ? finish() : play())}
            className="rounded-card border border-edge bg-surface/90 px-3 py-1.5 text-xs text-parchment shadow-pixel transition-colors hover:border-amber hover:text-amber"
          >
            {playing ? t('skip') : t('replay')}
          </button>
        </div>
      )}

      {playing && (
        <div className="absolute inset-x-0 bottom-0 h-[3px] bg-wood" aria-hidden>
          <div ref={progressRef} className="h-full origin-left scale-x-0 bg-amber" />
        </div>
      )}
    </div>
  );
}
