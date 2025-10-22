"use strict";
/**
 * Event Bus Implementation
 * Centralized event system for ORM lifecycle events
 * Provides pub/sub pattern with type-safe event handling
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ORM_EVENTS = exports.DefaultEventBus = void 0;
class DefaultEventBus {
    handlers = new Map();
    onceHandlers = new Map();
    /**
     * Emit event with data
     */
    emit(event, data) {
        // Emit to regular handlers
        const regularHandlers = this.handlers.get(event);
        if (regularHandlers) {
            for (const handler of regularHandlers) {
                try {
                    handler(data);
                }
                catch (error) {
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
                }
                catch (error) {
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
    on(event, handler) {
        if (!this.handlers.has(event)) {
            this.handlers.set(event, new Set());
        }
        this.handlers.get(event).add(handler);
        return {
            unsubscribe: () => {
                this.off(event, handler);
            },
        };
    }
    /**
     * Unsubscribe from event
     */
    off(event, handler) {
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
    once(event, handler) {
        if (!this.onceHandlers.has(event)) {
            this.onceHandlers.set(event, new Set());
        }
        this.onceHandlers.get(event).add(handler);
        return {
            unsubscribe: () => {
                this.off(event, handler);
            },
        };
    }
    /**
     * Remove all listeners for event or all events
     */
    removeAllListeners(event) {
        if (event) {
            this.handlers.delete(event);
            this.onceHandlers.delete(event);
        }
        else {
            this.handlers.clear();
            this.onceHandlers.clear();
        }
    }
    /**
     * Get all event names
     */
    getEventNames() {
        const eventNames = new Set();
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
    getListenerCount(event) {
        const regularCount = this.handlers.get(event)?.size || 0;
        const onceCount = this.onceHandlers.get(event)?.size || 0;
        return regularCount + onceCount;
    }
    /**
     * Check if event has listeners
     */
    hasListeners(event) {
        return this.getListenerCount(event) > 0;
    }
    /**
     * Get all handlers for event
     */
    getHandlers(event) {
        const handlers = [];
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
exports.DefaultEventBus = DefaultEventBus;
/**
 * Predefined ORM events
 */
exports.ORM_EVENTS = {
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
};
//# sourceMappingURL=event-bus.js.map