// features/logo-3d/components/TaskCard.tsx
import { Html } from '@react-three/drei'
import type { Task } from '@/types/task.types'

const priorityColors: Record<string, string> = {
  'urgent': '#EF4444',
  'high': '#F59E0B',
  'medium': '#3B82F6',
  'low': '#6B7280',
}

const statusIcons: Record<string, string> = {
  'todo': '📋',
  'in-progress': '🔄',
  'done': '✅',
  'backlog': '📦',
}

interface TaskCardProps {
  task?: Task
  // برای FloatingOrbs
  title?: string
  subtitle?: string
  type?: 'task' | 'xp' | 'achievement'
  icon?: string
  color?: string
  // استایل
  variant?: 'task' | 'xp' | 'achievement'
  opacity?: number
  onClose?: () => void
}

const variantStyles: Record<string, string> = {
  task: 'bg-slate-900/95 border-blue-400/20',
  xp: 'bg-slate-900/95 border-purple-400/20',
  achievement: 'bg-slate-900/95 border-amber-400/20',
}

export const TaskCard = ({ 
  task, 
  title, 
  subtitle, 
  type, 
  icon, 
  color,
  variant = 'task',
  opacity = 1,
  onClose,
}: TaskCardProps) => {
  // حالت تسک واقعی
  if (task) {
    return (
      <div 
        className={`
          pointer-events-auto select-none
          rounded-xl px-3.5 py-3 shadow-2xl border
          min-w-[190px] max-w-[230px]
          backdrop-blur-md
          ${variantStyles.task}
        `}
        style={{ opacity }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/10 text-white/80">
            {statusIcons[task.columnId]} {task.columnId}
          </span>
          {task.priority && (
            <span 
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: priorityColors[task.priority] }}
              title={task.priority}
            />
          )}
        </div>

        {/* Title */}
        <h3 className="text-white text-sm font-semibold mb-2 leading-tight">
          {task.title}
        </h3>

        {/* Meta */}
        <div className="space-y-1.5">
          {task.shortDescription && (
            <p className="text-[10px] text-white/50 line-clamp-2 leading-relaxed">
              {task.shortDescription}
            </p>
          )}
          
          <div className="flex items-center gap-3 text-[9px] text-white/40">
            {task.dueDate && (
              <span>📅 {new Date(task.dueDate).toLocaleDateString()}</span>
            )}
            {task.estimatedHours && (
              <span>⏱ {task.estimatedHours}h</span>
            )}
          </div>

          {task.labels && task.labels.length > 0 && (
            <div className="flex gap-1 flex-wrap pt-1">
              {task.labels.slice(0, 3).map(label => (
                <span 
                  key={label}
                  className="text-[8px] px-1.5 py-0.5 rounded-md bg-white/5 text-white/50 border border-white/5"
                >
                  {label}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // حالت ساده (برای FloatingOrbs)
  return (
    <div
      className={`
        pointer-events-none select-none
        rounded-xl px-3 py-2 shadow-xl border
        min-w-[100px] text-center
        backdrop-blur-md
        ${variantStyles[variant]}
      `}
      style={{ opacity }}
    >
      <div className="flex items-center gap-1.5 justify-center">
        {icon && <span className="text-sm">{icon}</span>}
        {color && (
          <span 
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: color }}
          />
        )}
        <span className="text-white font-semibold text-[11px]">
          {title}
        </span>
      </div>
      {subtitle && (
        <p className="text-white/50 text-[9px] mt-1">{subtitle}</p>
      )}
    </div>
  )
}