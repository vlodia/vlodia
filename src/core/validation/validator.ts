/**
 * Validation System
 * Schema validation with Zod integration and custom validators
 * Provides type-safe validation with comprehensive error reporting
 */

import { z } from 'zod';
import { MetadataRegistry } from '../metadata-registry';
import { ColumnMetadata } from '@/types';

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

export class EntityValidator {
  private metadataRegistry: MetadataRegistry;
  private schemas = new Map<string, z.ZodSchema>();

  constructor() {
    this.metadataRegistry = MetadataRegistry.getInstance();
  }

  /**
   * Validate entity data
   */
  validate<T>(
    entityClass: new () => T,
    data: any,
    _options: ValidationOptions = {}
  ): ValidationResult {
    const schema = this.getSchema(entityClass);
    const result = schema.safeParse(data);

    if (result.success) {
      return {
        valid: true,
        errors: [],
        data: result.data,
      };
    }

    const errors: ValidationError[] = result.error.errors.map(error => ({
      field: error.path.join('.'),
      message: error.message,
      value: (error as any).received || (error as any).input,
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
  validateProperty<T>(
    entityClass: new () => T,
    propertyName: string,
    value: any
  ): ValidationResult {
    const schema = this.getPropertySchema(entityClass, propertyName);
    const result = schema.safeParse(value);

    if (result.success) {
      return {
        valid: true,
        errors: [],
        data: result.data,
      };
    }

    const errors: ValidationError[] = result.error.errors.map(error => ({
      field: propertyName,
      message: error.message,
      value: (error as any).received ?? (error as any).input,
      code: error.code,
    }));

    return { valid: false, errors };
  }

  /**
   * Get or create schema for entity
   */
  private getSchema<T>(entityClass: new () => T): z.ZodSchema {
    const className = entityClass.name;

    if (this.schemas.has(className)) {
      return this.schemas.get(className)!;
    }

    const schema = this.createEntitySchema(entityClass);
    this.schemas.set(className, schema);

    return schema;
  }

  /**
   * Create entity schema from metadata
   */
  private createEntitySchema<T>(entityClass: new () => T): z.ZodSchema {
    const columns = this.metadataRegistry.getColumns(entityClass);
    const schemaFields: Record<string, z.ZodSchema> = {};

    for (const column of columns) {
      schemaFields[column.propertyName] = this.createColumnSchema(column);
    }

    return z.object(schemaFields);
  }

  /**
   * Create column schema from metadata
   */
  private createColumnSchema(column: ColumnMetadata): z.ZodSchema {
    let schema = this.getBaseSchema(column.type);

    // Apply nullable
    if (!column.nullable) {
      schema = schema.refine(val => val !== null && val !== undefined, {
        message: `${column.propertyName} is required`,
      });
    }

    // Apply length constraints
    if (column.length) {
      if (column.type === 'string') {
        schema = (schema as z.ZodString).max(column.length);
      }
    }

    // Apply precision and scale for numbers
    if (column.type === 'number' && column.precision) {
      const maxValue = Math.pow(10, column.precision - (column.scale || 0));
      schema = (schema as z.ZodNumber).max(maxValue);
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
  private getBaseSchema(type: string): z.ZodSchema {
    switch (type) {
      case 'string':
        return z.string();
      case 'number':
        return z.number();
      case 'boolean':
        return z.boolean();
      case 'date':
        return z.date();
      case 'json':
        return z.any();
      case 'uuid':
        return z.string().uuid();
      case 'text':
        return z.string();
      case 'blob':
        return z.any();
      default:
        return z.any();
    }
  }

  /**
   * Get property schema
   */
  private getPropertySchema<T>(entityClass: new () => T, propertyName: string): z.ZodSchema {
    const column = this.metadataRegistry.getColumn(entityClass, propertyName);
    if (!column) {
      throw new Error(`Property ${propertyName} not found in entity ${entityClass.name}`);
    }

    return this.createColumnSchema(column);
  }

  /**
   * Validate multiple entities
   */
  validateMany<T>(
    entityClass: new () => T,
    dataArray: any[],
    options: ValidationOptions = {}
  ): ValidationResult[] {
    return dataArray.map(data => this.validate(entityClass, data, options));
  }

  /**
   * Validate entity with custom rules
   */
  async validateWithRules<T>(
    entityClass: new () => T,
    data: any,
    rules: ValidationRule[],
    options: ValidationOptions = {}
  ): Promise<ValidationResult> {
    const baseResult = this.validate(entityClass, data, options);

    if (!baseResult.valid) {
      return baseResult;
    }

    const customErrors: ValidationError[] = [];

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
  clearCache(): void {
    this.schemas.clear();
  }

  /**
   * Get schema for entity
   */
  getEntitySchema<T>(entityClass: new () => T): z.ZodSchema | null {
    return this.schemas.get(entityClass.name) || null;
  }
}

export interface ValidationRule {
  validate(data: any): ValidationResult | Promise<ValidationResult>;
}

export class CustomValidationRule implements ValidationRule {
  constructor(
    private field: string,
    private validator: (value: any) => boolean,
    private message: string
  ) {}

  validate(data: any): ValidationResult {
    const value = data[this.field];
    const valid = this.validator(value);

    if (valid) {
      return { valid: true, errors: [] };
    }

    return {
      valid: false,
      errors: [
        {
          field: this.field,
          message: this.message,
          value,
          code: 'CUSTOM_VALIDATION',
        },
      ],
    };
  }
}

export class EmailValidationRule implements ValidationRule {
  validate(data: any): ValidationResult {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const errors: ValidationError[] = [];

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

export class PasswordValidationRule implements ValidationRule {
  constructor(
    private minLength: number = 8,
    private requireUppercase: boolean = true,
    private requireLowercase: boolean = true,
    private requireNumbers: boolean = true,
    private requireSpecialChars: boolean = true
  ) {}

  validate(data: any): ValidationResult {
    const errors: ValidationError[] = [];

    for (const [field, value] of Object.entries(data)) {
      if (typeof value === 'string' && field.toLowerCase().includes('password')) {
        const password = value as string;
        const passwordErrors: string[] = [];

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

export class UniqueValidationRule implements ValidationRule {
  constructor(
    private field: string,
    private checkFunction: (value: any) => Promise<boolean>
  ) {}

  async validate(data: any): Promise<ValidationResult> {
    const value = data[this.field];
    const isUnique = await this.checkFunction(value);

    if (isUnique) {
      return { valid: true, errors: [] };
    }

    return {
      valid: false,
      errors: [
        {
          field: this.field,
          message: `${this.field} must be unique`,
          value,
          code: 'NOT_UNIQUE',
        },
      ],
    };
  }
}
