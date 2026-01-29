import { useEffect, useRef, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { io, Socket } from 'socket.io-client';
import { X, Maximize2, Minimize2, Terminal as TerminalIcon } from 'lucide-react';
import { Button } from './ui/button';
import { useAppStore } from '@/store/useStore';
import { cn } from '@/lib/utils'; // Assuming you have a utils file

interface TerminalDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    command: string | null;
    targetNodeId: string | null;
}

const TerminalDrawer = ({ isOpen, onClose, command, targetNodeId }: TerminalDrawerProps) => {
    const terminalRef = useRef<HTMLDivElement>(null);
    const xtermRef = useRef<Terminal | null>(null);
    const socketRef = useRef<Socket | null>(null);
    const fitAddonRef = useRef<FitAddon | null>(null);
    const [isMaximized, setIsMaximized] = useState(false);
    const outputBuffer = useRef<string>("");

    // Store Actions
    const updateTargetNodes = useAppStore(state => state.updateTargetNodes);
    const getActiveTarget = useAppStore(state => state.getActiveTarget);

    // Initialize Socket and Terminal
    useEffect(() => {
        if (!isOpen) return;

        // Init Socket
        const token = localStorage.getItem('netrunner_token');
        socketRef.current = io('http://localhost:3001', {
            auth: { token: token }
        });

        // Init Terminal
        if (terminalRef.current && !xtermRef.current) {
            const term = new Terminal({
                cursorBlink: true,
                theme: {
                    background: '#020617', // slate-950
                    foreground: '#f8fafc', // slate-50
                    cursor: '#22c55e',     // green-500
                },
                fontFamily: 'monospace',
                fontSize: 14,
            });

            const fitAddon = new FitAddon();
            term.loadAddon(fitAddon);

            term.open(terminalRef.current);
            fitAddon.fit();

            xtermRef.current = term;
            fitAddonRef.current = fitAddon;

            term.writeln('\x1b[32m$ NetRunner Terminal initialized...\x1b[0m');
        }

        // Socket Events
        const socket = socketRef.current;
        const term = xtermRef.current;

        socket.on('connect', () => {
            term?.writeln('\x1b[34m> Connected to backend.\x1b[0m');

            if (command) {
                term?.writeln(`\x1b[33m> Executing: ${command}\x1b[0m`);
                term?.writeln('');
                outputBuffer.current = ""; // Reset buffer

                // Get Target Name for Folder creation
                const target = getActiveTarget();
                const targetName = target ? target.name : 'unknown';

                socket.emit('run-command', { command, targetName });
            }
        });

        socket.on('command-output', (data: string) => {
            // Fix newlines for xterm (expects \r\n)
            const formatted = data.replace(/\n/g, '\r\n');
            term?.write(formatted);
            outputBuffer.current += data;
        });

        socket.on('command-complete', ({ code }: { code: number }) => {
            term?.writeln('');
            term?.writeln(`\x1b[34m> Command finished with exit code ${code}\x1b[0m`);

            // Auto-Save Result to Node
            if (targetNodeId && code === 0 && outputBuffer.current) {
                saveToNode(targetNodeId, outputBuffer.current);
                term?.writeln('\x1b[32m> Output saved to node Results.\x1b[0m');
            }
        });

        socket.on('connect_error', (err) => {
            term?.writeln(`\x1b[31m> Connection Error: ${err.message}\x1b[0m`);
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
            // Don't verify destroy terminal heavily as React StrictMode ensures double mount
        };

    }, [isOpen, command]); // Re-run if command changes while open

    // Handle Resize
    useEffect(() => {
        const handleResize = () => fitAddonRef.current?.fit();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Effect to refit when maximize changes
    useEffect(() => {
        setTimeout(() => fitAddonRef.current?.fit(), 100);
    }, [isMaximized, isOpen]);

    const saveToNode = (nodeId: string, output: string) => {
        const target = getActiveTarget();
        if (!target) return;

        const updatedNodes = target.nodes.map(node => {
            if (node.id === nodeId) {
                const timestamp = new Date().toLocaleTimeString();
                const existing = node.data.content || "";

                // Append as HTML since Tiptap expects HTML content
                // Use <pre><code> for code blocks to ensure preservation of whitespace and formatting
                const newContent = `${existing}<h3>Run at ${timestamp}</h3><pre><code>${output}</code></pre><p></p>`;

                return { ...node, data: { ...node.data, content: newContent } };
            }
            return node;
        });

        updateTargetNodes(target.id, updatedNodes);
    };

    if (!isOpen) return null;

    return (
        <div className={cn(
            "fixed bottom-0 left-[250px] right-0 bg-slate-950 border-t border-slate-800 shadow-2xl transition-all duration-300 z-50 flex flex-col",
            isMaximized ? "top-0 h-screen" : "h-[300px]"
        )}>
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800">
                <div className="flex items-center gap-2 text-slate-200">
                    <TerminalIcon className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-mono font-medium">Terminal</span>
                </div>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-white" onClick={() => setIsMaximized(!isMaximized)}>
                        {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-red-400" onClick={onClose}>
                        <X size={14} />
                    </Button>
                </div>
            </div>

            {/* Terminal Container */}
            <div className="flex-1 p-2 overflow-hidden relative">
                <div ref={terminalRef} className="h-full w-full" />
            </div>
        </div>
    );
};

export default TerminalDrawer;
