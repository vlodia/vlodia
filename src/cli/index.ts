/**
 * CLI Entry Point
 * Main CLI application for Nythera ORM
 * Provides command-line interface for development workflow
 */

import { CLICommands } from './commands';

// Initialize CLI
new CLICommands();

// Export CLI for programmatic use
export { CLICommands } from './commands';
export * from './commands';
