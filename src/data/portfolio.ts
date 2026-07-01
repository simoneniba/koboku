import type { WheelItem } from "@/components/wheel/VokuWheel";

// PLACEHOLDER CONTENT — swap every src/poster/href for real Koboku assets before production.

const imgL = (seed: string) => `https://picsum.photos/seed/${seed}/1600/900`;
const imgP = (seed: string) => `https://picsum.photos/seed/${seed}/900/1600`;
const sampleVid = "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";

export const cinema: WheelItem[] = [
  { type: "image", src: imgL("kob-c1"), title: "Untitled I", meta: "2026 — Image" },
  {
    type: "video",
    src: sampleVid,
    poster: imgL("kob-c2"),
    title: "Motion Study",
    meta: "2026 — Film",
  },
  { type: "image", src: imgL("kob-c3"), title: "Untitled II", meta: "2026 — Image" },
  {
    type: "video",
    src: sampleVid,
    poster: imgL("kob-c4"),
    title: "Nightfall",
    meta: "2026 — Film",
  },
  { type: "image", src: imgL("kob-c5"), title: "Untitled III", meta: "2026 — Image" },
  { type: "video", src: sampleVid, poster: imgL("kob-c6"), title: "Drift", meta: "2026 — Film" },
];

export const reels: WheelItem[] = [
  { type: "image", src: imgP("kob-r1"), title: "Reel 01", meta: "2026 — Image" },
  {
    type: "video",
    src: sampleVid,
    poster: imgP("kob-r2"),
    title: "Reel 02",
    meta: "2026 — Video",
  },
  { type: "image", src: imgP("kob-r3"), title: "Reel 03", meta: "2026 — Image" },
  {
    type: "video",
    src: sampleVid,
    poster: imgP("kob-r4"),
    title: "Reel 04",
    meta: "2026 — Video",
  },
  { type: "image", src: imgP("kob-r5"), title: "Reel 05", meta: "2026 — Image" },
  {
    type: "video",
    src: sampleVid,
    poster: imgP("kob-r6"),
    title: "Reel 06",
    meta: "2026 — Video",
  },
];

export const sites: WheelItem[] = [
  {
    type: "video",
    src: sampleVid,
    poster: imgL("kob-s1"),
    title: "Casa Passerini",
    meta: "Agriturismo — Firenze",
    href: "https://example.com",
  },
  {
    type: "video",
    src: sampleVid,
    poster: imgL("kob-s2"),
    title: "Luke Belmar",
    meta: "Capital Club",
    href: "https://lukebelmar.vercel.app",
  },
];

export const portfolioItemCount = cinema.length + reels.length + sites.length;
