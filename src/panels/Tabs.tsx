import { useState, type ReactNode } from 'react';

/** Mine: minimal tabs. */
export function Tabs({ tabs }: { tabs: { id: string; label: string; content: ReactNode }[] }) {
  const [active, setActive] = useState(tabs[0].id);
  return (
    <div className="tabs">
      <div className="tab-bar" role="tablist">
        {tabs.map((t) => (
          <button key={t.id} role="tab" aria-selected={t.id === active} className={t.id === active ? 'is-active' : ''} onClick={() => setActive(t.id)}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="tab-body">{tabs.find((t) => t.id === active)?.content}</div>
    </div>
  );
}
