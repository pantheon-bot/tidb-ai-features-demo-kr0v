import { Generated } from 'kysely';

// Vector type represented as string (TiDB vector stored as VECTOR type)
export type Vector = string;

export interface DB {
  // Product catalog with vector embeddings for RAG demo
  products: {
    id: Generated<number>;
    name: string;
    description: string;
    category: string;
    price: number;
    tags: string; // JSON array stored as string
    stock_quantity: number;
    embedding: Vector | null; // Vector column for semantic search
    created_at: Generated<Date>;
    updated_at: Generated<Date>;
  };

  // Search history for analytics
  search_queries: {
    id: Generated<number>;
    query_text: string;
    search_type: 'vector' | 'hybrid' | 'fulltext';
    results_count: number;
    response_time_ms: number;
    created_at: Generated<Date>;
  };
}