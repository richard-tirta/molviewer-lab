# molviewer-lab

One-day learning build (2026-08-27) for the Deep Origin Staff Frontend interview
(hiring manager, Fri 2026-08-28). Goal: hands-on exposure to WebGL/three.js and
Mol\* so "molecular viewers are new domain, not new technology" is said from
experience. See `claude-station/career/` and
`frontend-career-grower/companies/deep-origin/README.md` for interview prep.

Run: `npx vite --port 5180` → http://localhost:5180. `npx vite build` passes.
Not a git repo yet; not deployed (Vercel deploy was requested in another session).

## Split of labor (deliberate — Richard hand-types the pieces worth owning)

| file | owner | status |
|---|---|---|
| `src/pdb/parsePdb.ts` | **Richard** | DONE — fixed-width column parser w/ two validation throws; 1686 atoms / 45 ligand (MK1) |
| `src/viewer/atomCloud.ts` | **Richard** | DONE — one `InstancedMesh`, per-instance matrix+color; reviewed |
| `src/state/selection.ts` | **Richard** | **TODO** — currently a TEMPORARY non-throwing stub returning a static `EMPTY` snapshot. Real store = module state + `Set` of listeners + `subscribe/getSnapshot/emit` + `useSyncExternalStore`. Gotcha: `getSnapshot` must return the same object until a change. |
| `src/viewer/RawViewer.tsx` | Claude | scene/camera/lights/orbit/resize; raycast picking (`hit.instanceId` → `atoms[i]`); effect 2 repaints instance buffers from the selection |
| `src/viewer/MolstarViewer.tsx` | Claude | Mol\* via `createPluginUI` + `renderReact18` (NOT `apps/viewer` — that pulls every extension and breaks on `fp-ts/es6`); dark skin scss (sass installed) |
| `src/panels/*` | Claude | Molecules (indinavir 2D via smiles-drawer + 45-atom table sharing selection), Jobs (fake ticking), Tabs |
| `src/App.tsx` | Claude | 3-column shell: left info + Selection readout, center tabs (three.js / Mol\*), right tabs (Molecules / Jobs) |

Data: `public/1HSG.pdb` — HIV-1 protease + indinavir (MK1). 1514 ATOM, 172 HETATM (45 MK1 + 127 HOH).

## Concepts covered with Richard (don't re-teach; build on)
- PDB = fixed-width text, `ATOM`/`HETATM`, `HOH` = water; ligand = hetero && !HOH; center = mean xyz for the camera.
- Drug discovery pipeline vocabulary: target, pocket, ligand, docking, pose, score, RMSD, SMILES, ADMET, protonation @ pH 7.4.
- three.js via Flash mapping: Scene=stage, Geometry=Library symbol, Material=paint, Mesh=instance on stage, Camera, Renderer+rAF loop.
- Instancing = one symbol, many instances, ONE draw call; `Matrix4.compose(pos, quat, scale)`; `needsUpdate` flags.
- Picking = NDC → `Raycaster.setFromCamera` → `intersectObject` → `instanceId`.
- Why the store lives outside React (three.js callbacks can't read `useState`); `useSyncExternalStore`.

## Next
1. Richard writes `selection.ts` → table row hover ↔ 3D sphere highlight works.
2. `git init` + commit (Richard commits), deploy to Vercel (preview URL for the interview).
3. Optional: bonds (distance rule < 1.9 Å, cylinders — instanced too), code-split Mol\* (4.3 MB chunk).
