import { SceneGate } from "@/components/three/scene-gate";
import { Background } from "@/components/three/background";
import { Nav } from "@/components/layout/nav";
import { Hero } from "@/components/sections/hero";
import { Thesis } from "@/components/sections/thesis";
import { Verticals } from "@/components/sections/verticals";
import { Process } from "@/components/sections/process";
import { Work } from "@/components/sections/work";
import { Stance } from "@/components/sections/stance";
import { Contact } from "@/components/sections/contact";

export default function HomePage() {
  return (
    <>
      {/* Fixed layers — sit behind all content */}
      <Background />
      <SceneGate />

      {/* Fixed nav */}
      <Nav />

      {/* Scrollable content — transparent over fixed 3D canvas */}
      <main className="relative z-[2] bg-transparent">
        <Hero />
        <Thesis />
        <Verticals />
        <Process />
        <Work />
        <Stance />
        <Contact />
      </main>
    </>
  );
}
