import type { ContextPreset, DemoDefinition, MeaningGraph } from './types';

export const memoryGraph: MeaningGraph = {
  phrase: 'memory',
  sentence: 'This system needs memory.',
  seedNodeIds: ['buffer', 'retained-state', 'governed-write'],
  nodes: [
    { id: 'buffer', label: 'buffer', domain: 'software', gloss: 'Working runtime buffer.', x: 110, y: 90, baseWeight: 0.92 },
    { id: 'context-window', label: 'context window', domain: 'software', gloss: 'Active short-range context.', x: 240, y: 70, baseWeight: 0.88 },
    { id: 'recent-turns', label: 'recent turns', domain: 'history', gloss: 'Local conversation history.', x: 360, y: 92, baseWeight: 0.84 },
    { id: 'retrieval-cache', label: 'retrieval cache', domain: 'software', gloss: 'Fast near-term access store.', x: 250, y: 165, baseWeight: 0.8 },
    { id: 'short-horizon', label: 'short horizon', domain: 'software', gloss: 'Immediate working scope.', x: 110, y: 185, baseWeight: 0.78 },
    { id: 'retained-state', label: 'retained state', domain: 'identity', gloss: 'State surviving beyond the current turn.', x: 380, y: 220, baseWeight: 0.86 },
    { id: 'user-history', label: 'user history', domain: 'history', gloss: 'Longer retained record.', x: 520, y: 190, baseWeight: 0.82 },
    { id: 'profile-continuity', label: 'profile continuity', domain: 'identity', gloss: 'Stable user continuity across sessions.', x: 640, y: 210, baseWeight: 0.8 },
    { id: 'long-horizon', label: 'long horizon', domain: 'identity', gloss: 'Durable persistence over time.', x: 510, y: 290, baseWeight: 0.79 },
    { id: 'governed-write', label: 'governed write', domain: 'governance', gloss: 'Approved durable write path.', x: 360, y: 320, baseWeight: 0.88 },
    { id: 'commit-gate', label: 'commit gate', domain: 'control', gloss: 'Permission gate before persistence.', x: 230, y: 335, baseWeight: 0.84 },
    { id: 'audit-trail', label: 'audit trail', domain: 'governance', gloss: 'Recorded durable retention trail.', x: 510, y: 365, baseWeight: 0.83 },
    { id: 'retention-policy', label: 'retention policy', domain: 'governance', gloss: 'Policy deciding what can persist.', x: 645, y: 330, baseWeight: 0.82 },
    { id: 'stratified-persistence', label: 'stratified persistence', domain: 'governance', gloss: 'Retention split by approval level.', x: 640, y: 115, baseWeight: 0.75 }
  ],
  edges: [
    { id: 'e1', source: 'buffer', target: 'context-window', relationType: 'supports', weight: 0.92 },
    { id: 'e2', source: 'context-window', target: 'recent-turns', relationType: 'stores', weight: 0.9 },
    { id: 'e3', source: 'recent-turns', target: 'retrieval-cache', relationType: 'supports', weight: 0.82 },
    { id: 'e4', source: 'retrieval-cache', target: 'short-horizon', relationType: 'extends', weight: 0.79 },
    { id: 'e5', source: 'retained-state', target: 'user-history', relationType: 'retains', weight: 0.88 },
    { id: 'e6', source: 'user-history', target: 'profile-continuity', relationType: 'supports', weight: 0.85 },
    { id: 'e7', source: 'retained-state', target: 'long-horizon', relationType: 'extends', weight: 0.84 },
    { id: 'e8', source: 'governed-write', target: 'commit-gate', relationType: 'constrains', weight: 0.86 },
    { id: 'e9', source: 'governed-write', target: 'audit-trail', relationType: 'governs', weight: 0.9 },
    { id: 'e10', source: 'audit-trail', target: 'retention-policy', relationType: 'supports', weight: 0.85 },
    { id: 'e11', source: 'retention-policy', target: 'stratified-persistence', relationType: 'governs', weight: 0.82 },
    { id: 'b1', source: 'recent-turns', target: 'retained-state', relationType: 'bridges', weight: 0.58, bridge: true },
    { id: 'b2', source: 'retained-state', target: 'governed-write', relationType: 'bridges', weight: 0.63, bridge: true },
    { id: 'b3', source: 'user-history', target: 'audit-trail', relationType: 'bridges', weight: 0.54, bridge: true }
  ],
  candidates: [
    {
      id: 'buffer-history',
      label: 'Short-horizon buffer/history',
      description: 'Memory as active context, recent turns, cache, and near-term working state.',
      nodeIds: ['buffer', 'context-window', 'recent-turns', 'retrieval-cache', 'short-horizon'],
      bridgeAnchorIds: ['b1']
    },
    {
      id: 'identity-retention',
      label: 'Persistent identity/history retention',
      description: 'Memory as retained state, user history, and continuity over a long horizon.',
      nodeIds: ['retained-state', 'user-history', 'profile-continuity', 'long-horizon'],
      bridgeAnchorIds: ['b1', 'b2', 'b3']
    },
    {
      id: 'governed-persistence',
      label: 'Governed write / audit persistence',
      description: 'Memory as a governed persistence path with commit gates, audit, and retention policy.',
      nodeIds: ['governed-write', 'commit-gate', 'audit-trail', 'retention-policy', 'stratified-persistence'],
      bridgeAnchorIds: ['b2', 'b3']
    }
  ]
};

