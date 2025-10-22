/**
 * Test Setup
 * Global test configuration and setup for Nythera ORM
 * Provides test utilities and common test setup
 */

import 'reflect-metadata';

// Global test setup
beforeAll(async () => {
  // Setup test environment
  console.log('Setting up Vlodia ORM test environment...');
});

afterAll(async () => {
  // Cleanup test environment
  console.log('Cleaning up Vlodia ORM test environment...');
});

// Global test utilities
export const testUtils = {
  /**
   * Create test entity data
   */
  createTestUser: (overrides: any = {}) => ({
    name: 'Test User',
    email: 'test@example.com',
    age: 25,
    createdAt: new Date(),
    ...overrides
  }),

  /**
   * Create test post data
   */
  createTestPost: (overrides: any = {}) => ({
    title: 'Test Post',
    content: 'Test content',
    published: true,
    createdAt: new Date(),
    ...overrides
  }),

  /**
   * Wait for async operations
   */
  wait: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),

  /**
   * Generate random test data
   */
  generateRandomData: (count: number = 10) => {
    const data = [];
    for (let i = 0; i < count; i++) {
      data.push({
        name: `Test User ${i}`,
        email: `test${i}@example.com`,
        age: Math.floor(Math.random() * 50) + 18,
        createdAt: new Date()
      });
    }
    return data;
  }
};