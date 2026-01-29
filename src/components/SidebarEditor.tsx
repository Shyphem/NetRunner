import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Check, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { type Node } from "reactflow";
import RichTextEditor from "./RichTextEditor";

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

    useEffect(() => {
        if (node) {
            setLabel(node.data.label || "");
            setContent(node.data.content || "");
            setCommand(node.data.command || "");
            setCategory(node.data.category || "");
        }
    }, [node]);

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

    if (!node) return null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[800px] sm:max-w-2xl overflow-y-auto sm:w-[80vw]">
                <SheetHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div className="space-y-1">
                        <SheetTitle>Edit Node</SheetTitle>
                        <SheetDescription>
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
                            <Label htmlFor="title">Title</Label>
                            <Input id="title" value={label} onChange={handleLabelChange} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Category</Label>
                            <Select value={category} onValueChange={handleCategoryChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
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
                            <Label>Command</Label>
                            <div className="relative group">
                                <pre className="bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-sm text-green-400 overflow-x-auto">
                                    <code>{command}</code>
                                </pre>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-slate-800"
                                    onClick={copyToClipboard}
                                >
                                    {copied ? <Check size={16} /> : <Copy size={16} />}
                                </Button>
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
