// stores/core/event-bus.test.ts (یه تست ساده تو کنسول)
import { useEventBus } from './event-bus.store';

// Test Event Bus
const testEventBus = () => {
  const bus = useEventBus.getState();
  
  // Register listener
  const listenerId = bus.on('task:created', (payload) => {
    console.log('✅ Task created event received:', payload);
  });
  
  // Emit event
  bus.emit('task:created', {
    id: 'test-1',
    boardId: 'board-1',
    columnId: 'todo',
    title: 'Test Task'
  });
  
  // Check debug
  console.log('📊 Debug:', bus.debug());
  
  // Check history
  console.log('📜 History:', bus.getHistory());
};