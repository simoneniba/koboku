"use client";

import { useSyncExternalStore } from "react";

/**
 * Due segnali globali per l'avvio:
 *  - sceneReady  : la scena 3D è caricata e stabile
 *  - introStart  : il loading screen ha iniziato a sparire → parte l'intro
 */
let sceneReady = false;
let introStart = false;
const readyListeners = new Set<() => void>();
const introListeners = new Set<() => void>();

export function markSceneReady() {
  if (sceneReady) return;
  sceneReady = true;
  readyListeners.forEach((l) => l());
}

export function markIntroStart() {
  if (introStart) return;
  introStart = true;
  introListeners.forEach((l) => l());
}

export function useSceneReady(): boolean {
  return useSyncExternalStore(
    (cb) => { readyListeners.add(cb); return () => readyListeners.delete(cb); },
    () => sceneReady,
    () => false,
  );
}

export function useIntroStarted(): boolean {
  return useSyncExternalStore(
    (cb) => { introListeners.add(cb); return () => introListeners.delete(cb); },
    () => introStart,
    () => false,
  );
}