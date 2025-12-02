import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import db from '@/lib/db';
import { sql } from 'kysely';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const { query, category, minPrice, maxPrice, limit = 5 } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    // Generate embedding for the search query
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
    });
    const queryEmbedding = embeddingResponse.data[0].embedding;
    const vectorString = `'[${queryEmbedding.join(',')}]'`;

    // Build hybrid search query: Vector similarity + structured filters
    let searchQuery = sql<{
      id: number;
      name: string;
      description: string;
      category: string;
      price: number;
      tags: string;
      stock_quantity: number;
      distance: number;
    }>`
      SELECT
        id,
        name,
        description,
        category,
        price,
        tags,
        stock_quantity,
        VEC_COSINE_DISTANCE(embedding, ${sql.raw(vectorString)}) as distance
      FROM products
      WHERE embedding IS NOT NULL
    `;

    // Add category filter
    if (category) {
      searchQuery = sql`${searchQuery} AND category = ${category}`;
    }

    // Add price range filters
    if (minPrice !== undefined) {
      searchQuery = sql`${searchQuery} AND price >= ${minPrice}`;
    }
    if (maxPrice !== undefined) {
      searchQuery = sql`${searchQuery} AND price <= ${maxPrice}`;
    }

    // Order by similarity and limit results
    searchQuery = sql`${searchQuery} ORDER BY distance ASC LIMIT ${sql.raw(limit.toString())}`;

    const results = await searchQuery.execute(db);

    const responseTime = Date.now() - startTime;

    // Log search query to analytics table
    await db
      .insertInto('search_queries')
      .values({
        query_text: query,
        search_type: 'hybrid',
        results_count: results.rows.length,
        response_time_ms: responseTime,
      })
      .execute();

    return NextResponse.json({
      query,
      filters: {
        category: category || null,
        minPrice: minPrice || null,
        maxPrice: maxPrice || null,
      },
      results: results.rows.map(row => ({
        ...row,
        tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags,
        similarity: 1 - row.distance,
      })),
      responseTime,
      searchType: 'hybrid',
    });
  } catch (error) {
    console.error('Hybrid search error:', error);
    return NextResponse.json(
      { error: 'Search failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
