// features/BoardSidebars/create/steps/AppearanceStep.tsx
import React from 'react';
import { Palette, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Rocket, Code2, Palette as PaletteIcon, Briefcase, Target,
  Zap, Star, Heart, Crown, Flame, Globe, Lightbulb,
  Megaphone, Puzzle, Shield, Sword, Trophy, Wand,
  FolderKanban, LayoutDashboard, CheckSquare, Sparkles as SparklesIcon
} from 'lucide-react';
import { EntityItem } from '@/components/ui/EntityPicker/entityPicker.types';
import { EntityPicker } from '@/components/ui/EntityPicker/EntityPicker';

const COLORS = [
  '#6366f1', '#8b5cf6', '#a855f7', '#7c3aed',
  '#ec4899', '#f43f5e', '#ef4444', '#dc2626',
  '#f97316', '#ea580c', '#eab308', '#f59e0b',
  '#22c55e', '#10b981', '#14b8a6', '#0d9488',
  '#06b6d4', '#0891b2', '#3b82f6', '#2563eb',
  '#1e293b', '#334155', '#6b7280', '#4b5563',
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

interface AppearanceStepProps {
  color: string;
  icon: string;
  boardName?: string;
  onColorChange: (color: string) => void;
  onIconChange: (icon: string) => void;
  isDarkMode?: boolean;
}

export const AppearanceStep: React.FC<AppearanceStepProps> = ({
  color,
  icon,
  boardName,
  onColorChange,
  onIconChange,
  isDarkMode = false,
}) => {

  const colorItems: EntityItem[] = COLORS.map(hex => ({
    id: hex,
    name: hex,
    color: hex,
  }));

  // Convert icons to EntityItem format
  const iconItems: EntityItem[] = ICONS.map(({ name, Icon, label }) => ({
    id: name,
    name: label,
    icon: <Icon size={14} />,
  }));

  const selectedIconItem = ICONS.find(i => i.name === icon);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Palette size={16} className={isDarkMode ? "text-gray-400" : "text-gray-500"} />
        <div>
          <h3 className={cn("text-sm font-semibold", isDarkMode ? "text-gray-200" : "text-gray-800")}>
            Appearance
          </h3>
          <p className={cn("text-xs", isDarkMode ? "text-gray-500" : "text-gray-400")}>
            Customize your board's look and feel.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
              {/* Color Picker - Grid Mode without renderItem */}
      <EntityPicker
        items={colorItems}
        isTopPosition={false}
        selectedIds={[color]}
        onToggle={(id) => onColorChange(id)}
        label="Color Theme"
        placeholder="Select a color"
        cardPlaceholder="Choose a color theme"
        searchPlaceholder="Search colors..."
        compact={true}
        listVariant="grid"
        gridColumns={6}
        renderBadge={(item) => (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium">
            <span
                className="w-3 h-3 rounded-full inline-block"
                style={{ backgroundColor: item.color }}
            />
            <span className="text-[11px]">{item.name}</span>
            </span>
        )}
      />

      {/* Icon Picker - Grid Mode with custom renderItem */}
      <EntityPicker
        items={iconItems}
        isTopPosition={false}
        selectedIds={[icon]}
        onToggle={(id) => onIconChange(id)}
        label="Icon"
        placeholder="Select an icon"
        cardPlaceholder="Choose an icon"
        searchPlaceholder="Search icons..."
        compact={true}
        listVariant="grid"
        gridColumns={4}
        renderItem={(item, isSelected) => (
          <div className={cn(
            "flex flex-col items-center gap-1 p-2 rounded-lg cursor-pointer transition-all",
            isSelected && "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/30"
          )}>
            {item.icon}
            <span className="text-[9px] text-center line-clamp-1">{item.name}</span>
          </div>
        )}
        renderBadge={(item) => (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium">
            {item.icon}
          </span>
        )}
      />
      
      </div>
      {/* Preview - Compact */}
      {boardName && (
        <div className="space-y-2">
          <label className={cn(
            "text-xs font-medium",
            isDarkMode ? "text-gray-400" : "text-gray-600"
          )}>
            Preview
          </label>
          <div
            className="rounded-lg p-3 border transition-all duration-300"
            style={{
              background: `linear-gradient(135deg, ${color}08, ${color}15)`,
              borderColor: color + '30',
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${color}20, ${color}40)`,
                  color: color,
                }}
              >
                {selectedIconItem && <selectedIconItem.Icon size={16} />}
              </div>
              <div className="min-w-0">
                <h4 className={cn(
                  "font-semibold text-sm truncate",
                  isDarkMode ? "text-gray-200" : "text-gray-900"
                )}>
                  {boardName}
                </h4>
                <p className={cn(
                  "text-xs truncate",
                  isDarkMode ? "text-gray-500" : "text-gray-400"
                )}>
                  Your board is ready
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};