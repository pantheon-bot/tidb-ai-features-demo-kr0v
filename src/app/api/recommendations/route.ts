import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { sql } from 'kysely';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productIdStr = searchParams.get('productId');
    const limit = parseInt(searchParams.get('limit') || '5');

    if (!productIdStr) {
      return NextResponse.json(
        { error: 'productId parameter is required' },
        { status: 400 }
      );
    }

    const productId = parseInt(productIdStr);

    // Get the product's embedding
    const product = await db
      .selectFrom('products')
      .select(['id', 'name', 'embedding'])
      .where('id', '=', productId)
      .executeTakeFirst();

    if (!product || !product.embedding) {
      return NextResponse.json(
        { error: 'Product not found or has no embedding' },
        { status: 404 }
      );
    }

    // Find similar products using vector distance
    const recommendations = await sql<{
      id: number;
      name: string;
      description: string;
      category: string;
      price: string;
      tags: string;
      similarity_score: number;
    }>`
      SELECT
        id,
        name,
        description,
        category,
        price,
        tags,
        (1 - VEC_COSINE_DISTANCE(embedding, ${product.embedding})) as similarity_score
      FROM products
      WHERE id != ${productId} AND embedding IS NOT NULL
      ORDER BY similarity_score DESC
      LIMIT ${sql.raw(limit.toString())}
    `.execute(db);

    return NextResponse.json({
      productId,
      productName: product.name,
      recommendations: recommendations.rows.map(row => ({
        ...row,
        tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags,
        similarity_score: parseFloat(String(row.similarity_score)),
      })),
    });
  } catch (error) {
    console.error('Recommendations error:', error);
    return NextResponse.json(
      { error: 'Failed to get recommendations', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
