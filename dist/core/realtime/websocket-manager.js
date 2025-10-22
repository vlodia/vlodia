"use strict";
/**
 * WebSocket Manager
 * Real-time data synchronization with WebSocket support
 * Provides live data updates and event streaming
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketManager = void 0;
class WebSocketManager {
    config;
    eventBus;
    logger;
    connections = new Map();
    subscriptions = new Map();
    server = null;
    constructor(config, eventBus, logger) {
        this.config = config;
        this.eventBus = eventBus;
        this.logger = logger;
    }
    /**
     * Initialize WebSocket server
     */
    async initialize() {
        if (!this.config.enabled) {
            return;
        }
        try {
            const WebSocket = require('ws');
            const http = require('http');
            const express = require('express');
            const app = express();
            const server = http.createServer(app);
            this.server = new WebSocket.Server({
                server,
                path: this.config.path,
                cors: this.config.cors
            });
            this.setupWebSocketHandlers();
            this.setupEventListeners();
            this.startHeartbeat();
            server.listen(this.config.port, () => {
                this.logger.info('WebSocket server started', {
                    port: this.config.port,
                    path: this.config.path
                });
            });
        }
        catch (error) {
            this.logger.error('Failed to initialize WebSocket server', { error });
            throw error;
        }
    }
    /**
     * Setup WebSocket event handlers
     */
    setupWebSocketHandlers() {
        this.server.on('connection', (socket, request) => {
            // Extract client info from request for logging
            const clientIP = request.connection?.remoteAddress || 'unknown';
            const userAgent = request.headers?.['user-agent'] || 'unknown';
            const connectionId = this.generateConnectionId();
            const connection = {
                id: connectionId,
                socket,
                subscriptions: new Set(),
                lastActivity: new Date()
            };
            this.connections.set(connectionId, connection);
            this.logger.debug('WebSocket connection established', {
                connectionId,
                clientIP,
                userAgent
            });
            socket.on('message', (message) => {
                this.handleMessage(connectionId, message);
            });
            socket.on('close', () => {
                this.handleDisconnection(connectionId);
            });
            socket.on('error', (error) => {
                this.logger.error('WebSocket error', { connectionId, error });
            });
            // Send welcome message
            this.sendMessage(connectionId, {
                type: 'connected',
                connectionId,
                timestamp: new Date()
            });
        });
    }
    /**
     * Setup event listeners for real-time updates
     */
    setupEventListeners() {
        this.eventBus.on('entity_created', (event) => {
            this.broadcastEvent({
                type: 'entity_created',
                entity: event.entity,
                data: event.data,
                timestamp: new Date(),
                userId: event.userId,
                tenantId: event.tenantId
            });
        });
        this.eventBus.on('entity_updated', (event) => {
            this.broadcastEvent({
                type: 'entity_updated',
                entity: event.entity,
                data: event.data,
                timestamp: new Date(),
                userId: event.userId,
                tenantId: event.tenantId
            });
        });
        this.eventBus.on('entity_deleted', (event) => {
            this.broadcastEvent({
                type: 'entity_deleted',
                entity: event.entity,
                data: event.data,
                timestamp: new Date(),
                userId: event.userId,
                tenantId: event.tenantId
            });
        });
        this.eventBus.on('query_executed', (event) => {
            this.broadcastEvent({
                type: 'query_executed',
                entity: event.entity,
                data: event.data,
                timestamp: new Date(),
                userId: event.userId,
                tenantId: event.tenantId
            });
        });
    }
    /**
     * Handle incoming WebSocket messages
     */
    handleMessage(connectionId, message) {
        try {
            const data = JSON.parse(message);
            const connection = this.connections.get(connectionId);
            if (!connection) {
                return;
            }
            connection.lastActivity = new Date();
            switch (data.type) {
                case 'subscribe':
                    this.handleSubscription(connectionId, data);
                    break;
                case 'unsubscribe':
                    this.handleUnsubscription(connectionId, data);
                    break;
                case 'ping':
                    this.sendMessage(connectionId, { type: 'pong', timestamp: new Date() });
                    break;
                default:
                    this.logger.warn('Unknown message type', { connectionId, type: data.type });
            }
        }
        catch (error) {
            this.logger.error('Failed to handle WebSocket message', { connectionId, error });
        }
    }
    /**
     * Handle entity subscription
     */
    handleSubscription(connectionId, data) {
        const connection = this.connections.get(connectionId);
        if (!connection)
            return;
        const { entity, userId, tenantId } = data;
        const subscriptionKey = `${entity}:${userId || '*'}:${tenantId || '*'}`;
        connection.subscriptions.add(subscriptionKey);
        if (!this.subscriptions.has(subscriptionKey)) {
            this.subscriptions.set(subscriptionKey, new Set());
        }
        this.subscriptions.get(subscriptionKey).add(connectionId);
        this.logger.debug('Entity subscription added', {
            connectionId,
            entity,
            subscriptionKey
        });
        this.sendMessage(connectionId, {
            type: 'subscribed',
            entity,
            timestamp: new Date()
        });
    }
    /**
     * Handle entity unsubscription
     */
    handleUnsubscription(connectionId, data) {
        const connection = this.connections.get(connectionId);
        if (!connection)
            return;
        const { entity, userId, tenantId } = data;
        const subscriptionKey = `${entity}:${userId || '*'}:${tenantId || '*'}`;
        connection.subscriptions.delete(subscriptionKey);
        const subscription = this.subscriptions.get(subscriptionKey);
        if (subscription) {
            subscription.delete(connectionId);
            if (subscription.size === 0) {
                this.subscriptions.delete(subscriptionKey);
            }
        }
        this.logger.debug('Entity subscription removed', {
            connectionId,
            entity,
            subscriptionKey
        });
        this.sendMessage(connectionId, {
            type: 'unsubscribed',
            entity,
            timestamp: new Date()
        });
    }
    /**
     * Handle connection disconnection
     */
    handleDisconnection(connectionId) {
        const connection = this.connections.get(connectionId);
        if (!connection)
            return;
        // Remove from all subscriptions
        for (const subscriptionKey of connection.subscriptions) {
            const subscription = this.subscriptions.get(subscriptionKey);
            if (subscription) {
                subscription.delete(connectionId);
                if (subscription.size === 0) {
                    this.subscriptions.delete(subscriptionKey);
                }
            }
        }
        this.connections.delete(connectionId);
        this.logger.debug('WebSocket connection closed', { connectionId });
    }
    /**
     * Broadcast event to subscribed connections
     */
    broadcastEvent(event) {
        const subscriptionKey = `${event.entity}:${event.userId || '*'}:${event.tenantId || '*'}`;
        const connections = this.subscriptions.get(subscriptionKey);
        if (connections) {
            for (const connectionId of connections) {
                this.sendMessage(connectionId, event);
            }
        }
        // Also broadcast to wildcard subscriptions
        const wildcardKey = `${event.entity}:*:*`;
        const wildcardConnections = this.subscriptions.get(wildcardKey);
        if (wildcardConnections) {
            for (const connectionId of wildcardConnections) {
                this.sendMessage(connectionId, event);
            }
        }
    }
    /**
     * Send message to specific connection
     */
    sendMessage(connectionId, message) {
        const connection = this.connections.get(connectionId);
        if (!connection || connection.socket.readyState !== 1) {
            return;
        }
        try {
            connection.socket.send(JSON.stringify(message));
        }
        catch (error) {
            this.logger.error('Failed to send WebSocket message', { connectionId, error });
        }
    }
    /**
     * Start heartbeat mechanism
     */
    startHeartbeat() {
        setInterval(() => {
            const now = new Date();
            const timeout = this.config.heartbeat.timeout;
            for (const [connectionId, connection] of this.connections) {
                const timeSinceActivity = now.getTime() - connection.lastActivity.getTime();
                if (timeSinceActivity > timeout) {
                    this.logger.debug('Connection timeout, closing', { connectionId });
                    connection.socket.close();
                    this.connections.delete(connectionId);
                }
                else {
                    // Send ping
                    this.sendMessage(connectionId, { type: 'ping', timestamp: now });
                }
            }
        }, this.config.heartbeat.interval);
    }
    /**
     * Generate unique connection ID
     */
    generateConnectionId() {
        return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Get connection statistics
     */
    getStats() {
        return {
            connections: this.connections.size,
            subscriptions: this.subscriptions.size,
            uptime: process.uptime()
        };
    }
    /**
     * Close all connections
     */
    async close() {
        for (const [connectionId, connection] of this.connections) {
            this.logger.debug('Closing WebSocket connection', { connectionId });
            connection.socket.close();
        }
        this.connections.clear();
        this.subscriptions.clear();
        if (this.server) {
            this.server.close();
        }
        this.logger.info('WebSocket server closed');
    }
}
exports.WebSocketManager = WebSocketManager;
//# sourceMappingURL=websocket-manager.js.map