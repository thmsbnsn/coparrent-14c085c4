import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Send, 
  Plus, 
  Trash2, 
  MessageCircle, 
  Stethoscope,
  AlertTriangle,
  Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PremiumFeatureGate } from "@/components/premium/PremiumFeatureGate";
import { RoleGate } from "@/components/gates/RoleGate";
import { useNurseNancy, type NurseNancyMessage } from "@/hooks/useNurseNancy";
import { format } from "date-fns";

// Simple markdown-like rendering for messages
const renderMessageContent = (content: string) => {
  // Split by double newlines for paragraphs
  const paragraphs = content.split(/\n\n+/);
  
  return paragraphs.map((paragraph, pIdx) => {
    // Check for bullet points
    if (paragraph.includes("•") || paragraph.includes("- ")) {
      const lines = paragraph.split("\n");
      return (
        <ul key={pIdx} className="list-disc list-inside space-y-1 my-2">
          {lines.map((line, lIdx) => {
            const cleanLine = line.replace(/^[•\-]\s*/, "").trim();
            if (!cleanLine) return null;
            return <li key={lIdx}>{renderInlineFormatting(cleanLine)}</li>;
          })}
        </ul>
      );
    }
    
    // Regular paragraph
    return (
      <p key={pIdx} className="my-2">
        {renderInlineFormatting(paragraph)}
      </p>
    );
  });
};

const renderInlineFormatting = (text: string) => {
  // Handle bold (**text**)
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={idx}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

interface ChatMessageProps {
  message: NurseNancyMessage;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  if (isSystem) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center my-4"
      >
        <Card className="max-w-2xl border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Stethoscope className="h-5 w-5 text-primary" />
              </div>
              <div className="text-sm">
                {renderMessageContent(message.content)}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} my-3`}
    >
      <div
        className={`max-w-[80%] md:max-w-[70%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-muted rounded-bl-md"
        }`}
      >
        <div className="text-sm whitespace-pre-wrap">
          {isUser ? message.content : renderMessageContent(message.content)}
        </div>
        <div
          className={`text-xs mt-1 ${
            isUser ? "text-primary-foreground/70" : "text-muted-foreground"
          }`}
        >
          {format(new Date(message.created_at), "h:mm a")}
        </div>
      </div>
    </motion.div>
  );
};

const ThreadSidebar = ({ 
  threads, 
  currentThreadId, 
  onSelectThread, 
  onNewChat, 
  onDeleteThread,
  loading 
}: {
  threads: Array<{ id: string; title: string; updated_at: string }>;
  currentThreadId: string | null;
  onSelectThread: (thread: any) => void;
  onNewChat: () => void;
  onDeleteThread: (id: string) => void;
  loading: boolean;
}) => {
  if (loading) {
    return (
      <div className="space-y-2 p-2">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b">
        <Button onClick={onNewChat} className="w-full gap-2">
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {threads.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No conversations yet
            </p>
          ) : (
            threads.map((thread) => (
              <div
                key={thread.id}
                className={`group flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors ${
                  currentThreadId === thread.id
                    ? "bg-primary/10 border border-primary/20"
                    : "hover:bg-muted"
                }`}
                onClick={() => onSelectThread(thread)}
              >
                <MessageCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{thread.title}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {format(new Date(thread.updated_at), "MMM d, h:mm a")}
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete conversation?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete this conversation and all its messages.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => onDeleteThread(thread.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

const NurseNancyContent = () => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    threads,
    currentThread,
    messages,
    loading,
    sending,
    selectThread,
    startNewChat,
    sendMessage,
    deleteThread,
  } = useNurseNancy();

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when thread changes
  useEffect(() => {
    if (currentThread) {
      inputRef.current?.focus();
    }
  }, [currentThread]);

  const handleSend = async () => {
    if (!inputValue.trim() || sending) return;
    const message = inputValue.trim();
    setInputValue("");
    await sendMessage(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = async () => {
    await startNewChat();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard/kids-hub")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Stethoscope className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Nurse Nancy</h1>
              <p className="text-xs text-muted-foreground">AI Health Assistant</p>
            </div>
          </div>
        </div>
        <Badge variant="outline" className="gap-1.5 text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/20">
          <AlertTriangle className="h-3 w-3" />
          Not Medical Advice
        </Badge>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 mt-4 gap-4 overflow-hidden">
        {/* Sidebar - Desktop */}
        <div className="hidden md:block w-64 border rounded-lg bg-card shrink-0">
          <ThreadSidebar
            threads={threads}
            currentThreadId={currentThread?.id || null}
            onSelectThread={selectThread}
            onNewChat={handleNewChat}
            onDeleteThread={deleteThread}
            loading={loading}
          />
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col border rounded-lg bg-card overflow-hidden">
          {!currentThread ? (
            // Empty state
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Stethoscope className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Welcome to Nurse Nancy</h2>
              <p className="text-muted-foreground mb-6 max-w-md">
                Get general health guidance and support for your children's wellness questions.
              </p>
              <Button onClick={handleNewChat} className="gap-2">
                <Plus className="h-4 w-4" />
                Start a New Chat
              </Button>
              
              {/* Mobile thread list */}
              {threads.length > 0 && (
                <div className="md:hidden mt-6 w-full max-w-sm">
                  <p className="text-sm font-medium mb-2">Previous Conversations</p>
                  <div className="space-y-2">
                    {threads.slice(0, 3).map((thread) => (
                      <Button
                        key={thread.id}
                        variant="outline"
                        className="w-full justify-start gap-2"
                        onClick={() => selectThread(thread)}
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span className="truncate">{thread.title}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <AnimatePresence>
                  {messages.map((message) => (
                    <ChatMessage key={message.id} message={message} />
                  ))}
                </AnimatePresence>
                {sending && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start my-3"
                  >
                    <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                        <span className="text-sm">Nurse Nancy is typing...</span>
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </ScrollArea>

              {/* Input */}
              <div className="p-4 border-t bg-background">
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your health question..."
                    disabled={sending}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!inputValue.trim() || sending}
                    size="icon"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  For emergencies, call 911. Nurse Nancy provides general information only.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const NurseNancyPage = () => {
  return (
    <DashboardLayout>
      <RoleGate requireParent restrictedMessage="Nurse Nancy is only available to parents and guardians.">
        <PremiumFeatureGate featureName="Nurse Nancy">
          <NurseNancyContent />
        </PremiumFeatureGate>
      </RoleGate>
    </DashboardLayout>
  );
};

export default NurseNancyPage;
