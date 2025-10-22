/**
 * Performance Benchmarks
 * Comprehensive benchmarking suite for Vlodia ORM
 * Tests CRUD operations, queries, and relationship loading performance
 */
declare class BenchmarkRunner {
    private orm;
    private results;
    constructor();
    initialize(): Promise<void>;
    cleanup(): Promise<void>;
    /**
     * Run all benchmarks
     */
    runAllBenchmarks(): Promise<void>;
    /**
     * Benchmark insert operations
     */
    private benchmarkInsert;
    /**
     * Benchmark find operations
     */
    private benchmarkFind;
    /**
     * Benchmark update operations
     */
    private benchmarkUpdate;
    /**
     * Benchmark delete operations
     */
    private benchmarkDelete;
    /**
     * Benchmark relationship loading
     */
    private benchmarkRelations;
    /**
     * Benchmark transactions
     */
    private benchmarkTransactions;
    /**
     * Benchmark bulk operations
     */
    private benchmarkBulkOperations;
    /**
     * Benchmark complex queries
     */
    private benchmarkComplexQueries;
    /**
     * Print benchmark results
     */
    private printResults;
}
export { BenchmarkRunner };
//# sourceMappingURL=index.d.ts.map