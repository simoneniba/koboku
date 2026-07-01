# Koboku Studio — Site

Award-tier marketing site for Koboku Studio. Next.js 15 + React 19 + Tailwind v4, choreographed with GSAP, smoothed by Lenis, dimensional with Three.js / React Three Fiber.

## Stack

| Layer       | Tooling                                                       |
| ----------- | ------------------------------------------------------------- |
| Framework   | Next.js 15 (App Router, Turbopack) · React 19 · TypeScript    |
| Styling     | Tailwind CSS v4 (oxide) · CSS variable design tokens          |
| Motion      | GSAP 3 (ScrollTrigger, SplitText) · `@gsap/react` · Lenis     |
| 3D          | three.js · @react-three/fiber · @react-three/drei · postprocessing |
| Tooling     | Biome (lint + format)                                         |

## Scripts

```bash
npm run dev      # Turbopack dev server at http://localhost:3000
npm run build    # Production build
npm run start    # Run the production build
npm run lint     # Biome check
npm run format   # Biome write
```

## Project layout

```
src/
  app/
    layout.tsx          # Fonts, metadata, SmoothScroll provider
    page.tsx            # Homepage composition
    globals.css         # Tailwind v4 theme + design tokens + utilities
  components/
    layout/             # Nav, chrome
    sections/           # Page-level sections (Hero, Manifesto, Work, Footer)
    three/              # R3F Scene wrapper + 3D primitives
    providers/          # SmoothScroll (Lenis) provider
  lib/
    gsap.ts             # Centralised GSAP registration
    utils.ts            # Small helpers (cn, lerp, clamp)
public/
  models/               # Drop Blender .glb / .gltf exports here
```

## Working with Blender assets

1. Export from Blender as **glTF 2.0 (.glb)** — embed textures, +Y up.
2. Drop the file into `public/models/`.
3. Generate a typed R3F component:

   ```bash
   npx gltfjsx public/models/hero.glb -o src/components/three/models/Hero.tsx --types --transform
   ```

4. Replace the placeholder geometry in `src/components/three/hero-object.tsx`.

## Motion conventions

- All GSAP code lives behind `useGSAP` (auto cleanup on unmount).
- Always import `gsap`, `ScrollTrigger`, `SplitText` from `@/lib/gsap` so plugin registration happens exactly once.
- Lenis drives the page; `ScrollTrigger.update` is called from the Lenis `scroll` event for perfect sync.
- Default ease is `expo.out`, default duration `1.2s` — override per timeline as needed.

## Design tokens

Defined in `globals.css` under `@theme`. Tailwind auto-generates utilities, so `bg-ink`, `text-bone`, `text-accent`, etc. all work out of the box. Add new tokens there to keep the system single-source-of-truth.
