import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { sql } from 'kysely';

export async function GET() {
  try {
    // Products mentioned most in searches (based on name/description matches)
    const trendingProducts = await sql<{
      id: number;
      name: string;
      description: string;
      category: string;
      price: string;
      tags: string;
      stock_quantity: number;
      mention_count: number;
      recent_searches: number;
    }>`
      SELECT
        p.id,
        p.name,
        p.description,
        p.category,
        p.price,
        p.tags,
        p.stock_quantity,
        COUNT(DISTINCT sq.id) as mention_count,
        SUM(CASE WHEN sq.created_at >= NOW() - INTERVAL 24 HOUR THEN 1 ELSE 0 END) as recent_searches
      FROM products p
      LEFT JOIN search_queries sq ON (
        sq.query_text LIKE CONCAT('%', SUBSTRING_INDEX(p.name, ' ', 1), '%')
        OR sq.query_text LIKE CONCAT('%', p.category, '%')
      )
      GROUP BY p.id, p.name, p.description, p.category, p.price, p.tags, p.stock_quantity
      HAVING mention_count > 0
      ORDER BY recent_searches DESC, mention_count DESC
      LIMIT 10
    `.execute(db);

    // Category trends
    const categoryTrends = await sql<{
      category: string;
      total_searches: number;
      growth_rate: number;
    }>`
      SELECT
        category,
        COUNT(*) as total_searches,
        (COUNT(CASE WHEN created_at >= NOW() - INTERVAL 7 DAY THEN 1 END) /
         NULLIF(COUNT(CASE WHEN created_at < NOW() - INTERVAL 7 DAY AND created_at >= NOW() - INTERVAL 14 DAY THEN 1 END), 0) - 1) * 100 as growth_rate
      FROM products p
      JOIN search_queries sq ON sq.query_text LIKE CONCAT('%', p.category, '%')
      GROUP BY category
      ORDER BY total_searches DESC
    `.execute(db);

    // Search velocity (queries per hour in last 24h)
    const searchVelocity = await sql<{
      avg_queries_per_hour: number;
      peak_hour_count: number;
    }>`
      SELECT
        COUNT(*) / 24 as avg_queries_per_hour,
        MAX(hourly_count) as peak_hour_count
      FROM (
        SELECT DATE_FORMAT(created_at, '%Y-%m-%d %H:00') as hour, COUNT(*) as hourly_count
        FROM search_queries
        WHERE created_at >= NOW() - INTERVAL 24 HOUR
        GROUP BY hour
      ) hourly_stats
    `.execute(db);

    return NextResponse.json({
      trendingProducts: trendingProducts.rows.map(row => ({
        ...row,
        tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags,
        price: parseFloat(row.price),
      })),
      categoryTrends: categoryTrends.rows,
      searchVelocity: searchVelocity.rows[0],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Trending error:', error);
    return NextResponse.json(
      { error: 'Failed to get trending data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
