import { useState, useMemo, useCallback, useEffect } from 'react';
import { Search, Scale, Book, Filter, ArrowUpDown } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { FeatureErrorBoundary } from '@/components/ui/FeatureErrorBoundary';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LawArticleListItem } from '@/components/law-articles/LawArticleListItem';
import { useLawArticles, LawArticle } from '@/hooks/useLawArticles';

type FilterType = 'all' | 'core' | 'definitions' | 'repealed' | 'auth';
type SortType = 'article' | 'title';

const CORE_ARTICLES = ['17', '34', '35'];
const DEFINITION_ARTICLES = ['9'];

const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'core', label: 'Core' },
  { value: 'definitions', label: 'Definitions' },
  { value: 'repealed', label: 'Repealed' },
  { value: 'auth', label: 'Auth-only' },
];

const SORT_OPTIONS: { value: SortType; label: string }[] = [
  { value: 'article', label: 'Article #' },
  { value: 'title', label: 'Title A–Z' },
];

const LawArticlesPageContent = () => {
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('article');
  
  const { data: articles, isLoading, error } = useLawArticles();

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const filteredAndSortedArticles = useMemo(() => {
    if (!articles) return [];
    
    let result = [...articles];
    
    // Apply search filter
    if (debouncedSearch.trim()) {
      const query = debouncedSearch.toLowerCase();
      result = result.filter(
        (article) =>
          article.title.toLowerCase().includes(query) ||
          article.summary?.toLowerCase().includes(query)
      );
    }
    
    // Apply category filter
    switch (activeFilter) {
      case 'core':
        result = result.filter((a) => CORE_ARTICLES.includes(a.article_number));
        break;
      case 'definitions':
        result = result.filter((a) => DEFINITION_ARTICLES.includes(a.article_number));
        break;
      case 'repealed':
        result = result.filter((a) => a.is_repealed);
        break;
      case 'auth':
        result = result.filter((a) => a.access_level === 'auth');
        break;
    }
    
    // Apply sorting
    if (sortBy === 'title') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      result.sort((a, b) => {
        const numA = parseInt(a.article_number, 10);
        const numB = parseInt(b.article_number, 10);
        return numA - numB;
      });
    }
    
    return result;
  }, [articles, debouncedSearch, activeFilter, sortBy]);

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
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Filter Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          {FILTER_OPTIONS.map((option) => (
            <Badge
              key={option.value}
              variant={activeFilter === option.value ? 'default' : 'outline'}
              className="cursor-pointer transition-colors hover:bg-primary/20"
              onClick={() => setActiveFilter(option.value)}
            >
              {option.label}
            </Badge>
          ))}
        </div>
        
        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortType)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats */}
      {!isLoading && articles && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Book className="w-4 h-4" />
          <span>
            {filteredAndSortedArticles.length} {filteredAndSortedArticles.length === 1 ? 'article' : 'articles'}
            {debouncedSearch && ` matching "${debouncedSearch}"`}
            {activeFilter !== 'all' && ` (${FILTER_OPTIONS.find(f => f.value === activeFilter)?.label})`}
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
      {!isLoading && filteredAndSortedArticles.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedArticles.map((article, index) => (
            <LawArticleListItem key={article.id} article={article} index={index} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredAndSortedArticles.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No articles found</h3>
            <p className="text-sm text-muted-foreground">
              {debouncedSearch 
                ? `No articles match your search for "${debouncedSearch}".`
                : 'No articles match the selected filter.'}
              {' '}Try adjusting your search or filters.
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
