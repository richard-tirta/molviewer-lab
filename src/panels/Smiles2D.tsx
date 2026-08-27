import { useEffect, useRef } from 'react';
import SmilesDrawer from 'smiles-drawer';

/** Mine: SMILES string → 2D structure SVG. */
export function Smiles2D({ smiles, width = 280, height = 200 }: { smiles: string; width?: number; height?: number }) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    svg.replaceChildren();
    const drawer = new SmilesDrawer.SmiDrawer({ width, height });
    drawer.draw(smiles, svg, 'dark');
  }, [smiles, width, height]);
  return <svg ref={ref} width={width} height={height} className="smiles" />;
}