export const contexts: Record<'softwareEngineering' | 'runtimeGovernance', ContextPreset> = {
  softwareEngineering: {
    id: 'software-engineering',
    label: 'Software Engineering',
    description: 'Biases activation toward buffers, context windows, recent turns, and short-horizon support.',
    domainBias: {
      software: 1.24,
      history: 1.04,
      identity: 0.97,
      governance: 0.84,
      control: 0.9
    },
    preferredRelationTypes: {
      supports: 1.14,
      stores: 1.18,
      extends: 1.1
    },
    suppressedRelationTypes: {
      governs: 0.88,
      constrains: 0.92,
      bridges: 0.98
    },
    candidatePriors: {
      'buffer-history': 0.35,
      'identity-retention': 0.06,
      'governed-persistence': -0.08
    }
  },
  runtimeGovernance: {
    id: 'runtime-governance',
    label: 'Runtime Governance',
    description: 'Biases activation toward governed write, audit trail, commit gates, and retention policy.',
    domainBias: {
      software: 0.9,
      history: 1.02,
      identity: 1,
      governance: 1.24,
      control: 1.16
    },
    preferredRelationTypes: {
      governs: 1.16,
      constrains: 1.14,
      retains: 1.05
    },
    suppressedRelationTypes: {
      stores: 0.92,
      extends: 0.96,
      bridges: 0.92
    },
    candidatePriors: {
      'buffer-history': -0.04,
      'identity-retention': 0.08,
      'governed-persistence': 0.32
    }
  }
};

