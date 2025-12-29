import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Scale, AlertTriangle, Lock, ExternalLink, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { FeatureErrorBoundary } from '@/components/ui/FeatureErrorBoundary';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useLawArticle, useRelatedArticles, useLawArticleMarkdown } from '@/hooks/useLawArticles';
import { useAuth } from '@/contexts/AuthContext';
import { RelatedArticleCard } from '@/components/law-articles/RelatedArticleCard';
import { MarkdownRenderer } from '@/components/law-articles/MarkdownRenderer';
import { LawArticleLockedState } from '@/components/law-articles/LawArticleLockedState';

const LawArticleDetailContent = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  
  const { data: article, isLoading: articleLoading, error: articleError } = useLawArticle(slug || '');
  const { data: relatedArticles, isLoading: relatedLoading } = useRelatedArticles(article?.related_slugs || null);
  
  const canAccessContent = article?.access_level !== 'auth' || !!user;
  const { 
    data: markdownContent, 
    isLoading: markdownLoading, 
    error: markdownError 
  } = useLawArticleMarkdown(
    canAccessContent ? article?.storage_path || null : null,
    article?.access_level || 'public'
  );

  // Loading state
  if (articleLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  // Error state
  if (articleError || !article) {
    return (
      <Card className="border-destructive">
        <CardContent className="py-12 text-center">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Article Not Found</h3>
          <p className="text-sm text-muted-foreground mb-6">
            The requested article could not be found. It may have been removed or the URL is incorrect.
          </p>
          <Button asChild variant="outline">
            <Link to="/dashboard/law-library">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Law Library
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back Link */}
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to="/dashboard/law-library">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Law Library
        </Link>
      </Button>

      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Scale className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <Badge variant="secondary" className="text-xs">
              Article {article.article_number}
            </Badge>
            {article.access_level === 'auth' && (
              <Badge variant="outline" className="gap-1 text-xs">
                <Lock className="w-3 h-3" />
                Auth Required
              </Badge>
            )}
            {article.is_repealed && (
              <Badge variant="destructive" className="gap-1 text-xs">
                <AlertTriangle className="w-3 h-3" />
                Repealed
              </Badge>
            )}
          </div>
          <h1 className="text-2xl font-bold text-foreground leading-tight">
            {article.title}
          </h1>
        </div>
      </div>

      {/* Summary */}
      {article.summary && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground leading-relaxed">{article.summary}</p>
          </CardContent>
        </Card>
      )}

      {/* Related Articles */}
      {article.related_slugs && article.related_slugs.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">Related Articles</h2>
          {relatedLoading ? (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          ) : relatedArticles && relatedArticles.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {relatedArticles.map((related) => (
                <RelatedArticleCard key={related.id} article={related} />
              ))}
            </div>
          ) : null}
        </div>
      )}

      <Separator />

      {/* Statute Content */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Statute Text</h2>
        
        {!canAccessContent ? (
          <LawArticleLockedState />
        ) : markdownLoading ? (
          <Card>
            <CardContent className="py-12 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">Loading statute text...</span>
            </CardContent>
          </Card>
        ) : markdownError ? (
          <Card className="border-destructive/50">
            <CardContent className="py-8 text-center">
              <AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Failed to load statute text. Please try again later.
              </p>
            </CardContent>
          </Card>
        ) : markdownContent ? (
          <Card>
            <CardContent className="py-6">
              <MarkdownRenderer content={markdownContent} />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-sm text-muted-foreground">
                No statute text available for this article.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

const LawArticleDetailPage = () => {
  return (
    <DashboardLayout>
      <FeatureErrorBoundary featureName="Law Article Detail">
        <LawArticleDetailContent />
      </FeatureErrorBoundary>
    </DashboardLayout>
  );
};

export default LawArticleDetailPage;
