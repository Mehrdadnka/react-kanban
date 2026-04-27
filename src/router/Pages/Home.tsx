import { Dashboard } from '@/components/dashboard/Dashboard';

export function Home() {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="mb-4 flex-shrink-0">
        <h1 className="lg:text-3xl sm:text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Overview of your task flow
        </p>
      </div>
      <div className="flex-1 min-h-0">
        <Dashboard />
      </div>
    </div>
  );
}