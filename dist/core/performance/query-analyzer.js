"use strict";
/**
 * Query Analyzer
 * N+1 query detection and performance optimization
 * Provides intelligent query analysis and optimization suggestions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryAnalyzer = void 0;
const metadata_registry_1 = require("../metadata-registry");
class QueryAnalyzer {
    metadataRegistry;
    logger;
    queryHistory = [];
    n1Patterns = new Map();
    performanceThresholds = {
        slowQuery: 1000, // 1 second
        n1Threshold: 5, // 5+ similar queries
        criticalThreshold: 10, // 10+ similar queries
    };
    constructor(logger) {
        this.metadataRegistry = metadata_registry_1.MetadataRegistry.getInstance();
        this.logger = logger;
    }
    /**
     * Analyze query for N+1 patterns and performance issues
     */
    analyzeQuery(sql, executionTime, rowCount) {
        const queryId = this.generateQueryId(sql);
        const n1Detected = this.detectN1Pattern(sql);
        const optimizationSuggestions = this.generateOptimizationSuggestions(sql, n1Detected);
        const performanceScore = this.calculatePerformanceScore(executionTime, rowCount, n1Detected);
        const analysis = {
            queryId,
            sql,
            executionTime,
            rowCount,
            n1Detected,
            optimizationSuggestions,
            performanceScore,
            timestamp: new Date(),
        };
        this.queryHistory.push(analysis);
        this.updateN1Patterns(analysis);
        // Log warnings for detected issues
        if (n1Detected) {
            this.logger.warn('N+1 query detected', {
                queryId,
                sql: this.sanitizeSQL(sql),
                executionTime,
                suggestions: optimizationSuggestions,
            });
        }
        if (executionTime > this.performanceThresholds.slowQuery) {
            this.logger.warn('Slow query detected', {
                queryId,
                sql: this.sanitizeSQL(sql),
                executionTime,
                threshold: this.performanceThresholds.slowQuery,
            });
        }
        return analysis;
    }
    /**
     * Detect N+1 query patterns
     */
    detectN1Pattern(sql) {
        const normalizedSQL = this.normalizeSQL(sql);
        // Check for common N+1 patterns
        const n1Patterns = [
            // Pattern 1: SELECT with WHERE IN (subquery)
            /SELECT.*FROM.*WHERE.*IN\s*\(\s*SELECT/i,
            // Pattern 2: Multiple similar SELECTs in sequence
            /SELECT.*FROM.*WHERE.*id\s*=\s*\?/i,
            // Pattern 3: Loop-like patterns
            /SELECT.*FROM.*WHERE.*id\s*IN\s*\([^)]+\)/i,
            // Pattern 4: Missing JOINs
            /SELECT.*FROM.*WHERE.*NOT\s+EXISTS/i,
        ];
        for (const pattern of n1Patterns) {
            if (pattern.test(normalizedSQL)) {
                return true;
            }
        }
        // Check for entity-specific N+1 patterns using metadata
        const entityN1Detected = this.detectEntityN1Pattern(normalizedSQL);
        if (entityN1Detected) {
            return true;
        }
        // Check for repeated similar queries
        const similarQueries = this.findSimilarQueries(normalizedSQL);
        return similarQueries.length >= this.performanceThresholds.n1Threshold;
    }
    /**
     * Detect N+1 patterns specific to entity relations
     */
    detectEntityN1Pattern(sql) {
        const entities = this.metadataRegistry.getAllEntities();
        for (const entity of entities) {
            const relations = entity.relations;
            for (const relation of relations) {
                // Check for OneToMany/ManyToMany N+1 patterns
                if (relation.type === 'OneToMany' || relation.type === 'ManyToMany') {
                    const relationPattern = new RegExp(`SELECT.*FROM.*${relation.target.name.toLowerCase()}.*WHERE.*${entity.name.toLowerCase()}_id\\s*=\\s*\\?`, 'i');
                    if (relationPattern.test(sql)) {
                        this.logger.debug('Entity-specific N+1 pattern detected', {
                            entity: entity.name,
                            relation: relation.propertyName,
                            type: relation.type,
                        });
                        return true;
                    }
                }
                // Check for missing JOIN patterns
                if (sql.includes(`FROM ${entity.tableName}`) && !sql.includes('JOIN')) {
                    const hasRelationQueries = this.queryHistory.some(q => q.sql.includes(relation.target.name.toLowerCase()) &&
                        q.timestamp.getTime() > Date.now() - 5000 // Within last 5 seconds
                    );
                    if (hasRelationQueries) {
                        this.logger.debug('Missing JOIN pattern detected', {
                            entity: entity.name,
                            relation: relation.propertyName,
                        });
                        return true;
                    }
                }
            }
        }
        return false;
    }
    /**
     * Find similar queries in history
     */
    findSimilarQueries(sql) {
        const normalizedSQL = this.normalizeSQL(sql);
        const basePattern = this.extractBasePattern(normalizedSQL);
        return this.queryHistory.filter(query => {
            const queryPattern = this.extractBasePattern(this.normalizeSQL(query.sql));
            return queryPattern === basePattern;
        });
    }
    /**
     * Extract base pattern from SQL
     */
    extractBasePattern(sql) {
        // Remove specific values and normalize
        return sql
            .replace(/\?\d+/g, '?') // Replace parameterized values
            .replace(/\d+/g, 'N') // Replace numbers
            .replace(/'[^']*'/g, "'S'") // Replace strings
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim();
    }
    /**
     * Normalize SQL for pattern matching
     */
    normalizeSQL(sql) {
        return sql.toLowerCase().replace(/\s+/g, ' ').replace(/`/g, '').trim();
    }
    /**
     * Generate optimization suggestions
     */
    generateOptimizationSuggestions(sql, n1Detected) {
        const suggestions = [];
        const normalizedSQL = this.normalizeSQL(sql);
        if (n1Detected) {
            suggestions.push('Consider using JOINs instead of multiple queries');
            suggestions.push('Use eager loading for related entities');
            suggestions.push('Implement batch loading for collections');
            // Add entity-specific suggestions
            const entitySuggestions = this.generateEntityOptimizationSuggestions(sql);
            suggestions.push(...entitySuggestions);
        }
        // Check for missing indexes
        if (normalizedSQL.includes('where') && !normalizedSQL.includes('order by')) {
            suggestions.push('Consider adding indexes on WHERE clause columns');
        }
        // Check for SELECT *
        if (normalizedSQL.includes('select *')) {
            suggestions.push('Avoid SELECT * - specify only needed columns');
        }
        // Check for missing LIMIT
        if (normalizedSQL.includes('select') && !normalizedSQL.includes('limit')) {
            suggestions.push('Consider adding LIMIT clause for large result sets');
        }
        // Check for complex subqueries
        if (normalizedSQL.includes('(select')) {
            suggestions.push('Consider optimizing subqueries or using JOINs');
        }
        return suggestions;
    }
    /**
     * Generate entity-specific optimization suggestions
     */
    generateEntityOptimizationSuggestions(sql) {
        const suggestions = [];
        const entities = this.metadataRegistry.getAllEntities();
        for (const entity of entities) {
            if (sql.includes(entity.tableName)) {
                const relations = entity.relations;
                for (const relation of relations) {
                    if (relation.type === 'OneToMany' || relation.type === 'ManyToMany') {
                        suggestions.push(`Consider eager loading for ${entity.name}.${relation.propertyName} relation`);
                        suggestions.push(`Add JOIN with ${relation.target.name} table for ${relation.propertyName}`);
                    }
                    if (relation.type === 'ManyToOne' || relation.type === 'OneToOne') {
                        suggestions.push(`Consider including ${relation.propertyName} in the initial query`);
                    }
                }
                // Check for missing indexes on foreign keys
                const columns = entity.columns;
                for (const column of columns) {
                    if (column.name.endsWith('_id') || column.name.endsWith('Id')) {
                        suggestions.push(`Ensure index exists on ${entity.tableName}.${column.name}`);
                    }
                }
            }
        }
        return suggestions;
    }
    /**
     * Calculate performance score (0-100)
     */
    calculatePerformanceScore(executionTime, rowCount, n1Detected) {
        let score = 100;
        // Penalize for execution time
        if (executionTime > 1000)
            score -= 30;
        else if (executionTime > 500)
            score -= 20;
        else if (executionTime > 100)
            score -= 10;
        // Penalize for N+1 queries
        if (n1Detected)
            score -= 40;
        // Penalize for large result sets without pagination
        if (rowCount > 1000)
            score -= 20;
        else if (rowCount > 100)
            score -= 10;
        return Math.max(0, score);
    }
    /**
     * Update N+1 pattern tracking
     */
    updateN1Patterns(analysis) {
        if (!analysis.n1Detected)
            return;
        const pattern = this.extractBasePattern(this.normalizeSQL(analysis.sql));
        const existing = this.n1Patterns.get(pattern);
        if (existing) {
            existing.count++;
            existing.affectedQueries.push(analysis.queryId);
            // Update severity
            if (existing.count >= this.performanceThresholds.criticalThreshold) {
                existing.severity = 'critical';
            }
            else if (existing.count >= this.performanceThresholds.n1Threshold) {
                existing.severity = 'high';
            }
        }
        else {
            this.n1Patterns.set(pattern, {
                pattern,
                count: 1,
                severity: 'medium',
                suggestions: analysis.optimizationSuggestions,
                affectedQueries: [analysis.queryId],
            });
        }
    }
    /**
     * Get performance metrics
     */
    getPerformanceMetrics() {
        const totalQueries = this.queryHistory.length;
        const n1Queries = this.queryHistory.filter(q => q.n1Detected).length;
        const averageExecutionTime = this.queryHistory.reduce((sum, q) => sum + q.executionTime, 0) / totalQueries;
        const slowestQuery = this.queryHistory.reduce((slowest, current) => current.executionTime > slowest.executionTime ? current : slowest);
        const optimizationOpportunities = this.n1Patterns.size;
        const performanceScore = this.queryHistory.reduce((sum, q) => sum + q.performanceScore, 0) / totalQueries;
        return {
            totalQueries,
            n1Queries,
            averageExecutionTime,
            slowestQuery,
            optimizationOpportunities,
            performanceScore,
        };
    }
    /**
     * Get N+1 detection report
     */
    getN1DetectionReport() {
        return Array.from(this.n1Patterns.values()).sort((a, b) => b.count - a.count);
    }
    /**
     * Get optimization recommendations
     */
    getOptimizationRecommendations() {
        const patterns = this.getN1DetectionReport();
        return {
            critical: patterns.filter(p => p.severity === 'critical'),
            high: patterns.filter(p => p.severity === 'high'),
            medium: patterns.filter(p => p.severity === 'medium'),
            suggestions: [
                'Implement eager loading for frequently accessed relations',
                'Use batch loading for collection relations',
                'Add database indexes on frequently queried columns',
                'Consider query result caching for expensive operations',
                'Optimize complex queries by breaking them into simpler parts',
            ],
        };
    }
    /**
     * Clear analysis history
     */
    clearHistory() {
        this.queryHistory = [];
        this.n1Patterns.clear();
        this.logger.info('Query analysis history cleared');
    }
    /**
     * Generate query ID
     */
    generateQueryId(sql) {
        const hash = this.hashString(sql);
        return `query_${hash}_${Date.now()}`;
    }
    /**
     * Hash string for ID generation
     */
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(36);
    }
    /**
     * Sanitize SQL for logging
     */
    sanitizeSQL(sql) {
        return (sql.replace(/\?\d+/g, '?').replace(/\d+/g, 'N').substring(0, 200) +
            (sql.length > 200 ? '...' : ''));
    }
}
exports.QueryAnalyzer = QueryAnalyzer;
//# sourceMappingURL=query-analyzer.js.map