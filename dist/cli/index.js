"use strict";
/**
 * CLI Entry Point
 * Main CLI application for Nythera ORM
 * Provides command-line interface for development workflow
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLICommands = void 0;
const commands_1 = require("./commands");
// Initialize CLI
new commands_1.CLICommands();
// Export CLI for programmatic use
var commands_2 = require("./commands");
Object.defineProperty(exports, "CLICommands", { enumerable: true, get: function () { return commands_2.CLICommands; } });
__exportStar(require("./commands"), exports);
//# sourceMappingURL=index.js.map