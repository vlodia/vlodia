"use strict";
/**
 * Validation System
 * Schema validation with Zod integration and custom validators
 * Provides type-safe validation with comprehensive error reporting
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniqueValidationRule = exports.PasswordValidationRule = exports.EmailValidationRule = exports.CustomValidationRule = exports.EntityValidator = void 0;
const zod_1 = require("zod");
const metadata_registry_1 = require("../metadata-registry");
class EntityValidator {
    metadataRegistry;
    schemas = new Map();
    constructor() {
        this.metadataRegistry = metadata_registry_1.MetadataRegistry.getInstance();
    }
    /**
     * Validate entity data
     */
    validate(entityClass, data, _options = {}) {
        const schema = this.getSchema(entityClass);
        const result = schema.safeParse(data);
        if (result.success) {
            return {
                valid: true,
                errors: [],
                data: result.data,
            };
        }
        const errors = result.error.errors.map(error => ({
            field: error.path.join('.'),
            message: error.message,
            value: error.received || error.input,
            code: error.code,
        }));
        return {
            valid: false,
            errors,
        };
    }
    /**
     * Validate entity property
     */
    validateProperty(entityClass, propertyName, value) {
        const schema = this.getPropertySchema(entityClass, propertyName);
        const result = schema.safeParse(value);
        if (result.success) {
            return {
                valid: true,
                errors: [],
                data: result.data,
            };
        }
        const errors = result.error.errors.map(error => ({
            field: propertyName,
            message: error.message,
            value: error.received ?? error.input,
            code: error.code,
        }));
        return { valid: false, errors };
    }
    /**
     * Get or create schema for entity
     */
    getSchema(entityClass) {
        const className = entityClass.name;
        if (this.schemas.has(className)) {
            return this.schemas.get(className);
        }
        const schema = this.createEntitySchema(entityClass);
        this.schemas.set(className, schema);
        return schema;
    }
    /**
     * Create entity schema from metadata
     */
    createEntitySchema(entityClass) {
        const columns = this.metadataRegistry.getColumns(entityClass);
        const schemaFields = {};
        for (const column of columns) {
            schemaFields[column.propertyName] = this.createColumnSchema(column);
        }
        return zod_1.z.object(schemaFields);
    }
    /**
     * Create column schema from metadata
     */
    createColumnSchema(column) {
        let schema = this.getBaseSchema(column.type);
        // Apply nullable
        if (!column.nullable) {
            schema = schema.refine(val => val !== null && val !== undefined, {
                message: `${column.propertyName} is required`
            });
        }
        // Apply length constraints
        if (column.length) {
            if (column.type === 'string') {
                schema = schema.max(column.length);
            }
        }
        // Apply precision and scale for numbers
        if (column.type === 'number' && column.precision) {
            const maxValue = Math.pow(10, column.precision - (column.scale || 0));
            schema = schema.max(maxValue);
        }
        // Apply default value
        if (column.defaultValue !== undefined) {
            schema = schema.default(column.defaultValue);
        }
        return schema;
    }
    /**
     * Get base schema for column type
     */
    getBaseSchema(type) {
        switch (type) {
            case 'string':
                return zod_1.z.string();
            case 'number':
                return zod_1.z.number();
            case 'boolean':
                return zod_1.z.boolean();
            case 'date':
                return zod_1.z.date();
            case 'json':
                return zod_1.z.any();
            case 'uuid':
                return zod_1.z.string().uuid();
            case 'text':
                return zod_1.z.string();
            case 'blob':
                return zod_1.z.any();
            default:
                return zod_1.z.any();
        }
    }
    /**
     * Get property schema
     */
    getPropertySchema(entityClass, propertyName) {
        const column = this.metadataRegistry.getColumn(entityClass, propertyName);
        if (!column) {
            throw new Error(`Property ${propertyName} not found in entity ${entityClass.name}`);
        }
        return this.createColumnSchema(column);
    }
    /**
     * Validate multiple entities
     */
    validateMany(entityClass, dataArray, options = {}) {
        return dataArray.map(data => this.validate(entityClass, data, options));
    }
    /**
     * Validate entity with custom rules
     */
    async validateWithRules(entityClass, data, rules, options = {}) {
        const baseResult = this.validate(entityClass, data, options);
        if (!baseResult.valid) {
            return baseResult;
        }
        const customErrors = [];
        for (const rule of rules) {
            const result = await rule.validate(data);
            if (!result.valid) {
                customErrors.push(...result.errors);
            }
        }
        if (customErrors.length > 0) {
            return {
                valid: false,
                errors: customErrors,
            };
        }
        return {
            valid: true,
            errors: [],
            data: baseResult.data,
        };
    }
    /**
     * Clear schema cache
     */
    clearCache() {
        this.schemas.clear();
    }
    /**
     * Get schema for entity
     */
    getEntitySchema(entityClass) {
        return this.schemas.get(entityClass.name) || null;
    }
}
exports.EntityValidator = EntityValidator;
class CustomValidationRule {
    field;
    validator;
    message;
    constructor(field, validator, message) {
        this.field = field;
        this.validator = validator;
        this.message = message;
    }
    validate(data) {
        const value = data[this.field];
        const valid = this.validator(value);
        if (valid) {
            return { valid: true, errors: [] };
        }
        return {
            valid: false,
            errors: [{
                    field: this.field,
                    message: this.message,
                    value,
                    code: 'CUSTOM_VALIDATION',
                }],
        };
    }
}
exports.CustomValidationRule = CustomValidationRule;
class EmailValidationRule {
    validate(data) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const errors = [];
        for (const [field, value] of Object.entries(data)) {
            if (typeof value === 'string' && field.toLowerCase().includes('email')) {
                if (!emailRegex.test(value)) {
                    errors.push({
                        field,
                        message: 'Invalid email format',
                        value,
                        code: 'INVALID_EMAIL',
                    });
                }
            }
        }
        return {
            valid: errors.length === 0,
            errors,
        };
    }
}
exports.EmailValidationRule = EmailValidationRule;
class PasswordValidationRule {
    minLength;
    requireUppercase;
    requireLowercase;
    requireNumbers;
    requireSpecialChars;
    constructor(minLength = 8, requireUppercase = true, requireLowercase = true, requireNumbers = true, requireSpecialChars = true) {
        this.minLength = minLength;
        this.requireUppercase = requireUppercase;
        this.requireLowercase = requireLowercase;
        this.requireNumbers = requireNumbers;
        this.requireSpecialChars = requireSpecialChars;
    }
    validate(data) {
        const errors = [];
        for (const [field, value] of Object.entries(data)) {
            if (typeof value === 'string' && field.toLowerCase().includes('password')) {
                const password = value;
                const passwordErrors = [];
                if (password.length < this.minLength) {
                    passwordErrors.push(`Password must be at least ${this.minLength} characters long`);
                }
                if (this.requireUppercase && !/[A-Z]/.test(password)) {
                    passwordErrors.push('Password must contain at least one uppercase letter');
                }
                if (this.requireLowercase && !/[a-z]/.test(password)) {
                    passwordErrors.push('Password must contain at least one lowercase letter');
                }
                if (this.requireNumbers && !/\d/.test(password)) {
                    passwordErrors.push('Password must contain at least one number');
                }
                if (this.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
                    passwordErrors.push('Password must contain at least one special character');
                }
                if (passwordErrors.length > 0) {
                    errors.push({
                        field,
                        message: passwordErrors.join(', '),
                        value,
                        code: 'WEAK_PASSWORD',
                    });
                }
            }
        }
        return {
            valid: errors.length === 0,
            errors,
        };
    }
}
exports.PasswordValidationRule = PasswordValidationRule;
class UniqueValidationRule {
    field;
    checkFunction;
    constructor(field, checkFunction) {
        this.field = field;
        this.checkFunction = checkFunction;
    }
    async validate(data) {
        const value = data[this.field];
        const isUnique = await this.checkFunction(value);
        if (isUnique) {
            return { valid: true, errors: [] };
        }
        return {
            valid: false,
            errors: [{
                    field: this.field,
                    message: `${this.field} must be unique`,
                    value,
                    code: 'NOT_UNIQUE',
                }],
        };
    }
}
exports.UniqueValidationRule = UniqueValidationRule;
//# sourceMappingURL=validator.js.map