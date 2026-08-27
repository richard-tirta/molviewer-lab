import { useSyncExternalStore } from 'react';

/**
 * YOURS. A tiny external store (no library) so the table, the 2D panel and
 * the 3D scene all read/write ONE selection.
 * - state: { hoveredSerial: number | null; selectedSerial: number | null }
 * - subscribe(listener) → unsubscribe
 * - getSnapshot() → current state object (must be referentially stable
 *   between changes or useSyncExternalStore will loop)
 * - setHovered(serial), setSelected(serial)
 * - useSelection() hook via useSyncExternalStore
 */
export type Selection = { hoveredSerial: number | null; selectedSerial: number | null };

// TEMPORARY non-throwing stub so the viewer renders while you review atomCloud.
// TODO(richard): replace with the real store (subscribe / getSnapshot / emit).
const EMPTY: Selection = { hoveredSerial: null, selectedSerial: null };
export function useSelection(): Selection {
  return EMPTY;
}
export function setHovered(_serial: number | null) {}
export function setSelected(_serial: number | null) {}
