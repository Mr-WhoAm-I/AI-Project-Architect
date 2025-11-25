
import React, { useMemo } from 'react';
import { DiagramNode, DiagramEdge } from '../types';

interface Props {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  isFull?: boolean;
}

export const ArchitectureDiagram: React.FC<Props> = ({ nodes, edges, isFull = false }) => {
  const svgWidth = isFull ? 1200 : 800;
  const svgHeight = isFull ? 800 : 600;

  // --- 1. ZONES DEFINITION ---
  const ZONES = {
    client: { 
        x: 20, y: 50, w: 200, h: svgHeight - 100, 
        label: "Client Side", color: "var(--theme-secondary)" 
    },
    service: { 
        x: 300, y: 50, w: 250, h: svgHeight - 100, 
        label: "Backend & API", color: "var(--theme-primary)" 
    },
    database: { 
        x: 600, y: 200, w: 180, h: svgHeight - 250, 
        label: "Data Layer", color: "#10b981" 
    },
    external: { 
        x: 600, y: 50, w: 180, h: 120, 
        label: "External / 3rd Party", color: "#f59e0b" 
    }
  };

  // --- 2. SMART NODE PLACEMENT ---
  const nodePositions = useMemo(() => {
    const posMap = new Map<string, { x: number, y: number, w: number, h: number }>();
    
    // Group nodes by type
    const groups: Record<string, DiagramNode[]> = { client: [], service: [], database: [], external: [] };
    nodes.forEach(n => {
        if (groups[n.type]) groups[n.type].push(n);
        else groups['service'].push(n); // Fallback
    });

    // Helper to distribute nodes vertically within a zone
    const layoutGroup = (type: keyof typeof ZONES, nodes: DiagramNode[]) => {
        const zone = ZONES[type];
        const count = nodes.length;
        if (count === 0) return;

        const nodeH = 60;
        const availableH = zone.h;
        const spacing = Math.min(100, availableH / count);
        
        // Center the group vertically in the zone
        const totalGroupH = (count * nodeH) + ((count - 1) * (spacing - nodeH));
        const startY = zone.y + (availableH - totalGroupH) / 2;

        nodes.forEach((node, idx) => {
            posMap.set(node.id, {
                x: zone.x + (zone.w - 140) / 2, // Center in zone width
                y: startY + (idx * spacing),
                w: 140,
                h: nodeH
            });
        });
    };

    layoutGroup('client', groups.client);
    layoutGroup('service', groups.service);
    layoutGroup('database', groups.database);
    layoutGroup('external', groups.external);

    return posMap;
  }, [nodes, svgHeight]);

  // --- 3. EDGE PATH CALCULATION (BEZIER) ---
  const getPath = (start: {x:number, y:number, w:number, h:number}, end: {x:number, y:number, w:number, h:number}) => {
    const startPt = { x: start.x + start.w, y: start.y + start.h / 2 }; // Right side
    const endPt = { x: end.x, y: end.y + end.h / 2 }; // Left side

    // Bezier Control Points
    const cp1 = { x: startPt.x + 50, y: startPt.y };
    const cp2 = { x: endPt.x - 50, y: endPt.y };

    return `M ${startPt.x} ${startPt.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${endPt.x} ${endPt.y}`;
  };

  return (
    <div className={`w-full overflow-x-auto rounded-xl border border-borderCol ${isFull ? 'bg-transparent border-none' : 'bg-surface/50 p-4'}`}>
      <svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto font-sans">
        <defs>
          <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill="var(--text-muted)" opacity="0.5" />
          </marker>
        </defs>

        {/* ZONES BACKGROUND */}
        {Object.values(ZONES).map((zone, i) => (
            <g key={i}>
                <rect 
                    x={zone.x} y={zone.y} width={zone.w} height={zone.h} 
                    rx="12" fill="var(--bg-surface)" stroke="var(--border-color)" strokeDasharray="4 4" 
                    opacity="0.3"
                />
                <text 
                    x={zone.x + zone.w / 2} y={zone.y - 10} 
                    textAnchor="middle" fill={zone.color} 
                    className="text-xs font-bold uppercase tracking-widest opacity-80"
                >
                    {zone.label}
                </text>
            </g>
        ))}

        {/* EDGES */}
        {edges.map((edge, i) => {
          const start = nodePositions.get(edge.from);
          const end = nodePositions.get(edge.to);
          if (!start || !end) return null;

          const path = getPath(start, end);

          return (
            <g key={i} className="group/edge hover:opacity-100 opacity-60 transition-opacity">
              <path 
                d={path} 
                fill="none" 
                stroke="var(--border-color)" 
                strokeWidth="2" 
                markerEnd="url(#arrowhead)"
                className="group-hover/edge:stroke-primary transition-colors"
              />
              {edge.label && (
                <rect 
                    x={(start.x + end.x + start.w) / 2} 
                    y={(start.y + end.y) / 2 - 10}
                    width={edge.label.length * 6 + 10}
                    height={16}
                    rx={4}
                    fill="var(--bg-main)"
                />
              )}
              {edge.label && (
                <text 
                  x={(start.x + end.x + start.w) / 2 + (edge.label.length * 3)} 
                  y={(start.y + end.y) / 2 + 2} 
                  textAnchor="middle" 
                  className="fill-textMuted text-[9px] font-mono pointer-events-none"
                >
                  {edge.label}
                </text>
              )}
            </g>
          );
        })}

        {/* NODES */}
        {nodes.map((node, i) => {
          const pos = nodePositions.get(node.id);
          if (!pos) return null;
          
          let borderColor = "var(--border-color)";
          let bgColor = "var(--bg-surface)";
          
          if (node.type === 'client') borderColor = ZONES.client.color;
          if (node.type === 'service') borderColor = ZONES.service.color;
          if (node.type === 'database') borderColor = ZONES.database.color;
          if (node.type === 'external') borderColor = ZONES.external.color;

          return (
            <g key={node.id} transform={`translate(${pos.x}, ${pos.y})`} className="cursor-default group/node">
              {/* Shadow */}
              <rect 
                x="2" y="2" width={pos.w} height={pos.h} rx="8" 
                fill="black" opacity="0.2"
              />
              {/* Main Box */}
              <rect 
                width={pos.w} height={pos.h} 
                rx="8" 
                fill={bgColor} 
                stroke={borderColor} 
                strokeWidth="1.5"
                className="transition-all group-hover/node:stroke-2 group-hover/node:fill-dark"
              />
              
              {/* Header Bar */}
              <rect 
                width={pos.w} height="4" 
                rx="2" 
                fill={borderColor} 
                opacity="0.8"
                clipPath="inset(0 0 50% 0 round 8px 8px 0 0)"
              />

              <text 
                x={pos.w / 2} y={pos.h / 2} 
                dy="-4"
                textAnchor="middle" 
                className="fill-textMain text-[11px] font-bold pointer-events-none"
              >
                {node.label}
              </text>
               <text 
                x={pos.w / 2} y={pos.h / 2} 
                dy="12"
                textAnchor="middle" 
                className="fill-textMuted text-[8px] uppercase tracking-wider pointer-events-none"
              >
                {node.type}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
