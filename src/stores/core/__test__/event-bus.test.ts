// src/stores/core/__tests__/event-bus.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useEventBus } from '../event-bus.store';
import type { EventName } from '../event-bus.types';

// ═══════════════════════════════════════════════
// Test Helpers
// ═══════════════════════════════════════════════

const resetEventBus = () => {
  useEventBus.setState({ 
    listeners: new Map(), 
    history: [] 
  });
};

const createTestEvent = (overrides = {}) => ({
  id: 'task-1',
  boardId: 'board-1',
  columnId: 'todo',
  title: 'Test Task',
  ...overrides,
});

// ═══════════════════════════════════════════════
// Core Functionality
// ═══════════════════════════════════════════════

describe('EventBus - Core', () => {
  beforeEach(() => resetEventBus());
  afterEach(() => resetEventBus());

  describe('on()', () => {
    it('should register listener and return UUID', () => {
      const bus = useEventBus.getState();
      const id = bus.on('task:created', () => {});
      
      expect(id).toMatch(/^[a-f0-9-]{36}$/);
      expect(bus.debug().listeners['task:created']).toBe(1);
    });

    it('should support scoped listeners', () => {
      const bus = useEventBus.getState();
      
      bus.on('task:created', () => {}, { scope: 'task' });
      bus.on('task:created', () => {}, { scope: 'xp' });
      
      expect(bus.debug().listeners['task:created']).toBe(2);
    });

    it('should support multiple listeners for same event', () => {
      const bus = useEventBus.getState();
      
      bus.on('task:created', () => {});
      bus.on('task:created', () => {});
      bus.on('task:created', () => {});
      
      expect(bus.debug().listeners['task:created']).toBe(3);
    });

    it('should support different events', () => {
      const bus = useEventBus.getState();
      
      bus.on('task:created', () => {});
      bus.on('task:completed', () => {});
      bus.on('board:created', () => {});
      
      const debug = bus.debug();
      expect(debug.listeners['task:created']).toBe(1);
      expect(debug.listeners['task:completed']).toBe(1);
      expect(debug.listeners['board:created']).toBe(1);
    });
  });

  describe('emit()', () => {
    it('should deliver payload to listener', () => {
      const bus = useEventBus.getState();
      let received: any = null;
      
      bus.on('task:created', (payload) => { received = payload; });
      bus.emit('task:created', createTestEvent());
      
      expect(received).toEqual(createTestEvent());
    });

    it('should deliver to multiple listeners', () => {
      const bus = useEventBus.getState();
      const results: string[] = [];
      
      bus.on('task:created', () => {results.push('A')});
      bus.on('task:created', () => {results.push('B')});
      bus.on('task:created', () => {results.push('C')});
      
      bus.emit('task:created', createTestEvent());
      
      expect(results).toEqual(['A', 'B', 'C']);
    });

    it('should support void events', () => {
      const bus = useEventBus.getState();
      let called = false;
      
      bus.on('system:boot', () => { called = true; });
      bus.emit('system:boot'); // No payload
      
      expect(called).toBe(true);
    });

    it('should not deliver to other event listeners', () => {
      const bus = useEventBus.getState();
      let taskCreatedCalled = false;
      let taskCompletedCalled = false;
      
      bus.on('task:created', () => { taskCreatedCalled = true; });
      bus.on('task:completed', () => { taskCompletedCalled = true; });
      
      bus.emit('task:created', createTestEvent());
      
      expect(taskCreatedCalled).toBe(true);
      expect(taskCompletedCalled).toBe(false);
    });
  });

  describe('off()', () => {
    it('should remove specific listener', () => {
      const bus = useEventBus.getState();
      const results: string[] = [];
      
      const id1 = bus.on('task:created', () => {results.push('first')});
      const id2 = bus.on('task:created', () => {results.push('second')});
      
      bus.off(id1);
      bus.emit('task:created', createTestEvent());
      
      expect(results).toEqual(['second']);
      expect(bus.debug().listeners['task:created']).toBe(1);
    });

    it('should remove all listeners for event when last one removed', () => {
      const bus = useEventBus.getState();
      
      const id = bus.on('task:created', () => {});
      bus.off(id);
      
      expect(bus.debug().listeners['task:created']).toBeUndefined();
    });

    it('should handle removing non-existent listener gracefully', () => {
      const bus = useEventBus.getState();
      
      expect(() => bus.off('non-existent-id')).not.toThrow();
    });

    it('should not affect other events when removing', () => {
      const bus = useEventBus.getState();
      
      const id1 = bus.on('task:created', () => {});
      const id2 = bus.on('task:completed', () => {});
      
      bus.off(id1);
      
      expect(bus.debug().listeners['task:created']).toBeUndefined();
      expect(bus.debug().listeners['task:completed']).toBe(1);
    });
  });

  describe('once()', () => {
    it('should execute only once', () => {
      const bus = useEventBus.getState();
      let count = 0;
      
      bus.once('task:created', () => { count++; });
      
      bus.emit('task:created', createTestEvent());
      bus.emit('task:created', createTestEvent({ id: 'task-2' }));
      bus.emit('task:created', createTestEvent({ id: 'task-3' }));
      
      expect(count).toBe(1);
    });

    it('should cleanup after execution', async () => {
      const bus = useEventBus.getState();
      
      bus.once('task:created', () => {});
      bus.emit('task:created', createTestEvent());
      
      // Wait for setTimeout(off, 0) to flush
      await new Promise(resolve => setTimeout(resolve, 5));
      
      expect(bus.debug().listeners['task:created']).toBeUndefined();
    });
  });
});

