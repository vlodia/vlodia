/**
 * WebSocket Manager
 * Real-time data synchronization with WebSocket support
 * Provides live data updates and event streaming
 */
import { EventBus } from '../events/event-bus';
import { Logger } from '@/types';
export interface WebSocketConfig {
    enabled: boolean;
    port: number;
    path: string;
    cors: {
        origin: string[];
        credentials: boolean;
    };
    heartbeat: {
        interval: number;
        timeout: number;
    };
}
export interface WebSocketConnection {
    id: string;
    socket: any;
    userId?: string;
    tenantId?: string;
    subscriptions: Set<string>;
    lastActivity: Date;
}
export interface RealtimeEvent {
    type: 'entity_created' | 'entity_updated' | 'entity_deleted' | 'query_executed';
    entity: string;
    data: any;
    timestamp: Date;
    userId?: string;
    tenantId?: string;
}
export declare class WebSocketManager {
    private config;
    private eventBus;
    private logger;
    private connections;
    private subscriptions;
    private server;
    constructor(config: WebSocketConfig, eventBus: EventBus, logger: Logger);
    /**
     * Initialize WebSocket server
     */
    initialize(): Promise<void>;
    /**
     * Setup WebSocket event handlers
     */
    private setupWebSocketHandlers;
    /**
     * Setup event listeners for real-time updates
     */
    private setupEventListeners;
    /**
     * Handle incoming WebSocket messages
     */
    private handleMessage;
    /**
     * Handle entity subscription
     */
    private handleSubscription;
    /**
     * Handle entity unsubscription
     */
    private handleUnsubscription;
    /**
     * Handle connection disconnection
     */
    private handleDisconnection;
    /**
     * Broadcast event to subscribed connections
     */
    private broadcastEvent;
    /**
     * Send message to specific connection
     */
    private sendMessage;
    /**
     * Start heartbeat mechanism
     */
    private startHeartbeat;
    /**
     * Generate unique connection ID
     */
    private generateConnectionId;
    /**
     * Get connection statistics
     */
    getStats(): {
        connections: number;
        subscriptions: number;
        uptime: number;
    };
    /**
     * Close all connections
     */
    close(): Promise<void>;
}
//# sourceMappingURL=websocket-manager.d.ts.map