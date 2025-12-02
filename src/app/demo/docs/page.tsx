import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header>
          <Link href="/demo" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50">
            ← Back to Demo
          </Link>
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mt-4 mb-2">
            TiDB AI Features Documentation
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Learn about the AI capabilities showcased in this demo
          </p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-zinc-700 dark:text-zinc-300">
            <p>
              This demo showcases TiDB Cloud&apos;s AI-native database capabilities, highlighting how TiDB combines
              OLTP (transactional), OLAP (analytical), and vector search workloads in a single unified platform.
            </p>
            <p>
              TiDB is purpose-built for AI applications, offering native vector search, real-time analytics on
              fresh data, and seamless integration with popular AI frameworks and embedding models.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feature 1: Vector Search with Embeddings</CardTitle>
            <Badge className="mt-2">Semantic Search</Badge>
          </CardHeader>
          <CardContent className="space-y-4 text-zinc-700 dark:text-zinc-300">
            <h3 className="font-semibold text-lg">What it does:</h3>
            <p>
              TiDB stores high-dimensional vector embeddings (1536 dimensions from OpenAI&apos;s text-embedding-3-small)
              directly in VECTOR columns. The demo generates embeddings from product names and descriptions, enabling
              semantic search that understands meaning rather than just keywords.
            </p>

            <h3 className="font-semibold text-lg mt-4">How it works:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>User queries are converted to embeddings using OpenAI&apos;s API</li>
              <li>TiDB performs cosine distance calculations using VEC_COSINE_DISTANCE()</li>
              <li>Results are ranked by semantic similarity, not just keyword matching</li>
              <li>Vector indexes (HNSW algorithm) enable fast similarity search at scale</li>
            </ul>

            <h3 className="font-semibold text-lg mt-4">Why it matters:</h3>
            <p>
              Traditional keyword search fails on queries like &quot;comfortable chair for long work hours&quot; if products
              don&apos;t contain those exact words. Vector search understands context and finds the ergonomic office
              chair even if the description uses different terminology.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feature 2: Hybrid Search</CardTitle>
            <Badge className="mt-2">Vector + Structured Filters</Badge>
          </CardHeader>
          <CardContent className="space-y-4 text-zinc-700 dark:text-zinc-300">
            <h3 className="font-semibold text-lg">What it does:</h3>
            <p>
              Combines semantic vector search with traditional SQL filters (category, price range, availability).
              This gives users the power of natural language search while maintaining precise control over results.
            </p>

            <h3 className="font-semibold text-lg mt-4">How it works:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>Vector similarity search provides semantic ranking</li>
              <li>SQL WHERE clauses filter by structured attributes (category, price)</li>
              <li>Both operations run in a single query with optimal performance</li>
              <li>No need for separate vector databases and relational databases</li>
            </ul>

            <h3 className="font-semibold text-lg mt-4">Why it matters:</h3>
            <p>
              E-commerce and recommendation systems need both semantic understanding and business logic.
              With TiDB, you can search for &quot;wireless audio device&quot; AND filter by price range $50-$100
              in a single efficient query, without managing multiple data stores.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feature 3: Real-Time Analytics (OLTP + OLAP)</CardTitle>
            <Badge className="mt-2">Unified Workloads</Badge>
          </CardHeader>
          <CardContent className="space-y-4 text-zinc-700 dark:text-zinc-300">
            <h3 className="font-semibold text-lg">What it does:</h3>
            <p>
              TiDB runs complex analytical queries (aggregations, groupings, trends) on the same data being
              actively updated by transactions. The analytics tab shows real-time metrics computed from
              fresh transactional data with zero ETL lag.
            </p>

            <h3 className="font-semibold text-lg mt-4">How it works:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>Every search query is immediately written to the search_queries table (OLTP)</li>
              <li>Analytics queries aggregate across all searches in real-time (OLAP)</li>
              <li>No batch processing, data warehousing, or ETL pipelines required</li>
              <li>TiDB&apos;s architecture separates storage and compute for optimal performance</li>
            </ul>

            <h3 className="font-semibold text-lg mt-4">Why it matters:</h3>
            <p>
              AI applications need to make decisions based on the freshest data. With TiDB, your recommendation
              system can analyze user behavior patterns, inventory trends, and search performance in real-time
              to deliver personalized results instantly.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Technical Implementation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-zinc-700 dark:text-zinc-300">
            <h3 className="font-semibold text-lg">Stack:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Database:</strong> TiDB Cloud Serverless (MySQL-compatible)</li>
              <li><strong>Vector Storage:</strong> VECTOR(1536) columns with HNSW indexes</li>
              <li><strong>Embeddings:</strong> OpenAI text-embedding-3-small (1536 dimensions)</li>
              <li><strong>Query Builder:</strong> Kysely (type-safe SQL)</li>
              <li><strong>Framework:</strong> Next.js 16 with App Router</li>
              <li><strong>UI:</strong> React Server Components + Tailwind CSS + shadcn/ui</li>
            </ul>

            <h3 className="font-semibold text-lg mt-4">Key SQL Operations:</h3>
            <pre className="bg-zinc-900 text-zinc-50 p-4 rounded-lg overflow-x-auto">
{`-- Vector similarity search
SELECT *, VEC_COSINE_DISTANCE(embedding, '[...]') as distance
FROM products
ORDER BY distance ASC
LIMIT 5;

-- Hybrid search with filters
SELECT *, VEC_COSINE_DISTANCE(embedding, '[...]') as distance
FROM products
WHERE category = 'Electronics'
  AND price BETWEEN 50 AND 200
ORDER BY distance ASC;

-- Real-time analytics
SELECT category, COUNT(*), AVG(price), SUM(stock_quantity)
FROM products
GROUP BY category;`}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-zinc-700 dark:text-zinc-300">
            <h3 className="font-semibold text-lg">Run the demo locally:</h3>
            <pre className="bg-zinc-900 text-zinc-50 p-4 rounded-lg overflow-x-auto">
{`# Install dependencies
npm install

# Set up environment variables
# Add DATABASE_URL and OPENAI_API_KEY to .env.local

# Run migrations
npm run migrate

# Seed sample data with embeddings
npm run seed

# Start dev server
npm run dev

# Open http://localhost:3000/demo`}
            </pre>

            <h3 className="font-semibold text-lg mt-4">Try these searches:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>&quot;comfortable chair for working from home&quot;</li>
              <li>&quot;portable audio equipment for outdoors&quot;</li>
              <li>&quot;eco-friendly kitchen items&quot;</li>
              <li>&quot;gear for staying active and healthy&quot;</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Learn More</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-zinc-700 dark:text-zinc-300">
              <li>
                <a
                  href="https://www.pingcap.com/ai/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  TiDB for AI Applications →
                </a>
              </li>
              <li>
                <a
                  href="https://docs.pingcap.com/tidbcloud/vector-search-overview"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Vector Search Documentation →
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/pingcap/tidb"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  TiDB on GitHub →
                </a>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
