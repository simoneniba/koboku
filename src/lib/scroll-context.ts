import { createContext, useContext } from "react";

export interface ScrollState {
  /** Normalised scroll progress 0 → 1 */
  progress: number;
}

export const ScrollContext = createContext<ScrollState>({ progress: 0 });

export function useScrollProgress(): number {
  return useContext(ScrollContext).progress;
}
