import { useRef, useEffect } from "react";
import { Search, X, MessageSquare, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  useMessageSearch,
  MessageSearchResult,
  groupResultsByThread,
} from "@/hooks/useMessageSearch";

interface MessageSearchProps {
  threadId?: string | null;
  onResultClick?: (result: MessageSearchResult) => void;
  onClose?: () => void;
  className?: string;
}

export const MessageSearch = ({
  threadId,
  onResultClick,
  onClose,
  className,
}: MessageSearchProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { query, results, loading, error, search, clearSearch } =
    useMessageSearch({ threadId });

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const groupedResults = groupResultsByThread(results);

  const handleResultClick = (result: MessageSearchResult) => {
    onResultClick?.(result);
    onClose?.();
  };

  const handleClear = () => {
    clearSearch();
    inputRef.current?.focus();
  };

  return (
    <div className={cn("flex flex-col", className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search messages..."
          value={query}
          onChange={(e) => search(e.target.value)}
          className="pl-9 pr-9"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={handleClear}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Results */}
      <div className="mt-3">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">
              Searching...
            </span>
          </div>
        )}

        {error && (
          <div className="text-center py-8 text-destructive text-sm">
            {error}
          </div>
        )}

        {!loading && !error && query && results.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No messages found for "{query}"</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <ScrollArea className="h-[400px]">
            <div className="space-y-1">
              {results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">
                      {result.sender_name || "Unknown"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(result.created_at), "MMM d, h:mm a")}
                    </span>
                  </div>
                  <p
                    className="text-sm text-muted-foreground line-clamp-2"
                    dangerouslySetInnerHTML={{ __html: result.snippet }}
                  />
                </button>
              ))}
            </div>
          </ScrollArea>
        )}

        {!loading && !query && (
          <div className="text-center py-8 text-muted-foreground">
            <Search className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Type to search your message history</p>
          </div>
        )}
      </div>
    </div>
  );
};
