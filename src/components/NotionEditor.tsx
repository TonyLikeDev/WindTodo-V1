"use client";

import React, { useEffect, useRef } from "react";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Heading from '@tiptap/extension-heading';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Placeholder from '@tiptap/extension-placeholder';
import { common, createLowlight } from 'lowlight';
import { 
  Bold, 
  Italic, 
  Type, 
  Code, 
  List, 
  CheckSquare, 
  Undo, 
  Redo 
} from 'lucide-react';

const lowlight = createLowlight(common);

interface NotionEditorProps {
  content: any;
  onChange: (json: any) => void;
}

export default function NotionEditor({ content, onChange }: NotionEditorProps) {
  // Use a ref to avoid infinite loops when syncing content
  const lastContentRef = useRef(content);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // Disable default code block
      }),
      Heading.configure({
        levels: [1, 2, 3],
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Placeholder.configure({
        placeholder: 'Gõ "/" để hiện các lệnh, hoặc bắt đầu viết tài liệu...',
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      lastContentRef.current = json;
      onChange(json);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm md:prose-base prose-primary max-w-none focus:outline-none min-h-[250px] text-foreground font-medium p-4',
      },
    },
  });

  // Sync external content changes (e.g. switching cards)
  useEffect(() => {
    if (editor && content !== lastContentRef.current) {
      editor.commands.setContent(content);
      lastContentRef.current = content;
    }
  }, [content, editor]);

  if (!editor) return null;

  return (
    <div className="flex flex-col h-full bg-white/40 rounded-[2.5rem] border border-white/60 overflow-hidden shadow-inner">
      {/* Notion-style Floating/Sticky Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-3 bg-white/60 border-b border-white/40 backdrop-blur-md sticky top-0 z-20">
        <ToolbarButton 
          active={editor.isActive('bold')} 
          onClick={() => editor.chain().focus().toggleBold().run()} 
          icon={<Bold size={16} />} 
        />
        <ToolbarButton 
          active={editor.isActive('italic')} 
          onClick={() => editor.chain().focus().toggleItalic().run()} 
          icon={<Italic size={16} />} 
        />
        <div className="w-px h-6 bg-white/40 mx-1" />
        <ToolbarButton 
          active={editor.isActive('heading', { level: 2 })} 
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} 
          icon={<Type size={16} />} 
        />
        <ToolbarButton 
          active={editor.isActive('bulletList')} 
          onClick={() => editor.chain().focus().toggleBulletList().run()} 
          icon={<List size={16} />} 
        />
        <ToolbarButton 
          active={editor.isActive('taskList')} 
          onClick={() => editor.chain().focus().toggleTaskList().run()} 
          icon={<CheckSquare size={16} />} 
        />
        <ToolbarButton 
          active={editor.isActive('codeBlock')} 
          onClick={() => editor.chain().focus().toggleCodeBlock().run()} 
          icon={<Code size={16} />} 
        />
        <div className="flex-grow" />
        <ToolbarButton 
          onClick={() => editor.chain().focus().undo().run()} 
          icon={<Undo size={16} />} 
        />
        <ToolbarButton 
          onClick={() => editor.chain().focus().redo().run()} 
          icon={<Redo size={16} />} 
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>

      <style jsx global>{`
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #adb5bd;
          pointer-events: none;
          height: 0;
        }
        .ProseMirror pre {
          background: #1e1e1e;
          color: #d4d4d4;
          padding: 1rem;
          border-radius: 1rem;
          font-family: 'JetBrains Mono', monospace;
        }
        .ProseMirror ul[data-type="taskList"] {
          list-style: none;
          padding: 0;
        }
        .ProseMirror ul[data-type="taskList"] li {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
        }
        .ProseMirror ul[data-type="taskList"] input[type="checkbox"] {
          appearance: none;
          width: 1.5rem;
          height: 1.5rem;
          border: 2px solid rgba(0,0,0,0.1);
          border-radius: 0.5rem;
          cursor: pointer;
          background: white;
          transition: all 0.2s;
        }
        .ProseMirror ul[data-type="taskList"] input[type="checkbox"]:checked {
          background: var(--color-primary);
          border-color: var(--color-primary);
        }
      `}</style>
    </div>
  );
}

function ToolbarButton({ active, onClick, icon }: { active?: boolean, onClick: () => void, icon: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`p-2.5 rounded-xl transition-all ${
        active 
          ? 'bg-primary text-white shadow-lg shadow-primary/30' 
          : 'text-muted-foreground hover:bg-white hover:text-primary'
      }`}
    >
      {icon}
    </button>
  );
}
