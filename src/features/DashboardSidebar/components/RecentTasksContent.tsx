import { SidebarTaskCard } from '@/components/sidebar-ui-engine';
import { Button } from '@/components/ui/button/Button';
import { ArrowRight, Clock } from 'lucide-react';
import React from 'react'



const RecentTasksContent: React.FC<{
  tasks: any[];
  isDarkMode: boolean;
  onTaskClick: (taskId: string) => void;
  onNavigate: (path: string) => void;
}> = ({ tasks, onTaskClick, onNavigate }) => (
  <div className="space-y-3">
    {tasks.length === 0 ? (
      <div className="text-center py-8 text-gray-400">
        <Clock size={32} className="mx-auto mb-3 opacity-50" />
        <p>No recent tasks</p>
      </div>
    ) : (
      tasks.map((task) => (
        <SidebarTaskCard
          key={task.id}
          task={task}
          onClick={onTaskClick}
          variant="compact"
        />
      ))
    )}
    <Button onClick={() => onNavigate('/tasks')} variant="outline" className="w-full flex items-center justify-center gap-2 mt-4">
      View All Tasks <ArrowRight size={16} />
    </Button>
  </div>
);


export default RecentTasksContent