// ═══════════════════════════════════════════════
// Priority System
// ═══════════════════════════════════════════════

describe('EventBus - Priority', () => {
  beforeEach(() => resetEventBus());

  it('should execute higher priority first (lower number = higher priority)', () => {
    const bus = useEventBus.getState();
    const order: number[] = [];
    
    bus.on('task:moved', () => {order.push(50)}, { priority: 50 });
    bus.on('task:moved', () => {order.push(10)}, { priority: 10 });
    bus.on('task:moved', () => {order.push(100)}, { priority: 100 });
    bus.on('task:moved', () => {order.push(0)}, { priority: 0 });
    
    bus.emit('task:moved', { id: '1', from: 'todo', to: 'done', boardId: 'b1' });
    
    expect(order).toEqual([0, 10, 50, 100]);
  });

  it('should execute same priority in registration order', () => {
    const bus = useEventBus.getState();
    const order: string[] = [];
    
    bus.on('task:created', () => {order.push('first')}, { priority: 50 });
    bus.on('task:created', () => {order.push('second')}, { priority: 50 });
    bus.on('task:created', () => {order.push('third')}, { priority: 50 });
    
    bus.emit('task:created', createTestEvent());
    
    expect(order).toEqual(['first', 'second', 'third']);
  });

  it('should default to priority 50 if not specified', () => {
    const bus = useEventBus.getState();
    const order: number[] = [];
    
    bus.on('task:created', () => {order.push(1)}); // default 50
    bus.on('task:created', () => {order.push(2)}, { priority: 10 }); // higher
    bus.on('task:created', () => {order.push(3)}); // default 50
    
    bus.emit('task:created', createTestEvent());
    
    expect(order).toEqual([2, 1, 3]); // 10 first, then 50s in order
  });
});

// ═══════════════════════════════════════════════
// History & Debug
// ═══════════════════════════════════════════════

describe('EventBus - History & Debug', () => {
  beforeEach(() => resetEventBus());

  it('should record events in history', () => {
    const bus = useEventBus.getState();
    
    bus.emit('task:created', createTestEvent());
    bus.emit('task:completed', { id: '1', boardId: 'b1' });
    
    const history = bus.getHistory();
    expect(history).toHaveLength(2);
    expect(history[0].name).toBe('task:created');
    expect(history[1].name).toBe('task:completed');
  });

  it('should include timestamp in history entries', () => {
    const bus = useEventBus.getState();
    
    bus.emit('system:boot');
    
    const entry = bus.getHistory()[0];
    expect(entry.timestamp).toBeGreaterThan(0);
    expect(entry.id).toBeTruthy();
    expect(entry.reversible).toBe(true);
  });

  it('should cap history at MAX_HISTORY (1000)', () => {
    const bus = useEventBus.getState();
    
    // Emit 1100 events
    for (let i = 0; i < 1100; i++) {
      bus.emit('task:created', createTestEvent({ id: `task-${i}` }));
    }
    
    expect(bus.getHistory().length).toBeLessThanOrEqual(1000);
  });

  it('should clear history', () => {
    const bus = useEventBus.getState();
    
    bus.emit('task:created', createTestEvent());
    bus.clearHistory();
    
    expect(bus.getHistory()).toHaveLength(0);
  });

  it('should debug method return correct counts', () => {
    const bus = useEventBus.getState();
    
    bus.on('task:created', () => {});
    bus.on('task:created', () => {});
    bus.on('task:completed', () => {});
    bus.emit('task:created', createTestEvent());
    bus.emit('task:created', createTestEvent({ id: '2' }));
    bus.emit('task:completed', { id: '1', boardId: 'b1' });
    
    const debug = bus.debug();
    expect(debug.listeners['task:created']).toBe(2);
    expect(debug.listeners['task:completed']).toBe(1);
    expect(debug.historyCount).toBe(3);
  });
});

// ═══════════════════════════════════════════════
// Error Handling
// ═══════════════════════════════════════════════

