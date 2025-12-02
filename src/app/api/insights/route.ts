import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { sql } from 'kysely';

export async function GET() {
  try {
    // 1. Query volume trend (hourly for last 24 hours)
    const hourlyTrend = await sql<{
      hour: string;
      vector_count: number;
      hybrid_count: number;
      total_count: number;
    }>`
      SELECT
        DATE_FORMAT(created_at, '%Y-%m-%d %H:00') as hour,
        SUM(CASE WHEN search_type = 'vector' THEN 1 ELSE 0 END) as vector_count,
        SUM(CASE WHEN search_type = 'hybrid' THEN 1 ELSE 0 END) as hybrid_count,
        COUNT(*) as total_count
      FROM search_queries
      WHERE created_at >= NOW() - INTERVAL 24 HOUR
      GROUP BY hour
      ORDER BY hour ASC
    `.execute(db);

    // 2. Query complexity analysis
    const complexityAnalysis = await sql<{
      avg_query_length: number;
      min_query_length: number;
      max_query_length: number;
      avg_results: number;
    }>`
      SELECT
        AVG(CHAR_LENGTH(query_text)) as avg_query_length,
        MIN(CHAR_LENGTH(query_text)) as min_query_length,
        MAX(CHAR_LENGTH(query_text)) as max_query_length,
        AVG(results_count) as avg_results
      FROM search_queries
    `.execute(db);

    // 3. Search effectiveness (zero results analysis)
    const effectiveness = await sql<{
      total_searches: number;
      zero_results_count: number;
      success_rate: number;
    }>`
      SELECT
        COUNT(*) as total_searches,
        SUM(CASE WHEN results_count = 0 THEN 1 ELSE 0 END) as zero_results_count,
        (1 - SUM(CASE WHEN results_count = 0 THEN 1 ELSE 0 END) / COUNT(*)) * 100 as success_rate
      FROM search_queries
    `.execute(db);

    // 4. Category search distribution
    const categoryDistribution = await sql<{
      category: string;
      search_count: number;
      avg_results: number;
    }>`
      SELECT
        p.category,
        COUNT(DISTINCT sq.id) as search_count,
        AVG(sq.results_count) as avg_results
      FROM search_queries sq
      JOIN products p ON FIND_IN_SET(LOWER(p.category), LOWER(sq.query_text)) > 0
        OR sq.query_text LIKE CONCAT('%', p.category, '%')
      GROUP BY p.category
      ORDER BY search_count DESC
      LIMIT 10
    `.execute(db);

    // 5. Response time percentiles
    const responsePercentiles = await sql<{
      p25: number;
      p50: number;
      p75: number;
      p95: number;
    }>`
      SELECT
        PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY response_time_ms) as p25,
        PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY response_time_ms) as p50,
        PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY response_time_ms) as p75,
        PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY response_time_ms) as p95
      FROM search_queries
    `.execute(db);

    // 6. Peak usage times
    const peakUsage = await sql<{
      hour_of_day: number;
      search_count: number;
    }>`
      SELECT
        HOUR(created_at) as hour_of_day,
        COUNT(*) as search_count
      FROM search_queries
      WHERE created_at >= NOW() - INTERVAL 7 DAY
      GROUP BY hour_of_day
      ORDER BY search_count DESC
      LIMIT 5
    `.execute(db);

    return NextResponse.json({
      hourlyTrend: hourlyTrend.rows,
      complexityAnalysis: complexityAnalysis.rows[0],
      effectiveness: effectiveness.rows[0],
      categoryDistribution: categoryDistribution.rows,
      responsePercentiles: responsePercentiles.rows[0] || null,
      peakUsage: peakUsage.rows,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Insights error:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
