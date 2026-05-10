import { Dashboard } from '@/components/dashboard/Dashboard';
import SynapseLogo from '@/components/SynapseLogo/SynapseLogo';
import { useApp } from '@/providers/AppProvider';

export function Home() {
  const { isDarkMode } = useApp();

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex items-start justify-center w-fit">
        <div className="justify-center flex flex-row items-start">
          <SynapseLogo size={80} isDarkMode={isDarkMode} />
          <h1 className="text-5xl my-auto font-bold bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent">
            Synapse
          </h1>
        </div>
        </div>
      <div className="flex-1 min-h-0">
        <Dashboard />
      </div>
    </div>
  );
}