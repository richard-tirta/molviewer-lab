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

// (1) One slot holding the current state. The VARIABLE gets reassigned; the
// OBJECT is never mutated — that's what lets React detect a change by reference.
let state: Selection = { hoveredSerial: null, selectedSerial: null };

// (2) Who wants to know when it changes.
const listeners = new Set<() => void>();

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener); // React calls this on unmount
}

// (3) "Something changed" — no payload; React re-reads getSnapshot itself.
function emit() {
  listeners.forEach((l) => l());
}

export function getSnapshot(): Selection {
  return state;
}

export function useSelection(): Selection {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

// (4) Setters: bail if nothing changes, else REPLACE the object and emit.
export function setHovered(serial: number | null) {
  if (serial === state.hoveredSerial) return;
  state = { ...state, hoveredSerial: serial };
  emit();
}

export function setSelected(serial: number | null) {
  if (serial === state.selectedSerial) return;
  state = { ...state, selectedSerial: serial };
  emit();
}
