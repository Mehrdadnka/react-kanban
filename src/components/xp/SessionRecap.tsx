import { useSessionStore } from "@/stores/xp/session.store";

export const SessionRecap: React.FC = () => {
  const { sessionXP, sessionTasks, sessionStartTime } = useSessionStore();
  
  if (sessionXP === 0) return null;
  
  const sessionMinutes = Math.floor(
    (Date.now() - sessionStartTime.getTime()) / 60000
  );
  
  return (
    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 
      rounded-xl border border-yellow-200 dark:border-yellow-800 p-3">
      <div className="text-xs font-semibold text-yellow-700 dark:text-yellow-400 mb-2">
        📊 This Session
      </div>
      <div className="flex items-center justify-between text-sm">
        <span>+{sessionXP} XP</span>
        <span>•</span>
        <span>{sessionTasks} tasks</span>
        <span>•</span>
        <span>{sessionMinutes}m</span>
      </div>
    </div>
  );
};