import type { CandidateInterpretation, ContextPreset, ExplanationStep, ModulatorState, PrunedBranch, RunResult } from './types';

function topMaterialEvents(events: RunResult['activation']['events'], kind: 'activation' | 'recursion', pass: number) {
  return events
    .filter((event) => event.kind === kind && event.pass === pass && Math.abs(event.delta) >= 0.04)
    .sort((left, right) => Math.abs(right.delta) - Math.abs(left.delta))
    .slice(0, kind === 'activation' ? 3 : 2);
}

function simplifyActivationMessage(message: string): string {
  return message
    .replace(' shifted through ', ' via ')
    .replace(', affect on bridges', '')
    .replace(', affect on retains', '')
    .replace(', affect on governs', '')
    .replace(', affect on constrains', '');
}

export function buildExplanationTrace(args: {
  context: ContextPreset;
  modulators: ModulatorState;
  selectedCandidate: CandidateInterpretation;
  candidates: CandidateInterpretation[];
  prunedBranches: PrunedBranch[];
  events: RunResult['activation']['events'];
}): ExplanationStep[] {
  const { context, modulators, selectedCandidate, candidates, prunedBranches, events } = args;
  const steps: ExplanationStep[] = [];
  const finalPass = modulators.recursionDepth;
  const activationEvents = topMaterialEvents(events, 'activation', finalPass);
  if (activationEvents.length > 0) {
    steps.push({
      title: 'Contextual activation',
      detail: `Context "${context.label}" most strongly shifted ${activationEvents
        .map((event) => simplifyActivationMessage(event.message))
        .join('; ')}.`
    });
  }

  if (modulators.affect !== 0) {
    steps.push({
      title: 'Affect modulation',
      detail:
        modulators.affect > 0
          ? `Positive affect ${modulators.affect.toFixed(2)} slightly increased continuity and history pathways.`
          : `Negative affect ${modulators.affect.toFixed(2)} slightly increased control and governance pathways.`
    });
  }

  const bridgePrunes = prunedBranches.filter((branch) => branch.reason === 'bridge-suppression' && branch.pass === finalPass);
  if (bridgePrunes.length > 0) {
    steps.push({
      title: 'Bridge suppression',
      detail: `Rigidity ${modulators.rigidity.toFixed(2)} pruned ${bridgePrunes
        .slice(0, 3)
        .map((branch) => branch.label)
        .join(', ')}, shrinking cross-domain interpretation width.`
    });
  }

  steps.push({
    title: 'Winning candidate',
    detail: `Candidate "${selectedCandidate.label}" gained support from ${selectedCandidate.supportNodeLabels.join(
      ', '
    )} and finished with score ${selectedCandidate.score.toFixed(3)}.`
  });

  const runnerUp = candidates.find((candidate) => candidate.rank === 2);
  if (runnerUp) {
    steps.push({
      title: 'Competing path',
      detail: `"${runnerUp.label}" remained viable at ${runnerUp.score.toFixed(3)} but trailed the winner.${runnerUp.bridgeSupport < 0.22 ? ' It lost accessible bridge support.' : ''}`
    });
  }

  if (modulators.recursionDepth > 1) {
    const recursionEvents = topMaterialEvents(events, 'recursion', finalPass);
    steps.push({
      title: 'Recursive reinforcement',
      detail:
        recursionEvents.length > 0
          ? `Recursion depth ${modulators.recursionDepth} fed the prior top candidate back as a mild reinforcing bias, most visibly on ${recursionEvents
              .map((event) => event.targetLabel)
              .join(', ')}.`
          : `Recursion depth ${modulators.recursionDepth} fed the prior top candidate back as a mild reinforcing bias on later passes.`
    });
  }

  steps.push({
    title: 'Reconstruction passes',
    detail: `Final selection favored ${selectedCandidate.label} after ${modulators.recursionDepth} reconstruction pass${
      modulators.recursionDepth === 1 ? '' : 'es'
    }.`
  });

  return steps;
}
