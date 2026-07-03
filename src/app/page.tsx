import { Nav } from "@/components/layout/nav";
import { SceneDirector } from "@/components/providers/scene-director";
import { Contact } from "@/components/sections/contact";
import { Hero } from "@/components/sections/hero";
import { Process } from "@/components/sections/process";
import { Thesis } from "@/components/sections/thesis";
import { Verticals } from "@/components/sections/verticals";
import { Work } from "@/components/sections/work";
import { Background } from "@/components/three/background";
import { SceneGate } from "@/components/three/scene-gate";

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
        <Contact />
      </main>

      {/* Section tracking for the camera/scene modes — after main so all
          section ids exist when triggers are created */}
      <SceneDirector />
    </>
  );
}
