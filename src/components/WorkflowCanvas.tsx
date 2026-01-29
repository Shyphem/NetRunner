import React, { useCallback, useState } from 'react';
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    type Connection,
    type Node,
    BackgroundVariant,
    type NodeTypes
} from 'reactflow';
import 'reactflow/dist/style.css';
import CustomNode from './CustomNode';
import SidebarEditor from './SidebarEditor';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

import { getInitialData } from '@/lib/initialData';

const nodeTypes: NodeTypes = {
    custom: CustomNode,
};

const defaultEdgeOptions = {
    style: { stroke: '#22c55e', strokeWidth: 2 },
    animated: true,
};

const WorkflowCanvas = () => {
    const { nodes: initialNodesData, edges: initialEdgesData } = getInitialData();
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodesData);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdgesData);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const onConnect = useCallback((params: Connection) => {
        setEdges((eds) => addEdge({ ...params, type: 'default', animated: true, style: { stroke: '#22c55e', strokeWidth: 2 } }, eds));
    }, [setEdges]);

    const onNodeClick = (_: React.MouseEvent, node: Node) => {
        setSelectedNode(node);
        setIsSidebarOpen(true);
    };

    const handleNodeUpdate = (id: string, data: any) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === id) {
                    return { ...node, data: { ...node.data, ...data } };
                }
                return node;
            })
        );
        // Also update local selected node state to reflect changes immediately in UI if needed
        setSelectedNode((prev) => prev && prev.id === id ? { ...prev, data: { ...prev.data, ...data } } : prev);
    };

    const handleDeleteNode = (id: string) => {
        setNodes((nds) => nds.filter((node) => node.id !== id));
        setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
        setIsSidebarOpen(false);
        setSelectedNode(null);
    };

    const handleAddNode = () => {
        const id = Math.random().toString(36).substr(2, 9);
        const newNode: Node = {
            id,
            type: 'custom',
            position: { x: Math.random() * 500, y: Math.random() * 500 },
            data: { label: 'New Node', type: 'Custom', category: 'Passive Enum' },
        };
        setNodes((nds) => nds.concat(newNode));
    };

    return (
        <div className="w-screen h-screen bg-slate-950">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                nodeTypes={nodeTypes}
                defaultEdgeOptions={defaultEdgeOptions}
                fitView
            >
                <Background color="#22c55e" gap={20} size={1} variant={BackgroundVariant.Dots} />
                <Controls className="bg-slate-900 border-slate-800 text-slate-200" />
                <MiniMap className="bg-slate-900 border-slate-800" nodeColor="#22c55e" maskColor="rgba(0,0,0,0.6)" />
                <div className="absolute top-4 right-4 z-10">
                    <Button onClick={handleAddNode} className="bg-green-600 hover:bg-green-700 text-white">
                        <Plus className="mr-2 h-4 w-4" /> Add Node
                    </Button>
                </div>
            </ReactFlow>
            <SidebarEditor
                open={isSidebarOpen}
                onOpenChange={setIsSidebarOpen}
                node={selectedNode}
                onUpdate={handleNodeUpdate}
                onDelete={handleDeleteNode}
            />
        </div>
    );
};

export default WorkflowCanvas;
