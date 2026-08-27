"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { LUXURY_CAROUSEL_PROMPT } from "@/data/luxury-carousel-prompt";

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const el = document.createElement("textarea");
      el.value = text;
      el.setAttribute("readonly", "");
      el.style.cssText = "position:fixed;top:0;left:0;opacity:0;pointer-events:none;";
      document.body.appendChild(el);
      el.focus();
      el.select();
      el.setSelectionRange(0, el.value.length);
      const ok = document.execCommand("copy");
      document.body.removeChild(el);
      return ok;
    } catch {
      return false;
    }
  }
}

/**
 * Android / supporting browsers: patterned Vibration API.
 * iOS Safari has no vibrate API — visual motion is the feedback there.
 */
function premiumHaptic() {
  try {
    if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
    navigator.vibrate(0);
    navigator.vibrate([12, 42, 18, 28, 10]);
  } catch {
    /* unsupported */
  }
}

function isCoarsePointer() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(hover: none), (pointer: coarse)").matches;
}

export function CarouselCopyTool() {
  const [copied, setCopied] = useState(false);
  const [pressing, setPressing] = useState(false);
  const [coarse, setCoarse] = useState(false);
  const reduceMotion = useReducedMotion();
  const lockY = useRef(0);
  const pressTimer = useRef<number | null>(null);

  useEffect(() => {
    setCoarse(isCoarsePointer());
    const mq = window.matchMedia("(hover: none), (pointer: coarse)");
    const onChange = () => setCoarse(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Hard lock scroll — iOS rubber-band + Android overscroll + desktop Lenis.
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    lockY.current = window.scrollY || window.pageYOffset;

    const prev = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyWidth: body.style.width,
      bodyTouchAction: body.style.touchAction,
      htmlOverscroll: html.style.overscrollBehavior,
    };

    html.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";
    body.style.overflow = "hidden";
    body.style.touchAction = "none";
    body.style.position = "fixed";
    body.style.top = `-${lockY.current}px`;
    body.style.width = "100%";

    const blockTouchMove = (e: TouchEvent) => {
      e.preventDefault();
    };
    document.addEventListener("touchmove", blockTouchMove, { passive: false });

    return () => {
      document.removeEventListener("touchmove", blockTouchMove);
      html.style.overflow = prev.htmlOverflow;
      html.style.overscrollBehavior = prev.htmlOverscroll;
      body.style.overflow = prev.bodyOverflow;
      body.style.position = prev.bodyPosition;
      body.style.top = prev.bodyTop;
      body.style.width = prev.bodyWidth;
      body.style.touchAction = prev.bodyTouchAction;
      window.scrollTo(0, lockY.current);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (pressTimer.current) window.clearTimeout(pressTimer.current);
    };
  }, []);

  const handleCopy = useCallback(async () => {
    // Fire haptic + clipboard in the same user-gesture turn (iOS clipboard rules).
    premiumHaptic();
    const copyPromise = copyText(LUXURY_CAROUSEL_PROMPT);

    if (!reduceMotion) {
      setPressing(true);
      if (pressTimer.current) window.clearTimeout(pressTimer.current);
      pressTimer.current = window.setTimeout(() => setPressing(false), coarse ? 780 : 920);
    }

    const ok = await copyPromise;
    if (ok) setCopied(true);
  }, [reduceMotion, coarse]);

  const idleY = coarse ? 2 : 3;
  const idleScale = coarse ? ([1.07, 1.078, 1.07] as const) : ([1.07, 1.085, 1.07] as const);
  const pressAnim = coarse
    ? {
        scale: [1.07, 0.98, 1.085, 1.07],
        y: [0, 2, -4, 0],
        rotate: [0, -0.7, 0.45, 0],
        filter: ["brightness(1)", "brightness(1.06)", "brightness(1.14)", "brightness(1)"],
      }
    : {
        scale: [1.07, 0.97, 1.1, 1.07],
        y: [0, 3, -6, 0],
        rotate: [0, -1.1, 0.7, 0],
        filter: ["brightness(1)", "brightness(1.08)", "brightness(1.18)", "brightness(1)"],
      };

  return (
    <div className="flex-1 min-h-0 w-full flex flex-col items-center">
      <div className="shrink-0 flex flex-col items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 md:mb-3 px-2">
        <p
          className={`text-display text-center text-[0.7rem] sm:text-[0.8rem] md:text-[0.95rem] font-bold uppercase tracking-[-0.02em] transition-colors duration-700 max-w-[20ch] sm:max-w-none ${
            copied ? "text-amber" : "text-bone/50"
          }`}
          aria-live="polite"
        >
          {copied ? "paste it into the best AI you know" : "click to copy"}
        </p>

        <motion.span
          aria-hidden
          className={`block transition-colors duration-700 ${
            copied ? "text-amber/70" : "text-bone/35"
          }`}
          animate={
            reduceMotion || pressing
              ? undefined
              : { y: [0, coarse ? 3 : 4, 0], opacity: [0.35, 0.7, 0.35] }
          }
          transition={
            reduceMotion || pressing
              ? undefined
              : { duration: coarse ? 2.8 : 2.4, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY }
          }
        >
          <svg
            width="16"
            height="24"
            viewBox="0 0 18 28"
            fill="none"
            className="mx-auto sm:w-[18px] sm:h-[28px]"
          >
            <path
              d="M9 1v20M9 21l-5.5-5.5M9 21l5.5-5.5"
              stroke="currentColor"
              strokeWidth="1.15"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.span>
      </div>

      <div className="flex-1 min-h-0 w-full flex items-center justify-center">
        <div className="relative max-h-full max-w-full leading-none select-none [-webkit-touch-callout:none]">
          <Image
            src="/images/tools/carousel-layout.png"
            alt=""
            width={576}
            height={1024}
            className="max-h-[100%] max-w-full h-auto w-auto object-contain pointer-events-none"
            priority
            sizes="(max-width: 640px) 92vw, (max-width: 1024px) 70vw, 28rem"
            draggable={false}
          />

          <button
            type="button"
            onClick={handleCopy}
            onContextMenu={(e) => e.preventDefault()}
            aria-label={
              copied
                ? "Prompt copied. Paste it into the best AI you know."
                : "Click to copy the Luxury Carousel Engine prompt"
            }
            className="absolute left-[8.4%] top-[4.8%] w-[50.8%] aspect-[701/821] overflow-visible outline-none focus-visible:ring-1 focus-visible:ring-amber/50 cursor-pointer touch-manipulation [-webkit-tap-highlight-color:transparent] select-none"
            style={{ WebkitTouchCallout: "none" }}
          >
            <motion.span
              className="absolute inset-0 block will-change-transform origin-center"
              animate={
                reduceMotion
                  ? { scale: 1.07 }
                  : pressing
                    ? pressAnim
                    : {
                        y: [0, -idleY, 0],
                        scale: [...idleScale],
                      }
              }
              transition={
                reduceMotion
                  ? undefined
                  : pressing
                    ? {
                        duration: coarse ? 0.72 : 0.9,
                        times: [0, 0.18, 0.48, 1],
                        ease: [0.22, 1, 0.36, 1],
                      }
                    : {
                        duration: coarse ? 6.2 : 5.5,
                        ease: "easeInOut",
                        repeat: Number.POSITIVE_INFINITY,
                      }
              }
            >
              <Image
                src="/images/tools/carousel-painting.png"
                alt="Framed portrait — click to copy the prompt"
                width={800}
                height={1000}
                className="h-full w-full object-contain pointer-events-none drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
                priority
                sizes="(max-width: 640px) 50vw, 14rem"
                draggable={false}
              />

              <motion.span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-[2px]"
                initial={false}
                animate={
                  pressing
                    ? {
                        boxShadow: [
                          "0 0 0 0 rgba(138,106,74,0)",
                          coarse
                            ? "0 0 20px 1px rgba(138,106,74,0.4)"
                            : "0 0 28px 2px rgba(138,106,74,0.45)",
                          "0 0 0 0 rgba(138,106,74,0)",
                        ],
                      }
                    : { boxShadow: "0 0 0 0 rgba(138,106,74,0)" }
                }
                transition={{ duration: coarse ? 0.72 : 0.9, ease: [0.22, 1, 0.36, 1] }}
              />
            </motion.span>
          </button>
        </div>
      </div>
    </div>
  );
}
