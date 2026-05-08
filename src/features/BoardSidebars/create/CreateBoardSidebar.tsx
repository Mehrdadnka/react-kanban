// features/BoardSidebars/create/CreateBoardSidebar.tsx
import React, { useEffect, useRef } from 'react';
import { Sparkles, Check, Palette, Layout, Settings, Info } from 'lucide-react';
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
  Rocket, Code2, Palette as PaletteIcon, Briefcase, Target,
  Zap, Star, Heart, Crown, Flame, Globe, Lightbulb,
  Megaphone, Puzzle, Shield, Sword, Trophy, Wand,
  FolderKanban, LayoutDashboard, CheckSquare, Sparkles as SparklesIcon
} from 'lucide-react';
import { BOARD_STEPS, BoardStepId, useBoardSidebarStore } from '@/stores/sidebar-engine/board-sidebar.store';
import { Stepper } from '@/components/ui/stepper/Stepper';

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

interface CreateBoardSidebarProps {
  panelId: string;
  isOpen: boolean;
  zIndex: number;
  isDarkMode: boolean;
  onClose: () => void;
  metadata?: { mode: 'create' | 'edit'; boardId?: string };
}

export const CreateBoardSidebar: React.FC<CreateBoardSidebarProps> = ({
  isOpen,
  zIndex,
  isDarkMode,
  onClose,
}) => {
  const {
    mode,
    activeStep,
    completedSteps,
    formState,
    updateFormField,
    goToStep,
    goNext,
    goBack,
    submitBoard,
    closeSidebar,
  } = useBoardSidebarStore();

  const titleInputRef = useRef<HTMLInputElement>(null);

  const isCreating = mode === 'create';
  const title = isCreating ? 'Create New Board' : 'Edit Board';

  // Focus on mount
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => titleInputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (formState.title.trim()) {
      submitBoard();
    }
  };

  const handleClose = () => {
    closeSidebar();
    onClose();
  };

  // Step Content
  const renderStep = () => {
    switch (activeStep) {
      case 'basic-info':
        return (
          <div className="space-y-5">
            <SidebarInput
              id="board-title"
              label="Board Name"
              value={formState.title}
              onChange={(v) => updateFormField('title', v)}
              placeholder="e.g., Marketing Campaign, Sprint 24..."
              required
              inputRef={titleInputRef}
            />
            <SidebarTextarea
              id="board-description"
              label="Description"
              value={formState.description}
              onChange={(v) => updateFormField('description', v)}
              placeholder="What's this board about?"
              rows={4}
            />
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6">
            {/* Color */}
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
                    onClick={() => updateFormField('color', color.hex)}
                    className={cn(
                      'relative w-full aspect-square rounded-xl transition-all duration-200',
                      'hover:scale-110 hover:shadow-lg',
                      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
                      formState.color === color.hex && 'ring-2 ring-offset-2 ring-blue-500 scale-110'
                    )}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  >
                    {formState.color === color.hex && (
                      <Check size={16} className="text-white absolute inset-0 m-auto drop-shadow-lg" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Icons */}
            <div>
              <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
                Icon
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-52 overflow-y-auto p-1">
                {ICONS.map(({ name, Icon, label }) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => updateFormField('icon', name)}
                    className={cn(
                      'flex flex-col items-center gap-1 p-3 rounded-xl transition-all duration-200',
                      'hover:scale-105',
                      'focus:outline-none focus:ring-2 focus:ring-blue-500',
                      formState.icon === name
                        ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800',
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    )}
                    title={label}
                  >
                    <Icon
                      size={22}
                      className={formState.icon === name ? 'text-blue-500' : ''}
                    />
                    <span className="text-[10px] leading-tight text-center">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            {formState.title && (
              <div className="animate-in fade-in duration-300">
                <label className="block text-sm font-medium mb-2">Preview</label>
                <div
                  className="rounded-xl p-4 border-2"
                  style={{
                    background: `linear-gradient(135deg, ${formState.color}08, ${formState.color}15)`,
                    borderColor: formState.color + '30',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${formState.color}20, ${formState.color}40)`,
                        color: formState.color,
                      }}
                    >
                      {React.createElement(
                        ICONS.find(i => i.name === formState.icon)?.Icon || Rocket,
                        { size: 20 }
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">{formState.title}</h4>
                      {formState.description && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                          {formState.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-5">
            <div className={cn(
              'rounded-xl p-6 text-center border-2 border-dashed',
              isDarkMode ? 'border-gray-700 text-gray-400' : 'border-gray-300 text-gray-500'
            )}>
              <Settings size={32} className="mx-auto mb-3 opacity-50" />
              <p className="text-sm font-medium">Advanced Settings</p>
              <p className="text-xs mt-1">Coming soon...</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const isLastStep = activeStep === BOARD_STEPS[BOARD_STEPS.length - 1].id;
  const isFirstStep = activeStep === BOARD_STEPS[0].id;

  return (
    <SidebarShell
      isOpen={isOpen}
      zIndex={zIndex}
      onClose={handleClose}
      title={title}
      icon={<Layout size={20} />}
      position="left"
      maxWidth="md"
      isDarkMode={isDarkMode}
    >
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        {/* Stepper */}
        <Stepper<BoardStepId>
        steps={BOARD_STEPS}
        activeStep={activeStep}
        completedSteps={completedSteps}
        onStepClick={goToStep}
        className="mb-6"
        />

        {/* Step Content */}
        <div className="flex-1">{renderStep()}</div>

        {/* Actions */}
        <SidebarActionBar className="mt-6">
          <SidebarActionLeft>
            {!isFirstStep && (
              <Button type="button" variant="outline" onClick={goBack} className="flex-1">
                Back
              </Button>
            )}
          </SidebarActionLeft>
          <SidebarActionRight>
            {!isLastStep ? (
              <Button
                type="button"
                onClick={goNext}
                disabled={activeStep === 'basic-info' && !formState.title.trim()}
                className={cn(
                  'flex-1 gap-2',
                  'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                )}
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={!formState.title.trim()}
                className={cn(
                  'flex-1 gap-2',
                  'bg-gradient-to-r from-blue-600 to-purple-600 text-white',
                  'hover:shadow-lg hover:scale-105 active:scale-95',
                  'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
                )}
              >
                <Sparkles size={16} />
                {isCreating ? 'Create Board' : 'Save Changes'}
              </Button>
            )}
          </SidebarActionRight>
        </SidebarActionBar>
      </form>
    </SidebarShell>
  );
};

CreateBoardSidebar.displayName = 'CreateBoardSidebar';