"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import Typography from '@tiptap/extension-typography';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote, 
  Redo, 
  Undo,
  Type,
  CheckSquare,
  Link as LinkIcon
} from 'lucide-react';

interface RichTextEditorProps {
  content: any;
  onChange: (json: any, html: string) => void;
  placeholder?: string;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap gap-1 p-2 bg-white/40 border-b border-white/60 backdrop-blur-sm sticky top-0 z-10">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 rounded-lg transition-all ${editor.isActive('bold') ? 'bg-primary text-white shadow-lg' : 'hover:bg-white/60 text-muted-foreground'}`}
      >
        <Bold size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 rounded-lg transition-all ${editor.isActive('italic') ? 'bg-primary text-white shadow-lg' : 'hover:bg-white/60 text-muted-foreground'}`}
      >
        <Italic size={16} />
      </button>
      <div className="w-px h-6 bg-white/40 mx-1 self-center" />
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-2 rounded-lg transition-all ${editor.isActive('heading', { level: 2 }) ? 'bg-primary text-white shadow-lg' : 'hover:bg-white/60 text-muted-foreground'}`}
      >
        <Type size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded-lg transition-all ${editor.isActive('bulletList') ? 'bg-primary text-white shadow-lg' : 'hover:bg-white/60 text-muted-foreground'}`}
      >
        <List size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        className={`p-2 rounded-lg transition-all ${editor.isActive('taskList') ? 'bg-primary text-white shadow-lg' : 'hover:bg-white/60 text-muted-foreground'}`}
      >
        <CheckSquare size={16} />
      </button>
      <div className="w-px h-6 bg-white/40 mx-1 self-center" />
      <button
        onClick={() => editor.chain().focus().undo().run()}
        className="p-2 rounded-lg hover:bg-white/60 text-muted-foreground transition-all"
      >
        <Undo size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        className="p-2 rounded-lg hover:bg-white/60 text-muted-foreground transition-all"
      >
        <Redo size={16} />
      </button>
    </div>
  );
};

export default function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight,
      Typography,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Bắt đầu gõ nội dung công việc (nhấn / để hiện lệnh)...',
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON(), editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm prose-primary max-w-none focus:outline-none p-5 min-h-[200px] text-foreground font-medium',
      },
    },
  });

  return (
    <div className="glass overflow-hidden rounded-[1.5rem] border-white/60 bg-white/20 shadow-inner">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
      
      <style jsx global>{`
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #adb5bd;
          pointer-events: none;
          height: 0;
        }
        .ProseMirror ul[data-type="taskList"] {
          list-style: none;
          padding: 0;
        }
        .ProseMirror ul[data-type="taskList"] li {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.25rem;
        }
        .ProseMirror ul[data-type="taskList"] input[type="checkbox"] {
          cursor: pointer;
          width: 1.25rem;
          height: 1.25rem;
          accent-color: var(--color-primary);
        }
      `}</style>
    </div>
  );
}
