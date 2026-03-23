import type {
  ActivationResult,
  CandidateInterpretation,
  ContextPreset,
  MeaningGraph,
  PrunedBranch
} from './types';

function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}

export function buildCandidates(
  graph: MeaningGraph,
  activation: ActivationResult,
  context: ContextPreset,
  previousTopCandidateId: string | null
): CandidateInterpretation[] {
  return graph.candidates.map((target) => {
    const supportNodeIds = target.nodeIds.filter((nodeId) => (activation.finalNodeScores[nodeId] ?? 0) >= 0.32);
    const supportNodeLabels = supportNodeIds.map((nodeId) => {
      const node = graph.nodes.find((entry) => entry.id === nodeId);
      if (!node) {
        throw new Error(`Unknown node ${nodeId}`);
      }
      return node.label;
    });
    const supportEdgeIds = graph.edges
      .filter((edge) => target.nodeIds.includes(edge.source) && target.nodeIds.includes(edge.target) && (activation.finalEdgeScores[edge.id] ?? 0) > 0)
      .map((edge) => edge.id);
    const bridgeEdgeIds = graph.edges
      .filter((edge) => edge.bridge && (target.bridgeAnchorIds ?? []).includes(edge.id))
      .map((edge) => edge.id);

    const nodeSupport = target.nodeIds.reduce((sum, nodeId) => sum + (activation.finalNodeScores[nodeId] ?? 0), 0);
    const edgeSupport = supportEdgeIds.reduce((sum, edgeId) => sum + (activation.finalEdgeScores[edgeId] ?? 0), 0);
    const bridgeSupport = bridgeEdgeIds.reduce((sum, edgeId) => sum + (activation.finalEdgeScores[edgeId] ?? 0), 0);
    const missingBridgePenalty =
      bridgeEdgeIds.filter((edgeId) => (activation.finalEdgeScores[edgeId] ?? 0) === 0).length * 0.18;
    const contextPrior = context.candidatePriors[target.id] ?? 0;
    const recursionBias = previousTopCandidateId === target.id ? 0.1 : 0;
    const score = round(nodeSupport * 0.66 + edgeSupport * 0.5 + bridgeSupport * 0.25 + contextPrior + recursionBias - missingBridgePenalty);

    return {
      id: target.id,
      label: target.label,
      description: target.description,
      score,
      rank: 0,
      supportNodeIds,
      supportNodeLabels,
      supportEdgeIds,
      bridgeSupport: round(bridgeSupport),
      viable: true
    };
  });
}

export function collectCandidatePruning(
  candidates: CandidateInterpretation[],
  rigidity: number,
  pass: number
): { survivors: CandidateInterpretation[]; pruned: PrunedBranch[] } {
  const sorted = [...candidates].sort((left, right) => right.score - left.score);
  if (sorted.length === 0) {
    return { survivors: [], pruned: [] };
  }

  const topScore = sorted[0].score;
  const absoluteThreshold = 0.95 + rigidity * 0.68;
  const competitiveThreshold = topScore - (1.08 - rigidity * 0.42);

  const survivors: CandidateInterpretation[] = [];
  const pruned: PrunedBranch[] = [];

  for (const candidate of sorted) {
    const bridgeFragile = candidate.bridgeSupport < 0.18 && rigidity > 0.8;
    const belowAbsolute = candidate.score < absoluteThreshold;
    const belowCompetitive = candidate.score < competitiveThreshold;

    if (bridgeFragile && belowCompetitive) {
      pruned.push({
        kind: 'candidate',
        id: candidate.id,
        label: candidate.label,
        reason: 'bridge-suppression',
        score: candidate.score,
        pass
      });
      continue;
    }

    if (belowAbsolute || belowCompetitive) {
      pruned.push({
        kind: 'candidate',
        id: candidate.id,
        label: candidate.label,
        reason: rigidity > 0.55 ? 'rigidity' : 'low-support',
        score: candidate.score,
        pass
      });
      continue;
    }

    survivors.push({ ...candidate, viable: true });
  }

  return { survivors, pruned };
}
