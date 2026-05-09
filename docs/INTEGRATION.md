# 🔗 Store Integration Guide

## Overview
This guide explains how to connect new stores and features to TaskFlow's Event Bus architecture.

## Architecture Pattern

```typescript
// 1. Define events in EventCatalog
// 2. Emit events from source store
// 3. Listen in target store
// 4. React to changes

// NO direct store imports between stores!
Connecting a New Store
Step 1: Define Events
typescript
// stores/core/event-bus.types.ts
export interface EventCatalog {
  // Add your events here
  'analytics:page_view': { page: string; timestamp: Date };
  'analytics:feature_used': { feature: string; userId: string };
}
Step 2: Emit from Source Store
typescript
// stores/analytics/analytics.store.ts
import { useEventBus } from '@/stores/core/event-bus.store';

const trackPageView = (page: string) => {
  // Store logic
  set(state => ({ ...state, pageViews: [...state.pageViews, { page, timestamp: new Date() }] }));
  
  // Emit event for other stores
  useEventBus.getState().emit('analytics:page_view', {
    page,
    timestamp: new Date(),
  });
};
Step 3: Listen in Target Store
typescript
// stores/dashboard/dashboard.store.ts
import { useEffect } from 'react';
import { useEventBus } from '@/stores/core/event-bus.store';

export const useDashboardListeners = () => {
  useEffect(() => {
    const bus = useEventBus.getState();
    
    const listenerId = bus.on('analytics:page_view', ({ page }) => {
      // Update dashboard stats
      updatePageStats(page);
    }, { priority: 50, scope: 'dashboard' });
    
    return () => bus.off(listenerId);
  }, []);
};
Step 4: Wire in AppInitializer
typescript
// components/AppInitializer.tsx
export const AppInitializer = ({ children }) => {
  useBoardEventListeners();    // Existing
  useXPEventHandlers();        // Existing
  useDashboardListeners();    // Add yours here
  useAnalyticsListeners();    // Add yours here
  
  // ...
};
Event Naming Conventions
Pattern: module:action[_detail]
text
✅ GOOD:
- task:created
- task:completed
- task:completed_early
- board:created
- board:deleted
- xp:gained
- xp:level_up
- system:boot
- system:error

❌ BAD:
- taskCreated (wrong format)
- createTask (verb first)
- board_create (underscore instead of colon)
- task-completed (dash instead of colon)
- newTask (ambiguous)
Modules
Module	Scope	Examples
system	App lifecycle	boot, error, daily_check
task	Task operations	created, completed, moved
board	Board management	created, deleted, updated
column	Column config	created, deleted, updated
xp	XP system	gained, level_up, achievement
sidebar	UI panels	opened, closed
user	User actions	logged_in, profile_updated
notification	Notifications	sent, read, dismissed
Priority Guidelines
Priority Levels
typescript
type Priority = 0 | 10 | 50 | 100;
When to Use Each
Priority	Use Case	Examples
0 - CRITICAL	Data integrity, saves	Database writes, cache invalidation
10 - HIGH	State synchronization	Stats updates, count recalculation
50 - NORMAL	UI updates, logging	Re-renders, analytics tracking
100 - LOW	Optional features	Animations, sound effects, email notifications
Example Priority Assignment
typescript
// CRITICAL: Save to localStorage first
bus.on('task:created', saveToStorage, { priority: 0 });

// HIGH: Invalidate stats cache
bus.on('task:created', invalidateStats, { priority: 10 });

// NORMAL: Update UI
bus.on('task:created', reRenderBoard, { priority: 50 });

// LOW: Show confetti (optional)
bus.on('task:completed', showConfetti, { priority: 100 });
React Integration Patterns
Pattern 1: Store Hook
typescript
// Inside a custom hook
export const useMyFeatureListeners = () => {
  useEffect(() => {
    const bus = useEventBus.getState();
    const store = useMyStore.getState();
    
    const ids = [
      bus.on('task:completed', (data) => {
        store.handleCompletion(data);
      }, { priority: 50 }),
      
      bus.on('board:created', (data) => {
        store.handleBoard(data);
      }, { priority: 50 }),
    ];
    
    return () => ids.forEach(id => bus.off(id));
  }, []);
};

// Use in AppInitializer
useMyFeatureListeners();
Pattern 2: Component Listener
typescript
// Inside a React component
const MyComponent = () => {
  const [lastEvent, setLastEvent] = useState(null);
  
  useEffect(() => {
    const bus = useEventBus.getState();
    
    const id = bus.on('xp:gained', (data) => {
      setLastEvent(data);
    });
    
    return () => bus.off(id);
  }, []);
  
  if (!lastEvent) return null;
  
  return <div>+{lastEvent.amount} XP!</div>;
};
Pattern 3: One-Time Setup
typescript
// For initialization that runs once
useEffect(() => {
  const bus = useEventBus.getState();
  
  // Runs once when app boots
  bus.once('system:boot', () => {
    initializeFeature();
  });
}, []);
Anti-Patterns to Avoid
❌ Circular Dependencies
typescript
// BAD: Store A imports Store B, Store B imports Store A
// task.store.ts
import { useBoardStore } from './board.store';

// board.store.ts  
import { useTaskStore } from './task.store'; // CIRCULAR!

// ✅ GOOD: Use Event Bus instead
// task.store.ts
useEventBus.getState().emit('task:completed', payload);

// board.store.ts
useEventBus.getState().on('task:completed', handler);
❌ Direct Store Access in Listeners
typescript
// BAD: Importing store in event handler
bus.on('event', () => {
  const tasks = useTaskStore.getState().tasks; // Tight coupling
});

// ✅ GOOD: Pass needed data in event payload
bus.emit('event', { taskCount: tasks.length });
❌ Heavy Computations in Listeners
typescript
// BAD: Blocking operations in listener
bus.on('task:created', async (data) => {
  const result = await heavyCalculation(data); // Blocks other listeners
});

// ✅ GOOD: Defer heavy work
bus.on('task:created', (data) => {
  setTimeout(() => heavyCalculation(data), 0);
});
Testing Integration
Unit Test Setup
typescript
import { useEventBus } from '@/stores/core/event-bus.store';

describe('MyStore', () => {
  beforeEach(() => {
    // Clear event bus
    useEventBus.getState().clearHistory();
  });
  
  it('should react to task:completed', () => {
    const bus = useEventBus.getState();
    const myStore = useMyStore.getState();
    
    // Setup listener
    useMyFeatureListeners();
    
    // Emit event
    bus.emit('task:completed', { 
      id: 'test', 
      boardId: 'board-1' 
    });
    
    // Assert
    expect(myStore.someValue).toBe(expectedValue);
  });
});
Integration Test Checklist
Event emits successfully

Listener receives correct payload

Priority order is respected

Cleanup removes listeners

No memory leaks (check debug())

Error in one listener doesn't break others

Async operations complete correctly

Debugging Connection Issues
javascript
// 1. Check if event is emitting
const history = bus.getHistory();
const myEvents = history.filter(e => e.name === 'my:event');
console.log('Events emitted:', myEvents.length);

// 2. Check if listeners are registered
const debug = bus.debug();
console.log('Listeners for my:event:', debug.listeners['my:event']);

// 3. Test manually
bus.emit('my:event', testPayload);

// 4. Check for errors
bus.on('system:error', ({ error }) => {
  console.error('System error:', error);
});
Migration from Direct Imports
Before (Tightly Coupled)
typescript
// stores/analytics.store.ts
import { useTaskStore } from './task.store';
import { useBoardStore } from './board.store';

// Called manually in each store
useTaskStore.subscribe((state) => {
  trackEvent('task_updated', state.lastUpdated);
});
After (Decoupled with Event Bus)
typescript
// stores/analytics.store.ts  
import { useEventBus } from '@/stores/core/event-bus.store';
import { useEffect } from 'react';

export const useAnalyticsListeners = () => {
  useEffect(() => {
    const bus = useEventBus.getState();
    
    const ids = [
      bus.on('task:created', trackTaskCreated, { priority: 100 }),
      bus.on('task:completed', trackTaskCompleted, { priority: 100 }),
      bus.on('board:created', trackBoardCreated, { priority: 100 }),
    ];
    
    return () => ids.forEach(id => bus.off(id));
  }, []);
};

// No direct imports of task/board stores!
Performance Best Practices
Use appropriate priorities - Don't make everything CRITICAL

Cleanup listeners - Always return cleanup in useEffect

Use once for one-time setups instead of on + manual cleanup

Batch updates - Use bulk events for multiple changes

Avoid async in high-priority listeners - It blocks others

Memoize listener callbacks - Prevent re-registration

Checklist for New Integration
Events defined in EventCatalog

Events typed correctly (TypeScript)

Emit after successful operation (not before)

Listeners registered in AppInitializer

Priority assigned appropriately

Cleanup function returns listener IDs

No circular dependencies created

Error handling in place

Tested manually via console

Documentation updated
