-- Add product views tracking for popularity analytics
CREATE TABLE IF NOT EXISTS product_views (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  search_query_id INT,
  viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_product_id (product_id),
  INDEX idx_viewed_at (viewed_at),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (search_query_id) REFERENCES search_queries(id) ON DELETE SET NULL
);

-- Add user sessions for tracking search patterns
CREATE TABLE IF NOT EXISTS search_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id VARCHAR(100) NOT NULL,
  queries_count INT DEFAULT 0,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_session_id (session_id),
  INDEX idx_started_at (started_at)
);

-- Add similarity scores cache for recommendations
CREATE TABLE IF NOT EXISTS product_similarities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  similar_product_id INT NOT NULL,
  similarity_score DECIMAL(5,4) NOT NULL,
  calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_product_id (product_id),
  INDEX idx_similarity (similarity_score DESC),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (similar_product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY unique_similarity (product_id, similar_product_id)
);
