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
    const { query, limit = 5 } = await request.json();

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

    // Perform vector similarity search using TiDB's VEC_COSINE_DISTANCE
    const results = await sql<{
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
      ORDER BY distance ASC
      LIMIT ${sql.raw(limit.toString())}
    `.execute(db);

    const responseTime = Date.now() - startTime;

    // Log search query to analytics table
    await db
      .insertInto('search_queries')
      .values({
        query_text: query,
        search_type: 'vector',
        results_count: results.rows.length,
        response_time_ms: responseTime,
      })
      .execute();

    return NextResponse.json({
      query,
      results: results.rows.map(row => ({
        ...row,
        tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags,
        similarity: 1 - row.distance, // Convert distance to similarity score
      })),
      responseTime,
      searchType: 'vector',
    });
  } catch (error) {
    console.error('Vector search error:', error);
    return NextResponse.json(
      { error: 'Search failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
