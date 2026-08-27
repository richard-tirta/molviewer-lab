export type Atom = {
  record: 'ATOM' | 'HETATM';
  serial: number;
  name: string;      // "CA", "N1"
  resName: string;   // "PRO", "MK1", "HOH"
  chain: string;     // "A"
  resSeq: number;    // 1, 902
  x: number;
  y: number;
  z: number;
  element: string;   // "C", "N", "O", "S"
  hetero: boolean;   // HETATM vs ATOM
};

export type Structure = {
  id: string;
  atoms: Atom[];
  /** ligand atoms = HETATM that aren't water */
  ligand: Atom[];
  center: [number, number, number];
};
