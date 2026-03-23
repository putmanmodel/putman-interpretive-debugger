import { useMemo, useState } from 'react';
import { ControlsPanel } from './components/ControlsPanel';
import { CompareView } from './components/CompareView';
import { demoDefinitions, getDemoDefinition } from './core/demoData';
import { runCompare } from './core/demoEngine';
import type { DemoDefinition, ModulatorState } from './core/types';

const defaultModulators: ModulatorState = {
  rigidity: 0.35,
  affect: 0,
  recursionDepth: 1
};

export default function App() {
  const [activeDemoId, setActiveDemoId] = useState<DemoDefinition['id']>('memory');
  const [modulators, setModulators] = useState<ModulatorState>(defaultModulators);
  const activeDemo = useMemo(() => getDemoDefinition(activeDemoId), [activeDemoId]);

  const result = useMemo(() => runCompare(activeDemoId, modulators), [activeDemoId, modulators]);

  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">PUTMAN Interpretive Debugger</p>
          <h1>Why did "{activeDemo.graph.phrase}" mean this here instead of one of its other plausible meanings?</h1>
          <p className="hero-copy">
            A controlled compare run for the sentence <strong>"{activeDemo.sentence}"</strong> under two fixed
            context packages.
          </p>
        </div>
        <div className="hero-card">
          <span>Selected interpretations</span>
          <strong>
            {result.left.context.label}: {result.left.selected.label}
            <br />
            {result.right.context.label}: {result.right.selected.label}
          </strong>
          <p>{result.summary}</p>
        </div>
      </header>

      <section className="workspace-grid">
        <div className="stack">
          <ControlsPanel
            activeDemoId={activeDemoId}
            demos={demoDefinitions}
            sentence={activeDemo.sentence}
            contextLabels={[activeDemo.contexts[0].label, activeDemo.contexts[1].label]}
            modulators={modulators}
            onDemoChange={setActiveDemoId}
            onChange={setModulators}
          />
        </div>

        <div className="results-stack">
          <CompareView result={result} />
        </div>
      </section>
    </div>
  );
}
