"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { scrollStore } from "@/lib/scroll-store";

/**
 * Fixed full-viewport water video background.
 * Parallax pauses while the Process white sheet fully covers the viewport.
 */
export function Background() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoFailed, setVideoFailed] = useState(false);
  const coveringRef = useRef(false);

  useEffect(() => {
    const onVisibility = () => {
      const v = videoRef.current;
      if (!v) return;
      if (document.visibilityState === "hidden") v.pause();
      else if (!scrollStore.whiteSheetCovering) v.play().catch(() => {});
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    let last = -1;
    const sync = () => {
      const covering = scrollStore.whiteSheetCovering;
      const v = videoRef.current;

      if (covering !== coveringRef.current) {
        coveringRef.current = covering;
        if (v) {
          if (covering) v.pause();
          else v.play().catch(() => {});
        }
      }

      if (covering || !wrapperRef.current) return;

      const p = scrollStore.progress;
      if (p === last) return;
      last = p;
      wrapperRef.current.style.transform = `translate3d(0, ${-p * 80}px, 0)`;
    };
    gsap.ticker.add(sync);
    return () => gsap.ticker.remove(sync);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleError = () => setVideoFailed(true);
    video.addEventListener("error", handleError);

    video.play().catch(() => {
      setVideoFailed(true);
    });

    return () => video.removeEventListener("error", handleError);
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-marine" aria-hidden="true">
      <div
        ref={wrapperRef}
        className="absolute inset-x-0 -top-[5vh] h-[120vh] will-change-transform"
      >
        {!videoFailed ? (
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            src="/videos/new-koboku-hero-video.mp4"
            poster="/images/water.jpg"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          />
        ) : (
          <div
            className="h-full w-full bg-cover bg-center"
            style={{
              backgroundImage: "url('/images/water.jpg')",
              backgroundPosition: "center 30%",
            }}
          />
        )}
      </div>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(14, 42, 71, 0.35) 100%)",
        }}
      />
    </div>
  );
}
