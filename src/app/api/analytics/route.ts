import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { sql } from 'kysely';

export async function GET() {
  try {
    // Real-time analytics queries showcasing TiDB's OLTP+OLAP capabilities

    // 1. Search query statistics by type
    const searchTypeStats = await sql<{
      search_type: string;
      total_searches: number;
      avg_response_time_ms: number;
      avg_results_count: number;
    }>`
      SELECT
        search_type,
        COUNT(*) as total_searches,
        AVG(response_time_ms) as avg_response_time_ms,
        AVG(results_count) as avg_results_count
      FROM search_queries
      GROUP BY search_type
      ORDER BY total_searches DESC
    `.execute(db);

    // 2. Recent search queries (showing transactional data freshness)
    const recentSearches = await db
      .selectFrom('search_queries')
      .selectAll()
      .orderBy('created_at', 'desc')
      .limit(10)
      .execute();

    // 3. Product inventory analytics
    const inventoryStats = await sql<{
      category: string;
      total_products: number;
      total_stock: number;
      avg_price: number;
      low_stock_items: number;
    }>`
      SELECT
        category,
        COUNT(*) as total_products,
        SUM(stock_quantity) as total_stock,
        AVG(price) as avg_price,
        SUM(CASE WHEN stock_quantity < 100 THEN 1 ELSE 0 END) as low_stock_items
      FROM products
      GROUP BY category
      ORDER BY total_products DESC
    `.execute(db);

    // 4. Overall system metrics
    const overallMetrics = await sql<{
      total_products: number;
      total_searches: number;
      avg_search_time_ms: number;
    }>`
      SELECT
        (SELECT COUNT(*) FROM products) as total_products,
        (SELECT COUNT(*) FROM search_queries) as total_searches,
        (SELECT AVG(response_time_ms) FROM search_queries) as avg_search_time_ms
    `.execute(db);

    // 5. Hourly search trend (for the last 24 hours)
    const searchTrend = await sql<{
      hour: string;
      search_count: number;
    }>`
      SELECT
        DATE_FORMAT(created_at, '%Y-%m-%d %H:00:00') as hour,
        COUNT(*) as search_count
      FROM search_queries
      WHERE created_at >= NOW() - INTERVAL 24 HOUR
      GROUP BY hour
      ORDER BY hour DESC
      LIMIT 24
    `.execute(db);

    // 6. Top search terms
    const topSearchTerms = await sql<{
      query_text: string;
      search_count: number;
      avg_results: number;
    }>`
      SELECT
        query_text,
        COUNT(*) as search_count,
        AVG(results_count) as avg_results
      FROM search_queries
      GROUP BY query_text
      ORDER BY search_count DESC
      LIMIT 5
    `.execute(db);

    // 7. Performance metrics
    const performanceMetrics = await sql<{
      min_response_time: number;
      max_response_time: number;
    }>`
      SELECT
        MIN(response_time_ms) as min_response_time,
        MAX(response_time_ms) as max_response_time
      FROM search_queries
      WHERE response_time_ms IS NOT NULL
    `.execute(db);

    return NextResponse.json({
      searchTypeStats: searchTypeStats.rows,
      recentSearches: recentSearches,
      inventoryStats: inventoryStats.rows,
      overallMetrics: overallMetrics.rows[0],
      searchTrend: searchTrend.rows,
      topSearchTerms: topSearchTerms.rows,
      performanceMetrics: performanceMetrics.rows[0],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Analytics query failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
