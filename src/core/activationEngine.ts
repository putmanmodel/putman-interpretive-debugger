import type {
  ActivationPass,
  ActivationResult,
  CandidateInterpretation,
  ContextPreset,
  Edge,
  MeaningGraph,
  ModulatorState,
  Node
} from './types';

function clamp(value: number, min = 0, max = 2): number {
  return Math.max(min, Math.min(max, value));
}

function getNode(graph: MeaningGraph, nodeId: string): Node {
  const node = graph.nodes.find((entry) => entry.id === nodeId);
  if (!node) {
    throw new Error(`Unknown node ${nodeId}`);
  }
  return node;
}

function getEdgeLabel(graph: MeaningGraph, edge: Edge): string {
  const source = getNode(graph, edge.source);
  const target = getNode(graph, edge.target);
  return `${source.label} -> ${target.label}`;
}

function makeInitialNodeScores(graph: MeaningGraph, context: ContextPreset): Record<string, number> {
  return Object.fromEntries(
    graph.nodes.map((node) => {
      const isSeed = graph.seedNodeIds.includes(node.id);
      const score = clamp(node.baseWeight * (isSeed ? 1.08 : 0.58) * (context.domainBias[node.domain] ?? 1), 0, 1.4);
      return [node.id, score];
    })
  );
}

function getAffectModifier(node: Node, relationType: string, affect: number): number {
  const magnitude = Math.abs(affect) * 0.14;
  if (affect > 0) {
    if (
      node.domain === 'history' ||
      node.domain === 'identity' ||
      node.domain === 'symbolic' ||
      relationType === 'retains'
    ) {
      return 1 + magnitude;
    }
    return 1;
  }
  if (affect < 0) {
    if (
      node.domain === 'governance' ||
      node.domain === 'control' ||
      node.domain === 'social' ||
      relationType === 'governs' ||
      relationType === 'constrains'
    ) {
      return 1 + magnitude;
    }
    if (relationType === 'bridges') {
      return 1 - magnitude * 0.45;
    }
  }
  return 1;
}

export function runActivationPasses(
  graph: MeaningGraph,
  context: ContextPreset,
  modulators: ModulatorState,
  previousTopCandidate: CandidateInterpretation | null
): ActivationResult {
  const events: ActivationResult['events'] = [];
  const passes: ActivationPass[] = [];
  const initialNodeScores = makeInitialNodeScores(graph, context);
  let nodeScores = { ...initialNodeScores };
  const carryoverNodes = new Set(previousTopCandidate?.supportNodeIds ?? []);

  for (let pass = 1; pass <= modulators.recursionDepth; pass += 1) {
    const incomingSupport: Record<string, { total: number; count: number }> = Object.fromEntries(
      graph.nodes.map((node) => [node.id, { total: 0, count: 0 }])
    );
    const nextNodeScores: Record<string, number> = {};
    const edgeScores: Record<string, number> = {};
    const prunedEdgeIds: string[] = [];

    for (const edge of graph.edges) {
      const sourceNode = getNode(graph, edge.source);
      const targetNode = getNode(graph, edge.target);
      const edgeLabel = getEdgeLabel(graph, edge);
      const relationPreference = context.preferredRelationTypes[edge.relationType] ?? 1;
      const suppressionMultiplier = context.suppressedRelationTypes[edge.relationType] ?? 1;
      const relationDomainBias = ((context.domainBias[sourceNode.domain] ?? 1) + (context.domainBias[targetNode.domain] ?? 1)) / 2;
      const sourceSupport = ((nodeScores[edge.source] ?? 0) + (nodeScores[edge.target] ?? 0)) / 2;
      const recursionCarryover =
        pass > 1 && (carryoverNodes.has(edge.source) || carryoverNodes.has(edge.target))
          ? 1 + 0.06 * (pass - 1)
          : 1;
      const bridgeRigidityMultiplier = edge.bridge ? 1 - modulators.rigidity * 0.48 : 1;
      const affect =
        (getAffectModifier(sourceNode, edge.relationType, modulators.affect) +
          getAffectModifier(targetNode, edge.relationType, modulators.affect)) /
        2;

      if (relationDomainBias !== 1 || relationPreference !== 1 || suppressionMultiplier !== 1 || affect !== 1) {
        const parts = [
          relationDomainBias !== 1 ? `${sourceNode.domain}/${targetNode.domain} domain bias` : null,
          relationPreference !== 1 ? `${edge.relationType} preference` : null,
          suppressionMultiplier !== 1 ? `${edge.relationType} suppression` : null,
          affect !== 1 ? `affect on ${edge.relationType}` : null
        ].filter(Boolean);
        events.push({
          kind: 'activation',
          pass,
          targetId: edge.id,
          targetLabel: edgeLabel,
          message: `${edgeLabel} shifted through ${parts.join(', ')}`,
          delta: relationDomainBias * relationPreference * suppressionMultiplier * affect - 1
        });
      }

      if (recursionCarryover !== 1) {
        events.push({
          kind: 'recursion',
          pass,
          targetId: edge.id,
          targetLabel: edgeLabel,
          message: `${edgeLabel} received mild carryover from the prior winning candidate`,
          delta: recursionCarryover - 1
        });
      }

      const rawEdgeScore =
        edge.weight *
        relationDomainBias *
        relationPreference *
        affect *
        suppressionMultiplier *
        bridgeRigidityMultiplier *
        (0.28 + sourceSupport * 0.72) *
        recursionCarryover;

      const edgePruneThreshold = 0.19 + modulators.rigidity * (edge.bridge ? 0.26 : 0.11);

      if (rawEdgeScore < edgePruneThreshold) {
        edgeScores[edge.id] = 0;
        prunedEdgeIds.push(edge.id);
        events.push({
          kind: 'pruning',
          pass,
          targetId: edge.id,
          targetLabel: edgeLabel,
          message: edge.bridge
            ? `${edgeLabel} was pruned as a vulnerable bridge under rigidity`
            : `${edgeLabel} fell below the support threshold`,
          delta: -rawEdgeScore
        });
        continue;
      }

      const finalScore = clamp(rawEdgeScore, 0, 1.6);
      edgeScores[edge.id] = finalScore;
      incomingSupport[edge.source].total += finalScore;
      incomingSupport[edge.source].count += 1;
      incomingSupport[edge.target].total += finalScore;
      incomingSupport[edge.target].count += 1;
    }

    for (const node of graph.nodes) {
      const support = incomingSupport[node.id];
      const incomingAverage = support.count > 0 ? support.total / support.count : 0;
      const blendedScore =
        initialNodeScores[node.id] * 0.28 +
        (nodeScores[node.id] ?? 0) * 0.38 +
        incomingAverage * 0.34;
      nextNodeScores[node.id] = clamp(blendedScore, 0, 1.45);
    }

    passes.push({
      pass,
      nodeScores: nextNodeScores,
      edgeScores,
      prunedEdgeIds
    });
    nodeScores = nextNodeScores;
  }

  const finalPass = passes[passes.length - 1];
  return {
    passes,
    finalNodeScores: finalPass.nodeScores,
    finalEdgeScores: finalPass.edgeScores,
    events
  };
}
