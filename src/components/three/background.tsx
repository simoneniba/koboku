"use client";

import { useScrollProgress } from "@/lib/scroll-context";
import { useRef, useEffect, useState } from "react";

/**
 * Fixed full-viewport water video background.
 * - Autoplay + muted + playsInline for mobile compatibility.
 * - Loops indefinitely.
 * - Falls back to /images/water.jpg as poster (and as static fallback if autoplay is blocked).
 * - Translates vertically with scroll for parallax depth.
 * - Pointer events disabled — sits behind all content and the 3D canvas.
 */
export function Background() {
  const progress = useScrollProgress();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    if (!wrapperRef.current) return;
    // Negative translateY: as the user scrolls down, the video drifts up,
    // creating a parallax depth effect without exposing the viewport edges.
    const translateY = -progress * 80;
    wrapperRef.current.style.transform = `translate3d(0, ${translateY}px, 0)`;
  }, [progress]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleError = () => setVideoFailed(true);
    video.addEventListener("error", handleError);

    // Attempt explicit play in case autoplay attribute alone is blocked.
    video.play().catch(() => {
      // Autoplay blocked — fall back to poster image.
      setVideoFailed(true);
    });

    return () => video.removeEventListener("error", handleError);
  }, []);

  return (
    <div
      className="fixed inset-0 z-0 overflow-hidden bg-marine"
      aria-hidden="true"
    >
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
      {/* Subtle vignette to lift the title corners */}
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
