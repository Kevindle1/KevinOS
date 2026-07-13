import { useMemo, useState } from 'react';
import { stories } from '../stories.js';

/**
 * Mode 1 — Component Explorer : un composant seul, toutes ses variantes / tailles
 * / états. Liste à gauche, rendu isolé à droite.
 */
export function Explorer() {
  const [selected, setSelected] = useState(stories[0]?.id ?? '');

  const groups = useMemo(() => {
    const map = new Map<string, typeof stories>();
    for (const s of stories) {
      const arr = map.get(s.group) ?? [];
      arr.push(s);
      map.set(s.group, arr);
    }
    return [...map.entries()];
  }, []);

  const current = stories.find((s) => s.id === selected) ?? stories[0];

  return (
    <div className="flex h-full min-h-0">
      <aside className="w-60 flex-none border-r border-border overflow-y-auto py-3">
        {groups.map(([group, items]) => (
          <div key={group} className="mb-4">
            <div className="px-4 mb-1 font-mono text-[11px] uppercase tracking-wider text-text-muted">
              {group}
            </div>
            {items.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelected(s.id)}
                className={
                  'w-full text-left px-4 h-9 text-sm transition duration-fast ease-out ' +
                  'focus-visible:outline-none focus-visible:shadow-focus ' +
                  (s.id === current?.id
                    ? 'text-accent bg-accent-subtle'
                    : 'text-text-secondary hover:bg-hover hover:text-text')
                }
              >
                {s.name}
              </button>
            ))}
          </div>
        ))}
      </aside>

      <section className="flex-1 overflow-auto p-8 min-w-0">
        <h2 className="text-xl font-semibold mb-1">{current?.name}</h2>
        <p className="text-sm text-text-secondary mb-6">{current?.group}</p>
        <div className="rounded-xl border border-border bg-bg p-8">{current?.render()}</div>
      </section>
    </div>
  );
}
