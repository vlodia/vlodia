/**
 * Event Bus Implementation
 * Centralized event system for ORM lifecycle events
 * Provides pub/sub pattern with type-safe event handling
 */

export interface EventHandler<T = any> {
  (data: T): void | Promise<void>;
}

export interface EventSubscription {
  unsubscribe(): void;
}

export interface EventBus {
  emit<T>(event: string, data?: T): void;
  on<T>(event: string, handler: EventHandler<T>): EventSubscription;
  off(event: string, handler: EventHandler): void;
  once<T>(event: string, handler: EventHandler<T>): EventSubscription;
  removeAllListeners(event?: string): void;
  getEventNames(): string[];
  getListenerCount(event: string): number;
}

export class DefaultEventBus implements EventBus {
  private handlers = new Map<string, Set<EventHandler>>();
  private onceHandlers = new Map<string, Set<EventHandler>>();

  /**
   * Emit event with data
   */
  emit<T>(event: string, data?: T): void {
    // Emit to regular handlers
    const regularHandlers = this.handlers.get(event);
    if (regularHandlers) {
      for (const handler of regularHandlers) {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      }
    }

    // Emit to once handlers
    const onceHandlers = this.onceHandlers.get(event);
    if (onceHandlers) {
      for (const handler of onceHandlers) {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in once event handler for ${event}:`, error);
        }
      }
      // Clear once handlers after execution
      onceHandlers.clear();
    }
  }

  /**
   * Subscribe to event
   */
  on<T>(event: string, handler: EventHandler<T>): EventSubscription {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }

    this.handlers.get(event)!.add(handler);

    return {
      unsubscribe: () => {
        this.off(event, handler);
      },
    };
  }

  /**
   * Unsubscribe from event
   */
  off(event: string, handler: EventHandler): void {
    const regularHandlers = this.handlers.get(event);
    if (regularHandlers) {
      regularHandlers.delete(handler);
      if (regularHandlers.size === 0) {
        this.handlers.delete(event);
      }
    }

    const onceHandlers = this.onceHandlers.get(event);
    if (onceHandlers) {
      onceHandlers.delete(handler);
      if (onceHandlers.size === 0) {
        this.onceHandlers.delete(event);
      }
    }
  }

  /**
   * Subscribe to event once
   */
  once<T>(event: string, handler: EventHandler<T>): EventSubscription {
    if (!this.onceHandlers.has(event)) {
      this.onceHandlers.set(event, new Set());
    }

    this.onceHandlers.get(event)!.add(handler);

    return {
      unsubscribe: () => {
        this.off(event, handler);
      },
    };
  }

  /**
   * Remove all listeners for event or all events
   */
  removeAllListeners(event?: string): void {
    if (event) {
      this.handlers.delete(event);
      this.onceHandlers.delete(event);
    } else {
      this.handlers.clear();
      this.onceHandlers.clear();
    }
  }

  /**
   * Get all event names
   */
  getEventNames(): string[] {
    const eventNames = new Set<string>();

    for (const event of this.handlers.keys()) {
      eventNames.add(event);
    }

    for (const event of this.onceHandlers.keys()) {
      eventNames.add(event);
    }

    return Array.from(eventNames);
  }

  /**
   * Get listener count for event
   */
  getListenerCount(event: string): number {
    const regularCount = this.handlers.get(event)?.size || 0;
    const onceCount = this.onceHandlers.get(event)?.size || 0;
    return regularCount + onceCount;
  }

  /**
   * Check if event has listeners
   */
  hasListeners(event: string): boolean {
    return this.getListenerCount(event) > 0;
  }

  /**
   * Get all handlers for event
   */
  getHandlers(event: string): EventHandler[] {
    const handlers: EventHandler[] = [];

    const regularHandlers = this.handlers.get(event);
    if (regularHandlers) {
      handlers.push(...regularHandlers);
    }

    const onceHandlers = this.onceHandlers.get(event);
    if (onceHandlers) {
      handlers.push(...onceHandlers);
    }

    return handlers;
  }
}

/**
 * Predefined ORM events
 */
export const ORM_EVENTS = {
  // Initialization events
  INITIALIZED: 'initialized',
  CLOSED: 'closed',

  // Transaction events
  TRANSACTION_START: 'transaction:start',
  TRANSACTION_COMMIT: 'transaction:commit',
  TRANSACTION_ROLLBACK: 'transaction:rollback',

  // Savepoint events
  SAVEPOINT_START: 'savepoint:start',
  SAVEPOINT_RELEASE: 'savepoint:release',
  SAVEPOINT_ROLLBACK: 'savepoint:rollback',

  // Query events
  QUERY_START: 'query:start',
  QUERY_END: 'query:end',
  QUERY_ERROR: 'query:error',

  // Entity events
  ENTITY_CREATED: 'entity:created',
  ENTITY_UPDATED: 'entity:updated',
  ENTITY_DELETED: 'entity:deleted',

  // Cache events
  CACHE_HIT: 'cache:hit',
  CACHE_MISS: 'cache:miss',
  CACHE_SET: 'cache:set',
  CACHE_DELETE: 'cache:delete',
  CACHE_CLEAR: 'cache:clear',

  // Migration events
  MIGRATION_START: 'migration:start',
  MIGRATION_END: 'migration:end',
  MIGRATION_ERROR: 'migration:error',

  // Error events
  ERROR: 'error',
  WARNING: 'warning',
} as const;

export type ORMEvent = (typeof ORM_EVENTS)[keyof typeof ORM_EVENTS];
