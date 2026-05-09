# 🚌 Event Bus System

## Overview
TaskFlow's Event Bus is a **type-safe, middleware-based pub/sub system** built on Zustand. It enables decoupled communication between stores without direct imports.

## Architecture
Store A → emit('event', payload)
↓
[Logger Middleware]
↓
[Validator Middleware]
↓
[Error Catcher]
↓
Listeners (sorted by priority)
↓
Store B, Store C, UI Components...

text

## Quick Start

```typescript
import { useEventBus } from '@/stores/core/event-bus.store';

// Emit an event
const bus = useEventBus.getState();
bus.emit('task:completed', { 
  id: 'task-123', 
  boardId: 'board-1' 
});

// Listen to events
bus.on('task:completed', (payload) => {
  console.log('Task completed:', payload.id);
}, { priority: 50 });
API Reference
on(event, handler, options?) → string
Register a persistent listener.

typescript
const listenerId = bus.on('task:created', 
  ({ id, boardId, title }) => {
    // Handle new task
  },
  { 
    priority: 50,    // Lower = higher priority (0-100)
    scope: 'xp'      // Module scope for debugging
  }
);

// Returns listenerId for removal
once(event, handler, options?) → string
Register a one-time listener (auto-removes after first execution).

typescript
bus.once('system:boot', () => {
  console.log('App started');
});
off(listenerId)
Remove a listener by its ID.

typescript
bus.off(listenerId);
emit(event, payload?)
Synchronously emit an event. Listeners execute in priority order.

typescript
// Void event (no payload)
bus.emit('system:boot');

// Event with payload
bus.emit('task:completed', { 
  id: 'task-1', 
  boardId: 'board-1' 
});
emitAsync(event, payload?) → Promise
Async version - awaits each listener in order.

typescript
await bus.emitAsync('task:deleted', { 
  id: 'task-1', 
  boardId: 'board-1' 
});
debug() → { listeners, historyCount }
Get system diagnostics.

typescript
const debug = bus.debug();
console.log('Active listeners:', Object.keys(debug.listeners).length);
console.log('Event history:', debug.historyCount);
getHistory() → EventEntry[]
Get last 1000 events for debugging.

typescript
const history = bus.getHistory();
const taskEvents = history.filter(e => e.name.startsWith('task:'));
Event Catalog
System Events
Event	Payload	Description
system:boot	void	App initialization
system:error	{ error, source }	System error occurred
system:daily_check	void	Daily streak check
Board Events
Event	Payload	Description
board:created	{ id, title }	Board created
board:deleted	{ id }	Board deleted
board:updated	{ id, changes }	Board modified
Task Events
Event	Payload	Description
task:created	{ id, boardId, columnId, title }	Task created
task:completed	{ id, boardId }	Task moved to done
task:moved	{ id, from, to, boardId }	Task column changed
task:updated	{ id, changes }	Task modified
task:deleted	{ id, boardId }	Task deleted
task:bulk-moved	{ taskIds, targetColumnId }	Batch move
task:bulk-deleted	{ taskIds }	Batch delete
task:time_logged	{ taskId, hours }	Time entry added
Column Events
Event	Payload	Description
column:created	{ id }	Column created
column:deleted	{ id }	Column deleted
column:updated	{ id, changes }	Column modified
Sidebar Events
Event	Payload	Description
sidebar:opened	{ panelId }	Panel opened
sidebar:closed	{ panelId }	Panel closed
XP System Events
Event	Payload	Description
xp:gained	{ action, amount, totalXP, level, levelProgress }	XP earned
xp:level_up	{ oldLevel, newLevel, title }	Level up!
xp:achievement_unlocked	{ achievementId, name, rewards }	Achievement unlocked
Middleware Pipeline
Built-in Middleware
Logger (Development only)

Logs every event with timestamp and payload

Color-coded console output

Error Catcher

Wraps each listener in try-catch

Emits system:error on failure

Prevents one listener from breaking others

History Recorder

Records last 1000 events

Includes reversible flag for undo/redo

Custom Middleware (Future)
typescript
// Example: Analytics middleware
const analyticsMiddleware = (event, payload, next) => {
  analytics.track(event, payload);
  next();
};
Priority System
typescript
type Priority = 0 | 10 | 50 | 100;

// CRITICAL (0): Database saves, data integrity
// HIGH (10): Cache invalidation, state sync
// NORMAL (50): UI updates, logging
// LOW (100): Analytics, optional features
Execution order: 0 first → 100 last

Best Practices
✅ DO
typescript
// Always return listener ID for cleanup
const id = bus.on('event', handler);

// Use scopes for organization
bus.on('event', handler, { scope: 'xp' });

// Clean up in useEffect
useEffect(() => {
  const id = bus.on('event', handler);
  return () => bus.off(id);
}, []);
❌ DON'T
typescript
// Don't emit inside a listener without guard
bus.on('task:created', (data) => {
  bus.emit('task:created', data); // Infinite loop!
});

// Don't use for synchronous data fetching
const data = bus.emit('get:data'); // Won't work
Debugging
Console Commands
javascript
// Check system status
window.__eventBus.getState().debug()

// View event history
window.__eventBus.getState().getHistory().slice(-10)

// Test an event
window.__eventBus.getState().emit('task:completed', { 
  id: 'test', boardId: 'board-1' 
})
Common Issues
"Event not triggering listener"

Check listener priority (lower = runs first)

Verify event name spelling (TypeScript helps!)

Ensure listener is registered before emit

"Memory leak"

Always cleanup listeners in useEffect return

Use once for one-time listeners

Check debug() for growing listener count

"TypeScript error on emit"

Check EventCatalog for correct payload type

Use void for events without payload

Import types from event-bus.types.ts

Performance
Max listeners per event: Unlimited (but optimize!)

History buffer: 1000 entries (circular)

Listener execution: Synchronous in priority order

Async support: Via emitAsync for sequential async

Migration Guide
From Direct Store Imports
Before:

typescript
// task.store.ts
import { useBoardStore } from './board.store';
useBoardStore.getState().invalidateCache();
After:

typescript
// task.store.ts
useEventBus.getState().emit('task:updated', { id, changes });

// board.store.ts
useEventBus.getState().on('task:updated', () => {
  invalidateCache();
});
text

---

## 📄 **docs/XP_SYSTEM.md**

```markdown
# ⚡ XP & Gamification System

