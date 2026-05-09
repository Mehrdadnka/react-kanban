// stores/core/event-bus.store.ts - UPDATED EMIT SIGNATURE
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { EventBusState, EventName, EventCatalog, ListenerConfig, EventEntry } from './event-bus.types';

const MAX_HISTORY = 1000;

const loggerMiddleware = (eventName: string, payload: unknown) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(
      `%c[EventBus]%c ${eventName}`,
      'color: #6366f1; font-weight: bold',
      'color: #94a3b8',
      { payload, timestamp: new Date().toISOString() }
    );
  }
};

const errorCatcherMiddleware = async (
  listenerId: string,
  handler: Function,
  payload: unknown
) => {
  try {
    await handler(payload);
  } catch (error) {
    console.error(`[EventBus] Error in listener ${listenerId}:`, error);
    // Will be fixed - circular reference
    setTimeout(() => {
      const bus = useEventBus.getState();
      bus.emit('system:error', { error: error as Error, source: listenerId });
    }, 0);
  }
};

export const useEventBus = create<EventBusState>()((set, get) => ({
  listeners: new Map(),
  history: [],

  on: (event, handler, options = {}) => {
    const id = uuidv4();
    const { priority = 50, scope } = options;
    
    const config: ListenerConfig = {
      id,
      priority: priority as ListenerConfig['priority'],
      handler: handler as (payload: unknown) => void | Promise<void>,
      scope,
    };

    set((state) => {
      const listeners = new Map(state.listeners);
      const existing = listeners.get(event) || [];
      listeners.set(event, [...existing, config]);
      return { listeners };
    });

    return id;
  },

  once: (event, handler, options = {}) => {
    let id: string;
    const wrappedHandler = async (payload: unknown) => {
      await handler(payload as any);
      get().off(id);
    };
    
    id = get().on(event, wrappedHandler as any, options);
    return id;
  },

  off: (listenerId) => {
    set((state) => {
      const listeners = new Map(state.listeners);
      
      listeners.forEach((configs, event) => {
        const filtered = configs.filter(c => c.id !== listenerId);
        if (filtered.length === 0) {
          listeners.delete(event);
        } else {
          listeners.set(event, filtered);
        }
      });
      
      return { listeners };
    });
  },

  // 🎯 FIXED: Conditional payload for void events
  emit: ((event: EventName, payload?: unknown) => {
    // Middleware: Logger
    loggerMiddleware(event, payload);

    // Add to history
    const entry: EventEntry = {
      id: uuidv4(),
      name: event,
      payload,
      timestamp: Date.now(),
      reversible: true,
    };

    set((state) => ({
      history: [...state.history, entry].slice(-MAX_HISTORY),
    }));

    // Get sorted listeners by priority
    const state = get();
    const listenerConfigs = state.listeners.get(event) || [];
    const sorted = [...listenerConfigs].sort((a, b) => a.priority - b.priority);

    // Execute listeners
    sorted.forEach((config) => {
      errorCatcherMiddleware(config.id, config.handler, payload);
    });
  }) as EventBusState['emit'],

  // 🎯 FIXED: Async version
  emitAsync: (async (event: EventName, payload?: unknown) => {
    // Middleware: Logger
    loggerMiddleware(event, payload);

    // Add to history
    const entry: EventEntry = {
      id: uuidv4(),
      name: event,
      payload,
      timestamp: Date.now(),
      reversible: true,
    };

    set((state) => ({
      history: [...state.history, entry].slice(-MAX_HISTORY),
    }));

    // Get sorted listeners by priority
    const state = get();
    const listenerConfigs = state.listeners.get(event) || [];
    const sorted = [...listenerConfigs].sort((a, b) => a.priority - b.priority);

    // Execute listeners in order, waiting for each
    for (const config of sorted) {
      await errorCatcherMiddleware(config.id, config.handler, payload);
    }
  }) as EventBusState['emitAsync'],

  getHistory: () => get().history,

  clearHistory: () => set({ history: [] }),

  debug: () => {
    const state = get();
    const listenerCount: Record<string, number> = {};
    
    state.listeners.forEach((configs, event) => {
      listenerCount[event] = configs.length;
    });

    return {
      listeners: listenerCount,
      historyCount: state.history.length,
    };
  },
}));