# 🧪 EventBus Testing Guide

## Overview
The EventBus test suite provides **100% coverage** of all public APIs, edge cases, error handling, async behavior, and performance benchmarks.

## Test Structure

```
src/stores/core/__tests__/event-bus.test.ts
├── Core Functionality (14 tests)
│   ├── on() - 4 tests
│   ├── emit() - 4 tests
│   ├── off() - 4 tests
│   └── once() - 2 tests
├── Priority System (3 tests)
├── History & Debug (5 tests)
├── Error Handling (4 tests)
├── Async Support (3 tests)
├── Performance (3 tests)
└── Type Safety (2 tests)
──────────────────────────────
Total: 34 tests
```

## Running Tests

```bash
# Run all EventBus tests
npx vitest run src/stores/core/__test__/event-bus.test.ts

# Watch mode
npx vitest src/stores/core/__test__/event-bus.test.ts

# With coverage
npx vitest run --coverage src/stores/core/__test__/event-bus.test.ts

# Run specific test
npx vitest run -t "should execute only once"
```

## Test Categories

### 1. Core API (14 tests)

#### `on()` - Register listeners
| Test | Description |
|------|-------------|
| register + UUID | `on()` returns valid UUID v4 |
| scoped listeners | Multiple listeners with different scopes |
| multiple listeners | 3 listeners for same event |
| different events | Listeners for different events don't conflict |

#### `emit()` - Fire events
| Test | Description |
|------|-------------|
| payload delivery | Payload reaches listener correctly |
| multiple listeners | All listeners receive the event |
| void events | Events with no payload work |
| isolation | Events don't leak to other event types |

#### `off()` - Remove listeners
| Test | Description |
|------|-------------|
| specific removal | Remove one listener, others stay |
| last listener | Map entry removed when last listener gone |
| non-existent | `off()` with invalid ID doesn't throw |
| event isolation | Removing listener doesn't affect other events |

#### `once()` - One-time listeners
| Test | Description |
|------|-------------|
| execute once | Fires only first time, ignores subsequent emits |
| cleanup | Listener removed from Map after execution |

### 2. Priority System (3 tests)

| Test | Description |
|------|-------------|
| high priority first | Priority 0 runs before 10 → 50 → 100 |
| same priority | Equal priorities execute in registration order |
| default priority | Unspecified priority defaults to 50 |

**Priority values:**
- `0` = CRITICAL (database writes, data integrity)
- `10` = HIGH (cache invalidation, state sync)
- `50` = NORMAL (UI updates, logging)
- `100` = LOW (analytics, optional features)

### 3. History & Debug (5 tests)

| Test | Description |
|------|-------------|
| record events | Events stored in history array |
| timestamps | Each entry has id, timestamp, reversible flag |
| cap at 1000 | History capped at MAX_HISTORY entries |
| clear history | `clearHistory()` empties the history |
| debug counts | `debug()` returns correct listener/event counts |

### 4. Error Handling (4 tests)

| Test | Description |
|------|-------------|
| no throw | Listener errors don't crash `emit()` |
| continue execution | Error in one listener doesn't block others |
| system:error event | Errors re-emitted as `system:error` |
| console.error | Errors logged to console |

**Error flow:**
```
listener throws → errorCatcherMiddleware catches → console.error()
                                                    ↓
                                           setTimeout(() => {
                                             emit('system:error', ...)
                                           }, 0)
```

### 5. Async Support (3 tests)

| Test | Description |
|------|-------------|
| async listeners | `async` handlers work with `emit()` |
| emitAsync order | `emitAsync()` awaits each listener in priority order |
| async errors | Async errors caught and handled gracefully |

### 6. Performance (3 tests)

| Test | Metric | Threshold |
|------|--------|-----------|
| 1000 listeners | Execution time | < 200ms ✅ (~12ms actual) |
| 500 rapid emits | Execution time | < 500ms ✅ (~7ms actual) |
| on/off cycles | Memory leak | No leak after 100 cycles ✅ |

### 7. Type Safety (2 tests)

| Test | Description |
|------|-------------|
| payload types | TypeScript enforces correct payload shapes |
| all events | All 22 events in catalog can be registered |

## Test Helpers

```typescript
// Reset EventBus to clean state
const resetEventBus = () => {
  useEventBus.setState({ 
    listeners: new Map(), 
    history: [] 
  });
};

// Create a standard test event
const createTestEvent = (overrides = {}) => ({
  id: 'task-1',
  boardId: 'board-1',
  columnId: 'todo',
  title: 'Test Task',
  ...overrides,
});
```

## Patterns & Conventions

### ✅ DO
```typescript
// Always reset state before each test
beforeEach(() => resetEventBus());

// Use curly braces for void returns
bus.on('task:created', () => { results.push('A'); });

// Pass options as 3rd argument
bus.on('task:created', handler, { priority: 10 });

// Use async/await for async tests
await bus.emitAsync('task:created', payload);
```

### ❌ DON'T
```typescript
// Don't use implicit returns that aren't void
bus.on('task:created', () => results.push('A')); // returns number

// Don't pass options as 2nd argument
bus.on('task:created', { priority: 10 }); // Wrong!

// Don't test without reset
it('test', () => {
  const bus = useEventBus.getState(); // May have stale state
});
```

## Known Edge Cases

### 1. `once()` cleanup timing
`once()` removes the listener **before** executing the handler. This ensures cleanup happens even if the handler throws.

```typescript
// Internal implementation
once: (event, handler, options) => {
  const wrappedHandler = (payload) => {
    get().off(listenerId);  // Remove first
    return handler(payload); // Then execute
  };
  listenerId = get().on(event, wrappedHandler, options);
};
```

### 2. `emitAsync` vs `emit` with async handlers
- `emit()`: Sync, async handlers run in background
- `emitAsync()`: Awaits each handler, guarantees order

### 3. Priority sorting
Listeners are sorted by `priority` (ascending) on each `emit()`. Same priority = registration order preserved.

### 4. Error re-emission
Errors are caught and re-emitted via `setTimeout(0)` to prevent recursion. This means `system:error` listeners fire **after** all current listeners complete.

## Adding New Tests

### Template
```typescript
describe('EventBus - New Feature', () => {
  beforeEach(() => resetEventBus());

  it('should [expected behavior]', () => {
    const bus = useEventBus.getState();
    
    // Arrange
    const results: string[] = [];
    
    // Act
    bus.on('task:created', () => { results.push('test'); });
    bus.emit('task:created', createTestEvent());
    
    // Assert
    expect(results).toContain('test');
  });
});
```

### Checklist
- [ ] Test name describes the behavior
- [ ] State reset in `beforeEach`
- [ ] All listeners properly cleaned up
- [ ] Edge cases covered (null, undefined, errors)
- [ ] TypeScript compliant (no implicit returns)

## Test Result History

| Date | Tests | Passed | Failed | Duration |
|------|-------|--------|--------|----------|
| 2026-05-13 | 34 | 34 ✅ | 0 | 202ms |

## Related Documentation
- [EventBus Architecture](./EVENT_BUS.md) - API reference & design
- [Integration Guide](./INTEGRATION.md) - How to connect stores
- [XP System](./XP_SYSTEM.md) - Gamification engine

---

**Last Updated:** 2026-05-13
**Test Framework:** Vitest v4.1.5
**Coverage:** 100% of EventBus public API
