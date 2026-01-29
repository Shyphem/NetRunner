import { useAppStore } from "@/store/useStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Plus, Target, Trash2, Settings, Star, LogOut } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";

const PasswordChangeForm = () => {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleChangePassword = async () => {
        setMessage("");
        setError("");
        try {
            const token = localStorage.getItem('netrunner_token');
            const res = await fetch('http://localhost:3001/api/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ currentPassword, newPassword }),
            });
            const data = await res.json();
            if (res.ok) {
                setMessage("Password updated successfully.");
                setCurrentPassword("");
                setNewPassword("");
            } else {
                setError(data.error || "Failed to update password.");
            }
        } catch (err) {
            setError("Connection failed.");
        }
    };

    return (
        <div className="space-y-3">
            <div className="space-y-1">
                <Label className="text-xs text-slate-400">Current Password</Label>
                <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="bg-slate-900 border-slate-800 h-8 text-sm" />
            </div>
            <div className="space-y-1">
                <Label className="text-xs text-slate-400">New Password</Label>
                <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="bg-slate-900 border-slate-800 h-8 text-sm" />
            </div>
            {message && <p className="text-xs text-green-500">{message}</p>}
            {error && <p className="text-xs text-red-500">{error}</p>}
            <Button onClick={handleChangePassword} size="sm" className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200">
                Update Password
            </Button>
        </div>
    );
};

const ProjectSidebar = () => {
    const {
        targets,
        activeTargetId,
        setActiveTarget,
        addTarget,
        removeTarget,
        templates,
        deleteTemplate,
        defaultTemplateId,
        setDefaultTemplate
    } = useAppStore();

    const [newDomain, setNewDomain] = useState("");
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>("default");
    const [openNewTarget, setOpenNewTarget] = useState(false);
    const [openSettings, setOpenSettings] = useState(false);

    const handleCreate = () => {
        if (newDomain.trim()) {
            const templateId = selectedTemplateId === "default" ? null : selectedTemplateId;
            addTarget(newDomain.trim(), templateId);
            setNewDomain("");
            setOpenNewTarget(false);
        }
    };

    return (
        <div className="w-[250px] flex-shrink-0 h-screen bg-slate-900 border-r border-slate-800 flex flex-col">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-green-500 flex items-center gap-2">
                        <Target className="w-6 h-6" />
                        NetRunner
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">Bug Bounty Workflow</p>
                </div>

                <Sheet open={openSettings} onOpenChange={setOpenSettings}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                            <Settings className="w-4 h-4" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="bg-slate-950 border-slate-800 text-slate-100">
                        <SheetHeader>
                            <SheetTitle className="text-white">Settings & Templates</SheetTitle>
                            <SheetDescription className="text-slate-400">
                                Configure templates.
                            </SheetDescription>
                        </SheetHeader>

                        <div className="mt-8">
                            <h3 className="text-sm font-semibold text-green-500 mb-4">Saved Templates</h3>
                            {templates.length === 0 ? (
                                <p className="text-sm text-slate-500 italic">No templates saved yet.</p>
                            ) : (
                                <div className="space-y-3">
                                    {templates.map(t => (
                                        <div key={t.id} className="bg-slate-900 p-3 rounded border border-slate-800 flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-slate-200">{t.name}</span>
                                                <span className="text-xs text-slate-500">{t.nodes.length} nodes</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className={cn("h-7 w-7", defaultTemplateId === t.id ? "text-yellow-400" : "text-slate-600 hover:text-yellow-400")}
                                                    onClick={() => setDefaultTemplate(defaultTemplateId === t.id ? null : t.id)}
                                                    title="Set as Default"
                                                >
                                                    <Star size={14} fill={defaultTemplateId === t.id ? "currentColor" : "none"} />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-7 w-7 text-slate-600 hover:text-red-400"
                                                    onClick={() => deleteTemplate(t.id)}
                                                >
                                                    <Trash2 size={14} />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <p className="mt-4 text-xs text-slate-500">
                                To create a template, arrange your nodes on the canvas and click "Save Template" in the top right.
                            </p>
                        </div>

                        <div className="mt-8 border-t border-slate-800 pt-6">
                            <h3 className="text-sm font-semibold text-green-500 mb-4">Security</h3>
                            <PasswordChangeForm />
                        </div>

                        <div className="mt-8 border-t border-slate-800 pt-6">
                            <Button
                                variant="destructive"
                                className="w-full flex items-center justify-center gap-2"
                                onClick={() => {
                                    localStorage.removeItem('netrunner_token');
                                    window.location.reload();
                                }}
                            >
                                <LogOut size={16} />
                                Logout
                            </Button>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-slate-200">Targets</h3>
                    </div>

                    {targets.length === 0 ? (
                        <div className="text-sm text-slate-500 text-center py-8">
                            No targets yet.<br />Create one to start.
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {targets.map((target) => (
                                <div
                                    key={target.id}
                                    className={cn(
                                        "group flex items-center justify-between p-2 rounded-md hover:bg-slate-800 cursor-pointer transition-colors border",
                                        activeTargetId === target.id
                                            ? "bg-slate-800 border-green-500/50"
                                            : "border-transparent"
                                    )}
                                    onClick={() => setActiveTarget(target.id)}
                                >
                                    <span className={cn(
                                        "text-sm",
                                        activeTargetId === target.id ? "text-green-400 font-medium" : "text-slate-300"
                                    )}>
                                        {target.name}
                                    </span>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-6 w-6 opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 hover:bg-transparent"
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevent switching when deleting
                                            removeTarget(target.id);
                                        }}
                                    >
                                        <Trash2 size={14} />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </ScrollArea>

            <div className="p-4 border-t border-slate-800">
                <Dialog open={openNewTarget} onOpenChange={setOpenNewTarget}>
                    <DialogTrigger asChild>
                        <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                            <Plus className="mr-2 h-4 w-4" /> New Target
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-950 border-slate-800 sm:max-w-md text-slate-100">
                        <DialogHeader>
                            <DialogTitle className="text-white">Add New Target</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="domain" className="text-slate-200">Target Domain</Label>
                                <Input
                                    id="domain"
                                    placeholder="e.g., tesla.com"
                                    value={newDomain}
                                    onChange={(e) => setNewDomain(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                                    className="bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="template" className="text-slate-200">Template</Label>
                                <Select onValueChange={setSelectedTemplateId} defaultValue="default">
                                    <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-100">
                                        <SelectValue placeholder="Select a template" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-900 border-slate-700 text-slate-100">
                                        <SelectItem value="default">
                                            Default System {defaultTemplateId ? "(Custom Default Active)" : ""}
                                        </SelectItem>
                                        {templates.map(t => (
                                            <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setOpenNewTarget(false)} className="text-slate-400 hover:text-white hover:bg-slate-900">Cancel</Button>
                            <Button onClick={handleCreate} className="bg-green-600 hover:bg-green-700 text-white">Create Workflow</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};

export default ProjectSidebar;
