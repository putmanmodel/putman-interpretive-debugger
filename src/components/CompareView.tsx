import { ActivationGraphView } from './ActivationGraphView';
import { CandidateRankings } from './CandidateRankings';
import { ExplanationTrace } from './ExplanationTrace';
import { PruningInspector } from './PruningInspector';
import type { CompareResult, RunResult } from '../core/types';

interface CompareViewProps {
  result: CompareResult;
}

function CompareColumn({ title, result }: { title: string; result: RunResult }) {
  return (
    <div className="compare-column">
      <div className="compare-heading">
        <h2>{title}</h2>
        <p>
          {result.context.label}
        </p>
      </div>
      <ActivationGraphView result={result} />
      <CandidateRankings candidates={result.candidates} selectedCandidateId={result.selected.id} />
      <PruningInspector prunedBranches={result.pruned} />
      <ExplanationTrace steps={result.explanation} />
    </div>
  );
}

export function CompareView({ result }: CompareViewProps) {
  return (
    <section className="compare-layout">
      <CompareColumn title={result.left.context.label} result={result.left} />
      <CompareColumn title={result.right.context.label} result={result.right} />
    </section>
  );
}
