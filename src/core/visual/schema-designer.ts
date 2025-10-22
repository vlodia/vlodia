/**
 * Visual Schema Designer
 * GUI-based schema design and visualization
 * Provides interactive schema management and visualization
 */

import { MetadataRegistry } from '../metadata-registry';
import { EntityMetadata, ColumnMetadata, RelationMetadata } from '@/types';

export interface SchemaNode {
  id: string;
  type: 'entity' | 'column' | 'relation';
  name: string;
  position: { x: number; y: number };
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

export class SchemaDesigner {
  private metadataRegistry: MetadataRegistry;
  private config: DesignConfig;

  constructor(config: DesignConfig) {
    this.metadataRegistry = MetadataRegistry.getInstance();
    this.config = config;
  }

  /**
   * Generate visual schema diagram from entities
   */
  generateSchemaDiagram(): SchemaDiagram {
    const entities = this.metadataRegistry.getAllEntities();
    const nodes: SchemaNode[] = [];
    const edges: SchemaEdge[] = [];

    // Generate entity nodes
    for (const entity of entities) {
      const entityNode = this.createEntityNode(entity);
      nodes.push(entityNode);

      // Generate column nodes
      const columns = entity.columns;
      for (const column of columns) {
        const columnNode = this.createColumnNode(entity, column);
        nodes.push(columnNode);

        // Create edge between entity and column
        const columnEdge = this.createColumnEdge(entityNode.id, columnNode.id, column);
        edges.push(columnEdge);
      }

      // Generate relation edges
      const relations = entity.relations;
      for (const relation of relations) {
        const relationEdge = this.createRelationEdge(entity, relation);
        if (relationEdge) {
          edges.push(relationEdge);
        }
      }
    }

    // Auto-layout if enabled
    if (this.config.autoLayout) {
      this.applyAutoLayout(nodes, edges);
    }

    return {
      nodes,
      edges,
      metadata: {
        title: 'Database Schema',
        description: 'Visual representation of database schema',
        version: '1.0.0',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    };
  }

  /**
   * Create entity node
   */
  private createEntityNode(entity: EntityMetadata): SchemaNode {
    return {
      id: `entity_${entity.name}`,
      type: 'entity',
      name: entity.name,
      position: { x: 0, y: 0 }, // Will be set by auto-layout
      properties: {
        tableName: entity.tableName,
        columns: entity.columns.length,
        relations: entity.relations.length
      },
      style: {
        color: this.getEntityColor(entity),
        size: 100,
        shape: 'rectangle'
      }
    };
  }

  /**
   * Create column node
   */
  private createColumnNode(entity: EntityMetadata, column: ColumnMetadata): SchemaNode {
    return {
      id: `column_${entity.name}_${column.propertyName}`,
      type: 'column',
      name: column.propertyName,
      position: { x: 0, y: 0 }, // Will be set by auto-layout
      properties: {
        type: column.type,
        nullable: column.nullable,
        primary: column.primary,
        unique: column.unique,
        generated: column.generated
      },
      style: {
        color: this.getColumnColor(column),
        size: 60,
        shape: column.primary ? 'diamond' : 'circle'
      }
    };
  }

  /**
   * Create column edge
   */
  private createColumnEdge(entityId: string, columnId: string, column: ColumnMetadata): SchemaEdge {
    return {
      id: `edge_${entityId}_${columnId}`,
      source: entityId,
      target: columnId,
      type: 'relation',
      properties: {
        columnType: column.type,
        nullable: column.nullable,
        primary: column.primary
      },
      style: {
        color: column.primary ? '#ff6b6b' : '#4ecdc4',
        width: column.primary ? 3 : 1,
        style: column.primary ? 'solid' : 'dashed'
      }
    };
  }

  /**
   * Create relation edge
   */
  private createRelationEdge(entity: EntityMetadata, relation: RelationMetadata): SchemaEdge | null {
    const targetEntity = this.metadataRegistry.getEntity(relation.target as any);
    if (!targetEntity) return null;

    return {
      id: `relation_${entity.name}_${targetEntity.name}_${relation.propertyName}`,
      source: `entity_${entity.name}`,
      target: `entity_${targetEntity.name}`,
      type: 'relation',
      properties: {
        relationType: relation.type,
        propertyName: relation.propertyName,
        joinColumn: relation.joinColumn,
        cascade: relation.cascade
      },
      style: {
        color: this.getRelationColor(relation.type),
        width: 2,
        style: 'solid'
      }
    };
  }

  /**
   * Apply auto-layout to nodes and edges
   */
  private applyAutoLayout(nodes: SchemaNode[], edges: SchemaEdge[]): void {
    switch (this.config.layout) {
      case 'hierarchical':
        this.applyHierarchicalLayout(nodes, edges);
        break;
      case 'force':
        this.applyForceLayout(nodes, edges);
        break;
      case 'circular':
        this.applyCircularLayout(nodes);
        break;
      case 'grid':
        this.applyGridLayout(nodes);
        break;
    }
  }

  /**
   * Apply hierarchical layout
   */
  private applyHierarchicalLayout(nodes: SchemaNode[], _edges: SchemaEdge[]): void {
    const entityNodes = nodes.filter(n => n.type === 'entity');
    const columnNodes = nodes.filter(n => n.type === 'column');
    
    // Position entities in a grid
    const cols = Math.ceil(Math.sqrt(entityNodes.length));
    entityNodes.forEach((node, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      node.position = { x: col * 300, y: row * 200 };
    });

    // Position columns around their entities
    columnNodes.forEach((node, index) => {
      const entityId = node.id.split('_')[1];
      const entityNode = entityNodes.find(n => n.id === `entity_${entityId}`);
      if (entityNode) {
        const angle = (index * 2 * Math.PI) / columnNodes.length;
        const radius = 150;
        node.position = {
          x: entityNode.position.x + Math.cos(angle) * radius,
          y: entityNode.position.y + Math.sin(angle) * radius
        };
      }
    });
  }

  /**
   * Apply force-directed layout
   */
  private applyForceLayout(nodes: SchemaNode[], edges: SchemaEdge[]): void {
    const iterations = 100;
    const k = 300; // Spring constant
    const c = 0.01; // Damping factor

    // Initialize positions randomly
    nodes.forEach(node => {
      node.position = {
        x: Math.random() * 800,
        y: Math.random() * 600
      };
    });

    // Apply force-directed algorithm
    for (let i = 0; i < iterations; i++) {
      const forces = new Map<string, { x: number; y: number }>();
      
      // Initialize forces
      nodes.forEach(node => {
        forces.set(node.id, { x: 0, y: 0 });
      });

      // Calculate repulsive forces between all nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const node1 = nodes[i];
          const node2 = nodes[j];
          if (!node1 || !node2) continue;
          
          const dx = node1.position.x - node2.position.x;
          const dy = node1.position.y - node2.position.y;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = k * k / distance;
          
          const fx = (dx / distance) * force;
          const fy = (dy / distance) * force;
          
          forces.get(node1.id)!.x += fx;
          forces.get(node1.id)!.y += fy;
          forces.get(node2.id)!.x -= fx;
          forces.get(node2.id)!.y -= fy;
        }
      }

      // Calculate attractive forces for connected nodes
      edges.forEach(edge => {
        const sourceNode = nodes.find(n => n.id === edge.source);
        const targetNode = nodes.find(n => n.id === edge.target);
        if (sourceNode && targetNode) {
          const dx = targetNode.position.x - sourceNode.position.x;
          const dy = targetNode.position.y - sourceNode.position.y;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = distance * distance / k;
          
          const fx = (dx / distance) * force;
          const fy = (dy / distance) * force;
          
          forces.get(sourceNode.id)!.x += fx;
          forces.get(sourceNode.id)!.y += fy;
          forces.get(targetNode.id)!.x -= fx;
          forces.get(targetNode.id)!.y -= fy;
        }
      });

      // Apply forces with damping
      nodes.forEach(node => {
        const force = forces.get(node.id)!;
        node.position.x += force.x * c;
        node.position.y += force.y * c;
      });
    }
  }

