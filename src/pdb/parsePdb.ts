import type { Atom, Structure } from '../types';

// export type Atom = {
//   serial: number;
//   name: string;      // "CA", "N1"
//   resName: string;   // "PRO", "MK1", "HOH"
//   chain: string;     // "A"
//   resSeq: number;    // 1, 902
//   x: number; y: number; z: number;
//   element: string;   // "C", "N", "O", "S"
//   hetero: boolean;   // HETATM vs ATOM
// };

/**
 * YOURS. PDB is a FIXED-WIDTH format — never split on whitespace.
 * Columns are 1-indexed in the spec; JS slice is 0-indexed, so
 * spec cols 31–38 → line.slice(30, 38).
 *
 *  cols  1–6   record name   "ATOM  " | "HETATM"
 *  cols  7–11  serial
 *  cols 13–16  atom name
 *  cols 18–20  residue name
 *  col  22     chain id
 *  cols 23–26  residue seq
 *  cols 31–38  x     
 *  cols 39–46  y     
 *  cols 47–54  z
 *  cols 77–78  element (right-justified; may be blank in old files —
 *              fall back to the first letter of the atom name)
 */
export function parsePdb(text: string, id: string): Structure {
  

  const lines = text.split('\n');
  const atomLines = lines.filter((l) => l.startsWith('ATOM') || l.startsWith('HETATM'));

  const isBadRecord = atomLines.some((l) => l.slice(0, 6) !== 'ATOM  ' && l.slice(0, 6) !== 'HETATM');
  if (isBadRecord) throw new Error('parsePdb: bad record name in ATOM/HETATM lines');

  const atomObjects: Atom[] = atomLines.map((line): Atom => {
    const record = line.slice(0, 6).trim() as 'ATOM' | 'HETATM';
    const serial = parseInt(line.slice(6, 11).trim(), 10);
    const name = line.slice(12, 16).trim();
    const resName = line.slice(17, 20).trim();
    const chain = line.slice(21, 22).trim();
    const resSeq = parseInt(line.slice(22, 26).trim(), 10);
    const x = parseFloat(line.slice(30, 38).trim());
    const y = parseFloat(line.slice(38, 46).trim());
    const z = parseFloat(line.slice(46, 54).trim());
    let element = line.slice(76, 78).trim();
    if (!element) {
      element = name[0]; // Fallback to first letter of atom name
    }
    return { record, serial, name, resName, chain, resSeq, x, y, z, element, hetero: record === 'HETATM' };
  });

  const nan = atomObjects.some((a) => !Number.isFinite(a.x) || !Number.isFinite(a.y) || !Number.isFinite(a.z) || !Number.isFinite(a.serial));
  if (nan) throw new Error('parsePdb: found NaN in atom coordinates or serial numbers');

  const ligand = atomObjects.filter((a) => a.hetero && a.resName !== 'HOH');
  const n = atomObjects.length;
  const center: [number, number, number] = [
    atomObjects.reduce((sum, a) => sum + a.x, 0) / n,
    atomObjects.reduce((sum, a) => sum + a.y, 0) / n,
    atomObjects.reduce((sum, a) => sum + a.z, 0) / n,
  ];

  console.log('atomObjects', atomObjects);
  console.log('ligand', ligand, 'center', center);

  return { id, atoms: atomObjects, ligand, center };
}
