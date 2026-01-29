import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { type Node, type Edge } from 'reactflow';
import { generateReconTree } from '@/lib/initialData';

interface Target {
    id: string;
    name: string; // The domain name
    nodes: Node[];
    edges: Edge[];
}

export interface Template {
    id: string;
    name: string;
    nodes: Node[];
    edges: Edge[];
}

interface AppState {
    targets: Target[];
    templates: Template[];
    activeTargetId: string | null;
    defaultTemplateId: string | null;

    // Terminal State
    terminal: {
        isOpen: boolean;
        command: string | null;
        targetNodeId: string | null;
    };
    setTerminal: (isOpen: boolean, command?: string | null, targetNodeId?: string | null) => void;

    // Actions
    addTarget: (domain: string, templateId?: string | null) => void;
    removeTarget: (id: string) => void;
    setActiveTarget: (id: string) => void;
    updateTargetNodes: (id: string, nodes: Node[]) => void;
    updateTargetEdges: (id: string, edges: Edge[]) => void;

    // Template Actions
    saveTemplate: (name: string, sourceTargetId: string) => void;
    deleteTemplate: (id: string) => void;
    setDefaultTemplate: (id: string | null) => void;

    // Helper
    getActiveTarget: () => Target | undefined;
}

export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            targets: [],
            templates: [],
            activeTargetId: null,
            defaultTemplateId: null,
            terminal: { isOpen: false, command: null, targetNodeId: null },

            addTarget: (domain: string, templateId?: string | null) => {
                let nodes: Node[] = [];
                let edges: Edge[] = [];
                const state = get();

                // Use provided templateId or fallback to default
                const tid = templateId !== undefined ? templateId : state.defaultTemplateId;
                const template = state.templates.find(t => t.id === tid);

                if (template) {
                    // Template Substitution Logic
                    const nodesStr = JSON.stringify(template.nodes);
                    const edgesStr = JSON.stringify(template.edges);

                    // Replace {{TARGET}} with actual domain
                    // We use a global replace. 
                    // Note: In JSON string, newlines etc might be escaped, but {{TARGET}} should be clean.
                    const processedNodes = nodesStr.replaceAll('{{TARGET}}', domain);
                    const processedEdges = edgesStr.replaceAll('{{TARGET}}', domain);

                    nodes = JSON.parse(processedNodes);
                    edges = JSON.parse(processedEdges);
                } else {
                    // Fallback to hardcoded generator
                    const data = generateReconTree(domain);
                    nodes = data.nodes;
                    edges = data.edges;
                }

                const newTarget: Target = {
                    id: crypto.randomUUID(),
                    name: domain,
                    nodes,
                    edges,
                };

                set((state) => ({
                    targets: [...state.targets, newTarget],
                    activeTargetId: newTarget.id,
                }));
            },

            removeTarget: (id: string) => {
                set((state) => {
                    const newTargets = state.targets.filter((t) => t.id !== id);
                    let newActiveId = state.activeTargetId;
                    if (state.activeTargetId === id) {
                        newActiveId = newTargets.length > 0 ? newTargets[0].id : null;
                    }
                    return { targets: newTargets, activeTargetId: newActiveId };
                });
            },

            setActiveTarget: (id: string) => {
                set({ activeTargetId: id });
            },

            updateTargetNodes: (id: string, nodes: Node[]) => {
                set((state) => ({
                    targets: state.targets.map((t) => (t.id === id ? { ...t, nodes } : t)),
                }));
            },

            updateTargetEdges: (id: string, edges: Edge[]) => {
                set((state) => ({
                    targets: state.targets.map((t) => (t.id === id ? { ...t, edges } : t)),
                }));
            },

            saveTemplate: (name: string, sourceTargetId: string) => {
                const state = get();
                const target = state.targets.find(t => t.id === sourceTargetId);
                if (!target) return;

                // processing: Replace target.name with {{TARGET}}
                const domain = target.name;
                // Escape domain for regex to ensure accurate replacement if domain has specials (dots usually fine in string replaceAll but let's be safe with basic string)

                const nodesStr = JSON.stringify(target.nodes);
                const edgesStr = JSON.stringify(target.edges);

                // Simple string replacement. 
                // Warning: if domain is "com", it might replace too much. 
                // Realistically domain is "tesla.com". 
                // If user entered "test", it might replace "testing" -> "{{TARGET}}ing". 
                // Acceptable edge case for this MVP level.

                const templateNodesStr = nodesStr.replaceAll(domain, '{{TARGET}}');
                const templateEdgesStr = edgesStr.replaceAll(domain, '{{TARGET}}');

                const newTemplate: Template = {
                    id: crypto.randomUUID(),
                    name,
                    nodes: JSON.parse(templateNodesStr),
                    edges: JSON.parse(templateEdgesStr)
                };

                set(state => ({
                    templates: [...state.templates, newTemplate]
                }));
            },

            deleteTemplate: (id: string) => {
                set(state => ({
                    templates: state.templates.filter(t => t.id !== id),
                    defaultTemplateId: state.defaultTemplateId === id ? null : state.defaultTemplateId
                }));
            },

            setDefaultTemplate: (id: string | null) => {
                set({ defaultTemplateId: id });
            },



            setTerminal: (isOpen, command = null, targetNodeId = null) => {
                set({ terminal: { isOpen, command, targetNodeId } });
            },

            getActiveTarget: () => {
                const state = get();
                return state.targets.find((t) => t.id === state.activeTargetId);
            },
        }),
        {
            name: 'bountyflow-storage',
            storage: createJSONStorage(() => ({
                getItem: async (_name) => {
                    try {
                        const token = localStorage.getItem('netrunner_token');
                        const response = await fetch('http://localhost:3001/api/data', {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        if (!response.ok) return null;
                        const data = await response.json();
                        return JSON.stringify(data);
                    } catch (err) {
                        console.error('Failed to load data:', err);
                        return null;
                    }
                },
                setItem: async (_name, value) => {
                    try {
                        const token = localStorage.getItem('netrunner_token');
                        const parsed = JSON.parse(value);
                        await fetch('http://localhost:3001/api/save', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify(parsed)
                        });
                    } catch (err) {
                        console.error('Failed to save data:', err);
                    }
                },
                removeItem: () => { },
            })),
        }
    )
);
