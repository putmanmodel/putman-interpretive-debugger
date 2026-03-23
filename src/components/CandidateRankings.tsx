import type { CandidateInterpretation } from '../core/types';

interface CandidateRankingsProps {
  candidates: CandidateInterpretation[];
  selectedCandidateId: string | null;
}

export function CandidateRankings({ candidates, selectedCandidateId }: CandidateRankingsProps) {
  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Candidate Rankings</h2>
        <span className="panel-kicker">Deterministic reconstruction output</span>
      </div>
      <div className="candidate-list">
        {candidates.map((candidate) => (
          <article
            key={candidate.id}
            className={candidate.id === selectedCandidateId ? 'candidate-card candidate-card-selected' : 'candidate-card'}
          >
            <div className="candidate-heading">
              <strong>
                #{candidate.rank} {candidate.label}
              </strong>
              <span>{candidate.score.toFixed(3)}</span>
            </div>
            <p>{candidate.description}</p>
            <p className="muted">
              Support nodes: {candidate.supportNodeLabels.join(', ') || 'none'} | Bridge support: {candidate.bridgeSupport.toFixed(3)}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
