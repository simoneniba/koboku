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

// ---------------------------------------------------------------------------
// Orbit constellation — three rings circling the statue in the Work section.
// Order on the page: 1) Sites (white backdrop)  2) Film (black)  3) Reels (video).
//
// REAL ASSETS — served from /public, copied from the user's Downloads folder:
//   Reels : /videos/reels/reel-1.mp4 …   + /images/reels/reel-image-1.png …  (9:16)
//   Film  : /videos/film/film-1.mp4 …    + /images/film/film-image-1.jpeg …  (16:9)
//
// Sites ring: placeholder thumbnails until real screenshots are exported —
// swap imgL("kob-site-…") for /images/sites/casa-passerini-1.jpg etc.

export interface OrbitItem {
  type: "image" | "video";
  src: string;
  ratio: "16:9" | "9:16";
  title: string;
  /** When set, tapping the plane opens this URL in a new tab. */
  href?: string;
  /** Still frame shown while the video is inactive (off-screen ring or
   *  back-facing plane). For image items this is unused — the image IS
   *  the poster. For video items without an explicit poster, the first
   *  frame of the video is used (browser default). */
  poster?: string;
}

export const orbitReels: OrbitItem[] = [
  {
    type: "video",
    src: "/videos/reels/reel-1.mp4",
    poster: "/images/reels/reel-image-1.png",
    ratio: "9:16",
    title: "Reel 1",
  },
  { type: "image", src: "/images/reels/reel-image-1.png", ratio: "9:16", title: "Reel Image 1" },
  {
    type: "video",
    src: "/videos/reels/reel-2.mp4",
    poster: "/images/reels/reel-image-2.png",
    ratio: "9:16",
    title: "Reel 2",
  },
  { type: "image", src: "/images/reels/reel-image-2.png", ratio: "9:16", title: "Reel Image 2" },
  {
    type: "video",
    src: "/videos/reels/reel-3.mp4",
    poster: "/images/reels/reel-image-3.png",
    ratio: "9:16",
    title: "Reel 3",
  },
  { type: "image", src: "/images/reels/reel-image-3.png", ratio: "9:16", title: "Reel Image 3" },
  {
    type: "video",
    src: "/videos/reels/reel-4.mp4",
    poster: "/images/reels/reel-image-4.png",
    ratio: "9:16",
    title: "Reel 4",
  },
  { type: "image", src: "/images/reels/reel-image-4.png", ratio: "9:16", title: "Reel Image 4" },
  {
    type: "video",
    src: "/videos/reels/reel-5.mp4",
    poster: "/images/reels/reel-image-5.png",
    ratio: "9:16",
    title: "Reel 5",
  },
  { type: "image", src: "/images/reels/reel-image-5.png", ratio: "9:16", title: "Reel Image 5" },
  {
    type: "video",
    src: "/videos/reels/reel-6.mp4",
    poster: "/images/reels/reel-image-6.png",
    ratio: "9:16",
    title: "Reel 6",
  },
  { type: "image", src: "/images/reels/reel-image-6.png", ratio: "9:16", title: "Reel Image 6" },
  {
    type: "video",
    src: "/videos/reels/reel-7.mp4",
    poster: "/images/reels/reel-image-7.png",
    ratio: "9:16",
    title: "Reel 7",
  },
  { type: "image", src: "/images/reels/reel-image-7.png", ratio: "9:16", title: "Reel Image 7" },
  {
    type: "video",
    src: "/videos/reels/reel-8.mp4",
    poster: "/images/reels/reel-image-8.png",
    ratio: "9:16",
    title: "Reel 8",
  },
  { type: "image", src: "/images/reels/reel-image-8.png", ratio: "9:16", title: "Reel Image 8" },
  {
    type: "video",
    src: "/videos/reels/reel-9.mp4",
    poster: "/images/reels/reel-image-8.png",
    ratio: "9:16",
    title: "Reel 9",
  },
  {
    type: "video",
    src: "/videos/reels/reel-10.mp4",
    poster: "/images/reels/reel-image-8.png",
    ratio: "9:16",
    title: "Reel 10",
  },
  {
    type: "video",
    src: "/videos/reels/reel-11.mp4",
    poster: "/images/reels/reel-image-8.png",
    ratio: "9:16",
    title: "Reel 11",
  },
];

