import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Button } from './ui/button';
import { Bold, Italic, Code, List, ListOrdered } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
}

const RichTextEditor = ({ content, onChange }: RichTextEditorProps) => {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                bulletList: {
                    keepMarks: true,
                    keepAttributes: false,
                },
                orderedList: {
                    keepMarks: true,
                    keepAttributes: false,
                },
            }),
        ],
        content: content,
        editorProps: {
            attributes: {
                class: 'prose prose-invert max-w-none focus:outline-none min-h-[150px] p-4 text-sm text-slate-200',
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    // Sync content if it changes externally (e.g. from Terminal)
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            // Only update if significantly different to avoid cursor jumps
            // For simple integration, we just set content if it's empty in editor or drastically different
            // But here we rely on the parent open/close to reset state mainly.
            // If sidebar is open and we update in bg, we want to see it?
            // SidebarEditor resets state on `node` change.
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    if (!editor) {
        return null;
    }

    return (
        <div className="border border-slate-700 rounded-md overflow-hidden bg-slate-900">
            <div className="flex items-center gap-1 p-2 bg-slate-950 border-b border-slate-800">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={cn("h-8 w-8", editor.isActive('bold') ? 'bg-slate-800 text-green-400' : 'text-slate-400')}
                >
                    <Bold size={14} />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={cn("h-8 w-8", editor.isActive('italic') ? 'bg-slate-800 text-green-400' : 'text-slate-400')}
                >
                    <Italic size={14} />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    className={cn("h-8 w-8", editor.isActive('code') ? 'bg-slate-800 text-green-400' : 'text-slate-400')}
                >
                    <Code size={14} />
                </Button>
                <div className="w-px h-4 bg-slate-700 mx-1" />
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={cn("h-8 w-8", editor.isActive('bulletList') ? 'bg-slate-800 text-green-400' : 'text-slate-400')}
                >
                    <List size={14} />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={cn("h-8 w-8", editor.isActive('orderedList') ? 'bg-slate-800 text-green-400' : 'text-slate-400')}
                >
                    <ListOrdered size={14} />
                </Button>
            </div>
            <EditorContent editor={editor} className="bg-slate-900" />
        </div>
    );
};

export default RichTextEditor;
