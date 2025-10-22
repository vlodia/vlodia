/**
 * Visual Schema Designer
 * GUI-based schema design and visualization
 * Provides interactive schema management and visualization
 */
export interface SchemaNode {
    id: string;
    type: 'entity' | 'column' | 'relation';
    name: string;
    position: {
        x: number;
        y: number;
    };
    properties: Record<string, any>;
    style: {
        color: string;
        size: number;
        shape: 'rectangle' | 'circle' | 'diamond';
    };
}
export interface SchemaEdge {
    id: string;
    source: string;
    target: string;
    type: 'relation' | 'inheritance' | 'dependency';
    properties: Record<string, any>;
    style: {
        color: string;
        width: number;
        style: 'solid' | 'dashed' | 'dotted';
    };
}
export interface SchemaDiagram {
    nodes: SchemaNode[];
    edges: SchemaEdge[];
    metadata: {
        title: string;
        description: string;
        version: string;
        createdAt: Date;
        updatedAt: Date;
    };
}
export interface DesignConfig {
    theme: 'light' | 'dark';
    layout: 'hierarchical' | 'force' | 'circular' | 'grid';
    showTypes: boolean;
    showRelations: boolean;
    showConstraints: boolean;
    autoLayout: boolean;
}
export declare class SchemaDesigner {
    private metadataRegistry;
    private config;
    constructor(config: DesignConfig);
    /**
     * Generate visual schema diagram from entities
     */
    generateSchemaDiagram(): SchemaDiagram;
    /**
     * Create entity node
     */
    private createEntityNode;
    /**
     * Create column node
     */
    private createColumnNode;
    /**
     * Create column edge
     */
    private createColumnEdge;
    /**
     * Create relation edge
     */
    private createRelationEdge;
    /**
     * Apply auto-layout to nodes and edges
     */
    private applyAutoLayout;
    /**
     * Apply hierarchical layout
     */
    private applyHierarchicalLayout;
    /**
     * Apply force-directed layout
     */
    private applyForceLayout;
    /**
     * Apply circular layout
     */
    private applyCircularLayout;
    /**
     * Apply grid layout
     */
    private applyGridLayout;
    /**
     * Get entity color based on properties
     */
    private getEntityColor;
    /**
     * Get column color based on properties
     */
    private getColumnColor;
    /**
     * Get relation color based on type
     */
    private getRelationColor;
    /**
     * Export diagram to JSON
     */
    exportDiagram(diagram: SchemaDiagram): string;
    /**
     * Import diagram from JSON
     */
    importDiagram(json: string): SchemaDiagram;
    /**
     * Generate SVG representation
     */
    generateSVG(diagram: SchemaDiagram): string;
}
//# sourceMappingURL=schema-designer.d.ts.map