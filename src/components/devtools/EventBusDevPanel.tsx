// components/devtools/EventBusDevPanel.tsx
import React, { useState } from 'react';
import { useEventBus } from '@/stores/core/event-bus.store';

export const EventBusDevPanel: React.FC = () => {
  const [lastEvents, setLastEvents] = useState<any[]>([]);
  const bus = useEventBus.getState();
  
  const testVoidEvent = () => {
    bus.emit('system:boot');
    bus.emit('system:daily_check');
    refreshHistory();
  };
  
  const testTaskEvent = () => {
    bus.emit('task:created', {
      id: 'test-' + Date.now(),
      boardId: 'board-1',
      columnId: 'todo',
      title: 'Test Task'
    });
    
    bus.emit('task:completed', {
      id: 'test-' + Date.now(),
      boardId: 'board-1'
    });
    refreshHistory();
  };
  
  const testXPEvent = () => {
    bus.emit('xp:gained', {
      action: 'task:completed',
      amount: 25,
      totalXP: 100,
      level: 1,
      levelProgress: 50
    });
    
    bus.emit('xp:level_up', {
      oldLevel: 1,
      newLevel: 2,
      title: 'Learner'
    });
    refreshHistory();
  };
  
  const refreshHistory = () => {
    setLastEvents(bus.getHistory().slice(-10));
  };
  
  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border p-4 w-96">
      <h3 className="font-bold mb-2">🔧 EventBus DevTools</h3>
      
      <div className="space-y-2">
        <button 
          onClick={testVoidEvent}
          className="w-full px-3 py-1 bg-blue-500 text-white rounded"
        >
          Test Void Events
        </button>
        
        <button 
          onClick={testTaskEvent}
          className="w-full px-3 py-1 bg-green-500 text-white rounded"
        >
          Test Task Events
        </button>
        
        <button 
          onClick={testXPEvent}
          className="w-full px-3 py-1 bg-purple-500 text-white rounded"
        >
          Test XP Events
        </button>
        
        <button 
          onClick={refreshHistory}
          className="w-full px-3 py-1 bg-gray-500 text-white rounded"
        >
          Refresh History
        </button>
      </div>
      
      <div className="mt-2">
        <div className="text-xs font-semibold">Debug Info:</div>
        <pre className="text-xs mt-1 bg-gray-100 dark:bg-gray-900 p-2 rounded max-h-40 overflow-auto">
          {JSON.stringify(bus.debug(), null, 2)}
        </pre>
      </div>
      
      <div className="mt-2">
        <div className="text-xs font-semibold">Last Events:</div>
        <pre className="text-xs mt-1 bg-gray-100 dark:bg-gray-900 p-2 rounded max-h-40 overflow-auto">
          {JSON.stringify(lastEvents, null, 2)}
        </pre>
      </div>
    </div>
  );
};