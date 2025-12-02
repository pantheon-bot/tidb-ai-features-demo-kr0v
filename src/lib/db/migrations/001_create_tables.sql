-- Create products table with vector support for TiDB AI demo
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  tags JSON,
  stock_quantity INT NOT NULL DEFAULT 0,
  embedding VECTOR(1536) COMMENT 'OpenAI text-embedding-3-small dimension',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_price (price),
  FULLTEXT INDEX idx_description (description)
);

-- Create search queries table for real-time analytics
CREATE TABLE IF NOT EXISTS search_queries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  query_text VARCHAR(500) NOT NULL,
  search_type ENUM('vector', 'hybrid', 'fulltext') NOT NULL,
  results_count INT NOT NULL,
  response_time_ms INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_search_type (search_type),
  INDEX idx_created_at (created_at)
);

-- Create vector index for efficient similarity search
-- Note: TiDB vector indexes are created using HNSW algorithm
ALTER TABLE products ADD VECTOR INDEX idx_embedding ((VEC_COSINE_DISTANCE(embedding))) COMMENT 'Vector index for semantic search';
