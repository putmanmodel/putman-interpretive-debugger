export type Domain =
  | 'software'
  | 'history'
  | 'identity'
  | 'governance'
  | 'control'
  | 'wildlife'
  | 'social'
  | 'symbolic';

export type RelationType =
  | 'supports'
  | 'stores'
  | 'extends'
  | 'retains'
  | 'governs'
  | 'constrains'
  | 'bridges';

export interface Node {
  id: string;
  label: string;
  domain: Domain;
  gloss: string;
  x: number;
  y: number;
  baseWeight: number;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  relationType: RelationType;
  weight: number;
  bridge?: boolean;
}

export interface CandidateDefinition {
  id: string;
  label: string;
  description: string;
  nodeIds: string[];
  bridgeAnchorIds?: string[];
}

export interface MeaningGraph {
  phrase: string;
  sentence: string;
  nodes: Node[];
  edges: Edge[];
  candidates: CandidateDefinition[];
  seedNodeIds: string[];
}

export interface DemoDefinition {
  id: 'memory' | 'snake';
  label: string;
  sentence: string;
  graph: MeaningGraph;
  contexts: [ContextPreset, ContextPreset];
}

export interface ContextPreset {
  id: string;
  label: string;
  description: string;
  domainBias: Partial<Record<Domain, number>>;
  preferredRelationTypes: Partial<Record<RelationType, number>>;
  suppressedRelationTypes: Partial<Record<RelationType, number>>;
  candidatePriors: Partial<Record<string, number>>;
}

export interface ModulatorState {
  rigidity: number;
  affect: number;
  recursionDepth: 1 | 2 | 3;
}

export interface ActivationEvent {
  kind: 'activation' | 'pruning' | 'recursion';
  pass: number;
  targetId: string;
  targetLabel: string;
  message: string;
  delta: number;
}

export interface ActivationPass {
  pass: number;
  nodeScores: Record<string, number>;
  edgeScores: Record<string, number>;
  prunedEdgeIds: string[];
}

export interface ActivationResult {
  passes: ActivationPass[];
  finalNodeScores: Record<string, number>;
  finalEdgeScores: Record<string, number>;
  events: ActivationEvent[];
}

export interface CandidateInterpretation {
  id: string;
  label: string;
  description: string;
  score: number;
  rank: number;
  supportNodeIds: string[];
  supportNodeLabels: string[];
  supportEdgeIds: string[];
  bridgeSupport: number;
  viable: boolean;
}

export type PruneReason = 'low-support' | 'rigidity' | 'bridge-suppression';

export interface PrunedBranch {
  kind: 'edge' | 'candidate';
  id: string;
  label: string;
  reason: PruneReason;
  score: number;
  pass: number;
}

export interface ExplanationStep {
  title: string;
  detail: string;
}

export interface RunResult {
  demo: DemoDefinition;
  graph: MeaningGraph;
  context: ContextPreset;
  activation: ActivationResult;
  candidates: CandidateInterpretation[];
  pruned: PrunedBranch[];
  finalRelevantPruned: PrunedBranch[];
  explanation: ExplanationStep[];
  selected: CandidateInterpretation;
}

export interface CompareResult {
  demo: DemoDefinition;
  left: RunResult;
  right: RunResult;
  summary: string;
}