  /**
   * Apply circular layout
   */
  private applyCircularLayout(nodes: SchemaNode[]): void {
    const centerX = 400;
    const centerY = 300;
    const radius = 200;
    
    nodes.forEach((node, index) => {
      const angle = (index * 2 * Math.PI) / nodes.length;
      node.position = {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius
      };
    });
  }

  /**
   * Apply grid layout
   */
  private applyGridLayout(nodes: SchemaNode[]): void {
    const cols = Math.ceil(Math.sqrt(nodes.length));
    const cellWidth = 200;
    const cellHeight = 150;
    
    nodes.forEach((node, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      node.position = {
        x: col * cellWidth,
        y: row * cellHeight
      };
    });
  }

  /**
   * Get entity color based on properties
   */
  private getEntityColor(entity: EntityMetadata): string {
    const relations = entity.relations;
    if (relations.length > 5) return '#ff6b6b'; // Red for complex entities
    if (relations.length > 2) return '#4ecdc4'; // Teal for moderate complexity
    return '#45b7d1'; // Blue for simple entities
  }

  /**
   * Get column color based on properties
   */
  private getColumnColor(column: ColumnMetadata): string {
    if (column.primary) return '#ff6b6b'; // Red for primary keys
    if (column.unique) return '#f9ca24'; // Yellow for unique columns
    if (column.nullable) return '#6c5ce7'; // Purple for nullable columns
    return '#a4b0be'; // Gray for regular columns
  }

