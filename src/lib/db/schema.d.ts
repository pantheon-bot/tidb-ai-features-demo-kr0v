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

  // Product views tracking
  product_views: {
    id: Generated<number>;
    product_id: number;
    search_query_id: number | null;
    viewed_at: Generated<Date>;
  };

  // Search sessions
  search_sessions: {
    id: Generated<number>;
    session_id: string;
    queries_count: number;
    started_at: Generated<Date>;
    last_activity: Generated<Date>;
  };

  // Product similarity cache
  product_similarities: {
    id: Generated<number>;
    product_id: number;
    similar_product_id: number;
    similarity_score: number;
    calculated_at: Generated<Date>;
  };
}