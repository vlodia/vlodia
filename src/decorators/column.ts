/**
 * Column Decorators
 * Provides decorators for defining database columns with type safety and metadata
 * Supports various column types, constraints, and database-specific options
 */

import 'reflect-metadata';
import { MetadataRegistry } from '../core/metadata-registry';
import { ColumnMetadata, ColumnType } from '../types';

export interface ColumnOptions {
  name?: string;
  type?: ColumnType;
  nullable?: boolean;
  primary?: boolean;
  generated?: boolean;
  unique?: boolean;
  length?: number;
  precision?: number;
  scale?: number;
  defaultValue?: any;
  comment?: string;
}

const METADATA_KEY = Symbol('nythera:column');

/**
 * Column decorator for defining database columns
 * @param options Configuration options for the column
 */
export function Column(options: ColumnOptions = {}): PropertyDecorator {
  return function (target: any, propertyKey: string | symbol) {
    const registry = MetadataRegistry.getInstance();

    // Get existing metadata if any (from previous decorators)
    const existingMetadata = Reflect.getMetadata(METADATA_KEY, target, propertyKey) as
      | ColumnMetadata
      | undefined;

    // Infer column type from TypeScript type if not specified
    const columnType =
      options.type || existingMetadata?.type || inferColumnType(target, propertyKey);

    const metadata: ColumnMetadata = {
      name: options.name || existingMetadata?.name || String(propertyKey),
      propertyName: String(propertyKey),
      type: columnType,
      nullable: options.nullable ?? existingMetadata?.nullable ?? true,
      primary: options.primary ?? existingMetadata?.primary ?? false,
      generated: options.generated ?? existingMetadata?.generated ?? false,
      unique: options.unique ?? existingMetadata?.unique ?? false,
      length: options.length || existingMetadata?.length || 0,
      precision: options.precision || existingMetadata?.precision || 0,
      scale: options.scale || existingMetadata?.scale || 0,
      defaultValue: options.defaultValue ?? existingMetadata?.defaultValue,
    };

    // Store metadata in reflection
    Reflect.defineMetadata(METADATA_KEY, metadata, target, propertyKey);

    // Register with metadata registry
    // Property decorators receive the prototype, but we need the constructor
    const constructor = target.constructor;
    registry.registerColumn(constructor, String(propertyKey), metadata);
  };
}

/**
 * Primary key column decorator
 * @param options Configuration options for the primary key
 */
export function PrimaryKey(options: Omit<ColumnOptions, 'primary'> = {}): PropertyDecorator {
  return Column({ ...options, primary: true, nullable: false });
}

/**
 * Generated column decorator (auto-increment, UUID, etc.)
 * @param options Configuration options for the generated column
 */
export function Generated(options: Omit<ColumnOptions, 'generated'> = {}): PropertyDecorator {
  return Column({ ...options, generated: true });
}

/**
 * Unique column decorator
 * @param options Configuration options for the unique column
 */
export function Unique(options: Omit<ColumnOptions, 'unique'> = {}): PropertyDecorator {
  return Column({ ...options, unique: true });
}

/**
 * Not null column decorator
 * @param options Configuration options for the not null column
 */
export function NotNull(options: Omit<ColumnOptions, 'nullable'> = {}): PropertyDecorator {
  return Column({ ...options, nullable: false });
}

/**
 * Infer column type from TypeScript type
 */
function inferColumnType(target: any, propertyKey: string | symbol): ColumnType {
  const designType = Reflect.getMetadata('design:type', target, propertyKey);

  switch (designType) {
    case String:
      return 'string';
    case Number:
      return 'number';
    case Boolean:
      return 'boolean';
    case Date:
      return 'date';
    case Object:
      return 'json';
    default:
      return 'string';
  }
}

/**
 * Get column metadata from a property
 */
export function getColumnMetadata(
  target: any,
  propertyKey: string | symbol
): ColumnMetadata | undefined {
  return Reflect.getMetadata(METADATA_KEY, target, propertyKey);
}

/**
 * Check if a property is marked as a column
 */
export function isColumn(target: any, propertyKey: string | symbol): boolean {
  return Reflect.hasMetadata(METADATA_KEY, target, propertyKey);
}
