import type { ActivationResult, MeaningGraph, ModulatorState, PrunedBranch } from './types';

export function collectEdgePruning(
  graph: MeaningGraph,
  activation: ActivationResult,
  modulators: ModulatorState
): PrunedBranch[] {
  const finalPass = activation.passes[activation.passes.length - 1];
  return finalPass.prunedEdgeIds.map((edgeId) => {
    const edge = graph.edges.find((entry) => entry.id === edgeId);
    if (!edge) {
      throw new Error(`Unknown edge ${edgeId}`);
    }
    const source = graph.nodes.find((entry) => entry.id === edge.source);
    const target = graph.nodes.find((entry) => entry.id === edge.target);
    if (!source || !target) {
      throw new Error(`Unknown nodes for edge ${edgeId}`);
    }
    return {
      kind: 'edge',
      id: edge.id,
      label: `${source.label} -> ${target.label}`,
      reason: edge.bridge ? 'bridge-suppression' : modulators.rigidity > 0.5 ? 'rigidity' : 'low-support',
      score: activation.finalEdgeScores[edge.id] ?? 0,
      pass: finalPass.pass
    };
  });
}
