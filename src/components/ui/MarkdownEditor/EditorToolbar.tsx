// src/components/ui/MarkdownEditor/EditorToolbar.tsx

import React from 'react';
import {
  Bold, Italic, Underline, Strikethrough, Code, Quote,
  List, ListOrdered, CheckSquare, Heading1, Heading2,
  Heading3, Link, Image, Table as TableIcon, Minus, Undo, Redo,
  AlignLeft, AlignCenter, AlignRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FontSizeSelector } from './FontSizeSelector';
import { Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';

interface EditorToolbarProps {
  editor: Editor;
  onImageClick: () => void;
  isDarkMode?: boolean;
}

const ToolbarButton: React.FC<{
  onClick: () => void;
  active?: boolean;
  icon: React.ElementType;
  title: string;
  isDarkMode?: boolean;
}> = ({ onClick, active, icon: Icon, title, isDarkMode }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={cn(
      'p-1.5 rounded transition-colors',
      active
        ? 'bg-blue-500 text-white'
        : isDarkMode
          ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
    )}
  >
    <Icon size={16} />
  </button>
);

const Divider = ({ isDarkMode }: { isDarkMode?: boolean }) => (
  <div className={cn('w-px h-6', isDarkMode ? 'bg-gray-700' : 'bg-gray-200')} />
);

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  editor,
  onImageClick,
  isDarkMode,
}) => {
  const addLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const addHorizontalRule = () => {
    editor.chain().focus().setHorizontalRule().run();
  };

  return (
    <div
      className={cn(
        'flex items-center gap-0.5 px-3 py-2 border-b flex-wrap',
        isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'
      )}
    >
      {/* Undo/Redo */}
      <ToolbarButton onClick={() => editor.chain().focus().undo().run()} icon={Undo} title="Undo" isDarkMode={isDarkMode} />
      <ToolbarButton onClick={() => editor.chain().focus().redo().run()} icon={Redo} title="Redo" isDarkMode={isDarkMode} />
      <Divider isDarkMode={isDarkMode} />
      <Divider isDarkMode={isDarkMode} />
      <FontSizeSelector editor={editor} isDarkMode={isDarkMode} />
      <div className={cn('w-px h-6', isDarkMode ? 'bg-gray-700' : 'bg-gray-200')} />

      {/* Headings */}
      <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} icon={Heading1} title="Heading 1" isDarkMode={isDarkMode} />
      <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} icon={Heading2} title="Heading 2" isDarkMode={isDarkMode} />
      <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} icon={Heading3} title="Heading 3" isDarkMode={isDarkMode} />
      <Divider isDarkMode={isDarkMode} />

      {/* Formatting */}
      <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} icon={Bold} title="Bold" isDarkMode={isDarkMode} />
      <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} icon={Italic} title="Italic" isDarkMode={isDarkMode} />
      <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} icon={Underline} title="Underline" isDarkMode={isDarkMode} />
      <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} icon={Strikethrough} title="Strikethrough" isDarkMode={isDarkMode} />
      <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} icon={Code} title="Inline Code" isDarkMode={isDarkMode} />
      <Divider isDarkMode={isDarkMode} />

      {/* Alignment */}
      <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} icon={AlignLeft} title="Align Left" isDarkMode={isDarkMode} />
      <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} icon={AlignCenter} title="Align Center" isDarkMode={isDarkMode} />
      <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} icon={AlignRight} title="Align Right" isDarkMode={isDarkMode} />
      <Divider isDarkMode={isDarkMode} />

      {/* Lists */}
      <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} icon={List} title="Bullet List" isDarkMode={isDarkMode} />
      <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} icon={ListOrdered} title="Ordered List" isDarkMode={isDarkMode} />
      <ToolbarButton onClick={() => editor.chain().focus().toggleTaskList().run()} active={editor.isActive('taskList')} icon={CheckSquare} title="Task List" isDarkMode={isDarkMode} />
      <Divider isDarkMode={isDarkMode} />

      {/* Block */}
      <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} icon={Quote} title="Blockquote" isDarkMode={isDarkMode} />
      <ToolbarButton onClick={addLink} active={editor.isActive('link')} icon={Link} title="Link" isDarkMode={isDarkMode} />
      <ToolbarButton onClick={onImageClick} icon={Image} title="Image" isDarkMode={isDarkMode} />
      <ToolbarButton onClick={addTable} icon={TableIcon} title="Table" isDarkMode={isDarkMode} />
      <ToolbarButton onClick={addHorizontalRule} icon={Minus} title="Horizontal Rule" isDarkMode={isDarkMode} />
    </div>
  );
};