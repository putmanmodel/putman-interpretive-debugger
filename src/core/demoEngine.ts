import { runActivationPasses } from './activationEngine';
import { getDemoDefinition } from './demoData';
import { collectEdgePruning } from './pruningEngine';
import { buildCandidates, collectCandidatePruning } from './reconstructionEngine';
import { buildExplanationTrace } from './traceEngine';
import type { CandidateInterpretation, CompareResult, ContextPreset, DemoDefinition, ModulatorState, PrunedBranch, RunResult } from './types';

function rankCandidates(candidates: CandidateInterpretation[]): CandidateInterpretation[] {
  return [...candidates]
    .sort((left, right) => right.score - left.score)
    .map((candidate, index) => ({ ...candidate, rank: index + 1 }));
}

function runSingleContext(demo: DemoDefinition, context: ContextPreset, modulators: ModulatorState): RunResult {
  const graph = demo.graph;
  let previousTopCandidate: CandidateInterpretation | null = null;
  let finalCandidates: CandidateInterpretation[] = [];
  let finalActivation = runActivationPasses(graph, context, modulators, null);
  let accumulatedPruning: PrunedBranch[] = [];

  for (let pass = 1; pass <= modulators.recursionDepth; pass += 1) {
    finalActivation = runActivationPasses(
      graph,
      context,
      { ...modulators, recursionDepth: pass as ModulatorState['recursionDepth'] },
      previousTopCandidate
    );
    const builtCandidates = buildCandidates(graph, finalActivation, context, previousTopCandidate?.id ?? null);
    const { survivors, pruned } = collectCandidatePruning(builtCandidates, modulators.rigidity, pass);
    finalCandidates = rankCandidates(survivors.length > 0 ? survivors : builtCandidates);
    accumulatedPruning = [...accumulatedPruning, ...pruned];
    previousTopCandidate = finalCandidates[0] ?? null;
  }

  const finalPass = modulators.recursionDepth;
  const finalEdgePruning = collectEdgePruning(graph, finalActivation, modulators);
  accumulatedPruning = [...finalEdgePruning, ...accumulatedPruning];
  const finalRelevantPruned = accumulatedPruning.filter((branch) => branch.pass === finalPass);
  const selected = finalCandidates[0] ?? rankCandidates(buildCandidates(graph, finalActivation, context, null))[0];
  const explanation = buildExplanationTrace({
    context,
    modulators,
    selectedCandidate: selected,
    candidates: finalCandidates,
    prunedBranches: finalRelevantPruned,
    events: finalActivation.events
  });

  return {
    demo,
    graph,
    context,
    activation: finalActivation,
    candidates: finalCandidates,
    pruned: accumulatedPruning,
    finalRelevantPruned,
    explanation,
    selected
  };
}

export function runCompare(demoId: DemoDefinition['id'], modulators: ModulatorState): CompareResult {
  const demo = getDemoDefinition(demoId);
  const [leftContext, rightContext] = demo.contexts;
  const left = runSingleContext(demo, leftContext, modulators);
  const right = runSingleContext(demo, rightContext, modulators);
  const summaryParts: string[] = [];
  if (left.selected.id === right.selected.id) {
    summaryParts.push(
      `${left.context.label} and ${right.context.label} both selected ${left.selected.label}.`
    );
  } else {
    summaryParts.push(
      `${left.context.label} selected ${left.selected.label}, while ${right.context.label} selected ${right.selected.label}.`
    );
  }

  const leftBridgeSuppressed = left.finalRelevantPruned.some((branch) => branch.reason === 'bridge-suppression');
  const rightBridgeSuppressed = right.finalRelevantPruned.some((branch) => branch.reason === 'bridge-suppression');
  if (leftBridgeSuppressed || rightBridgeSuppressed) {
    if (leftBridgeSuppressed && rightBridgeSuppressed) {
      summaryParts.push('Rigidity suppressed bridge relations in both contexts, narrowing alternative interpretations.');
    } else if (leftBridgeSuppressed) {
      summaryParts.push(`${left.context.label} also suppressed bridge relations, narrowing alternatives on that side.`);
    } else {
      summaryParts.push(`${right.context.label} also suppressed bridge relations, narrowing alternatives on that side.`);
    }
  }

  const leftRunnerUp = left.candidates.find((candidate) => candidate.rank === 2);
  const rightRunnerUp = right.candidates.find((candidate) => candidate.rank === 2);
  if (leftRunnerUp || rightRunnerUp) {
    const competitionParts = [
      leftRunnerUp ? `${left.context.label} kept ${leftRunnerUp.label} as a visible runner-up` : null,
      rightRunnerUp ? `${right.context.label} kept ${rightRunnerUp.label} as a visible runner-up` : null
    ].filter(Boolean);
    if (competitionParts.length > 0) {
      summaryParts.push(`${competitionParts.join(', and ')}.`);
    }
  }

  return { demo, left, right, summary: summaryParts.join(' ') };
}
