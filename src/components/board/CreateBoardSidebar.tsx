// features/BoardSidebars/create/CreateBoardSidebar.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Check, Palette } from 'lucide-react';
import { useBoardStore } from '@/stores/board.store';
import { useApp } from '@/providers/AppProvider';
import { cn } from '@/lib/utils';
import {
  SidebarShell,
  SidebarInput,
  SidebarTextarea,
  SidebarActionBar,
  SidebarActionLeft,
  SidebarActionRight,
} from '@/components/sidebar-ui-engine';
import { Button } from '@/components/ui/button/Button';
import {
  Rocket, Code2, Palette as PaletteIcon, Layout, Briefcase, Target,
  Zap, Star, Heart, Crown, Flame, Globe, Lightbulb,
  Megaphone, Puzzle, Shield, Sword, Trophy, Wand,
  FolderKanban, LayoutDashboard, CheckSquare, Sparkles as SparklesIcon
} from 'lucide-react';

interface CreateBoardSidebarProps {
  panelId: string;
  isOpen: boolean;
  zIndex: number;
  isDarkMode: boolean;
  onClose: () => void;
  onUpdateMetadata?: (metadata: any) => void;
}

const COLORS = [
  { hex: '#6366f1', name: 'Indigo' },
  { hex: '#8b5cf6', name: 'Purple' },
  { hex: '#ec4899', name: 'Pink' },
  { hex: '#ef4444', name: 'Red' },
  { hex: '#f97316', name: 'Orange' },
  { hex: '#eab308', name: 'Yellow' },
  { hex: '#22c55e', name: 'Green' },
  { hex: '#14b8a6', name: 'Teal' },
  { hex: '#06b6d4', name: 'Cyan' },
  { hex: '#3b82f6', name: 'Blue' },
  { hex: '#1e293b', name: 'Dark' },
  { hex: '#6b7280', name: 'Gray' },
];

const ICONS = [
  { name: 'Rocket', Icon: Rocket, label: 'Startup' },
  { name: 'Code2', Icon: Code2, label: 'Dev' },
  { name: 'Palette', Icon: PaletteIcon, label: 'Design' },
  { name: 'Target', Icon: Target, label: 'Goals' },
  { name: 'Zap', Icon: Zap, label: 'Fast' },
  { name: 'Briefcase', Icon: Briefcase, label: 'Work' },
  { name: 'Star', Icon: Star, label: 'Important' },
  { name: 'Flame', Icon: Flame, label: 'Hot' },
  { name: 'Globe', Icon: Globe, label: 'Web' },
  { name: 'Lightbulb', Icon: Lightbulb, label: 'Ideas' },
  { name: 'Trophy', Icon: Trophy, label: 'Win' },
  { name: 'Heart', Icon: Heart, label: 'Favorite' },
  { name: 'Crown', Icon: Crown, label: 'Premium' },
  { name: 'Shield', Icon: Shield, label: 'Secure' },
  { name: 'Sparkles', Icon: SparklesIcon, label: 'Magic' },
  { name: 'FolderKanban', Icon: FolderKanban, label: 'Kanban' },
  { name: 'LayoutDashboard', Icon: LayoutDashboard, label: 'Dashboard' },
  { name: 'CheckSquare', Icon: CheckSquare, label: 'Tasks' },
  { name: 'Sword', Icon: Sword, label: 'Agile' },
  { name: 'Puzzle', Icon: Puzzle, label: 'Modular' },
  { name: 'Megaphone', Icon: Megaphone, label: 'Marketing' },
  { name: 'Wand', Icon: Wand, label: 'Creative' },
];

