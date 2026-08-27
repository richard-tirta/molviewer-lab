import * as THREE from 'three';
import type { Atom } from '../types';

export const ELEMENT_COLOR: Record<string, number> = {
  C: 0x909090, N: 0x3050f8, O: 0xff0d0d, S: 0xffff30, P: 0xff8000, H: 0xffffff,
};
export const ELEMENT_RADIUS: Record<string, number> = {
  C: 0.7, N: 0.65, O: 0.6, S: 1.0, P: 1.0, H: 0.3,
};

/**
 * YOURS. Return ONE InstancedMesh holding every atom.
 * - one SphereGeometry, one MeshStandardMaterial, `atoms.length` instances
 * - per-instance: setMatrixAt (position + radius scale), setColorAt (element)
 * - mark instanceMatrix / instanceColor needsUpdate
 * Why: 1,700 Mesh objects = 1,700 draw calls. One InstancedMesh = 1 draw call.
 */
export function buildAtomCloud(atoms: Atom[]): THREE.InstancedMesh {
  console.log('atoms,', atoms);

  const geometry = new THREE.SphereGeometry(1, 16, 16);
  const material = new THREE.MeshStandardMaterial();
  const mesh = new THREE.InstancedMesh(geometry, material, atoms.length);

  atoms.forEach((atom, i) => {
    const { x, y, z, element } = atom;
    const color = ELEMENT_COLOR[element] ?? 0xff00ff;
    const radius = ELEMENT_RADIUS[element] ?? 1.0;
    const position = new THREE.Vector3(x, y, z);
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3(radius, radius, radius);
    const matrix = new THREE.Matrix4();
    matrix.compose(position, quaternion, scale);
    mesh.setMatrixAt(i, matrix);
    mesh.setColorAt(i, new THREE.Color(color));
  });

  mesh.instanceMatrix.needsUpdate = true;
  mesh.instanceColor!.needsUpdate = true;

  return mesh;

}