describe('EventBus - Error Handling', () => {
  beforeEach(() => {
    resetEventBus();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should not throw when listener throws', () => {
    const bus = useEventBus.getState();
    
    bus.on('task:created', () => {
      throw new Error('Test error');
    });
    
    expect(() => {
      bus.emit('task:created', createTestEvent());
    }).not.toThrow();
  });

  it('should continue executing other listeners after error', () => {
    const bus = useEventBus.getState();
    const results: string[] = [];
    
    bus.on('task:created', () => {
      throw new Error('First listener fails');
    });
    bus.on('task:created', () => {
      results.push('second works');
    });
    
    bus.emit('task:created', createTestEvent());
    
    expect(results).toContain('second works');
  });

  it('should emit system:error on listener failure', async () => {
    const bus = useEventBus.getState();
    let errorReceived = false;
    
    bus.on('system:error', () => { errorReceived = true; });
    bus.on('task:created', () => {
      throw new Error('Intentional failure');
    });
    
    bus.emit('task:created', createTestEvent());
    
    // Wait for setTimeout in errorCatcherMiddleware
    await new Promise(resolve => setTimeout(resolve, 10));
    
    expect(errorReceived).toBe(true);
  });

  it('should log error to console', () => {
    const bus = useEventBus.getState();
    
    bus.on('task:created', () => {
      throw new Error('Logged error');
    });
    
    bus.emit('task:created', createTestEvent());
    
    expect(console.error).toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════
// Async Support
// ═══════════════════════════════════════════════

describe('EventBus - Async', () => {
  beforeEach(() => resetEventBus());

  it('should support async listeners', async () => {
    const bus = useEventBus.getState();
    const results: string[] = [];
    
    bus.on('task:created', async () => {
      await new Promise(r => setTimeout(r, 10));
      results.push('async done');
    });
    
    bus.emit('task:created', createTestEvent());
    
    // emit is sync, so async listener may not be done
    await new Promise(r => setTimeout(r, 20));
    expect(results).toContain('async done');
  });

  it('should support emitAsync for sequential execution', async () => {
    const bus = useEventBus.getState();
    const order: number[] = [];
    
    bus.on('task:created', async () => {
      await new Promise(r => setTimeout(r, 30));
      order.push(1);
    });
    
    bus.on('task:created', () => {
      order.push(2);
    });
    
    await bus.emitAsync('task:created', createTestEvent());
    
    // Async listeners execute in order with emitAsync
    expect(order).toEqual([1, 2]);
  });

  it('should handle async errors gracefully', async () => {
    const bus = useEventBus.getState();
    
    bus.on('task:created', async () => {
      throw new Error('Async error');
    });
    
    await expect(
      bus.emitAsync('task:created', createTestEvent())
    ).resolves.not.toThrow();
  });
});

// ═══════════════════════════════════════════════
// Memory & Performance
// ═══════════════════════════════════════════════

describe('EventBus - Performance', () => {
  beforeEach(() => resetEventBus());

  it('should handle 1000 listeners for same event', () => {
    const bus = useEventBus.getState();
    let count = 0;
    
    for (let i = 0; i < 1000; i++) {
      bus.on('task:created', () => { count++; });
    }
    
    const start = performance.now();
    bus.emit('task:created', createTestEvent());
    const elapsed = performance.now() - start;
    
    expect(count).toBe(1000);
    expect(elapsed).toBeLessThan(200); // Should complete in <200ms
  });

  it('should handle rapid emits', () => {
    const bus = useEventBus.getState();
    let count = 0;
    
    bus.on('task:created', () => { count++; });
    
    const start = performance.now();
    for (let i = 0; i < 500; i++) {
      bus.emit('task:created', createTestEvent({ id: `task-${i}` }));
    }
    const elapsed = performance.now() - start;
    
    expect(count).toBe(500);
    expect(elapsed).toBeLessThan(500);
  });

  it('should not leak memory on repeated on/off cycles', () => {
    const bus = useEventBus.getState();
    
    for (let i = 0; i < 100; i++) {
      const id = bus.on('task:created', () => {});
      bus.off(id);
    }
    
    expect(bus.debug().listeners['task:created']).toBeUndefined();
  });
});

// ═══════════════════════════════════════════════
// Type Safety (TypeScript compile-time tests)
// ═══════════════════════════════════════════════

describe('EventBus - Type Safety', () => {
  beforeEach(() => resetEventBus());

  it('should infer correct payload types', () => {
    const bus = useEventBus.getState();
    
    // These should compile without type errors
    bus.emit('task:created', { id: '1', boardId: 'b1', columnId: 'todo', title: 'Test' });
    bus.emit('task:completed', { id: '1', boardId: 'b1' });
    bus.emit('system:boot');
    bus.emit('board:created', { id: '1', title: 'Board' });
    
    // bus.emit('task:created', { id: '1' }); // Would be TypeScript error
    
    expect(true).toBe(true); // Type check passed
  });

  it('should support all events in catalog', () => {
    const bus = useEventBus.getState();
    const allEvents: EventName[] = [
      'system:boot', 'system:error', 'system:daily_check',
      'task:created', 'task:completed', 'task:moved', 'task:deleted',
      'board:created', 'board:deleted', 'board:updated',
      'column:created', 'column:deleted', 'column:updated',
      'xp:gained', 'xp:level_up', 'xp:achievement_unlocked',
      'challenges:generated', 'challenge:completed', 'challenge:claimed',
      'powerup:used', 'powerup:unlocked', 'powerup:purchased',
    ];
    
    allEvents.forEach(event => {
      const id = bus.on(event, () => {});
      expect(id).toBeTruthy();
      bus.off(id);
    });
  });
});