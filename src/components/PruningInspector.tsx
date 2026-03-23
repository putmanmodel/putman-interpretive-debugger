import type { PrunedBranch } from '../core/types';

interface PruningInspectorProps {
  prunedBranches: PrunedBranch[];
}

export function PruningInspector({ prunedBranches }: PruningInspectorProps) {
  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Pruning Inspector</h2>
        <span className="panel-kicker">What got cut and why</span>
      </div>
      <div className="prune-list">
        {prunedBranches.length === 0 ? (
          <p className="muted">No branches were pruned in the final run.</p>
        ) : (
          prunedBranches.map((branch) => (
            <article key={`${branch.kind}-${branch.id}-${branch.pass}`} className="prune-row">
              <strong>{branch.label}</strong>
              <span>{branch.reason}</span>
              <span>pass {branch.pass}</span>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
