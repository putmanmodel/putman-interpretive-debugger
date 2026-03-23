import type { ExplanationStep } from '../core/types';

interface ExplanationTraceProps {
  steps: ExplanationStep[];
}

export function ExplanationTrace({ steps }: ExplanationTraceProps) {
  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Explanation Trace</h2>
        <span className="panel-kicker">Human-readable reconstruction log</span>
      </div>
      <ol className="trace-list">
        {steps.map((step, index) => (
          <li key={`${step.title}-${index}`} className="trace-item">
            <strong>{step.title}</strong>
            <p>{step.detail}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
