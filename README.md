# TiDB AI Features Demo

This demo showcases the AI-native capabilities of TiDB Cloud, demonstrating how TiDB unifies OLTP (transactional), OLAP (analytical), and vector search workloads in a single database.

## Features Demonstrated

### 1. **Vector Search with Embeddings**
- Semantic search using OpenAI embeddings (text-embedding-3-small, 1536 dimensions)
- Native VECTOR columns in TiDB for storing high-dimensional embeddings
- Cosine distance similarity search using `VEC_COSINE_DISTANCE()`
- HNSW vector indexes for fast similarity search at scale

### 2. **Hybrid Search (Vector + Structured Filters)**
- Combines semantic vector search with traditional SQL filters
- Search by natural language AND filter by category, price range, etc.
- Single unified query without multiple data stores
- Demonstrates TiDB's ability to handle both unstructured (embeddings) and structured (relational) data

### 3. **Real-Time Analytics (OLTP + OLAP)**
- Complex analytical queries on fresh transactional data
- Zero ETL lag - analytics run on the same data being actively updated
- Aggregations, groupings, and trends computed in real-time
- Showcases TiDB's unified architecture for mixed workloads

## Tech Stack

- **Framework:** Next.js 16 with App Router and React Server Components
- **Database:** TiDB Cloud Serverless (MySQL-compatible)
- **Query Builder:** Kysely (type-safe SQL)
- **Embeddings:** OpenAI text-embedding-3-small
- **UI:** Tailwind CSS + shadcn/ui components
- **Driver:** mysql2 with TLS 1.2+

## Getting Started

### Prerequisites

1. **TiDB Cloud account** - Get your `DATABASE_URL` from [TiDB Cloud Console](https://tidbcloud.com/)
2. **OpenAI API key** - Get your API key from [OpenAI Platform](https://platform.openai.com/)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file in the project root:
```bash
DATABASE_URL=mysql://[user]:[password]@[host]/[database]
OPENAI_API_KEY=sk-...
```

3. Run database migrations:
```bash
npm run migrate
```

4. Seed sample data with embeddings:
```bash
npm run seed
```
This will insert 12 sample products and generate embeddings for each using OpenAI's API.

5. Start the development server:
```bash
npm run dev
```

6. Open the demo:
- **Homepage:** [http://localhost:3000](http://localhost:3000)
- **Demo App:** [http://localhost:3000/demo](http://localhost:3000/demo)
- **Documentation:** [http://localhost:3000/demo/docs](http://localhost:3000/demo/docs)

## Example Queries to Try

Once the demo is running, try these semantic search queries:

- "comfortable chair for working from home" → finds the Ergonomic Office Chair
- "portable audio equipment for outdoors" → finds the Portable Bluetooth Speaker
- "eco-friendly kitchen items" → finds the Bamboo Cutting Board Set
- "gear for staying active and healthy" → finds the Yoga Mat and Fitness Tracker
- "high quality sound devices" → finds wireless headphones and speakers

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── search/
│   │   │   ├── vector/route.ts      # Vector similarity search endpoint
│   │   │   └── hybrid/route.ts      # Hybrid search with filters
│   │   └── analytics/route.ts       # Real-time analytics endpoint
│   ├── demo/
│   │   ├── page.tsx                 # Main demo UI
│   │   └── docs/page.tsx            # Feature documentation
│   └── page.tsx                     # Landing page
└── lib/
    └── db/
        ├── db.ts                     # Kysely database instance
        ├── schema.d.ts               # TypeScript types for tables
        ├── migrate.ts                # Migration runner
        ├── seed.ts                   # Data seeding script
        └── migrations/
            └── 001_create_tables.sql # Vector-enabled schema
```

## Database Schema

### Products Table
- `id` - Primary key
- `name`, `description` - Product information
- `category`, `price`, `stock_quantity` - Structured attributes
- `tags` - JSON array for flexible metadata
- `embedding` - **VECTOR(1536)** column for semantic search
- Vector index using HNSW algorithm for fast similarity search

### Search Queries Table
- Logs every search for real-time analytics
- Captures query text, search type, results count, and response time
- Demonstrates OLTP writes with immediate OLAP queries

## Learn More

To learn more about this template, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [TiDB Cloud Starter Documents](https://docs.pingcap.com/tidbcloud/) - learn about TiDB Cloud.
  - [Vector search in TiDB](https://pingcap.github.io/ai/guides/vector-search/#__tabbed_1_2)
- [Kysely](https://kysely.dev/) - the type-safe SQL query builder for TypeScript
- [mysql2](https://github.com/sidorares/node-mysql2) - MySQL client for Node.js
- [shadcn/ui](https://ui.shadcn.com/) - a popular UI library for React.
