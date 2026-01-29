import { useCallback, useState, useEffect } from 'react';
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    type Connection,
    BackgroundVariant,
    type Node,
    ReactFlowProvider
} from 'reactflow';
import 'reactflow/dist/style.css';
import CustomNode from './CustomNode';
import SidebarEditor from './SidebarEditor';
import { Button } from './ui/button';
import { Plus, Save } from 'lucide-react';
import { useAppStore } from '@/store/useStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const nodeTypes = {
    custom: CustomNode,
};

const defaultEdgeOptions = {
    animated: true,
    style: {
        stroke: '#22c55e',
        strokeWidth: 2,
    },
    type: 'default',
};

const CanvasContent = () => {
    // Get state from store
    const {
        getActiveTarget
    } = useAppStore();

    const activeTarget = getActiveTarget();

    return (
        <div className="w-full h-full bg-slate-950 relative">
            {activeTarget ? (
                <CanvasWithStore key={activeTarget.id} target={activeTarget} />
            ) : (
                <div className="flex items-center justify-center h-full text-slate-500">
                    Select or create a target to begin.
                </div>
            )}
        </div>
    );
};

const CanvasWithStore = ({ target }: { target: any }) => {
    const { updateTargetNodes, updateTargetEdges, saveTemplate } = useAppStore();

    // Initialize local state from target props
    const [nodes, setNodes, onNodesChange] = useNodesState(target.nodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(target.edges);

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);

    // Template Save Dialog
    const [isSaveTemplateOpen, setIsSaveTemplateOpen] = useState(false);
    const [templateName, setTemplateName] = useState("");

    const onConnect = useCallback((params: Connection) => {
        setEdges((eds) => {
            const newEdges = addEdge({ ...params, type: 'default', animated: true, style: { stroke: '#22c55e', strokeWidth: 2 } }, eds);
            updateTargetEdges(target.id, newEdges);
            return newEdges;
        });
    }, [setEdges, target.id, updateTargetEdges]);

    const handleNodesChange = useCallback((changes: any) => {
        onNodesChange(changes);
    }, [onNodesChange]);

    const handleEdgesChange = useCallback((changes: any) => {
        onEdgesChange(changes);
    }, [onEdgesChange]);

    // Sync state to store whenever nodes/edges change
    useEffect(() => {
        const handler = setTimeout(() => {
            updateTargetNodes(target.id, nodes);
            updateTargetEdges(target.id, edges);
        }, 500);
        return () => clearTimeout(handler);
    }, [nodes, edges, target.id, updateTargetNodes, updateTargetEdges]);

    const onNodeClick = (_: React.MouseEvent, node: Node) => {
        setSelectedNode(node);
        setIsSidebarOpen(true);
    };

    const handleNodeUpdate = (id: string, data: any) => {
        setNodes((nds) => {
            const newNodes = nds.map((node) => {
                if (node.id === id) {
                    return { ...node, data: { ...node.data, ...data } };
                }
                return node;
            });
            return newNodes;
        });
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
            position: { x: Math.random() * 500 + 1500, y: Math.random() * 500 },
            data: { label: 'New Node', type: 'Custom', category: 'Passive Enum', command: '', content: '' },
        };
        setNodes((nds) => nds.concat(newNode));
    };

    const handleSaveTemplate = () => {
        if (templateName.trim()) {
            // Force final sync before saving template to ensure latest positions are captured
            // Although store usually lags by 500ms, if user stopped moving it should be fine.
            // For safety we could pass current local nodes/edges to saveTemplate, OR just trust the sync.
            // Let's pass the IDs and trust the store has mostly synced, or we force sync now.
            updateTargetNodes(target.id, nodes);
            updateTargetEdges(target.id, edges);

            saveTemplate(templateName.trim(), target.id);
            setIsSaveTemplateOpen(false);
            setTemplateName("");
        }
    };

    return (
        <>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={handleNodesChange}
                onEdgesChange={handleEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                nodeTypes={nodeTypes}
                defaultEdgeOptions={defaultEdgeOptions}
                fitView
            >
                <Background color="#22c55e" gap={20} size={1} variant={BackgroundVariant.Dots} />
                <Controls className="bg-slate-900 border-slate-800 text-slate-200" />
                <MiniMap className="bg-slate-900 border-slate-800" nodeColor="#22c55e" maskColor="rgba(0,0,0,0.6)" />
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                    <Button onClick={() => setIsSaveTemplateOpen(true)} variant="outline" className="bg-slate-900 border-green-500/50 text-green-500 hover:bg-green-500/10 hover:text-green-400">
                        <Save className="mr-2 h-4 w-4" /> Save Template
                    </Button>
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

            <Dialog open={isSaveTemplateOpen} onOpenChange={setIsSaveTemplateOpen}>
                <DialogContent className="bg-slate-950 border-slate-800 text-slate-100">
                    <DialogHeader>
                        <DialogTitle>Save as Template</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Save this workflow layout and configuration as a reusable template.
                            The current domain "{target.name}" will be replaced with a variable.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="templateName" className="text-slate-200">Template Name</Label>
                            <Input
                                id="templateName"
                                placeholder="e.g., Passive Recon Focused"
                                value={templateName}
                                onChange={(e) => setTemplateName(e.target.value)}
                                className="bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsSaveTemplateOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveTemplate} className="bg-green-600 hover:bg-green-700">Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

const WorkflowCanvas = () => {
    return (
        <ReactFlowProvider>
            <CanvasContent />
        </ReactFlowProvider>
    );
};

export default WorkflowCanvas;
