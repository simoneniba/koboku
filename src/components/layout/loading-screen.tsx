"use client";

import { useState, useEffect, useRef } from "react";
import { useSceneReady } from "@/lib/ready-state";

const IMAGES = [
  "/images/loading/load-1.jpg",
  "/images/loading/load-2.jpg",
  "/images/loading/load-3.jpg",
  "/images/loading/load-4.jpg",
  "/images/loading/load-5.jpg",
];

const MIN_DURATION_MS = 1800;
const FADE_MS = 700;

export function LoadingScreen() {
  // L'immagine viene scelta solo nel browser, dopo il mount — mai durante
  // il render server, così server e client coincidono (no hydration error).
  const [image, setImage] = useState<string | null>(null);
  const sceneReady = useSceneReady();
  const [progress, setProgress] = useState(0);
  const [fading, setFading] = useState(false);
  const [hidden, setHidden] = useState(false);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    setImage(IMAGES[Math.floor(Math.random() * IMAGES.length)]);
  }, []);

  useEffect(() => {
    if (startRef.current === null) startRef.current = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const elapsed = now - startRef.current!;
      const timePct = Math.min(95, (elapsed / MIN_DURATION_MS) * 95);
      const minTimeReached = elapsed >= MIN_DURATION_MS;

      if (sceneReady && minTimeReached) {
        setProgress(100);
        setFading(true);
        window.setTimeout(() => setHidden(true), FADE_MS);
        return;
      }

      setProgress(sceneReady ? 96 : timePct);
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [sceneReady]);

  if (hidden) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-marine"
      style={{
        opacity: fading ? 0 : 1,
        transition: `opacity ${FADE_MS}ms ease-out`,
        pointerEvents: fading ? "none" : "auto",
      }}
      aria-hidden="true"
    >
      {/* L'immagine appare solo dopo che il browser l'ha scelta */}
      {image && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${image}')` }}
        />
      )}
      <div className="absolute inset-0 bg-marine/30" />

      <div className="absolute top-8 left-6 md:left-10">
        <img
          src="/images/koboku-logo-white-800.png"
          alt="Koboku"
          className="h-14 w-auto md:h-20"
        />
      </div>

      <div className="absolute bottom-0 left-0 right-0 px-6 md:px-10 pb-8">
        <div className="relative h-px w-full bg-bone/20">
          <div
            className="absolute inset-y-0 left-0 bg-bone transition-[width] duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-3 flex justify-between">
          <span className="text-eyebrow text-bone/60">Koboku Studio</span>
          <span className="text-eyebrow text-bone/60">{Math.round(progress)}</span>
        </div>
      </div>
    </div>
  );
}