export const CreateBoardSidebar: React.FC<CreateBoardSidebarProps> = ({
  isOpen,
  zIndex,
  isDarkMode,
  onClose,
}) => {
  const addBoard = useBoardStore((state) => state.addBoard);
  const titleInputRef = useRef<HTMLInputElement>(null);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState(ICONS[0]);
  const [isCreating, setIsCreating] = useState(false);

  // Focus title input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 300); // Wait for animation
    }
  }, [isOpen]);

  // Reset form on open
  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      setSelectedColor(COLORS[0]);
      setSelectedIcon(ICONS[0]);
      setIsCreating(false);
    }
  }, [isOpen]);

  const handleCreate = () => {
    if (!title.trim()) return;
    
    setIsCreating(true);
    
    addBoard({
      title: title.trim(),
      description: description.trim(),
      color: selectedColor.hex,
      icon: selectedIcon.name,
    });
    
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && title.trim()) {
      e.preventDefault();
      handleCreate();
    }
  };

  return (
    <SidebarShell
      isOpen={isOpen}
      zIndex={zIndex}
      onClose={onClose}
      title="Create New Board"
      icon={<Sparkles size={20} />}
      position="left"
      maxWidth="md"
      isDarkMode={isDarkMode}
    >
      <div className="space-y-6">
        {/* Board Name */}
        <SidebarInput
          id="board-title"
          label="Board Name"
          value={title}
          onChange={setTitle}
          placeholder="e.g., Marketing Campaign, Sprint 24..."
          required
          inputRef={titleInputRef}
        />

        {/* Description */}
        <SidebarTextarea
          id="board-description"
          label="Description"
          value={description}
          onChange={setDescription}
          placeholder="What's this board about?"
          rows={3}
        />

        {/* Color Selection */}
        <div>
          <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
            <Palette size={16} className="inline mr-2" />
            Color Theme
          </label>
          <div className="grid grid-cols-6 gap-2.5">
            {COLORS.map((color) => (
              <button
                key={color.hex}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={cn(
                  'relative w-full aspect-square rounded-xl transition-all duration-200',
                  'hover:scale-110 hover:shadow-lg',
                  'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
                  selectedColor.hex === color.hex && 'ring-2 ring-offset-2 ring-blue-500 scale-110'
                )}
                style={{ backgroundColor: color.hex }}
                title={color.name}
              >
                {selectedColor.hex === color.hex && (
                  <Check size={16} className="text-white absolute inset-0 m-auto drop-shadow-lg" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Icon Selection */}
        <div>
          <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
            Icon
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1">
            {ICONS.map(({ name, Icon, label }) => (
              <button
                key={name}
                type="button"
                onClick={() => setSelectedIcon({ name, Icon, label })}
                className={cn(
                  'flex flex-col items-center gap-1 p-3 rounded-xl transition-all duration-200',
                  'hover:scale-105',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500',
                  selectedIcon.name === name
                    ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800',
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                )}
                title={label}
              >
                <Icon
                  size={22}
                  className={selectedIcon.name === name ? 'text-blue-500' : ''}
                />
                <span className="text-[10px] leading-tight text-center">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Live Preview */}
        {title && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Preview
            </label>
            <div
              className="rounded-xl p-4 border-2 transition-all duration-300"
              style={{
                background: `linear-gradient(135deg, ${selectedColor.hex}08, ${selectedColor.hex}15)`,
                borderColor: selectedColor.hex + '30',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${selectedColor.hex}20, ${selectedColor.hex}40)`,
                    color: selectedColor.hex,
                  }}
                >
                  {React.createElement(selectedIcon.Icon, { size: 20 })}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm truncate">{title}</h4>
                  {description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                      {description}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Mini progress bar */}
              <div className="mt-3 h-1 rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: '0%',
                    background: `linear-gradient(90deg, ${selectedColor.hex}, ${selectedColor.hex}80)`
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Bar */}
      <SidebarActionBar className="mt-6">
        <SidebarActionLeft>
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
        </SidebarActionLeft>
        <SidebarActionRight>
          <Button
            onClick={handleCreate}
            disabled={!title.trim() || isCreating}
            className={cn(
              'flex-1 gap-2',
              'bg-gradient-to-r from-blue-600 to-purple-600 text-white',
              'hover:shadow-lg hover:scale-105 active:scale-95',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
            )}
          >
            {isCreating ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Create Board
              </>
            )}
          </Button>
        </SidebarActionRight>
      </SidebarActionBar>
    </SidebarShell>
  );
};

CreateBoardSidebar.displayName = 'CreateBoardSidebar';