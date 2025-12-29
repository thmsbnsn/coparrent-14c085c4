import { useState, useMemo } from 'react';
import { Search, Scale, Book } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { FeatureErrorBoundary } from '@/components/ui/FeatureErrorBoundary';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { LawArticleListItem } from '@/components/law-articles/LawArticleListItem';
import { useLawArticles } from '@/hooks/useLawArticles';

const LawArticlesPageContent = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: articles, isLoading, error } = useLawArticles();

  const filteredArticles = useMemo(() => {
    if (!articles) return [];
    if (!searchQuery.trim()) return articles;

    const query = searchQuery.toLowerCase();
    return articles.filter(
      (article) =>
        article.title.toLowerCase().includes(query) ||
        article.article_number.toLowerCase().includes(query) ||
        article.summary?.toLowerCase().includes(query)
    );
  }, [articles, searchQuery]);

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="py-12 text-center">
          <p className="text-destructive">Failed to load law articles. Please try again later.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Scale className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Indiana Code Title 31</h1>
            <p className="text-sm text-muted-foreground">Family Law and Juvenile Law</p>
          </div>
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Stats */}
      {!isLoading && articles && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Book className="w-4 h-4" />
          <span>
            {filteredArticles.length} {filteredArticles.length === 1 ? 'article' : 'articles'}
            {searchQuery && ` matching "${searchQuery}"`}
          </span>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Articles Grid */}
      {!isLoading && filteredArticles.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredArticles.map((article, index) => (
            <LawArticleListItem key={article.id} article={article} index={index} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredArticles.length === 0 && searchQuery && (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No articles found</h3>
            <p className="text-sm text-muted-foreground">
              No articles match your search for "{searchQuery}". Try a different search term.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const LawArticlesPage = () => {
  return (
    <DashboardLayout>
      <FeatureErrorBoundary featureName="Law Articles">
        <LawArticlesPageContent />
      </FeatureErrorBoundary>
    </DashboardLayout>
  );
};

export default LawArticlesPage;
