"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  tags: string[];
  stock_quantity: number;
  similarity?: number;
}

interface SearchResult {
  query: string;
  results: Product[];
  responseTime: number;
  searchType: string;
  filters?: {
    category: string | null;
    minPrice: number | null;
    maxPrice: number | null;
  };
}

interface AnalyticsData {
  searchTypeStats: Array<{
    search_type: string;
    total_searches: number;
    avg_response_time_ms: number;
    avg_results_count: number;
  }>;
  recentSearches: Array<{
    query_text: string;
    search_type: string;
    created_at: string;
  }>;
  inventoryStats: Array<{
    category: string;
    total_products: number;
    total_stock: number;
    avg_price: number;
    low_stock_items: number;
  }>;
  overallMetrics: {
    total_products: number;
    total_searches: number;
    avg_search_time_ms: number;
  };
}

export default function TiDBAIDemo() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVectorSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/search/vector', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, limit: 5 }),
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setSearchResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleHybridSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/search/hybrid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          category: category || undefined,
          minPrice: minPrice ? parseFloat(minPrice) : undefined,
          maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
          limit: 5,
        }),
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setSearchResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/analytics');
      if (!response.ok) {
        throw new Error('Failed to load analytics');
      }
      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                TiDB AI Features Demo
              </h1>
              <p className="text-lg text-zinc-600 dark:text-zinc-400">
                Showcasing vector search, hybrid search, and real-time analytics with TiDB Cloud
              </p>
            </div>
            <Link href="/demo/docs">
              <Button variant="outline">Documentation</Button>
            </Link>
          </div>
        </header>

        <Tabs defaultValue="vector" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="vector">Vector Search</TabsTrigger>
            <TabsTrigger value="hybrid">Hybrid Search</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="vector" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Semantic Vector Search</CardTitle>
                <CardDescription>
                  Search products using natural language. TiDB generates embeddings and finds semantically similar items using cosine distance.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., 'comfortable chair for long work hours' or 'wireless audio device'"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleVectorSearch()}
                    className="flex-1"
                  />
                  <Button onClick={handleVectorSearch} disabled={loading}>
                    {loading ? 'Searching...' : 'Search'}
                  </Button>
                </div>
                {error && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md">
                    {error}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hybrid" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Hybrid Search (Vector + Filters)</CardTitle>
                <CardDescription>
                  Combine semantic search with structured filters like category and price range for precise results.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search query..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleHybridSearch()}
                    className="flex-1"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    placeholder="Category (optional)"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Min Price"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Max Price"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>
                <Button onClick={handleHybridSearch} disabled={loading} className="w-full">
                  {loading ? 'Searching...' : 'Search with Filters'}
                </Button>
                {error && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md">
                    {error}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Real-Time Analytics (OLTP + OLAP)</CardTitle>
                <CardDescription>
                  TiDB runs transactional and analytical queries on the same fresh data with zero ETL lag.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={loadAnalytics} disabled={loading} className="mb-4">
                  {loading ? 'Loading...' : 'Load Analytics Dashboard'}
                </Button>
                {error && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md">
                    {error}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {searchResult && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Search Results</CardTitle>
              <CardDescription>
                Found {searchResult.results.length} results in {searchResult.responseTime}ms
                {searchResult.searchType === 'hybrid' && searchResult.filters && (
                  <span>
                    {' '}• Filters: {searchResult.filters.category && `Category: ${searchResult.filters.category}`}
                    {searchResult.filters.minPrice && ` Min: $${searchResult.filters.minPrice}`}
                    {searchResult.filters.maxPrice && ` Max: $${searchResult.filters.maxPrice}`}
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {searchResult.results.map((product) => (
                <Card key={product.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{product.name}</CardTitle>
                        <div className="flex gap-2 mt-2">
                          <Badge>{product.category}</Badge>
                          {product.similarity && (
                            <Badge variant="outline">
                              {(product.similarity * 100).toFixed(1)}% match
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                          ${product.price.toFixed(2)}
                        </div>
                        <div className="text-sm text-zinc-500">
                          {product.stock_quantity} in stock
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-zinc-600 dark:text-zinc-400 mb-2">
                      {product.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {product.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        )}

        {analytics && (
          <div className="mt-6 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Overall Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                      {analytics.overallMetrics.total_products}
                    </div>
                    <div className="text-sm text-zinc-500">Total Products</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                      {analytics.overallMetrics.total_searches}
                    </div>
                    <div className="text-sm text-zinc-500">Total Searches</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                      {analytics.overallMetrics.avg_search_time_ms?.toFixed(0)}ms
                    </div>
                    <div className="text-sm text-zinc-500">Avg Response Time</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Search Type Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.searchTypeStats.map((stat) => (
                    <div key={stat.search_type} className="flex justify-between items-center p-3 bg-zinc-100 dark:bg-zinc-900 rounded">
                      <Badge>{stat.search_type}</Badge>
                      <span className="text-sm">
                        {stat.total_searches} searches • {stat.avg_response_time_ms.toFixed(0)}ms avg • {stat.avg_results_count.toFixed(1)} results avg
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Inventory by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.inventoryStats.map((stat) => (
                    <div key={stat.category} className="flex justify-between items-center p-3 bg-zinc-100 dark:bg-zinc-900 rounded">
                      <div>
                        <div className="font-semibold">{stat.category}</div>
                        <div className="text-sm text-zinc-500">
                          {stat.total_products} products • {stat.total_stock} units • ${stat.avg_price.toFixed(2)} avg
                        </div>
                      </div>
                      {stat.low_stock_items > 0 && (
                        <Badge variant="destructive">{stat.low_stock_items} low stock</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
