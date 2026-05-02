const filterLabels: Record<string, string> = {
  'total-tasks': 'all tasks',
  'in-progress': 'in progress tasks',
  'completed': 'completed tasks',
  'todo': 'todo tasks',
};

const filterRoutes: Record<string, string> = {
  'total-tasks': '/tasks',
  'in-progress': '/tasks?filter=in-progress',
  'completed': '/tasks?filter=done',
  'todo': '/tasks?filter=todo',
};
export { filterLabels, filterRoutes }