export const orbitFilm: OrbitItem[] = [
  {
    type: "video",
    src: "/videos/film/film-1.mp4",
    poster: "/images/film/film-image-1.jpeg",
    ratio: "16:9",
    title: "Film 1",
  },
  { type: "image", src: "/images/film/film-image-1.jpeg", ratio: "16:9", title: "Film Image 1" },
  {
    type: "video",
    src: "/videos/film/film-2.mp4",
    poster: "/images/film/film-image-2.jpeg",
    ratio: "16:9",
    title: "Film 2",
  },
  { type: "image", src: "/images/film/film-image-2.jpeg", ratio: "16:9", title: "Film Image 2" },
  {
    type: "video",
    src: "/videos/film/film-3.mp4",
    poster: "/images/film/film-image-3.jpeg",
    ratio: "16:9",
    title: "Film 3",
  },
  { type: "image", src: "/images/film/film-image-3.jpeg", ratio: "16:9", title: "Film Image 3" },
  { type: "image", src: "/images/film/film-image-4.png", ratio: "16:9", title: "Film Image 4" },
  { type: "image", src: "/images/film/film-image-5.png", ratio: "16:9", title: "Film Image 5" },
  { type: "image", src: "/images/film/film-image-6.png", ratio: "16:9", title: "Film Image 6" },
  { type: "image", src: "/images/film/film-image-7.png", ratio: "16:9", title: "Film Image 7" },
  { type: "image", src: "/images/film/film-image-8.png", ratio: "16:9", title: "Film Image 8" },
  { type: "image", src: "/images/film/film-image-9.png", ratio: "16:9", title: "Film Image 9" },
  { type: "image", src: "/images/film/film-image-10.png", ratio: "16:9", title: "Film Image 10" },
  { type: "image", src: "/images/film/film-image-11.png", ratio: "16:9", title: "Film Image 11" },
  { type: "image", src: "/images/film/film-image-12.png", ratio: "16:9", title: "Film Image 12" },
  { type: "image", src: "/images/film/film-image-13.png", ratio: "16:9", title: "Film Image 13" },
  { type: "image", src: "/images/film/film-image-14.png", ratio: "16:9", title: "Film Image 14" },
  { type: "image", src: "/images/film/film-image-15.png", ratio: "16:9", title: "Film Image 15" },
  { type: "image", src: "/images/film/film-image-16.png", ratio: "16:9", title: "Film Image 16" },
  { type: "image", src: "/images/film/film-image-17.webp", ratio: "16:9", title: "Film Image 17" },
  { type: "image", src: "/images/film/film-image-18.webp", ratio: "16:9", title: "Film Image 18" },
];

const CASA_PASSERINI_URL = "https://casa-passerini-site.vercel.app/it/";

export const orbitSites: OrbitItem[] = [
  {
    type: "image",
    src: imgL("kob-site-cp-1"),
    ratio: "16:9",
    title: "Casa Passerini",
    href: CASA_PASSERINI_URL,
  },
  {
    type: "image",
    src: imgL("kob-site-cp-2"),
    ratio: "16:9",
    title: "Casa Passerini",
    href: CASA_PASSERINI_URL,
  },
  {
    type: "image",
    src: imgL("kob-site-cp-3"),
    ratio: "16:9",
    title: "Casa Passerini",
    href: CASA_PASSERINI_URL,
  },
  {
    type: "image",
    src: imgL("kob-site-cp-4"),
    ratio: "16:9",
    title: "Casa Passerini",
    href: CASA_PASSERINI_URL,
  },
];
