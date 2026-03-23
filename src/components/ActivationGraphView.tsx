import { useState } from 'react';
import type { Edge, RunResult } from '../core/types';

interface ActivationGraphViewProps {
  result: RunResult;
}

interface GraphCanvasProps {
  expanded?: boolean;
}

function getNodeClass(score: number): string {
  if (score > 0.95) {
    return 'node-high';
  }
  if (score > 0.6) {
    return 'node-medium';
  }
  return 'node-low';
}

function edgeHash(value: string): number {
  return value.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function shouldShowEdgeLabel(edge: Edge, pruned: boolean, expanded: boolean, index: number): boolean {
  if (!expanded) {
    return edge.bridge || pruned;
  }

  if (edge.bridge || pruned) {
    return true;
  }

  if (edge.relationType === 'supports') {
    return index % 3 === 0;
  }

  if (edge.relationType === 'extends') {
    return index % 2 === 0;
  }

  return true;
}

function getEdgeLabelPosition(args: {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  edge: Edge;
  expanded: boolean;
  index: number;
}): { x: number; y: number } {
  const { sourceX, sourceY, targetX, targetY, edge, expanded, index } = args;
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const length = Math.max(Math.hypot(dx, dy), 1);
  const normalX = -dy / length;
  const normalY = dx / length;
  const sign = (edgeHash(edge.id) + index) % 2 === 0 ? 1 : -1;
  const anchor = expanded ? (sign > 0 ? 0.42 : 0.58) : 0.5;
  const baseX = sourceX + dx * anchor;
  const baseY = sourceY + dy * anchor;
  const offsetMagnitude = expanded
    ? edge.bridge || edge.relationType === 'bridges'
      ? 34
      : 24
    : edge.bridge || edge.relationType === 'bridges'
      ? 20
      : 14;
  const extraPrunedOffset = expanded && edge.bridge ? 4 : 0;

  return {
    x: baseX + normalX * sign * (offsetMagnitude + extraPrunedOffset),
    y: baseY + normalY * sign * (offsetMagnitude + extraPrunedOffset)
  };
}

export function ActivationGraphView({ result }: ActivationGraphViewProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { activation, graph } = result;
  const finalPass = activation.passes[activation.passes.length - 1];

  function renderGraphCanvas({ expanded = false }: GraphCanvasProps = {}) {
    const nodeRadius = expanded ? 28 : 20;
    const edgeFontSize = expanded ? '14px' : '11px';
    const nodeLabelFontSize = expanded ? '13px' : '10px';
    const nodeScoreFontSize = expanded ? '14px' : '11px';
    const nodeScoreOffset = expanded ? 46 : 34;

    return (
      <svg
        viewBox="0 0 720 420"
        className={expanded ? 'graph-view graph-view-expanded' : 'graph-view'}
        role="img"
        aria-label={`${graph.phrase} activation graph`}
      >
        {graph.edges.map((edge, index) => {
          const source = graph.nodes.find((node) => node.id === edge.source)!;
          const target = graph.nodes.find((node) => node.id === edge.target)!;
          const score = finalPass.edgeScores[edge.id] ?? 0;
          const pruned = finalPass.prunedEdgeIds.includes(edge.id);
          const showLabel = shouldShowEdgeLabel(edge, pruned, expanded, index);
          const labelPosition = getEdgeLabelPosition({
            sourceX: source.x,
            sourceY: source.y,
            targetX: target.x,
            targetY: target.y,
            edge,
            expanded,
            index
          });

          return (
            <g key={edge.id}>
              <line
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                className={pruned ? 'edge edge-pruned' : edge.bridge ? 'edge edge-bridge' : 'edge'}
                strokeWidth={expanded ? Math.max(2, score * 4.6) : Math.max(1.5, score * 4)}
              />
              {showLabel ? (
                <text
                  x={labelPosition.x}
                  y={labelPosition.y}
                  className={pruned || edge.bridge ? 'edge-label edge-label-key' : 'edge-label'}
                  style={{ fontSize: edgeFontSize }}
                  textAnchor="middle"
                >
                  {edge.relationType}
                </text>
              ) : null}
            </g>
          );
        })}

        {graph.nodes.map((node) => {
          const score = finalPass.nodeScores[node.id] ?? 0;
          return (
            <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
              <circle r={nodeRadius} className={`node ${getNodeClass(score)}`} />
              <text className="node-label" textAnchor="middle" y="4" style={{ fontSize: nodeLabelFontSize }}>
                {node.label}
              </text>
              <text
                className="node-score"
                textAnchor="middle"
                y={nodeScoreOffset}
                style={{ fontSize: nodeScoreFontSize }}
              >
                {score.toFixed(2)}
              </text>
            </g>
          );
        })}
      </svg>
    );
  }

  return (
    <>
      <section className="panel panel-wide">
        <div className="panel-header panel-header-graph">
          <div>
            <h2>Activation Graph</h2>
            <span className="panel-kicker">Active, bridged, and pruned relations</span>
          </div>
          <button type="button" className="graph-action" onClick={() => setIsExpanded(true)}>
            Expand
          </button>
        </div>

        {renderGraphCanvas()}

        <div className="legend">
          <span>
            <i className="legend-swatch legend-active" />
            active node
          </span>
          <span>
            <i className="legend-swatch legend-bridge" />
            bridge relation
          </span>
          <span>
            <i className="legend-swatch legend-pruned" />
            pruned relation
          </span>
        </div>
      </section>

      {isExpanded ? (
        <div className="graph-overlay" role="dialog" aria-modal="true" aria-label={`${graph.phrase} expanded graph`}>
          <div className="graph-overlay-panel">
            <div className="panel-header panel-header-graph">
              <div>
                <h2>Activation Graph Inspection</h2>
                <span className="panel-kicker">{graph.sentence}</span>
              </div>
              <button type="button" className="graph-action" onClick={() => setIsExpanded(false)}>
                Close
              </button>
            </div>

            <div className="graph-overlay-canvas">{renderGraphCanvas({ expanded: true })}</div>

            <div className="legend">
              <span>
                <i className="legend-swatch legend-active" />
                active node
              </span>
              <span>
                <i className="legend-swatch legend-bridge" />
                bridge relation
              </span>
              <span>
                <i className="legend-swatch legend-pruned" />
                pruned relation
              </span>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
