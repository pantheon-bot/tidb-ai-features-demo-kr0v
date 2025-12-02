import OpenAI from 'openai';
import db from './db';
import { sql } from 'kysely';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Sample product data showcasing various categories
const sampleProducts = [
  {
    name: 'Premium Wireless Headphones',
    description: 'High-fidelity wireless headphones with active noise cancellation, 30-hour battery life, and premium leather cushions. Perfect for audiophiles and professionals who demand the best sound quality.',
    category: 'Electronics',
    price: 299.99,
    tags: JSON.stringify(['audio', 'wireless', 'noise-cancelling', 'premium']),
    stock_quantity: 150,
  },
  {
    name: 'Smart Fitness Tracker',
    description: 'Advanced fitness tracker with heart rate monitoring, sleep tracking, GPS, and waterproof design. Syncs with your smartphone for comprehensive health insights and workout analytics.',
    category: 'Electronics',
    price: 129.99,
    tags: JSON.stringify(['fitness', 'wearable', 'health', 'sports']),
    stock_quantity: 300,
  },
  {
    name: 'Organic Green Tea Collection',
    description: 'Premium organic green tea sourced from Japanese tea gardens. Rich in antioxidants, this collection includes matcha, sencha, and jasmine varieties. Perfect for tea enthusiasts seeking authentic flavors.',
    category: 'Food & Beverages',
    price: 24.99,
    tags: JSON.stringify(['organic', 'tea', 'healthy', 'beverage']),
    stock_quantity: 500,
  },
  {
    name: 'Professional Camera Tripod',
    description: 'Lightweight yet sturdy aluminum tripod with fluid head for smooth panning. Supports DSLR and mirrorless cameras up to 15 lbs. Ideal for landscape photography and video production.',
    category: 'Photography',
    price: 89.99,
    tags: JSON.stringify(['photography', 'video', 'equipment', 'professional']),
    stock_quantity: 75,
  },
  {
    name: 'Ergonomic Office Chair',
    description: 'Premium ergonomic office chair with lumbar support, adjustable armrests, and breathable mesh back. Designed for all-day comfort during long work sessions. Supports up to 300 lbs.',
    category: 'Furniture',
    price: 349.99,
    tags: JSON.stringify(['office', 'furniture', 'ergonomic', 'comfort']),
    stock_quantity: 50,
  },
  {
    name: 'Stainless Steel Cookware Set',
    description: '12-piece professional-grade stainless steel cookware set. Includes pots, pans, and lids with tri-ply construction for even heat distribution. Dishwasher safe and oven safe up to 500°F.',
    category: 'Kitchen',
    price: 199.99,
    tags: JSON.stringify(['kitchen', 'cookware', 'stainless-steel', 'professional']),
    stock_quantity: 120,
  },
  {
    name: 'Portable Bluetooth Speaker',
    description: 'Compact waterproof Bluetooth speaker with 360-degree sound. Features 12-hour battery life, built-in microphone for calls, and IPX7 waterproof rating. Perfect for outdoor adventures.',
    category: 'Electronics',
    price: 79.99,
    tags: JSON.stringify(['audio', 'bluetooth', 'portable', 'waterproof']),
    stock_quantity: 250,
  },
  {
    name: 'Yoga Mat with Carrying Strap',
    description: 'Extra-thick 6mm yoga mat with non-slip surface and carrying strap. Made from eco-friendly TPE material. Provides excellent cushioning for yoga, pilates, and floor exercises.',
    category: 'Sports',
    price: 34.99,
    tags: JSON.stringify(['yoga', 'fitness', 'exercise', 'eco-friendly']),
    stock_quantity: 200,
  },
  {
    name: 'LED Desk Lamp',
    description: 'Modern LED desk lamp with touch controls and adjustable brightness levels. Features USB charging port and flexible gooseneck design. Energy-efficient and eye-friendly lighting for reading and work.',
    category: 'Lighting',
    price: 45.99,
    tags: JSON.stringify(['lighting', 'led', 'desk', 'adjustable']),
    stock_quantity: 180,
  },
  {
    name: 'Hardcover Notebook Set',
    description: 'Set of 3 premium hardcover notebooks with dotted pages. Features elastic band closure, pen loop, and expandable inner pocket. Ideal for journaling, sketching, and note-taking.',
    category: 'Stationery',
    price: 29.99,
    tags: JSON.stringify(['notebook', 'stationery', 'writing', 'journal']),
    stock_quantity: 400,
  },
  {
    name: 'Wireless Gaming Mouse',
    description: 'High-precision wireless gaming mouse with customizable RGB lighting and programmable buttons. Features 16,000 DPI sensor and 70-hour battery life. Perfect for competitive gaming.',
    category: 'Electronics',
    price: 69.99,
    tags: JSON.stringify(['gaming', 'mouse', 'wireless', 'rgb']),
    stock_quantity: 220,
  },
  {
    name: 'Bamboo Cutting Board Set',
    description: 'Set of 3 eco-friendly bamboo cutting boards in different sizes. Naturally antibacterial and gentle on knife blades. Includes juice grooves and non-slip feet.',
    category: 'Kitchen',
    price: 39.99,
    tags: JSON.stringify(['kitchen', 'bamboo', 'eco-friendly', 'cutting-board']),
    stock_quantity: 150,
  },
];

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return response.data[0].embedding;
}

function vectorToString(vector: number[]): string {
  // TiDB vector format: '[1,2,3]' as a string literal
  return `'[${vector.join(',')}]'`;
}

export async function seedDatabase() {
  console.log('Starting database seeding...');
  console.log(`Generating embeddings for ${sampleProducts.length} products...`);

  // Clear existing data
  await db.deleteFrom('products').execute();
  console.log('✓ Cleared existing products');

  let successCount = 0;
  for (let i = 0; i < sampleProducts.length; i++) {
    const product = sampleProducts[i];
    try {
      // Generate embedding from name + description
      const embeddingText = `${product.name}. ${product.description}`;
      const embedding = await generateEmbedding(embeddingText);
      const vectorString = vectorToString(embedding);

      // Insert product with embedding
      await sql`
        INSERT INTO products (name, description, category, price, tags, stock_quantity, embedding)
        VALUES (
          ${product.name},
          ${product.description},
          ${product.category},
          ${product.price},
          ${product.tags},
          ${product.stock_quantity},
          ${sql.raw(vectorString)}
        )
      `.execute(db);

      successCount++;
      console.log(`✓ Inserted product ${i + 1}/${sampleProducts.length}: ${product.name}`);
    } catch (error) {
      console.error(`✗ Failed to insert ${product.name}:`, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  console.log(`\nSeeding completed! Successfully inserted ${successCount}/${sampleProducts.length} products.`);

  // Verify the data
  const count = await db.selectFrom('products').select(db.fn.count('id').as('count')).executeTakeFirst();
  console.log(`Total products in database: ${count?.count}`);
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}
