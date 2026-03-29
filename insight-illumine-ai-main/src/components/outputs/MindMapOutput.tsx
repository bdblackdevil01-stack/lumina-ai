import { useCallback, useMemo } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Download, Network } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export interface MindMapNode {
  id: string;
  label: string;
  children?: MindMapNode[];
}

interface MindMapOutputProps {
  data: MindMapNode;
}

function flatten(
  node: MindMapNode,
  x: number,
  y: number,
  level: number,
  nodes: Node[],
  edges: Edge[],
  parentId?: string
) {
  const colors = [
    "hsl(250, 65%, 55%)",
    "hsl(210, 80%, 50%)",
    "hsl(180, 70%, 42%)",
    "hsl(280, 60%, 55%)",
    "hsl(320, 55%, 50%)",
  ];

  nodes.push({
    id: node.id,
    position: { x, y },
    data: { label: node.label },
    style: {
      background: level === 0 ? colors[0] : `${colors[level % colors.length]}22`,
      color: level === 0 ? "#fff" : "hsl(260, 10%, 15%)",
      border: `2px solid ${colors[level % colors.length]}`,
      borderRadius: "12px",
      padding: "10px 16px",
      fontSize: level === 0 ? "14px" : "12px",
      fontWeight: level === 0 ? "700" : "500",
      minWidth: "100px",
      textAlign: "center" as const,
    },
  });

  if (parentId) {
    edges.push({
      id: `${parentId}-${node.id}`,
      source: parentId,
      target: node.id,
      style: { stroke: colors[level % colors.length], strokeWidth: 2 },
    });
  }

  const children = node.children || [];
  const totalHeight = children.length * 100;
  const startY = y - totalHeight / 2;
  children.forEach((child, i) => {
    flatten(child, x + 250, startY + i * 100, level + 1, nodes, edges, node.id);
  });
}

export function MindMapOutput({ data }: MindMapOutputProps) {
  const { initialNodes, initialEdges } = useMemo(() => {
    const n: Node[] = [];
    const e: Edge[] = [];
    flatten(data, 50, 300, 0, n, e);
    return { initialNodes: n, initialEdges: e };
  }, [data]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const copyText = () => {
    const serialize = (node: MindMapNode, indent = 0): string => {
      const prefix = "  ".repeat(indent);
      let text = `${prefix}- ${node.label}`;
      if (node.children) {
        text += "\n" + node.children.map((c) => serialize(c, indent + 1)).join("\n");
      }
      return text;
    };
    navigator.clipboard.writeText(serialize(data));
    toast.success("Copied to clipboard");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="glass-card glow-border">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Network className="h-5 w-5 text-primary" />
            Mind Map
          </CardTitle>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={copyText}><Copy className="h-4 w-4" /></Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] rounded-lg overflow-hidden border border-border/30">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              fitView
              proOptions={{ hideAttribution: true }}
            >
              <Controls />
              <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
            </ReactFlow>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
