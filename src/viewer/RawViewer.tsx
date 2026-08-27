import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { Structure } from '../types';
import { buildAtomCloud, ELEMENT_COLOR, ELEMENT_RADIUS } from './atomCloud';
import { setHovered, setSelected, useSelection } from '../state/selection';

const HOVER = new THREE.Color(0xffffff);
const SELECT = new THREE.Color(0x7dff9a);

/** Mine: scene/camera/lights/orbit/resize + raycast picking. Your atomCloud plugs in. */
export function RawViewer({ structure }: { structure: Structure | null }) {
  const host = useRef<HTMLDivElement>(null);
  const cloudRef = useRef<THREE.InstancedMesh | null>(null);
  const sel = useSelection();

  // Build the scene once per structure.
  useEffect(() => {
    const el = host.current;
    if (!el || !structure) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b0e14);
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    el.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const key = new THREE.DirectionalLight(0xffffff, 1.2);
    key.position.set(1, 1, 1);
    scene.add(key);

    const cloud = buildAtomCloud(structure.atoms);
    cloudRef.current = cloud;
    scene.add(cloud);

    const [cx, cy, cz] = structure.center;
    camera.position.set(cx, cy, cz + 70);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(cx, cy, cz);
    controls.update();

    // --- picking: pointer → ray → instanceId → atom serial ---
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    let lastHit: number | null = null;
    const pick = (e: PointerEvent): number | null => {
      const r = renderer.domElement.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      const hit = ray.intersectObject(cloud, false)[0];
      return hit?.instanceId ?? null;
    };
    const onMove = (e: PointerEvent) => {
      const i = pick(e);
      if (i === lastHit) return;
      lastHit = i;
      setHovered(i === null ? null : structure.atoms[i].serial);
      renderer.domElement.style.cursor = i === null ? 'default' : 'pointer';
    };
    const onClick = (e: PointerEvent) => {
      const i = pick(e);
      setSelected(i === null ? null : structure.atoms[i].serial);
    };
    renderer.domElement.addEventListener('pointermove', onMove);
    renderer.domElement.addEventListener('click', onClick);

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = el;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();

    let raf = 0;
    const loop = () => { controls.update(); renderer.render(scene, camera); raf = requestAnimationFrame(loop); };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.domElement.removeEventListener('pointermove', onMove);
      renderer.domElement.removeEventListener('click', onClick);
      controls.dispose();
      cloud.geometry.dispose();
      (cloud.material as THREE.Material).dispose();
      renderer.dispose();
      el.removeChild(renderer.domElement);
      cloudRef.current = null;
    };
  }, [structure]);

  // Reflect the shared selection into instance colors/scales — whoever set it.
  useEffect(() => {
    const cloud = cloudRef.current;
    if (!cloud || !structure) return;
    const m = new THREE.Matrix4();
    const p = new THREE.Vector3();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3();
    const c = new THREE.Color();
    structure.atoms.forEach((a, i) => {
      const isHover = a.serial === sel.hoveredSerial;
      const isSel = a.serial === sel.selectedSerial;
      const isLig = a.hetero && a.resName !== 'HOH';
      const r = (ELEMENT_RADIUS[a.element] ?? 0.7) * (isLig ? 1.25 : 1) * (isHover || isSel ? 1.4 : 1);
      cloud.getMatrixAt(i, m);
      m.decompose(p, q, s);
      s.set(r, r, r);
      m.compose(p, q, s);
      cloud.setMatrixAt(i, m);
      c.set(ELEMENT_COLOR[a.element] ?? 0xff00ff);
      if (!isLig) c.multiplyScalar(0.55); // protein recedes, ligand pops
      if (isSel) c.copy(SELECT);
      if (isHover) c.copy(HOVER);
      cloud.setColorAt(i, c);
    });
    cloud.instanceMatrix.needsUpdate = true;
    if (cloud.instanceColor) cloud.instanceColor.needsUpdate = true;
  }, [structure, sel]);

  return <div ref={host} className="viewer" />;
}
