import type { Structure } from '../types';
import { setHovered, setSelected, useSelection } from '../state/selection';
import { Smiles2D } from './Smiles2D';

/** Indinavir (MK1) — PubChem CID 5362440 */
const LIGANDS: Record<string, { name: string; smiles: string }> = {
  MK1: {
    name: 'Indinavir',
    smiles: 'CC(C)(C)NC(=O)[C@@H]1CN(CCN1C[C@@H](O)C[C@@H](Cc1ccccc1)C(=O)N[C@@H]1[C@H](O)Cc2ccccc21)Cc1cccnc1',
  },
};

/** Mine: the 2D structure + an atom table that shares selection with the 3D scene. */
export function MoleculesPanel({ structure }: { structure: Structure }) {
  const sel = useSelection();
  const res = structure.ligand[0]?.resName;
  const lig = res ? LIGANDS[res] : undefined;

  return (
    <div className="panel">
      <h2>{lig?.name ?? res ?? 'No ligand'} <span className="muted">{res}</span></h2>
      {lig && <Smiles2D smiles={lig.smiles} />}
      <table className="atoms">
        <thead><tr><th>#</th><th>name</th><th>el</th><th>x</th><th>y</th><th>z</th></tr></thead>
        <tbody onMouseLeave={() => setHovered(null)}>
          {structure.ligand.map((a) => (
            <tr
              key={a.serial}
              className={a.serial === sel.selectedSerial ? 'is-selected' : a.serial === sel.hoveredSerial ? 'is-hovered' : ''}
              onMouseEnter={() => setHovered(a.serial)}
              onClick={() => setSelected(a.serial === sel.selectedSerial ? null : a.serial)}
            >
              <td>{a.serial}</td><td>{a.name}</td><td>{a.element}</td>
              <td>{a.x.toFixed(1)}</td><td>{a.y.toFixed(1)}</td><td>{a.z.toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