export const snakeGraph: MeaningGraph = {
  phrase: 'snake',
  sentence: 'We saw a snake.',
  seedNodeIds: ['snake-token', 'reptile', 'deceiver'],
  nodes: [
    { id: 'snake-token', label: 'snake', domain: 'wildlife', gloss: 'Surface token shared across multiple interpretations.', x: 145, y: 205, baseWeight: 0.92 },
    { id: 'reptile', label: 'reptile', domain: 'wildlife', gloss: 'Animal classification.', x: 255, y: 95, baseWeight: 0.9 },
    { id: 'scales', label: 'scales', domain: 'wildlife', gloss: 'Physical reptile trait.', x: 355, y: 65, baseWeight: 0.82 },
    { id: 'slither', label: 'slither', domain: 'wildlife', gloss: 'Characteristic movement.', x: 500, y: 90, baseWeight: 0.84 },
    { id: 'habitat', label: 'habitat', domain: 'wildlife', gloss: 'Ecological setting.', x: 600, y: 165, baseWeight: 0.8 },
    { id: 'venom', label: 'venom', domain: 'wildlife', gloss: 'Potentially dangerous biological property.', x: 520, y: 240, baseWeight: 0.83 },
    { id: 'wild-encounter', label: 'wild encounter', domain: 'wildlife', gloss: 'Observed animal encounter.', x: 300, y: 260, baseWeight: 0.86 },
    { id: 'deceiver', label: 'deceiver', domain: 'social', gloss: 'Untrustworthy person.', x: 250, y: 350, baseWeight: 0.88 },
    { id: 'betrayal', label: 'betrayal', domain: 'social', gloss: 'Trust violation.', x: 390, y: 355, baseWeight: 0.84 },
    { id: 'trust-breakdown', label: 'trust breakdown', domain: 'social', gloss: 'Relationship fracture.', x: 535, y: 335, baseWeight: 0.82 },
    { id: 'warning', label: 'warning', domain: 'control', gloss: 'Caution or social alarm.', x: 660, y: 270, baseWeight: 0.8 },
    { id: 'hostile-intent', label: 'hostile intent', domain: 'control', gloss: 'Perceived threat from another person.', x: 650, y: 355, baseWeight: 0.81 },
    { id: 'symbolic-figure', label: 'symbolic figure', domain: 'symbolic', gloss: 'Snake as archetypal sign or emblem.', x: 120, y: 340, baseWeight: 0.84 },
    { id: 'temptation', label: 'temptation', domain: 'symbolic', gloss: 'Narrative role of seduction or testing.', x: 85, y: 105, baseWeight: 0.78 },
    { id: 'omen', label: 'omen', domain: 'symbolic', gloss: 'Sign carrying story weight.', x: 70, y: 275, baseWeight: 0.8 },
    { id: 'emblem', label: 'emblem', domain: 'symbolic', gloss: 'Recognizable symbolic marker.', x: 145, y: 30, baseWeight: 0.74 },
    { id: 'story-role', label: 'story role', domain: 'symbolic', gloss: 'Role inside a narrative frame.', x: 270, y: 20, baseWeight: 0.79 }
  ],
  edges: [
    { id: 's1', source: 'snake-token', target: 'reptile', relationType: 'supports', weight: 0.9 },
    { id: 's2', source: 'reptile', target: 'scales', relationType: 'supports', weight: 0.85 },
    { id: 's3', source: 'reptile', target: 'slither', relationType: 'supports', weight: 0.87 },
    { id: 's4', source: 'slither', target: 'habitat', relationType: 'extends', weight: 0.8 },
    { id: 's5', source: 'reptile', target: 'venom', relationType: 'supports', weight: 0.76 },
    { id: 's6', source: 'snake-token', target: 'wild-encounter', relationType: 'supports', weight: 0.84 },
    { id: 's7', source: 'snake-token', target: 'deceiver', relationType: 'supports', weight: 0.78 },
    { id: 's8', source: 'deceiver', target: 'betrayal', relationType: 'supports', weight: 0.88 },
    { id: 's9', source: 'betrayal', target: 'trust-breakdown', relationType: 'extends', weight: 0.84 },
    { id: 's10', source: 'trust-breakdown', target: 'warning', relationType: 'supports', weight: 0.76 },
    { id: 's11', source: 'warning', target: 'hostile-intent', relationType: 'constrains', weight: 0.8 },
    { id: 's12', source: 'snake-token', target: 'symbolic-figure', relationType: 'supports', weight: 0.77 },
    { id: 's13', source: 'symbolic-figure', target: 'temptation', relationType: 'supports', weight: 0.82 },
    { id: 's14', source: 'symbolic-figure', target: 'omen', relationType: 'supports', weight: 0.84 },
    { id: 's15', source: 'symbolic-figure', target: 'emblem', relationType: 'supports', weight: 0.75 },
    { id: 's16', source: 'symbolic-figure', target: 'story-role', relationType: 'extends', weight: 0.81 },
    { id: 'sb1', source: 'venom', target: 'hostile-intent', relationType: 'bridges', weight: 0.56, bridge: true },
    { id: 'sb2', source: 'warning', target: 'omen', relationType: 'bridges', weight: 0.6, bridge: true },
    { id: 'sb3', source: 'deceiver', target: 'symbolic-figure', relationType: 'bridges', weight: 0.58, bridge: true },
    { id: 'sb4', source: 'wild-encounter', target: 'warning', relationType: 'bridges', weight: 0.52, bridge: true }
  ],
  candidates: [
    {
      id: 'snake-animal',
      label: 'Animal / reptile',
      description: 'Snake as an animal, with reptile traits, movement, habitat, and possible venom.',
      nodeIds: ['reptile', 'scales', 'slither', 'habitat', 'venom', 'wild-encounter'],
      bridgeAnchorIds: ['sb1', 'sb4']
    },
    {
      id: 'snake-betrayal',
      label: 'Social metaphor / betrayal',
      description: 'Snake as an untrustworthy person linked to betrayal, warning, and hostile intent.',
      nodeIds: ['deceiver', 'betrayal', 'trust-breakdown', 'warning', 'hostile-intent'],
      bridgeAnchorIds: ['sb1', 'sb2', 'sb3', 'sb4']
    },
    {
      id: 'snake-symbolic',
      label: 'Symbolic / narrative figure',
      description: 'Snake as a story symbol tied to temptation, omen, emblem, and narrative role.',
      nodeIds: ['symbolic-figure', 'temptation', 'omen', 'emblem', 'story-role'],
      bridgeAnchorIds: ['sb2', 'sb3']
    }
  ]
};

