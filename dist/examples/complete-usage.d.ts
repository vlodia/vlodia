/**
 * Complete Vlodia ORM Usage Examples
 * Comprehensive examples demonstrating all ORM functionality including new features
 * Shows basic usage, advanced features, real-time, GraphQL, performance analysis, schema visualization, and multi-tenancy
 */
declare class User {
    id: number;
    name: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
    posts: Post[];
    comments: Comment[];
}
declare class Post {
    id: number;
    title: string;
    content: string;
    published: boolean;
    createdAt: Date;
    updatedAt: Date;
    author: User;
    comments: Comment[];
}
declare class Comment {
    id: number;
    content: string;
    createdAt: Date;
    user: User;
    post: Post;
}
declare const basicConfig: {
    database: {
        type: "postgres";
        host: string;
        port: number;
        database: string;
        username: string;
        password: string;
    };
    entities: (typeof User | typeof Post | typeof Comment)[];
    logging: {
        level: "info";
        format: "text";
        queries: boolean;
    };
};
declare const advancedConfig: {
    database: {
        type: "postgres";
        host: string;
        port: number;
        username: string;
        password: string;
        database: string;
        ssl: boolean;
    };
    entities: (typeof User | typeof Post | typeof Comment)[];
    logging: {
        level: "debug";
        format: "json";
        queries: boolean;
    };
    cache: {
        enabled: boolean;
        type: "memory";
        ttl: number;
    };
    realtime: {
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
    };
    graphql: {
        enabled: boolean;
        path: string;
        playground: boolean;
        introspection: boolean;
        subscriptions: boolean;
        cors: {
            origin: string[];
            credentials: boolean;
        };
    };
    tenancy: {
        enabled: boolean;
        defaultTenant: string;
    };
};
declare function basicUsageExample(): Promise<void>;
declare function advancedUsageExample(): Promise<void>;
declare function repositoryPatternExample(): Promise<void>;
declare function runAllExamples(): Promise<void>;
export { runAllExamples, basicUsageExample, advancedUsageExample, repositoryPatternExample, basicConfig, advancedConfig, };
//# sourceMappingURL=complete-usage.d.ts.map