import { useEffect, useRef } from 'react';
import { createPluginUI } from 'molstar/lib/mol-plugin-ui';
import { renderReact18 } from 'molstar/lib/mol-plugin-ui/react18';
import { DefaultPluginUISpec } from 'molstar/lib/mol-plugin-ui/spec';
import { PluginConfig } from 'molstar/lib/mol-plugin/config';
import type { PluginUIContext } from 'molstar/lib/mol-plugin-ui/context';
import 'molstar/lib/mol-plugin-ui/skin/dark.scss';

/** Mine: the library the JD names. Same PDB, zero hand-rolled rendering. */
export function MolstarViewer({ url }: { url: string }) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let plugin: PluginUIContext | undefined;
    let cancelled = false;

    (async () => {
      const p = await createPluginUI({
        target: el,
        render: renderReact18,
        spec: {
          ...DefaultPluginUISpec(),
          layout: { initial: { isExpanded: false, showControls: false } },
          config: [[PluginConfig.Viewport.ShowExpand, false], [PluginConfig.Viewport.ShowSelectionMode, false], [PluginConfig.Viewport.ShowAnimation, false]],
        },
      });
      if (cancelled) { p.dispose(); return; }
      plugin = p;
      const data = await p.builders.data.download({ url }, { state: { isGhost: true } });
      const traj = await p.builders.structure.parseTrajectory(data, 'pdb');
      await p.builders.structure.hierarchy.applyPreset(traj, 'default');
    })();

    return () => { cancelled = true; plugin?.dispose(); };
  }, [url]);

  return <div ref={host} className="viewer molstar" />;
}
