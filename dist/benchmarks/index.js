"use strict";
/**
 * Performance Benchmarks
 * Comprehensive benchmarking suite for Vlodia ORM
 * Tests CRUD operations, queries, and relationship loading performance
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BenchmarkRunner = void 0;
const index_1 = require("../index");
// Benchmark entities
let BenchmarkUser = class BenchmarkUser {
    id;
    name;
    email;
    age;
    createdAt;
    posts;
};
__decorate([
    (0, index_1.PrimaryKey)(),
    __metadata("design:type", Number)
], BenchmarkUser.prototype, "id", void 0);
__decorate([
    (0, index_1.Column)(),
    __metadata("design:type", String)
], BenchmarkUser.prototype, "name", void 0);
__decorate([
    (0, index_1.Column)(),
    __metadata("design:type", String)
], BenchmarkUser.prototype, "email", void 0);
__decorate([
    (0, index_1.Column)(),
    __metadata("design:type", Number)
], BenchmarkUser.prototype, "age", void 0);
__decorate([
    (0, index_1.Column)(),
    __metadata("design:type", Date)
], BenchmarkUser.prototype, "createdAt", void 0);
__decorate([
    (0, index_1.OneToMany)(() => BenchmarkPost, 'userId'),
    __metadata("design:type", Array)
], BenchmarkUser.prototype, "posts", void 0);
BenchmarkUser = __decorate([
    (0, index_1.Entity)({ tableName: 'benchmark_users' })
], BenchmarkUser);
let BenchmarkPost = class BenchmarkPost {
    id;
    title;
    content;
    published;
    userId;
    createdAt;
    user;
};
__decorate([
    (0, index_1.PrimaryKey)(),
    __metadata("design:type", Number)
], BenchmarkPost.prototype, "id", void 0);
__decorate([
    (0, index_1.Column)(),
    __metadata("design:type", String)
], BenchmarkPost.prototype, "title", void 0);
__decorate([
    (0, index_1.Column)(),
    __metadata("design:type", String)
], BenchmarkPost.prototype, "content", void 0);
__decorate([
    (0, index_1.Column)(),
    __metadata("design:type", Boolean)
], BenchmarkPost.prototype, "published", void 0);
__decorate([
    (0, index_1.Column)(),
    __metadata("design:type", Number)
], BenchmarkPost.prototype, "userId", void 0);
__decorate([
    (0, index_1.Column)(),
    __metadata("design:type", Date)
], BenchmarkPost.prototype, "createdAt", void 0);
__decorate([
    (0, index_1.ManyToOne)(() => BenchmarkUser, 'userId'),
    __metadata("design:type", BenchmarkUser)
], BenchmarkPost.prototype, "user", void 0);
BenchmarkPost = __decorate([
    (0, index_1.Entity)({ tableName: 'benchmark_posts' })
], BenchmarkPost);
class BenchmarkRunner {
    orm;
    results = [];
    constructor() {
        const config = {
            database: {
                type: 'sqlite',
                database: ':memory:',
            },
            entities: [BenchmarkUser, BenchmarkPost],
            logging: {
                level: 'error',
                format: 'text',
                queries: false,
            },
        };
        this.orm = new index_1.Vlodia(config);
    }
    async initialize() {
        await this.orm.initialize();
    }
    async cleanup() {
        await this.orm.close();
    }
    /**
     * Run all benchmarks
     */
    async runAllBenchmarks() {
        console.log('Starting Vlodia ORM Benchmarks...\n');
        await this.initialize();
        try {
            await this.benchmarkInsert();
            await this.benchmarkFind();
            await this.benchmarkUpdate();
            await this.benchmarkDelete();
            await this.benchmarkRelations();
            await this.benchmarkTransactions();
            await this.benchmarkBulkOperations();
            await this.benchmarkComplexQueries();
            this.printResults();
        }
        finally {
            await this.cleanup();
        }
    }
    /**
     * Benchmark insert operations
     */
    async benchmarkInsert() {
        console.log('Benchmarking INSERT operations...');
        const iterations = 1000;
        const startTime = Date.now();
        const startMemory = process.memoryUsage().heapUsed;
        for (let i = 0; i < iterations; i++) {
            const user = new BenchmarkUser();
            user.name = `User ${i}`;
            user.email = `user${i}@example.com`;
            user.age = Math.floor(Math.random() * 50) + 18;
            user.createdAt = new Date();
            await this.orm.manager.save(user);
        }
        const endTime = Date.now();
        const endMemory = process.memoryUsage().heapUsed;
        const duration = endTime - startTime;
        const memoryUsage = endMemory - startMemory;
        this.results.push({
            name: 'INSERT (1000 records)',
            duration,
            operations: iterations,
            opsPerSecond: Math.round((iterations / duration) * 1000),
            memoryUsage: Math.round(memoryUsage / 1024 / 1024), // MB
        });
        console.log(`INSERT: ${iterations} records in ${duration}ms (${Math.round((iterations / duration) * 1000)} ops/sec)`);
    }
    /**
     * Benchmark find operations
     */
    async benchmarkFind() {
        console.log('Benchmarking FIND operations...');
        const iterations = 1000;
        const startTime = Date.now();
        const startMemory = process.memoryUsage().heapUsed;
        for (let i = 0; i < iterations; i++) {
            await this.orm.manager.find(BenchmarkUser, {
                where: { age: { $gt: 25 } },
                limit: 10,
            });
        }
        const endTime = Date.now();
        const endMemory = process.memoryUsage().heapUsed;
        const duration = endTime - startTime;
        const memoryUsage = endMemory - startMemory;
        this.results.push({
            name: 'FIND (1000 queries)',
            duration,
            operations: iterations,
            opsPerSecond: Math.round((iterations / duration) * 1000),
            memoryUsage: Math.round(memoryUsage / 1024 / 1024), // MB
        });
        console.log(`FIND: ${iterations} queries in ${duration}ms (${Math.round((iterations / duration) * 1000)} ops/sec)`);
    }
    /**
     * Benchmark update operations
     */
    async benchmarkUpdate() {
        console.log('Benchmarking UPDATE operations...');
        const users = await this.orm.manager.find(BenchmarkUser, { limit: 100 });
        const iterations = users.length;
        const startTime = Date.now();
        const startMemory = process.memoryUsage().heapUsed;
        for (const user of users) {
            user.age = Math.floor(Math.random() * 50) + 18;
            await this.orm.manager.save(user);
        }
        const endTime = Date.now();
        const endMemory = process.memoryUsage().heapUsed;
        const duration = endTime - startTime;
        const memoryUsage = endMemory - startMemory;
        this.results.push({
            name: 'UPDATE (100 records)',
            duration,
            operations: iterations,
            opsPerSecond: Math.round((iterations / duration) * 1000),
            memoryUsage: Math.round(memoryUsage / 1024 / 1024), // MB
        });
        console.log(`UPDATE: ${iterations} records in ${duration}ms (${Math.round((iterations / duration) * 1000)} ops/sec)`);
    }
    /**
     * Benchmark delete operations
     */
    async benchmarkDelete() {
        console.log('Benchmarking DELETE operations...');
        const users = await this.orm.manager.find(BenchmarkUser, { limit: 100 });
        const iterations = users.length;
        const startTime = Date.now();
        const startMemory = process.memoryUsage().heapUsed;
        for (const user of users) {
            await this.orm.manager.remove(user);
        }
        const endTime = Date.now();
        const endMemory = process.memoryUsage().heapUsed;
        const duration = endTime - startTime;
        const memoryUsage = endMemory - startMemory;
        this.results.push({
            name: 'DELETE (100 records)',
            duration,
            operations: iterations,
            opsPerSecond: Math.round((iterations / duration) * 1000),
            memoryUsage: Math.round(memoryUsage / 1024 / 1024), // MB
        });
        console.log(`DELETE: ${iterations} records in ${duration}ms (${Math.round((iterations / duration) * 1000)} ops/sec)`);
    }
    /**
     * Benchmark relationship loading
     */
    async benchmarkRelations() {
        console.log('Benchmarking RELATIONSHIP loading...');
        // Create test data
        const users = [];
        for (let i = 0; i < 100; i++) {
            const user = new BenchmarkUser();
            user.name = `User ${i}`;
            user.email = `user${i}@example.com`;
            user.age = Math.floor(Math.random() * 50) + 18;
            user.createdAt = new Date();
            users.push(await this.orm.manager.save(user));
        }
        for (const user of users) {
            for (let j = 0; j < 5; j++) {
                const post = new BenchmarkPost();
                post.title = `Post ${j} for User ${user.id}`;
                post.content = `Content for post ${j}`;
                post.published = Math.random() > 0.5;
                post.userId = user.id;
                post.createdAt = new Date();
                await this.orm.manager.save(post);
            }
        }
        const iterations = 100;
        const startTime = Date.now();
        const startMemory = process.memoryUsage().heapUsed;
        for (let i = 0; i < iterations; i++) {
            await this.orm.manager.find(BenchmarkUser, {
                relations: ['posts'],
                limit: 10,
            });
        }
        const endTime = Date.now();
        const endMemory = process.memoryUsage().heapUsed;
        const duration = endTime - startTime;
        const memoryUsage = endMemory - startMemory;
        this.results.push({
            name: 'RELATIONS (100 queries)',
            duration,
            operations: iterations,
            opsPerSecond: Math.round((iterations / duration) * 1000),
            memoryUsage: Math.round(memoryUsage / 1024 / 1024), // MB
        });
        console.log(`RELATIONS: ${iterations} queries in ${duration}ms (${Math.round((iterations / duration) * 1000)} ops/sec)`);
    }
    /**
     * Benchmark transactions
     */
    async benchmarkTransactions() {
        console.log('Benchmarking TRANSACTION operations...');
        const iterations = 100;
        const startTime = Date.now();
        const startMemory = process.memoryUsage().heapUsed;
        for (let i = 0; i < iterations; i++) {
            await this.orm.transaction(async (manager) => {
                const user = new BenchmarkUser();
                user.name = `Transaction User ${i}`;
                user.email = `transaction${i}@example.com`;
                user.age = Math.floor(Math.random() * 50) + 18;
                user.createdAt = new Date();
                const savedUser = await manager.save(user);
                const post = new BenchmarkPost();
                post.title = `Transaction Post ${i}`;
                post.content = `Content for transaction post ${i}`;
                post.published = true;
                post.userId = savedUser.id;
                post.createdAt = new Date();
                await manager.save(post);
            });
        }
        const endTime = Date.now();
        const endMemory = process.memoryUsage().heapUsed;
        const duration = endTime - startTime;
        const memoryUsage = endMemory - startMemory;
        this.results.push({
            name: 'TRANSACTIONS (100 transactions)',
            duration,
            operations: iterations,
            opsPerSecond: Math.round((iterations / duration) * 1000),
            memoryUsage: Math.round(memoryUsage / 1024 / 1024), // MB
        });
        console.log(`TRANSACTIONS: ${iterations} transactions in ${duration}ms (${Math.round((iterations / duration) * 1000)} ops/sec)`);
    }
    /**
     * Benchmark bulk operations
     */
    async benchmarkBulkOperations() {
        console.log('Benchmarking BULK operations...');
        const iterations = 10;
        const batchSize = 100;
        const startTime = Date.now();
        const startMemory = process.memoryUsage().heapUsed;
        for (let i = 0; i < iterations; i++) {
            const users = [];
            for (let j = 0; j < batchSize; j++) {
                const user = new BenchmarkUser();
                user.name = `Bulk User ${i}-${j}`;
                user.email = `bulk${i}-${j}@example.com`;
                user.age = Math.floor(Math.random() * 50) + 18;
                user.createdAt = new Date();
                users.push(user);
            }
            await Promise.all(users.map(user => this.orm.manager.save(user)));
        }
        const endTime = Date.now();
        const endMemory = process.memoryUsage().heapUsed;
        const duration = endTime - startTime;
        const memoryUsage = endMemory - startMemory;
        const totalOperations = iterations * batchSize;
        this.results.push({
            name: 'BULK (1000 records)',
            duration,
            operations: totalOperations,
            opsPerSecond: Math.round((totalOperations / duration) * 1000),
            memoryUsage: Math.round(memoryUsage / 1024 / 1024), // MB
        });
        console.log(`BULK: ${totalOperations} records in ${duration}ms (${Math.round((totalOperations / duration) * 1000)} ops/sec)`);
    }
    /**
     * Benchmark complex queries
     */
    async benchmarkComplexQueries() {
        console.log('Benchmarking COMPLEX queries...');
        const iterations = 100;
        const startTime = Date.now();
        const startMemory = process.memoryUsage().heapUsed;
        for (let i = 0; i < iterations; i++) {
            await this.orm.manager.find(BenchmarkUser, {
                where: {
                    $and: [
                        { age: { $gt: 25 } },
                        { $or: [{ name: { $like: '%User%' } }, { email: { $like: '%@example.com' } }] },
                    ],
                },
                orderBy: { createdAt: 'DESC' },
                limit: 20,
            });
        }
        const endTime = Date.now();
        const endMemory = process.memoryUsage().heapUsed;
        const duration = endTime - startTime;
        const memoryUsage = endMemory - startMemory;
        this.results.push({
            name: 'COMPLEX (100 queries)',
            duration,
            operations: iterations,
            opsPerSecond: Math.round((iterations / duration) * 1000),
            memoryUsage: Math.round(memoryUsage / 1024 / 1024), // MB
        });
        console.log(`COMPLEX: ${iterations} queries in ${duration}ms (${Math.round((iterations / duration) * 1000)} ops/sec)`);
    }
    /**
     * Print benchmark results
     */
    printResults() {
        console.log('\nBENCHMARK RESULTS');
        console.log('==================');
        console.log('');
        // Sort by operations per second
        const sortedResults = this.results.sort((a, b) => b.opsPerSecond - a.opsPerSecond);
        console.log('Rank | Operation | Duration | Ops/sec | Memory');
        console.log('-----|-----------|----------|---------|-------');
        sortedResults.forEach((result, index) => {
            console.log(`${(index + 1).toString().padStart(4)} | ${result.name.padEnd(10)} | ${result.duration.toString().padStart(7)}ms | ${result.opsPerSecond.toString().padStart(7)} | ${result.memoryUsage}MB`);
        });
        console.log('\nPerformance Summary:');
        console.log(`- Fastest operation: ${sortedResults[0]?.name} (${sortedResults[0]?.opsPerSecond} ops/sec)`);
        console.log(`- Total operations: ${sortedResults.reduce((sum, r) => sum + r.operations, 0)}`);
        console.log(`- Total duration: ${sortedResults.reduce((sum, r) => sum + r.duration, 0)}ms`);
        console.log(`- Average memory usage: ${Math.round(sortedResults.reduce((sum, r) => sum + r.memoryUsage, 0) / sortedResults.length)}MB`);
    }
}
exports.BenchmarkRunner = BenchmarkRunner;
// Run benchmarks if called directly
if (require.main === module) {
    const runner = new BenchmarkRunner();
    runner.runAllBenchmarks().catch(console.error);
}
//# sourceMappingURL=index.js.map