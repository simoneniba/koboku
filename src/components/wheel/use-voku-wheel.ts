import { useEffect, type RefObject } from "react";

function fmtTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) sec = 0;
  const s = Math.floor(sec % 60);
  const m = Math.floor((sec / 60) % 60);
  const h = Math.floor(sec / 3600);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(h)}:${p(m)}:${p(s)}`;
}

export function useVokuWheel(rootRef: RefObject<HTMLElement | null>, zmax: number): void {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const stage = root.querySelector<HTMLElement>("[data-stage]");
    const track = root.querySelector<HTMLElement>("[data-track]");
    const cards = Array.from(root.querySelectorAll<HTMLElement>("[data-card]"));
    if (!stage || !track || cards.length === 0) return;

    const stageEl = stage;
    const trackEl = track;

    const prevBtn = root.querySelector<HTMLElement>("[data-prev]");
    const nextBtn = root.querySelector<HTMLElement>("[data-next]");
    const countEl = root.querySelector<HTMLElement>("[data-count]");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let offset = 0;
    let current = 0;
    let dragging = false;
    let startX = 0;
    let startOffset = 0;
    let tweenId = 0;
    let wheelTimer = 0;
    let resizeTimer = 0;

    const stageWidth = (): number => stageEl.clientWidth;

    function targetOffsetFor(index: number): number {
      const card = cards[index];
      return stageWidth() / 2 - (card.offsetLeft + card.offsetWidth / 2);
    }

    function applyScales(): void {
      if (reduce) {
        for (const c of cards) c.style.transform = "translateZ(0) scale(1)";
        return;
      }
      const half = stageWidth() / 2 || 1;
      for (const c of cards) {
        const center = c.offsetLeft + c.offsetWidth / 2 + offset;
        const d = Math.min(Math.abs(center - half) / half, 1);
        const s = d * d * (3 - 2 * d);
        const scale = 1 + (zmax - 1) * s;
        c.style.transform = `translateZ(0) scale(${scale})`;
      }
    }

    function render(): void {
      trackEl.style.transform = `translateX(${offset}px)`;
      applyScales();
    }

    function nearestIndex(): number {
      const half = stageWidth() / 2;
      let best = 0;
      let bestDist = Infinity;
      cards.forEach((c, i) => {
        const center = c.offsetLeft + c.offsetWidth / 2 + offset;
        const dist = Math.abs(center - half);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      });
      return best;
    }

    function tweenTo(target: number, done?: () => void): void {
      cancelAnimationFrame(tweenId);
      if (reduce) {
        offset = target;
        render();
        done?.();
        return;
      }
      const from = offset;
      const delta = target - from;
      const dur = 320;
      const t0 = performance.now();
      trackEl.style.willChange = "transform";
      for (const c of cards) c.style.willChange = "transform";
      const step = (now: number) => {
        const p = Math.min((now - t0) / dur, 1);
        const e = p < 0.5 ? 4 * p * p * p : 1 - (-2 * p + 2) ** 3 / 2;
        offset = from + delta * e;
        render();
        if (p < 1) {
          tweenId = requestAnimationFrame(step);
        } else {
          trackEl.style.willChange = "";
          for (const c of cards) c.style.willChange = "";
          done?.();
        }
      };
      tweenId = requestAnimationFrame(step);
    }

    function setActive(index: number): void {
      current = index;
      cards.forEach((c, i) => {
        const active = i === index;
        c.classList.toggle("is-active", active);
        const v = c.querySelector<HTMLVideoElement>("[data-video]");
        if (v) {
          if (active) v.play().catch(() => {});
          else v.pause();
        }
      });
      if (countEl) {
        countEl.textContent =
          `${String(index + 1).padStart(2, "0")} / ${String(cards.length).padStart(2, "0")}`;
      }
    }

    function goTo(index: number): void {
      const clamped = Math.max(0, Math.min(cards.length - 1, index));
      tweenTo(targetOffsetFor(clamped), () => setActive(clamped));
    }

    const onPointerDown = (e: PointerEvent) => {
      dragging = true;
      startX = e.clientX;
      startOffset = offset;
      cancelAnimationFrame(tweenId);
      try {
        stageEl.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      trackEl.style.willChange = "transform";
      for (const c of cards) c.style.willChange = "transform";
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      offset = startOffset + (e.clientX - startX);
      render();
    };

    const endDrag = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      try {
        stageEl.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      goTo(nearestIndex());
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goTo(current - 1);
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goTo(current + 1);
      }
    };

    const onWheel = (e: WheelEvent) => {
      const horiz = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : 0;
      if (horiz === 0) return;
      e.preventDefault();
      cancelAnimationFrame(tweenId);
      offset -= horiz;
      render();
      clearTimeout(wheelTimer);
      wheelTimer = window.setTimeout(() => goTo(nearestIndex()), 120);
    };

    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        offset = targetOffsetFor(current);
        render();
      }, 120);
    };

    stageEl.addEventListener("pointerdown", onPointerDown);
    stageEl.addEventListener("pointermove", onPointerMove);
    stageEl.addEventListener("pointerup", endDrag);
    stageEl.addEventListener("pointercancel", endDrag);
    stageEl.addEventListener("keydown", onKeyDown);
    stageEl.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("resize", onResize);

    const onPrev = () => goTo(current - 1);
    const onNext = () => goTo(current + 1);
    prevBtn?.addEventListener("click", onPrev);
    nextBtn?.addEventListener("click", onNext);

    const videoCleanups: (() => void)[] = [];

    cards.forEach((c) => {
      const v = c.querySelector<HTMLVideoElement>("[data-video]");
      if (!v) return;
      const timeEl = c.querySelector<HTMLElement>("[data-time]");
      const pp = c.querySelector<HTMLElement>("[data-playpause]");
      const iconPlay = c.querySelector<HTMLElement>("[data-icon-play]");
      const iconPause = c.querySelector<HTMLElement>("[data-icon-pause]");
      const sound = c.querySelector<HTMLElement>("[data-sound]");
      const iconMuted = c.querySelector<HTMLElement>("[data-icon-muted]");
      const iconUnmuted = c.querySelector<HTMLElement>("[data-icon-unmuted]");
      const fs = c.querySelector<HTMLElement>("[data-fullscreen]");

      const syncPlay = () => {
        const playing = !v.paused;
        iconPlay?.classList.toggle("voku-ic--off", playing);
        iconPause?.classList.toggle("voku-ic--off", !playing);
      };
      const syncSound = () => {
        iconMuted?.classList.toggle("voku-ic--off", !v.muted);
        iconUnmuted?.classList.toggle("voku-ic--off", v.muted);
      };

      const onPlayPause = () => {
        if (v.paused) v.play().catch(() => {});
        else v.pause();
      };
      const onSound = () => {
        v.muted = !v.muted;
        syncSound();
      };
      const onFullscreen = () => {
        if (document.fullscreenElement) document.exitFullscreen();
        else if (c.requestFullscreen) c.requestFullscreen();
        else if (v.requestFullscreen) v.requestFullscreen();
      };
      const onTimeUpdate = () => {
        if (timeEl) timeEl.textContent = fmtTime(v.currentTime);
      };

      pp?.addEventListener("click", onPlayPause);
      sound?.addEventListener("click", onSound);
      fs?.addEventListener("click", onFullscreen);
      v.addEventListener("play", syncPlay);
      v.addEventListener("pause", syncPlay);
      v.addEventListener("timeupdate", onTimeUpdate);
      syncPlay();
      syncSound();

      videoCleanups.push(() => {
        pp?.removeEventListener("click", onPlayPause);
        sound?.removeEventListener("click", onSound);
        fs?.removeEventListener("click", onFullscreen);
        v.removeEventListener("play", syncPlay);
        v.removeEventListener("pause", syncPlay);
        v.removeEventListener("timeupdate", onTimeUpdate);
      });
    });

    let io: IntersectionObserver | undefined;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((en) => {
            const active = cards[current];
            const v = active?.querySelector<HTMLVideoElement>("[data-video]") ?? null;
            if (!v) return;
            if (en.isIntersecting) v.play().catch(() => {});
            else v.pause();
          });
        },
        { threshold: 0.2 },
      );
      io.observe(stageEl);
    }

    const initId = requestAnimationFrame(() => {
      offset = targetOffsetFor(0);
      render();
      setActive(0);
    });

    return () => {
      cancelAnimationFrame(tweenId);
      cancelAnimationFrame(initId);
      clearTimeout(wheelTimer);
      clearTimeout(resizeTimer);
      stageEl.removeEventListener("pointerdown", onPointerDown);
      stageEl.removeEventListener("pointermove", onPointerMove);
      stageEl.removeEventListener("pointerup", endDrag);
      stageEl.removeEventListener("pointercancel", endDrag);
      stageEl.removeEventListener("keydown", onKeyDown);
      stageEl.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", onResize);
      prevBtn?.removeEventListener("click", onPrev);
      nextBtn?.removeEventListener("click", onNext);
      for (const cleanup of videoCleanups) cleanup();
      io?.disconnect();
    };
  }, [rootRef, zmax]);
}