## Overview
TaskFlow's XP system rewards users for productivity with a **multi-layered gamification engine**. Every action earns XP, unlocks achievements, and progresses through levels.

## Quick Start

```typescript
import { useXPStore } from '@/stores/xp/xp.store';

// Get current state
const xp = useXPStore.getState();
console.log(xp.totalXP);     // 450
console.log(xp.currentLevel); // 3
console.log(xp.levelTitle);   // "🌱 Beginner"

// Get level info
const info = xp.getLevelInfo();
// { level: 3, progress: 25, title: "🌱 Beginner", nextLevelXP: 400 }
XP Calculation Formula
Base XP Values
Action	XP	Description
task:created	5	Creating a task
task:completed	25	Basic completion
task:completed_early	50	Before due date
task:completed_on_time	35	On the due date
task:completed_overdue	10	After due date
task:moved_to_progress	15	Starting work
task:priority_urgent_completed	75	Urgent task done
task:priority_high_completed	50	High priority done
subtask:completed	10	Sub-task finished
board:created	30	Creating a board
board:streak_daily	20	Daily activity
board:streak_weekly	100	7-day streak
label:organized	5	Adding labels
attachment:added	5	File upload
time:logged	5	Time tracking
milestone:reached	50	Achievement bonus
collaboration:assigned	10	Team assignment
Multiplier Formula
text
Final XP = Base XP × Active Multipliers × Context Bonus

Context Bonuses:
- Priority Urgent: ×1.5
- Priority High: ×1.25  
- Early Completion: ×1.5
- On-Time Completion: ×1.2
Example Calculation:

text
Urgent task completed early:
Base: 25 XP
× 1.5 (urgent) = 37.5
× 1.5 (early) = 56.25
+ 75 XP (urgent completion bonus)
= 131 XP total! 🎉
Level Progression
Quadratic Level Formula
text
Level N requires: N × 100 + (N-1) × 50 XP

Level 1:   0 -   100 XP
Level 2: 100 -   350 XP  (+250)
Level 3: 350 -   750 XP  (+400)
Level 4: 750 -  1300 XP  (+550)
Level 5: 1300 - 2000 XP  (+700)
Level Titles
Level	Title	XP Range
1-5	🌱 Beginner	0 - 2,000
6-10	📚 Learner	2,000 - 7,000
11-20	⚡ Practitioner	7,000 - 25,000
21-35	🎯 Expert	25,000 - 75,000
36-50	🏆 Master	75,000 - 150,000
51-75	👑 Grandmaster	150,000 - 300,000
76-100	🌟 Legend	300,000 - 500,000
100+	🔮 Transcendent	500,000+
Progression Curve
text
XP Required
^
500K |                                    🔮
     |                              🌟
300K |                        👑
     |                   🏆
150K |              🎯
     |         ⚡
 75K |    📚
     | 🌱
 2K  |___|_____|_____|_____|_____|_____|_____> Level
     1   10    20    35    50    75    100
Achievements
Current Achievements
ID	Name	Icon	Requirement	Reward
first-task	First Steps	🎯	1 task completed	50 XP, beginner badge
task-master-10	Task Master	⭐	10 tasks completed	150 XP, productive badge
task-warrior-50	Task Warrior	⚔️	50 tasks completed	500 XP, double-xp-1h perk
task-legend-100	Legendary	👑	100 tasks completed	2000 XP, legend badge, custom theme
board-creator-5	Board Architect	🏗️	5 boards created	300 XP
early-bird-10	Early Bird	🐦	10 early completions	400 XP, efficient badge
Achievement Lifecycle
typescript
1. User performs action → addXP()
2. XP Store checks achievements
3. Count increments
4. When count ≥ requiredCount:
   - Achievement marked completed
   - Reward XP granted
   - Perk/badge awarded
   - Toast notification shown
   - xp:achievement_unlocked event emitted
Streak System
How Streaks Work
typescript
// Daily check event (emitted at midnight)
eventBus.emit('system:daily_check');

// Streak increments on consecutive days
// Streak breaks if a day is missed

// Current streak tracking
const { streak } = useXPStore.getState();
console.log(streak.current); // 5
console.log(streak.longest); // 14
Streak Rewards
Streak	Reward
3 days	🔥 Fire badge
7 days	200 XP bonus
30 days	1000 XP + permanent 1.1x multiplier
100 days	5000 XP + Legend badge
Power-ups & Multipliers
Active Multipliers
typescript
const xp = useXPStore.getState();

// Activate double XP for 1 hour
xp.activateMultiplier('double-xp', 2.0, 3600000);

// Permanent 1.1x multiplier
xp.activateMultiplier('veteran', 1.1);

// Remove multiplier
xp.deactivateMultiplier('double-xp');
Available Power-ups
Power-up	Effect	Duration	Unlock
Double XP	2× XP	1 hour	Achievement: task-warrior-50
Veteran	1.1× XP	Permanent	Achievement: streak-30
XP Magnet	1.25× XP	30 min	Level 20
Streak Freeze	Protect streak	1 day	Level 15
API Reference
addXP(action, context?)
typescript
xp.addXP('task:completed', {
  taskId: 'task-1',
  boardId: 'board-1',
  taskPriority: 'high'
});
getLevelInfo()
typescript
const info = xp.getLevelInfo();
// { level: 3, progress: 25, title: "🌱 Beginner", nextLevelXP: 400 }
calculateLevel(totalXP)
typescript
const levelInfo = xp.calculateLevel(1500);
// { level: 5, currentXP: 200, xpToNextLevel: 500, progress: 40, title: "🌱 Beginner" }
getAchievements()
typescript
const achievements = xp.getAchievements();
const unlocked = achievements.filter(a => a.completed);
const next = achievements.find(a => !a.completed);
activateMultiplier(id, factor, duration?)
typescript
// 2x XP for 1 hour
xp.activateMultiplier('event-boost', 2.0, 3600000);

// Permanent 1.5x
xp.activateMultiplier('premium', 1.5);
resetXP()
typescript
// Full reset (use with caution!)
if (confirm('Reset all XP?')) {
  xp.resetXP();
}
Adding New Achievements
typescript
// 1. Add to ACHIEVEMENT_DEFINITIONS in xp.store.ts
const NEW_ACHIEVEMENT = {
  id: 'speed-demon-10',
  name: 'Speed Demon',
  description: 'Complete 10 tasks within 1 hour of creation',
  icon: '⚡',
  requiredAction: 'task:completed_early' as XPAction,
  requiredCount: 10,
  rewards: { xp: 600, badge: 'fast', perk: 'speed-boost' },
};

// 2. Add achievement component (optional)
// 3. Test: bus.emit('task:completed_early', ...)
Adding New XP Actions
typescript
// 1. Add to XPAction type in xp.types.ts
export type XPAction = 
  | 'task:completed'
  | 'custom:new_action'; // Add here

// 2. Add XP value
export const XP_VALUES: Record<XPAction, number> = {
  'task:completed': 25,
  'custom:new_action': 15, // Add here
};

// 3. Emit from your feature
bus.emit('custom:event', payload);

// 4. Handle in xp-event-handlers.ts
bus.on('custom:event', () => {
  xpStore.addXP('custom:new_action');
});
Debugging
javascript
// Check XP state
window.__xpStore.getState()

// Simulate XP gain
window.__eventBus.getState().emit('task:completed', { 
  id: 'test', boardId: 'board-1' 
})

// Fast level up
for (let i = 0; i < 50; i++) {
  bus.emit('task:completed', { id: `test-${i}`, boardId: 'board-1' });
}
Performance Notes
Max events stored: 500 (configurable)

Achievement checks: Every addXP() call

Level calculation: O(log n) - very fast

Persistence: Automatic via Zustand persist

Storage size: ~5KB for average user (1 year)