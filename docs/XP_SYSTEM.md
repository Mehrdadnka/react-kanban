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
```

## XP Calculation Formula

### Base XP Values

| Action | XP | Description |
|--------|-----|-------------|
| `task:created` | 5 | Creating a task |
| `task:completed` | 25 | Basic completion |
| `task:completed_early` | 50 | Before due date |
| `task:completed_on_time` | 35 | On the due date |
| `task:completed_overdue` | 10 | After due date |
| `task:moved_to_progress` | 15 | Starting work |
| `task:priority_urgent_completed` | 75 | Urgent task done |
| `task:priority_high_completed` | 50 | High priority done |
| `subtask:completed` | 10 | Sub-task finished |
| `board:created` | 30 | Creating a board |
| `board:streak_daily` | 20 | Daily activity |
| `board:streak_weekly` | 100 | 7-day streak |
| `label:organized` | 5 | Adding labels |
| `attachment:added` | 5 | File upload |
| `time:logged` | 5 | Time tracking |
| `milestone:reached` | 50 | Achievement bonus |
| `collaboration:assigned` | 10 | Team assignment |

### Multiplier Formula

```
Final XP = Base XP × Active Multipliers × Context Bonus

Context Bonuses:
- Priority Urgent: ×1.5
- Priority High: ×1.25  
- Early Completion: ×1.5
- On-Time Completion: ×1.2
```

**Example Calculation:**
```
Urgent task completed early:
Base: 25 XP
× 1.5 (urgent) = 37.5
× 1.5 (early) = 56.25
+ 75 XP (urgent completion bonus)
= 131 XP total! 🎉
```

## Level Progression

### Quadratic Level Formula

```
Level N requires: N × 100 + (N-1) × 50 XP

Level 1:   0 -   100 XP
Level 2: 100 -   350 XP  (+250)
Level 3: 350 -   750 XP  (+400)
Level 4: 750 -  1300 XP  (+550)
Level 5: 1300 - 2000 XP  (+700)
```

### Level Titles

| Level | Title | XP Range |
|-------|-------|-----------|
| 1-5 | 🌱 Beginner | 0 - 2,000 |
| 6-10 | 📚 Learner | 2,000 - 7,000 |
| 11-20 | ⚡ Practitioner | 7,000 - 25,000 |
| 21-35 | 🎯 Expert | 25,000 - 75,000 |
| 36-50 | 🏆 Master | 75,000 - 150,000 |
| 51-75 | 👑 Grandmaster | 150,000 - 300,000 |
| 76-100 | 🌟 Legend | 300,000 - 500,000 |
| 100+ | 🔮 Transcendent | 500,000+ |

### Progression Curve

```
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
```

## Achievements

### Current Achievements

| ID | Name | Icon | Requirement | Reward |
|----|------|------|-------------|--------|
| `first-task` | First Steps | 🎯 | 1 task completed | 50 XP, beginner badge |
| `task-master-10` | Task Master | ⭐ | 10 tasks completed | 150 XP, productive badge |
| `task-warrior-50` | Task Warrior | ⚔️ | 50 tasks completed | 500 XP, double-xp-1h perk |
| `task-legend-100` | Legendary | 👑 | 100 tasks completed | 2000 XP, legend badge, custom theme |
| `board-creator-5` | Board Architect | 🏗️ | 5 boards created | 300 XP |
| `early-bird-10` | Early Bird | 🐦 | 10 early completions | 400 XP, efficient badge |

### Achievement Lifecycle

```typescript
1. User performs action → addXP()
2. XP Store checks achievements
3. Count increments
4. When count ≥ requiredCount:
   - Achievement marked completed
   - Reward XP granted
   - Perk/badge awarded
   - Toast notification shown
   - xp:achievement_unlocked event emitted
```

## Streak System

### How Streaks Work

```typescript
// Daily check event (emitted at midnight)
eventBus.emit('system:daily_check');

// Streak increments on consecutive days
// Streak breaks if a day is missed

// Current streak tracking
const { streak } = useXPStore.getState();
console.log(streak.current); // 5
console.log(streak.longest); // 14
```

### Streak Rewards

| Streak | Reward |
|--------|--------|
| 3 days | 🔥 Fire badge |
| 7 days | 200 XP bonus |
| 30 days | 1000 XP + permanent 1.1x multiplier |
| 100 days | 5000 XP + Legend badge |

## Power-ups & Multipliers

### Active Multipliers

```typescript
const xp = useXPStore.getState();