  /**
   * Get relation color based on type
   */
  private getRelationColor(relationType: string): string {
    switch (relationType) {
      case 'OneToOne': return '#00b894';
      case 'OneToMany': return '#0984e3';
      case 'ManyToOne': return '#e17055';
      case 'ManyToMany': return '#fd79a8';
      default: return '#636e72';
    }
  }

  /**
   * Export diagram to JSON
   */
  exportDiagram(diagram: SchemaDiagram): string {
    return JSON.stringify(diagram, null, 2);
  }

  /**
   * Import diagram from JSON
   */
  importDiagram(json: string): SchemaDiagram {
    return JSON.parse(json);
  }

  /**
   * Generate SVG representation
   */
  generateSVG(diagram: SchemaDiagram): string {
    let svg = `<svg width="1000" height="800" xmlns="http://www.w3.org/2000/svg">`;
    
    // Add edges
    diagram.edges.forEach(edge => {
      const sourceNode = diagram.nodes.find(n => n.id === edge.source);
      const targetNode = diagram.nodes.find(n => n.id === edge.target);
      
      if (sourceNode && targetNode) {
        svg += `<line x1="${sourceNode.position.x}" y1="${sourceNode.position.y}" 
                      x2="${targetNode.position.x}" y2="${targetNode.position.y}" 
                      stroke="${edge.style.color}" stroke-width="${edge.style.width}" 
                      stroke-dasharray="${edge.style.style === 'dashed' ? '5,5' : 'none'}" />`;
      }
    });
    
    // Add nodes
    diagram.nodes.forEach(node => {
      if (node.style.shape === 'rectangle') {
        svg += `<rect x="${node.position.x - 50}" y="${node.position.y - 25}" 
                     width="100" height="50" fill="${node.style.color}" 
                     stroke="#000" stroke-width="2" />`;
      } else if (node.style.shape === 'circle') {
        svg += `<circle cx="${node.position.x}" cy="${node.position.y}" 
                       r="${node.style.size / 2}" fill="${node.style.color}" 
                       stroke="#000" stroke-width="2" />`;
      }
      
      // Add text
      svg += `<text x="${node.position.x}" y="${node.position.y + 5}" 
                   text-anchor="middle" font-family="Arial" font-size="12" 
                   fill="#000">${node.name}</text>`;
    });
    
    svg += `</svg>`;
    return svg;
  }
}
