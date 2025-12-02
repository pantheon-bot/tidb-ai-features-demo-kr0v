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
  topSearchTerms?: Array<{
    query_text: string;
    search_count: number;
    avg_results: number;
  }>;
  performanceMetrics?: {
    min_response_time: number;
    max_response_time: number;
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
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [trending, setTrending] = useState<any>(null);

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

  const loadRecommendations = async (productId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/recommendations?productId=${productId}&limit=5`);
      if (!response.ok) {
        throw new Error('Failed to load recommendations');
      }
      const data = await response.json();
      setRecommendations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const loadTrending = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/trending');
      if (!response.ok) {
        throw new Error('Failed to load trending');
      }
      const data = await response.json();
      setTrending(data);
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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="vector">Vector Search</TabsTrigger>
            <TabsTrigger value="hybrid">Hybrid Search</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
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

          <TabsContent value="recommendations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>AI-Powered Product Recommendations</CardTitle>
                <CardDescription>
                  Find similar products using vector embeddings - TiDB calculates cosine similarity in real-time
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {searchResult && searchResult.results.length > 0 && (
                  <div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                      Select a product from your search results to see similar items:
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {searchResult.results.slice(0, 6).map((product) => (
                        <Button
                          key={product.id}
                          variant={selectedProductId === product.id ? "default" : "outline"}
                          onClick={() => {
                            setSelectedProductId(product.id);
                            loadRecommendations(product.id);
                          }}
                          className="h-auto py-3 text-left justify-start"
                          disabled={loading}
                        >
                          <div className="truncate">
                            <div className="font-medium text-sm truncate">{product.name}</div>
                            <div className="text-xs opacity-70">${typeof product.price === 'number' ? product.price.toFixed(2) : parseFloat(product.price).toFixed(2)}</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {!searchResult && (
                  <div className="text-center py-8">
                    <p className="text-zinc-500">Run a search first to see product recommendations</p>
                  </div>
                )}

                {recommendations && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-3">
                      Products similar to &quot;{recommendations.productName}&quot;
                    </h3>
                    <div className="space-y-3">
                      {recommendations.recommendations.map((rec: any) => (
                        <Card key={rec.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="font-medium">{rec.name}</div>
                                <div className="text-sm text-zinc-500 mt-1">{rec.category}</div>
                                <div className="text-xs text-zinc-400 mt-2 line-clamp-2">{rec.description}</div>
                              </div>
                              <div className="text-right ml-4">
                                <Badge variant="outline" className="mb-2">
                                  {(rec.similarity_score * 100).toFixed(1)}% match
                                </Badge>
                                <div className="font-bold">${typeof rec.price === 'number' ? rec.price.toFixed(2) : parseFloat(rec.price).toFixed(2)}</div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Trending Products & Insights</CardTitle>
                <CardDescription>
                  Real-time analysis of search patterns and product popularity using TiDB's analytical capabilities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={loadTrending} disabled={loading} className="mb-4">
                  {loading ? 'Loading...' : 'Load Trending Data'}
                </Button>
              </CardContent>
            </Card>

            {trending && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Hot Products</CardTitle>
                    <CardDescription>Most searched products in the last 24 hours</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {trending.trendingProducts.slice(0, 5).map((product: any, index: number) => (
                        <div key={product.id} className="flex items-center gap-4 p-3 bg-zinc-100 dark:bg-zinc-900 rounded">
                          <div className="text-2xl font-bold text-zinc-400 w-8">#{index + 1}</div>
                          <div className="flex-1">
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-zinc-500">{product.category} • ${product.price.toFixed(2)}</div>
                          </div>
                          <div className="text-right">
                            <Badge>{product.recent_searches} recent</Badge>
                            <div className="text-xs text-zinc-500 mt-1">{product.mention_count} total</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Category Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {trending.categoryTrends.map((cat: any) => (
                        <div key={cat.category} className="flex justify-between items-center p-2">
                          <span className="font-medium">{cat.category}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-zinc-500">{cat.total_searches} searches</span>
                            {cat.growth_rate > 0 && (
                              <Badge variant="default">↑ {cat.growth_rate.toFixed(0)}%</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
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
                          ${typeof product.price === 'number' ? product.price.toFixed(2) : parseFloat(product.price).toFixed(2)}
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
                      {analytics.overallMetrics.avg_search_time_ms ? parseFloat(String(analytics.overallMetrics.avg_search_time_ms)).toFixed(0) : '0'}ms
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
                        {stat.total_searches} searches • {parseFloat(String(stat.avg_response_time_ms)).toFixed(0)}ms avg • {parseFloat(String(stat.avg_results_count)).toFixed(1)} results avg
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
                          {stat.total_products} products • {stat.total_stock} units • ${parseFloat(String(stat.avg_price)).toFixed(2)} avg
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

            <Card>
              <CardHeader>
                <CardTitle>Recent Search History</CardTitle>
                <CardDescription>
                  Real-time search activity showing queries as they happen (OLTP writes with instant OLAP reads)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analytics.recentSearches.length > 0 ? (
                  <div className="space-y-2">
                    {analytics.recentSearches.map((search, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 bg-zinc-100 dark:bg-zinc-900 rounded"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-sm text-zinc-900 dark:text-zinc-50">
                            &quot;{search.query_text}&quot;
                          </div>
                          <div className="text-xs text-zinc-500">
                            {new Date(search.created_at).toLocaleString()}
                          </div>
                        </div>
                        <Badge variant="secondary">{search.search_type}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-zinc-500">No searches yet. Try running a search above!</p>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Query Performance Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">Fastest Query</span>
                      <Badge variant="outline">
                        {analytics.performanceMetrics
                          ? `${parseFloat(String(analytics.performanceMetrics.min_response_time)).toFixed(0)}ms`
                          : analytics.searchTypeStats.length > 0
                          ? `${Math.min(...analytics.searchTypeStats.map(s => parseFloat(String(s.avg_response_time_ms)))).toFixed(0)}ms`
                          : 'N/A'
                        }
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">Average Query</span>
                      <Badge variant="outline">
                        {analytics.overallMetrics.avg_search_time_ms
                          ? `${parseFloat(String(analytics.overallMetrics.avg_search_time_ms)).toFixed(0)}ms`
                          : 'N/A'
                        }
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">Slowest Query</span>
                      <Badge variant="outline">
                        {analytics.performanceMetrics
                          ? `${parseFloat(String(analytics.performanceMetrics.max_response_time)).toFixed(0)}ms`
                          : analytics.searchTypeStats.length > 0
                          ? `${Math.max(...analytics.searchTypeStats.map(s => parseFloat(String(s.avg_response_time_ms)))).toFixed(0)}ms`
                          : 'N/A'
                        }
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">Total Query Volume</span>
                      <Badge variant="outline">{analytics.overallMetrics.total_searches}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Search Type Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.searchTypeStats.map((stat) => {
                      const percentage = (stat.total_searches / analytics.overallMetrics.total_searches * 100).toFixed(1);
                      return (
                        <div key={stat.search_type} className="space-y-1">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-zinc-600 dark:text-zinc-400 capitalize">{stat.search_type}</span>
                            <span className="font-medium">{percentage}%</span>
                          </div>
                          <div className="h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {analytics.topSearchTerms && analytics.topSearchTerms.length > 0 && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Top Search Terms</CardTitle>
                  <CardDescription>
                    Most frequently searched queries with their performance metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analytics.topSearchTerms.map((term, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 bg-zinc-100 dark:bg-zinc-900 rounded"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-sm">&quot;{term.query_text}&quot;</div>
                          <div className="text-xs text-zinc-500">
                            Avg {parseFloat(String(term.avg_results)).toFixed(1)} results per search
                          </div>
                        </div>
                        <Badge>{term.search_count} searches</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
