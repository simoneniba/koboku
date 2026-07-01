"use client";

import { useRef } from "react";
import styles from "./VokuWheel.module.css";
import { useVokuWheel } from "./use-voku-wheel";

export interface WheelItem {
  type: "image" | "video";
  src: string;
  poster?: string;
  title: string;
  meta?: string;
  href?: string;
}

export interface VokuWheelProps {
  items: WheelItem[];
  ratio?: "16:9" | "9:16";
  variant?: "cinema" | "reels" | "sites";
  label?: string;
  zmax?: number;
  chrome?: boolean;
}

export function VokuWheel({
  items,
  ratio = "16:9",
  variant = "cinema",
  label = "",
  zmax = 1.12,
  chrome = variant === "sites",
}: VokuWheelProps) {
  const rootRef = useRef<HTMLElement>(null);
  const zmaxClamped = Math.min(Math.max(zmax, 1), 1.25);
  const ratioClass = ratio === "9:16" ? styles.isPortrait : styles.isLandscape;

  useVokuWheel(rootRef, zmaxClamped);

  return (
    <section
      ref={rootRef}
      className={`${styles.wheel} ${ratioClass}`}
      data-voku-wheel
      data-zmax={zmaxClamped}
      aria-roledescription="carousel"
      aria-label={label || "Work"}
    >
      {label && (
        <header className={styles.head}>
          <span className={styles.label}>{label}</span>
          <span className={styles.count} data-count />
        </header>
      )}

      <div
        className={`${styles.stage} pointer-events-auto`}
        tabIndex={0}
        data-stage
        aria-label={label || "Work"}
      >
        <div className={styles.track} data-track>
          {items.map((item, i) => (
            <article
              key={`${item.title}-${i}`}
              className={[
                styles.card,
                item.type === "video" ? "is-video" : "is-image",
                chrome ? styles.cardHasChrome : "",
              ]
                .filter(Boolean)
                .join(" ")}
              data-card
              data-index={i}
            >
              {chrome && (
                <div className={styles.chrome} aria-hidden="true">
                  <span className={styles.dot} />
                  <span className={styles.dot} />
                  <span className={styles.dot} />
                  {item.href && (
                    <span className={styles.url}>{item.href.replace(/^https?:\/\//, "")}</span>
                  )}
                </div>
              )}

              <div className={styles.media}>
                {item.type === "video" ? (
                  <video
                    className={styles.video}
                    data-video
                    src={item.src}
                    poster={item.poster}
                    muted
                    loop
                    playsInline
                    preload="none"
                  />
                ) : (
                  <img
                    className={styles.img}
                    src={item.src}
                    alt={item.title}
                    loading="lazy"
                    decoding="async"
                  />
                )}

                <div className={styles.meta}>
                  <span className={styles.title}>{item.title}</span>
                  {item.meta && <span className={styles.sub}>{item.meta}</span>}
                </div>

                {item.type === "video" && (
                  <div className={styles.controls} data-controls>
                    <button
                      className={styles.ctrl}
                      data-playpause
                      type="button"
                      aria-label="Play or pause"
                    >
                      <svg className={styles.ic} data-icon-play viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      <svg
                        className={`${styles.ic} voku-ic--off`}
                        data-icon-pause
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
                      </svg>
                    </button>
                    <span className={styles.ctrlTime} data-time>
                      00:00:00
                    </span>
                    <button className={styles.ctrl} data-sound type="button" aria-label="Toggle sound">
                      <svg className={styles.ic} data-icon-muted viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M4 9v6h4l5 5V4L8 9H4z" opacity=".55" />
                        <path
                          d="M18 10l4 4m0-4l-4 4"
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="none"
                        />
                      </svg>
                      <svg
                        className={`${styles.ic} voku-ic--off`}
                        data-icon-unmuted
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M4 9v6h4l5 5V4L8 9H4z" />
                      </svg>
                    </button>
                    <button
                      className={styles.ctrl}
                      data-fullscreen
                      type="button"
                      aria-label="Fullscreen"
                    >
                      <svg
                        className={styles.ic}
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>

        <button
          className={`${styles.nav} ${styles.navPrev} pointer-events-auto`}
          data-prev
          type="button"
          aria-label="Previous"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 6l-6 6 6 6" />
          </svg>
        </button>
        <button
          className={`${styles.nav} ${styles.navNext} pointer-events-auto`}
          data-next
          type="button"
          aria-label="Next"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>
      </div>
    </section>
  );
}
