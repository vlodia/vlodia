/**
 * Column Decorators
 * Provides decorators for defining database columns with type safety and metadata
 * Supports various column types, constraints, and database-specific options
 */
import 'reflect-metadata';
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
/**
 * Column decorator for defining database columns
 * @param options Configuration options for the column
 */
export declare function Column(options?: ColumnOptions): PropertyDecorator;
/**
 * Primary key column decorator
 * @param options Configuration options for the primary key
 */
export declare function PrimaryKey(options?: Omit<ColumnOptions, 'primary'>): PropertyDecorator;
/**
 * Generated column decorator (auto-increment, UUID, etc.)
 * @param options Configuration options for the generated column
 */
export declare function Generated(options?: Omit<ColumnOptions, 'generated'>): PropertyDecorator;
/**
 * Unique column decorator
 * @param options Configuration options for the unique column
 */
export declare function Unique(options?: Omit<ColumnOptions, 'unique'>): PropertyDecorator;
/**
 * Not null column decorator
 * @param options Configuration options for the not null column
 */
export declare function NotNull(options?: Omit<ColumnOptions, 'nullable'>): PropertyDecorator;
/**
 * Get column metadata from a property
 */
export declare function getColumnMetadata(target: any, propertyKey: string | symbol): ColumnMetadata | undefined;
/**
 * Check if a property is marked as a column
 */
export declare function isColumn(target: any, propertyKey: string | symbol): boolean;
//# sourceMappingURL=column.d.ts.map