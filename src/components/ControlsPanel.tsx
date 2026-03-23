import type { DemoDefinition, ModulatorState } from '../core/types';

interface ControlsPanelProps {
  activeDemoId: DemoDefinition['id'];
  demos: DemoDefinition[];
  sentence: string;
  contextLabels: [string, string];
  modulators: ModulatorState;
  onDemoChange: (value: DemoDefinition['id']) => void;
  onChange: (value: ModulatorState) => void;
}

export function ControlsPanel({
  activeDemoId,
  demos,
  sentence,
  contextLabels,
  modulators,
  onDemoChange,
  onChange
}: ControlsPanelProps) {
  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Controls</h2>
        <span className="panel-kicker">Two handcrafted demos, compare mode always on</span>
      </div>

      <label className="field">
        <span>Phrase demo</span>
        <select value={activeDemoId} onChange={(event) => onDemoChange(event.target.value as DemoDefinition['id'])}>
          {demos.map((demo) => (
            <option key={demo.id} value={demo.id}>
              {demo.label}
            </option>
          ))}
        </select>
      </label>

      <div className="fixed-phrase">
        <span>Sentence</span>
        <strong>"{sentence}"</strong>
      </div>

      <div className="fixed-phrase">
        <span>Contexts</span>
        <strong>
          {contextLabels[0]} vs {contextLabels[1]}
        </strong>
      </div>

      <label className="field">
        <span>Rigidity: {modulators.rigidity.toFixed(2)}</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={modulators.rigidity}
          onChange={(event) => onChange({ ...modulators, rigidity: Number(event.target.value) })}
        />
      </label>

      <label className="field">
        <span>Affect: {modulators.affect.toFixed(2)}</span>
        <input
          type="range"
          min="-1"
          max="1"
          step="0.01"
          value={modulators.affect}
          onChange={(event) => onChange({ ...modulators, affect: Number(event.target.value) })}
        />
      </label>

      <label className="field">
        <span>Recursion depth</span>
        <div className="stepper">
          {[1, 2, 3].map((depth) => (
            <button
              key={depth}
              type="button"
              className={depth === modulators.recursionDepth ? 'stepper-button active' : 'stepper-button'}
              onClick={() => onChange({ ...modulators, recursionDepth: depth as ModulatorState['recursionDepth'] })}
            >
              {depth}
            </button>
          ))}
        </div>
      </label>
    </section>
  );
}