export const snakeContexts: Record<'wildlifeBiology' | 'socialNarrative', ContextPreset> = {
  wildlifeBiology: {
    id: 'wildlife-biology',
    label: 'Wildlife / Biology',
    description: 'Biases activation toward reptile traits, habitat, movement, venom, and wild encounter.',
    domainBias: {
      wildlife: 1.24,
      social: 0.88,
      symbolic: 0.9,
      control: 0.96
    },
    preferredRelationTypes: {
      supports: 1.12,
      extends: 1.08
    },
    suppressedRelationTypes: {
      constrains: 0.94,
      bridges: 0.98
    },
    candidatePriors: {
      'snake-animal': 0.34,
      'snake-betrayal': -0.06,
      'snake-symbolic': 0.02
    }
  },
  socialNarrative: {
    id: 'social-narrative',
    label: 'Social / Narrative',
    description: 'Biases activation toward betrayal, warning, symbolic figure, and story framing.',
    domainBias: {
      wildlife: 0.9,
      social: 1.18,
      symbolic: 1.14,
      control: 1.08
    },
    preferredRelationTypes: {
      constrains: 1.08,
      supports: 1.06,
      bridges: 1.04
    },
    suppressedRelationTypes: {
      extends: 0.97
    },
    candidatePriors: {
      'snake-animal': -0.04,
      'snake-betrayal': 0.24,
      'snake-symbolic': 0.16
    }
  }
};

export const demoDefinitions: DemoDefinition[] = [
  {
    id: 'memory',
    label: 'Memory',
    sentence: memoryGraph.sentence,
    graph: memoryGraph,
    contexts: [contexts.softwareEngineering, contexts.runtimeGovernance]
  },
  {
    id: 'snake',
    label: 'Snake',
    sentence: snakeGraph.sentence,
    graph: snakeGraph,
    contexts: [snakeContexts.wildlifeBiology, snakeContexts.socialNarrative]
  }
];

export function getDemoDefinition(id: DemoDefinition['id']): DemoDefinition {
  const demo = demoDefinitions.find((entry) => entry.id === id);
  if (!demo) {
    throw new Error(`Unknown demo definition: ${id}`);
  }
  return demo;
}
