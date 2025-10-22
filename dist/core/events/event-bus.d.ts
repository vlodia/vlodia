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
export declare class DefaultEventBus implements EventBus {
    private handlers;
    private onceHandlers;
    /**
     * Emit event with data
     */
    emit<T>(event: string, data?: T): void;
    /**
     * Subscribe to event
     */
    on<T>(event: string, handler: EventHandler<T>): EventSubscription;
    /**
     * Unsubscribe from event
     */
    off(event: string, handler: EventHandler): void;
    /**
     * Subscribe to event once
     */
    once<T>(event: string, handler: EventHandler<T>): EventSubscription;
    /**
     * Remove all listeners for event or all events
     */
    removeAllListeners(event?: string): void;
    /**
     * Get all event names
     */
    getEventNames(): string[];
    /**
     * Get listener count for event
     */
    getListenerCount(event: string): number;
    /**
     * Check if event has listeners
     */
    hasListeners(event: string): boolean;
    /**
     * Get all handlers for event
     */
    getHandlers(event: string): EventHandler[];
}
/**
 * Predefined ORM events
 */
export declare const ORM_EVENTS: {
    readonly INITIALIZED: "initialized";
    readonly CLOSED: "closed";
    readonly TRANSACTION_START: "transaction:start";
    readonly TRANSACTION_COMMIT: "transaction:commit";
    readonly TRANSACTION_ROLLBACK: "transaction:rollback";
    readonly SAVEPOINT_START: "savepoint:start";
    readonly SAVEPOINT_RELEASE: "savepoint:release";
    readonly SAVEPOINT_ROLLBACK: "savepoint:rollback";
    readonly QUERY_START: "query:start";
    readonly QUERY_END: "query:end";
    readonly QUERY_ERROR: "query:error";
    readonly ENTITY_CREATED: "entity:created";
    readonly ENTITY_UPDATED: "entity:updated";
    readonly ENTITY_DELETED: "entity:deleted";
    readonly CACHE_HIT: "cache:hit";
    readonly CACHE_MISS: "cache:miss";
    readonly CACHE_SET: "cache:set";
    readonly CACHE_DELETE: "cache:delete";
    readonly CACHE_CLEAR: "cache:clear";
    readonly MIGRATION_START: "migration:start";
    readonly MIGRATION_END: "migration:end";
    readonly MIGRATION_ERROR: "migration:error";
    readonly ERROR: "error";
    readonly WARNING: "warning";
};
export type ORMEvent = (typeof ORM_EVENTS)[keyof typeof ORM_EVENTS];
//# sourceMappingURL=event-bus.d.ts.map