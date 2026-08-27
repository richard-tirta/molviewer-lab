import { useEffect, useState } from 'react';
import type { Structure } from './types';
import { parsePdb } from './pdb/parsePdb';
import { RawViewer } from './viewer/RawViewer';
import { MolstarViewer } from './viewer/MolstarViewer';
import { MoleculesPanel } from './panels/MoleculesPanel';
import { JobsPanel } from './panels/JobsPanel';
import { Tabs } from './panels/Tabs';
import { useSelection } from './state/selection';

const PDB_URL = '/1HSG.pdb';

export default function App() {
  const [structure, setStructure] = useState<Structure | null>(null);
  const [error, setError] = useState<string | null>(null);
  const sel = useSelection();

  useEffect(() => {
    fetch(PDB_URL)
      .then((r) => r.text())
      .then((t) => setStructure(parsePdb(t, '1HSG')))
      .catch((e) => setError(String(e)));
  }, []);

  const atom = structure?.atoms.find((a) => a.serial === (sel.hoveredSerial ?? sel.selectedSerial));

  return (
    <div className="shell">
      <aside className="side">
        <h1>molviewer-lab</h1>
        {error && <p className="err">{error}</p>}
        {structure && (
          <dl>
            <dt>Structure</dt><dd>{structure.id}</dd>
            <dt>Atoms</dt><dd>{structure.atoms.length}</dd>
            <dt>Ligand atoms</dt><dd>{structure.ligand.length}</dd>
          </dl>
        )}
        <h2>Selection</h2>
        {atom ? (
          <dl>
            <dt>{sel.hoveredSerial ? 'hover' : 'selected'}</dt><dd>#{atom.serial}</dd>
            <dt>Residue</dt><dd>{atom.resName} {atom.chain}{atom.resSeq}</dd>
            <dt>Atom</dt><dd>{atom.name} ({atom.element})</dd>
            <dt>xyz</dt><dd>{atom.x.toFixed(2)}, {atom.y.toFixed(2)}, {atom.z.toFixed(2)}</dd>
          </dl>
        ) : <p className="muted">hover or click an atom</p>}
      </aside>
      <main className="center">
        <Tabs tabs={[
          { id: 'raw', label: 'three.js (hand-rolled)', content: <RawViewer structure={structure} /> },
          { id: 'molstar', label: 'Mol*', content: <MolstarViewer url={PDB_URL} /> },
        ]} />
      </main>
      <aside className="side right">
        {structure && (
          <Tabs tabs={[
            { id: 'mol', label: 'Molecules', content: <MoleculesPanel structure={structure} /> },
            { id: 'jobs', label: 'Jobs', content: <JobsPanel /> },
          ]} />
        )}
      </aside>
    </div>
  );
}
