import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Check, Trash2, Play, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { type Node } from "reactflow";
import RichTextEditor from "./RichTextEditor";
import { useAppStore } from "@/store/useStore"; // Import store

interface SidebarEditorProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    node: Node | null;
    onUpdate: (id: string, data: any) => void;
    onDelete: (id: string) => void;
}

const CATEGORIES = [
    "Passive Enum",
    "Active Enum",
    "Probing",
    "Port Scanning",
    "Fingerprinting",
    "Visual Recon",
    "Content Discovery",
    "URL Extraction",
    "Vulnerability Filtering",
    "Root",
    "Phase 1",
    "Phase 2"
];

const SidebarEditor = ({ open, onOpenChange, node, onUpdate, onDelete }: SidebarEditorProps) => {
    const [label, setLabel] = useState("");
    const [content, setContent] = useState("");
    const [command, setCommand] = useState("");
    const [category, setCategory] = useState("");
    const [copied, setCopied] = useState(false);
    const [toolInstalled, setToolInstalled] = useState<boolean | null>(null);

    const setTerminal = useAppStore(state => state.setTerminal); // Get action

    useEffect(() => {
        if (node) {
            setLabel(node.data.label || "");
            setContent(node.data.content || "");
            setCommand(node.data.command || "");
            setCategory(node.data.category || "");

            // Check if tool is installed
            if (node.data.command) {
                const toolName = node.data.command.split(' ')[0];
                checkTool(toolName);
            } else {
                setToolInstalled(null);
            }
        }
    }, [node]);

    const checkTool = async (tool: string) => {
        try {
            const token = localStorage.getItem('netrunner_token');
            const res = await fetch('http://localhost:3001/api/check-tool', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ tool })
            });
            const data = await res.json();
            setToolInstalled(data.installed);
        } catch (err) {
            console.error("Failed to check tool", err);
            setToolInstalled(null);
        }
    };

    const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newLabel = e.target.value;
        setLabel(newLabel);
        if (node) {
            onUpdate(node.id, { label: newLabel });
        }
    };

    const handleContentChange = (newContent: string) => {
        setContent(newContent);
        if (node) {
            onUpdate(node.id, { content: newContent });
        }
    };

    const handleCategoryChange = (newCategory: string) => {
        setCategory(newCategory);
        if (node) {
            onUpdate(node.id, { category: newCategory });
        }
    };

    const handleDelete = () => {
        if (node) {
            onDelete(node.id);
            onOpenChange(false);
        }
    };

    const copyToClipboard = () => {
        if (command) {
            navigator.clipboard.writeText(command);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleRun = () => {
        if (command && node) {
            setTerminal(true, command, node.id);
            onOpenChange(false); // Close editor to show terminal better? Or keep open? Let's close for now.
        }
    };

    if (!node) return null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[800px] sm:max-w-2xl overflow-y-auto sm:w-[80vw] bg-slate-950 border-slate-800 text-slate-100">
                <SheetHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div className="space-y-1">
                        <SheetTitle className="text-slate-100">Edit Node</SheetTitle>
                        <SheetDescription className="text-slate-400">
                            Modify the documentation for this workflow step.
                        </SheetDescription>
                    </div>
                    <Button
                        variant="destructive"
                        size="icon"
                        onClick={handleDelete}
                        title="Delete Node"
                    >
                        <Trash2 size={16} />
                    </Button>
                </SheetHeader>
                <div className="grid gap-6 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title" className="text-slate-200">Title</Label>
                            <Input id="title" value={label} onChange={handleLabelChange} className="bg-slate-900 border-slate-700 text-slate-100" />
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-slate-200">Category</Label>
                            <Select value={category} onValueChange={handleCategoryChange}>
                                <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-100">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-slate-700 text-slate-100">
                                    {CATEGORIES.map((cat) => (
                                        <SelectItem key={cat} value={cat}>
                                            {cat}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {command && (
                        <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-slate-200">Command</Label>
                                {toolInstalled !== null && (
                                    <span className={`text-[10px] flex items-center gap-1 ${toolInstalled ? 'text-green-500' : 'text-red-500'}`}>
                                        {toolInstalled ? <Check size={12} /> : <AlertCircle size={12} />}
                                        {toolInstalled ? 'Tool Installed' : 'Tool Missing'}
                                    </span>
                                )}
                            </div>
                            <div className="relative group">
                                <pre className="bg-slate-900 border border-slate-800 rounded-lg p-4 font-mono text-sm text-green-400 whitespace-pre-wrap break-all pr-24">
                                    <code>{command}</code>
                                </pre>
                                <div className="absolute top-2 right-2 flex items-center gap-1">
                                    <Button
                                        size="sm"
                                        className="h-8 bg-green-600 hover:bg-green-700 text-white gap-2"
                                        onClick={handleRun}
                                        disabled={toolInstalled === false}
                                        title={toolInstalled === false ? "Tool not found on server" : "Run in Terminal"}
                                    >
                                        <Play size={14} /> Run
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800"
                                        onClick={copyToClipboard}
                                    >
                                        {copied ? <Check size={16} /> : <Copy size={16} />}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid gap-2">
                        <Label htmlFor="content">Results</Label>
                        <RichTextEditor
                            content={content}
                            onChange={handleContentChange}
                        />
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default SidebarEditor;
