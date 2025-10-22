/**
 * Validation System
 * Schema validation with Zod integration and custom validators
 * Provides type-safe validation with comprehensive error reporting
 */
import { z } from 'zod';
export interface ValidationError {
    field: string;
    message: string;
    value: any;
    code: string;
}
export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
    data?: any;
}
export interface ValidationOptions {
    strict?: boolean;
    allowUnknown?: boolean;
    stripUnknown?: boolean;
    abortEarly?: boolean;
}
export declare class EntityValidator {
    private metadataRegistry;
    private schemas;
    constructor();
    /**
     * Validate entity data
     */
    validate<T>(entityClass: new () => T, data: any, _options?: ValidationOptions): ValidationResult;
    /**
     * Validate entity property
     */
    validateProperty<T>(entityClass: new () => T, propertyName: string, value: any): ValidationResult;
    /**
     * Get or create schema for entity
     */
    private getSchema;
    /**
     * Create entity schema from metadata
     */
    private createEntitySchema;
    /**
     * Create column schema from metadata
     */
    private createColumnSchema;
    /**
     * Get base schema for column type
     */
    private getBaseSchema;
    /**
     * Get property schema
     */
    private getPropertySchema;
    /**
     * Validate multiple entities
     */
    validateMany<T>(entityClass: new () => T, dataArray: any[], options?: ValidationOptions): ValidationResult[];
    /**
     * Validate entity with custom rules
     */
    validateWithRules<T>(entityClass: new () => T, data: any, rules: ValidationRule[], options?: ValidationOptions): Promise<ValidationResult>;
    /**
     * Clear schema cache
     */
    clearCache(): void;
    /**
     * Get schema for entity
     */
    getEntitySchema<T>(entityClass: new () => T): z.ZodSchema | null;
}
export interface ValidationRule {
    validate(data: any): ValidationResult | Promise<ValidationResult>;
}
export declare class CustomValidationRule implements ValidationRule {
    private field;
    private validator;
    private message;
    constructor(field: string, validator: (value: any) => boolean, message: string);
    validate(data: any): ValidationResult;
}
export declare class EmailValidationRule implements ValidationRule {
    validate(data: any): ValidationResult;
}
export declare class PasswordValidationRule implements ValidationRule {
    private minLength;
    private requireUppercase;
    private requireLowercase;
    private requireNumbers;
    private requireSpecialChars;
    constructor(minLength?: number, requireUppercase?: boolean, requireLowercase?: boolean, requireNumbers?: boolean, requireSpecialChars?: boolean);
    validate(data: any): ValidationResult;
}
export declare class UniqueValidationRule implements ValidationRule {
    private field;
    private checkFunction;
    constructor(field: string, checkFunction: (value: any) => Promise<boolean>);
    validate(data: any): Promise<ValidationResult>;
}
//# sourceMappingURL=validator.d.ts.map