// Activate double XP for 1 hour
xp.activateMultiplier('double-xp', 2.0, 3600000);

// Permanent 1.1x multiplier
xp.activateMultiplier('veteran', 1.1);

// Remove multiplier
xp.deactivateMultiplier('double-xp');
```

### Available Power-ups

| Power-up | Effect | Duration | Unlock |
|----------|--------|----------|--------|
| Double XP | 2× XP | 1 hour | Achievement: task-warrior-50 |
| Veteran | 1.1× XP | Permanent | Achievement: streak-30 |
| XP Magnet | 1.25× XP | 30 min | Level 20 |
| Streak Freeze | Protect streak | 1 day | Level 15 |

## API Reference

### `addXP(action, context?)`

```typescript
xp.addXP('task:completed', {
  taskId: 'task-1',
  boardId: 'board-1',
  taskPriority: 'high'
});
```

### `getLevelInfo()`

```typescript
const info = xp.getLevelInfo();
// { level: 3, progress: 25, title: "🌱 Beginner", nextLevelXP: 400 }
```

### `calculateLevel(totalXP)`

```typescript
const levelInfo = xp.calculateLevel(1500);
// { level: 5, currentXP: 200, xpToNextLevel: 500, progress: 40, title: "🌱 Beginner" }
```

### `getAchievements()`

```typescript
const achievements = xp.getAchievements();
const unlocked = achievements.filter(a => a.completed);
const next = achievements.find(a => !a.completed);
```

### `activateMultiplier(id, factor, duration?)`

```typescript
// 2x XP for 1 hour
xp.activateMultiplier('event-boost', 2.0, 3600000);

// Permanent 1.5x
xp.activateMultiplier('premium', 1.5);
```

### `resetXP()`

```typescript
// Full reset (use with caution!)
if (confirm('Reset all XP?')) {
  xp.resetXP();
}
```

## Adding New Achievements

```typescript
// 1. Add to ACHIEVEMENT_DEFINITIONS in xp.store.ts
{
  id: 'speed-demon-10',
  name: 'Speed Demon',
  description: 'Complete 10 tasks within 1 hour of creation',
  icon: '⚡',
  requiredAction: 'task:completed_early' as XPAction,
  requiredCount: 10,
  rewards: { xp: 600, badge: 'fast', perk: 'speed-boost' },
}

// 2. Test
bus.emit('task:completed_early', { id: 'test', boardId: 'board-1' });
```

## Adding New XP Actions

```typescript
// 1. Add to XPAction type in xp.types.ts
export type XPAction = 
  | 'task:completed'
  | 'custom:new_action'; // Add here

// 2. Add XP value
export const XP_VALUES: Record<XPAction, number> = {
  'task:completed': 25,
  'custom:new_action': 15, // Add here
};

// 3. Emit from feature
bus.emit('custom:event', payload);

// 4. Handle in xp-event-handlers.ts
bus.on('custom:event', () => {
  xpStore.addXP('custom:new_action');
});
```

## Debugging

```javascript
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
```

## Performance Notes

- **Max events stored:** 500 (configurable)
- **Achievement checks:** Every addXP() call
- **Level calculation:** O(log n) - very fast
- **Persistence:** Automatic via Zustand persist
- **Storage size:** ~5KB for average user (1 year)

## Architecture Diagram

```
User Action (Complete Task)
    ↓
Task Store (task:completed event)
    ↓
XP Event Handlers (calculates XP)
    ↓
XP Store (adds XP, checks level/achievements)
    ↓
Event Bus (xp:gained, xp:level_up, etc.)
    ↓
UI Components (notifications, animations)
```

## File Structure

```
stores/xp/
├── xp.types.ts          # Types & constants
├── xp.store.ts          # Main XP store
├── xp-calculator.ts     # Level/XP math
├── xp-event-handlers.ts # Event bus connections
└── xp-analytics.ts      # Predictions & trends

components/xp/
├── XPSystem.tsx         # Main notification system
├── XPWidget.tsx         # Sidebar widget
├── XPHeaderBar.tsx      # Header progress bar
├── XPProgressRing.tsx   # Circular progress SVG
├── XPProgressBar.tsx    # Linear progress bar
├── XPFloatingNotification.tsx  # +XP popup
├── AchievementUnlockToast.tsx  # Achievement popup
└── XPDashboard.tsx      # Full analytics page
```

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-05-09 | Initial XP system with levels, achievements, streaks |
