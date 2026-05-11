import { Dashboard } from '@/components/dashboard/Dashboard';
import SynapseLogo from '@/components/SynapseLogo/SynapseLogo';
import { useApp } from '@/providers/AppProvider';

export function Home() {
  const { isDarkMode } = useApp();

  return (
    <div className="h-full flex flex-row overflow-hidden">
      <div className=" flex items-start ">
        <div className="w-fit justify-center flex flex-row items-start">
          {/* <SynapseLogo size={200} isDarkMode={isDarkMode} /> */}
       
        </div>
        </div>
      <div className="flex-1 min-h-0">
        <Dashboard />
      </div>
    </div>
  );
}