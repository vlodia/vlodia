/**
 * Query Analyzer
 * N+1 query detection and performance optimization
 * Provides intelligent query analysis and optimization suggestions
 */
import { Logger } from '@/types';
export interface QueryAnalysis {
    queryId: string;
    sql: string;
    executionTime: number;
    rowCount: number;
    n1Detected: boolean;
    optimizationSuggestions: string[];
    performanceScore: number;
    timestamp: Date;
}
export interface N1Detection {
    pattern: string;
    count: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    suggestions: string[];
    affectedQueries: string[];
}
export interface PerformanceMetrics {
    totalQueries: number;
    n1Queries: number;
    averageExecutionTime: number;
    slowestQuery: QueryAnalysis;
    optimizationOpportunities: number;
    performanceScore: number;
}
export declare class QueryAnalyzer {
    private metadataRegistry;
    private logger;
    private queryHistory;
    private n1Patterns;
    private performanceThresholds;
    constructor(logger: Logger);
    /**
     * Analyze query for N+1 patterns and performance issues
     */
    analyzeQuery(sql: string, executionTime: number, rowCount: number): QueryAnalysis;
    /**
     * Detect N+1 query patterns
     */
    private detectN1Pattern;
    /**
     * Detect N+1 patterns specific to entity relations
     */
    private detectEntityN1Pattern;
    /**
     * Find similar queries in history
     */
    private findSimilarQueries;
    /**
     * Extract base pattern from SQL
     */
    private extractBasePattern;
    /**
     * Normalize SQL for pattern matching
     */
    private normalizeSQL;
    /**
     * Generate optimization suggestions
     */
    private generateOptimizationSuggestions;
    /**
     * Generate entity-specific optimization suggestions
     */
    private generateEntityOptimizationSuggestions;
    /**
     * Calculate performance score (0-100)
     */
    private calculatePerformanceScore;
    /**
     * Update N+1 pattern tracking
     */
    private updateN1Patterns;
    /**
     * Get performance metrics
     */
    getPerformanceMetrics(): PerformanceMetrics;
    /**
     * Get N+1 detection report
     */
    getN1DetectionReport(): N1Detection[];
    /**
     * Get optimization recommendations
     */
    getOptimizationRecommendations(): {
        critical: N1Detection[];
        high: N1Detection[];
        medium: N1Detection[];
        suggestions: string[];
    };
    /**
     * Clear analysis history
     */
    clearHistory(): void;
    /**
     * Generate query ID
     */
    private generateQueryId;
    /**
     * Hash string for ID generation
     */
    private hashString;
    /**
     * Sanitize SQL for logging
     */
    private sanitizeSQL;
}
//# sourceMappingURL=query-analyzer.d.ts.map