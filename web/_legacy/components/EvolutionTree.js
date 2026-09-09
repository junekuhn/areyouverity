'use client';

import { useState, useEffect } from 'react';

/**
 * Evolution Tree Component
 * Visualizes a user's identity journey through different states
 */
export default function EvolutionTree({ history, currentState }) {
  const [selectedNode, setSelectedNode] = useState(null);

  // Calculate tree layout
  const calculateTreeLayout = () => {
    if (!history || history.length === 0) return [];

    const nodes = history.map((event, index) => ({
      id: index,
      state: event.state,
      timestamp: event.timestamp,
      reason: event.reason,
      x: index * 150 + 50,
      y: 100,
      isCurrent: index === history.length - 1
    }));

    return nodes;
  };

  const nodes = calculateTreeLayout();

  const getStateColor = (state) => {
    switch(state) {
      case 'Affirmed': return '#60a5fa'; // blue
      case 'Denied': return '#a78bfa'; // purple
      case 'PureNO': return '#c084fc'; // purple darker
      case 'Contradicted': return '#f87171'; // red
      default: return '#9ca3af'; // gray
    }
  };

  const getStateIcon = (state) => {
    switch(state) {
      case 'Affirmed': return '✓';
      case 'Denied': return '✗';
      case 'PureNO': return '⊗';
      case 'Contradicted': return '💥';
      default: return '?';
    }
  };

  const getRarityScore = () => {
    if (!history || history.length === 0) return 0;

    // Calculate rarity based on path uniqueness
    const pathSignature = history.map(h => h.state).join('→');
    const transitions = history.length - 1;
    const contradictions = history.filter(h => h.state === 'Contradicted').length;

    // Rarity formula: more transitions = rarer, contradictions add rarity
    const baseScore = transitions * 10;
    const contradictionBonus = contradictions * 25;
    const uniqueBonus = pathSignature.includes('Contradicted') ? 50 : 0;

    return baseScore + contradictionBonus + uniqueBonus;
  };

  const rarity = getRarityScore();

  return (
    <div className="border border-white/20 p-6 bg-black">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold">Evolution Tree</h3>
        <div className="text-sm">
          <span className="text-white/60">Rarity Score: </span>
          <span className={`font-bold ${
            rarity >= 100 ? 'text-purple-400' :
            rarity >= 50 ? 'text-blue-400' :
            'text-white/60'
          }`}>
            {rarity}
          </span>
        </div>
      </div>

      {nodes.length === 0 ? (
        <div className="text-center py-12 text-white/40">
          No evolution history yet
        </div>
      ) : (
        <>
          {/* SVG Tree Visualization */}
          <div className="mb-6 overflow-x-auto">
            <svg
              width={Math.max(600, nodes.length * 150 + 100)}
              height="200"
              className="mx-auto"
            >
              {/* Connection lines */}
              {nodes.map((node, index) => {
                if (index === 0) return null;
                const prevNode = nodes[index - 1];
                return (
                  <line
                    key={`line-${index}`}
                    x1={prevNode.x + 30}
                    y1={prevNode.y + 30}
                    x2={node.x + 30}
                    y2={node.y + 30}
                    stroke={getStateColor(node.state)}
                    strokeWidth="2"
                    strokeDasharray={node.state === 'Contradicted' ? '5,5' : 'none'}
                    opacity="0.5"
                  />
                );
              })}

              {/* Nodes */}
              {nodes.map((node, index) => (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onClick={() => setSelectedNode(node)}
                  className="cursor-pointer"
                  style={{ transition: 'all 0.3s ease' }}
                >
                  {/* Node circle */}
                  <circle
                    r="30"
                    fill={node.isCurrent ? getStateColor(node.state) : 'transparent'}
                    stroke={getStateColor(node.state)}
                    strokeWidth={node.isCurrent ? "4" : "2"}
                    opacity={node.isCurrent ? "1" : "0.7"}
                  />

                  {/* State icon */}
                  <text
                    textAnchor="middle"
                    y="10"
                    fontSize="24"
                    fill="white"
                  >
                    {getStateIcon(node.state)}
                  </text>

                  {/* Node label */}
                  <text
                    textAnchor="middle"
                    y="60"
                    fontSize="12"
                    fill="#9ca3af"
                    className="font-mono"
                  >
                    {node.state}
                  </text>

                  {/* Current indicator */}
                  {node.isCurrent && (
                    <text
                      textAnchor="middle"
                      y="-45"
                      fontSize="10"
                      fill={getStateColor(node.state)}
                      className="font-bold"
                    >
                      CURRENT
                    </text>
                  )}
                </g>
              ))}
            </svg>
          </div>

          {/* Selected Node Details */}
          {selectedNode && (
            <div className="border border-white/10 p-4 bg-white/5">
              <div className="text-sm font-mono mb-2">
                <span className="text-white/60">State: </span>
                <span style={{ color: getStateColor(selectedNode.state) }}>
                  {selectedNode.state}
                </span>
              </div>
              {selectedNode.timestamp && (
                <div className="text-xs text-white/60 mb-2">
                  {new Date(Number(selectedNode.timestamp) * 1000).toLocaleString()}
                </div>
              )}
              {selectedNode.reason && (
                <div className="text-xs text-white/70 italic">
                  "{selectedNode.reason}"
                </div>
              )}
            </div>
          )}

          {/* Path Signature */}
          <div className="mt-6 p-4 border border-white/10 bg-white/5">
            <div className="text-xs text-white/60 mb-2">Path Signature:</div>
            <div className="font-mono text-sm text-white/80">
              {nodes.map((n, i) => (
                <span key={i}>
                  <span style={{ color: getStateColor(n.state) }}>
                    {n.state}
                  </span>
                  {i < nodes.length - 1 && <span className="text-white/40"> → </span>}
                </span>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div className="mt-4 flex flex-wrap gap-2">
            {nodes.length >= 3 && (
              <div className="text-xs bg-blue-500/20 text-blue-400 px-3 py-1 rounded border border-blue-500/30">
                🏅 Veteran (3+ transitions)
              </div>
            )}
            {nodes.some(n => n.state === 'Contradicted') && (
              <div className="text-xs bg-red-500/20 text-red-400 px-3 py-1 rounded border border-red-500/30">
                💥 Contradicted
              </div>
            )}
            {rarity >= 100 && (
              <div className="text-xs bg-purple-500/20 text-purple-400 px-3 py-1 rounded border border-purple-500/30">
                ⭐ Legendary Path
              </div>
            )}
          </div>
        </>
      )}

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-white/10 flex gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#60a5fa' }} />
          <span className="text-white/60">Affirmed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#a78bfa' }} />
          <span className="text-white/60">Denied</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#f87171' }} />
          <span className="text-white/60">Contradicted</span>
        </div>
      </div>
    </div>
  );
}
