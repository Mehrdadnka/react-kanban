import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Button } from '@/components/ui/button/Button';
import { Input } from '@/components/ui/input/Input';
import { Textarea } from '@/components/ui/textarea/Textarea';
import { Label } from '@/components/ui/label/Label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select/Select';
import { useTaskStore, Task } from '@/stores/task.store';
import { Plus, X } from 'lucide-react';

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultStatus?: Task['status'];
}

export const TaskDialog: React.FC<TaskDialogProps> = ({
  open,
  onOpenChange,
  defaultStatus = 'todo',
}) => {
  const addTask = useTaskStore((state) => state.addTask);
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [priority, setPriority] = React.useState<Task['priority']>('medium');
  const [status, setStatus] = React.useState<Task['status']>(defaultStatus);

  React.useEffect(() => {
    setStatus(defaultStatus);
  }, [defaultStatus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addTask({
      title,
      description,
      status: status,
      priority,
    });

    setTitle('');
    setDescription('');
    setPriority('medium');
    setStatus('todo');
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md dark:bg-gray-900 rounded-lg shadow-xl p-6">
          <Dialog.Title className="text-xl font-bold mb-4">
            New Task
          </Dialog.Title>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Task title..."
                className="mt-1 text-black"
                autoFocus
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Task description..."
                className="mt-1 text-black"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={status}
                onValueChange={(value: Task['status']) => setStatus(value)}
              >
                <SelectTrigger className="mt-1 text-black">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">📋 Todo</SelectItem>
                  <SelectItem value="in-progress">⚡ In Progress</SelectItem>
                  <SelectItem value="done">✅ Done</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={priority}
                onValueChange={(value: Task['priority']) => setPriority(value)}
              >
                <SelectTrigger className="mt-1 text-black">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Dialog.Close asChild>
                <Button type="button" variant="destructive">
                  <X size={34} />
                </Button>
              </Dialog.Close>
              <Button type="submit" variant='success'>
                <Plus size={34} />
              </Button>
            </div>
          </form>

          <Dialog.Close asChild>
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};