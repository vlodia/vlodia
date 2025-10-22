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

export class WebSocketManager {
  private config: WebSocketConfig;
  private eventBus: EventBus;
  private logger: Logger;
  private connections = new Map<string, WebSocketConnection>();
  private subscriptions = new Map<string, Set<string>>();
  private server: any = null;

  constructor(config: WebSocketConfig, eventBus: EventBus, logger: Logger) {
    this.config = config;
    this.eventBus = eventBus;
    this.logger = logger;
  }

  /**
   * Initialize WebSocket server
   */
  async initialize(): Promise<void> {
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

    } catch (error) {
      this.logger.error('Failed to initialize WebSocket server', { error });
      throw error;
    }
  }

  /**
   * Setup WebSocket event handlers
   */
  private setupWebSocketHandlers(): void {
    this.server.on('connection', (socket: any, request: any) => {
      // Extract client info from request for logging
      const clientIP = request.connection?.remoteAddress || 'unknown';
      const userAgent = request.headers?.['user-agent'] || 'unknown';
      const connectionId = this.generateConnectionId();
      const connection: WebSocketConnection = {
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

      socket.on('message', (message: string) => {
        this.handleMessage(connectionId, message);
      });

      socket.on('close', () => {
        this.handleDisconnection(connectionId);
      });

      socket.on('error', (error: Error) => {
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
  private setupEventListeners(): void {
    this.eventBus.on('entity_created', (event: any) => {
      this.broadcastEvent({
        type: 'entity_created',
        entity: event.entity,
        data: event.data,
        timestamp: new Date(),
        userId: event.userId,
        tenantId: event.tenantId
      });
    });

    this.eventBus.on('entity_updated', (event: any) => {
      this.broadcastEvent({
        type: 'entity_updated',
        entity: event.entity,
        data: event.data,
        timestamp: new Date(),
        userId: event.userId,
        tenantId: event.tenantId
      });
    });

    this.eventBus.on('entity_deleted', (event: any) => {
      this.broadcastEvent({
        type: 'entity_deleted',
        entity: event.entity,
        data: event.data,
        timestamp: new Date(),
        userId: event.userId,
        tenantId: event.tenantId
      });
    });

    this.eventBus.on('query_executed', (event: any) => {
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
  private handleMessage(connectionId: string, message: string): void {
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
    } catch (error) {
      this.logger.error('Failed to handle WebSocket message', { connectionId, error });
    }
  }

  /**
   * Handle entity subscription
   */
  private handleSubscription(connectionId: string, data: any): void {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    const { entity, userId, tenantId } = data;
    const subscriptionKey = `${entity}:${userId || '*'}:${tenantId || '*'}`;

    connection.subscriptions.add(subscriptionKey);
    
    if (!this.subscriptions.has(subscriptionKey)) {
      this.subscriptions.set(subscriptionKey, new Set());
    }
    this.subscriptions.get(subscriptionKey)!.add(connectionId);

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
  private handleUnsubscription(connectionId: string, data: any): void {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

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
  private handleDisconnection(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

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
  private broadcastEvent(event: RealtimeEvent): void {
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
  private sendMessage(connectionId: string, message: any): void {
    const connection = this.connections.get(connectionId);
    if (!connection || connection.socket.readyState !== 1) {
      return;
    }

    try {
      connection.socket.send(JSON.stringify(message));
    } catch (error) {
      this.logger.error('Failed to send WebSocket message', { connectionId, error });
    }
  }

  /**
   * Start heartbeat mechanism
   */
  private startHeartbeat(): void {
    setInterval(() => {
      const now = new Date();
      const timeout = this.config.heartbeat.timeout;

      for (const [connectionId, connection] of this.connections) {
        const timeSinceActivity = now.getTime() - connection.lastActivity.getTime();
        
        if (timeSinceActivity > timeout) {
          this.logger.debug('Connection timeout, closing', { connectionId });
          connection.socket.close();
          this.connections.delete(connectionId);
        } else {
          // Send ping
          this.sendMessage(connectionId, { type: 'ping', timestamp: now });
        }
      }
    }, this.config.heartbeat.interval);
  }

  /**
   * Generate unique connection ID
   */
  private generateConnectionId(): string {
    return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get connection statistics
   */
  getStats(): {
    connections: number;
    subscriptions: number;
    uptime: number;
  } {
    return {
      connections: this.connections.size,
      subscriptions: this.subscriptions.size,
      uptime: process.uptime()
    };
  }

  /**
   * Close all connections
   */
  async close(): Promise<void> {
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
