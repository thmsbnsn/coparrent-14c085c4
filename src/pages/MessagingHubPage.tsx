import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquare, 
  Users, 
  Send, 
  Plus,
  Hash,
  FileText,
  Check,
  CheckCheck,
  UsersRound,
  Search,
  Menu,
  RefreshCw
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useMessagingHub, MessageThread, FamilyMember } from "@/hooks/useMessagingHub";
import { useFamilyRole } from "@/hooks/useFamilyRole";
import { useTypingIndicator } from "@/hooks/useTypingIndicator";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { MessageSearch } from "@/components/messages/MessageSearch";
import { MessageReactions } from "@/components/messages/MessageReactions";
import { PullToRefreshIndicator } from "@/components/messages/PullToRefreshIndicator";
import { UnreadBadge } from "@/components/messages/UnreadBadge";
import { SwipeableTabs } from "@/components/messages/SwipeableTabs";
import { resolveSenderName } from "@/lib/displayResolver";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const formatTimestamp = (dateString: string) => {
  return format(new Date(dateString), "MMM d, yyyy h:mm a");
};

const formatShortTime = (dateString: string) => {
  return format(new Date(dateString), "h:mm a");
};

const formatReadTime = (dateString: string) => {
  return format(new Date(dateString), "MMM d, h:mm a");
};

const getRoleBadge = (role: string) => {
  const roleLabels: Record<string, string> = {
    parent: "Parent",
    guardian: "Guardian",
    third_party: "Family Member",
  };
  const label = roleLabels[role] || "Member";
  const variant = role === "parent" || role === "guardian" ? "default" : "secondary";
  return <Badge variant={variant} className="text-xs">{label}</Badge>;
};

const getInitials = (name: string | null | undefined, email: string | null | undefined) => {
  if (name) {
    const parts = name.split(" ");
    return parts.length >= 2 
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : name.substring(0, 2).toUpperCase();
  }
  return email?.substring(0, 2).toUpperCase() || "?";
};

const MessagingHubPage = () => {
  const {
    threads,
    groupChats,
    familyChannel,
    familyMembers,
    activeThread,
    messages,
    loading,
    role,
    profileId,
    setActiveThread,
    sendMessage,
    getOrCreateDMThread,
    createGroupChat,
    ensureFamilyChannel,
    fetchThreads,
  } = useMessagingHub();
  
  const { isThirdParty } = useFamilyRole();
  const { typingText, setTyping, clearTyping } = useTypingIndicator(activeThread?.id || null);
  const { 
    totalUnread, 
    getUnreadForThread, 
    getUnreadByType, 
    showIndicator,
    refresh: refreshUnread 
  } = useUnreadMessages();
  const isMobile = useIsMobile();
  
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [showNewDM, setShowNewDM] = useState(false);
  const [activeTab, setActiveTab] = useState<"family" | "groups" | "direct">("family");
  const [selectedMembers, setSelectedMembers] = useState<FamilyMember[]>([]);
  const [showGroupConfirm, setShowGroupConfirm] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [messageReactions, setMessageReactions] = useState<Map<string, { emoji: string; count: number; hasReacted: boolean }[]>>(new Map());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Pull-to-refresh for messages
  const handleRefresh = useCallback(async () => {
    await fetchThreads();
    await refreshUnread();
  }, [fetchThreads, refreshUnread]);

  const { 
    isRefreshing, 
    pullDistance, 
    bindEvents 
  } = usePullToRefresh({
    onRefresh: handleRefresh,
    enabled: isMobile,
  });

  // Bind pull-to-refresh to scroll area
  useEffect(() => {
    if (scrollAreaRef.current && isMobile) {
      return bindEvents(scrollAreaRef.current);
    }
  }, [bindEvents, isMobile]);

  // Fetch reactions for current messages
  useEffect(() => {
    const fetchReactions = async () => {
      if (!messages.length || !profileId) return;

      const messageIds = messages.map(m => m.id);
      const { data: reactions } = await supabase
        .from("message_reactions")
        .select("*")
        .in("message_id", messageIds);

      if (reactions) {
        const reactionsMap = new Map<string, { emoji: string; count: number; hasReacted: boolean }[]>();
        
        reactions.forEach((r: any) => {
          const existing = reactionsMap.get(r.message_id) || [];
          const emojiEntry = existing.find(e => e.emoji === r.emoji);
          
          if (emojiEntry) {
            emojiEntry.count++;
            if (r.profile_id === profileId) emojiEntry.hasReacted = true;
          } else {
            existing.push({
              emoji: r.emoji,
              count: 1,
              hasReacted: r.profile_id === profileId,
            });
          }
          
          reactionsMap.set(r.message_id, existing);
        });
        
        setMessageReactions(reactionsMap);
      }
    };

    fetchReactions();
  }, [messages, profileId]);

  // Subscribe to reaction changes
  useEffect(() => {
    if (!activeThread) return;

    const channel = supabase
      .channel(`reactions-${activeThread.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "message_reactions",
        },
        async () => {
          // Refetch reactions when changes occur
          const messageIds = messages.map(m => m.id);
          if (messageIds.length === 0) return;

          const { data: reactions } = await supabase
            .from("message_reactions")
            .select("*")
            .in("message_id", messageIds);

          if (reactions) {
            const reactionsMap = new Map<string, { emoji: string; count: number; hasReacted: boolean }[]>();
            
            reactions.forEach((r: any) => {
              const existing = reactionsMap.get(r.message_id) || [];
              const emojiEntry = existing.find(e => e.emoji === r.emoji);
              
              if (emojiEntry) {
                emojiEntry.count++;
                if (r.profile_id === profileId) emojiEntry.hasReacted = true;
              } else {
                existing.push({
                  emoji: r.emoji,
                  count: 1,
                  hasReacted: r.profile_id === profileId,
                });
              }
              
              reactionsMap.set(r.message_id, existing);
            });
            
            setMessageReactions(reactionsMap);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeThread, messages, profileId]);

  // Handle adding/toggling a reaction
  const handleReaction = async (messageId: string, emoji: string) => {
    if (!profileId) return;

    const existingReactions = messageReactions.get(messageId) || [];
    const hasReacted = existingReactions.find(r => r.emoji === emoji)?.hasReacted;

    if (hasReacted) {
      // Remove reaction
      await supabase
        .from("message_reactions")
        .delete()
        .match({ message_id: messageId, profile_id: profileId, emoji });
    } else {
      // Add reaction
      await supabase
        .from("message_reactions")
        .insert({ message_id: messageId, profile_id: profileId, emoji });
    }
  };

  // Handle typing indicator on input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (e.target.value.trim()) {
      setTyping();
    }
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize family channel on load
  useEffect(() => {
    if (!loading && !familyChannel) {
      ensureFamilyChannel();
    }
  }, [loading, familyChannel, ensureFamilyChannel]);

  // Set family channel as active by default
  useEffect(() => {
    if (familyChannel && !activeThread) {
      setActiveThread(familyChannel);
    }
  }, [familyChannel, activeThread, setActiveThread]);

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;
    
    clearTyping();
    setSending(true);
    const success = await sendMessage(newMessage.trim());
    if (success) {
      setNewMessage("");
    }
    setSending(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleMemberSelection = (member: FamilyMember) => {
    if (member.profile_id === profileId) return;
    
    setSelectedMembers(prev => {
      const isSelected = prev.some(m => m.profile_id === member.profile_id);
      if (isSelected) {
        return prev.filter(m => m.profile_id !== member.profile_id);
      } else {
        return [...prev, member];
      }
    });
  };

  const handleStartConversation = async () => {
    if (selectedMembers.length === 0) {
      toast.error("Please select at least one person to message");
      return;
    }
    
    if (selectedMembers.length > 1) {
      setShowGroupConfirm(true);
      return;
    }
    
    const member = selectedMembers[0];
    const thread = await getOrCreateDMThread(member.profile_id);
    if (thread) {
      setActiveThread({
        ...thread,
        other_participant: {
          id: member.profile_id,
          full_name: member.full_name,
          email: member.email,
          role: member.role,
        },
      });
      setShowNewDM(false);
      setSelectedMembers([]);
      setActiveTab("direct");
      setShowSidebar(false);
    }
  };

  const handleCreateGroupChat = async () => {
    if (!groupName.trim()) {
      toast.error("Please enter a group name");
      return;
    }
    
    setCreatingGroup(true);
    const thread = await createGroupChat(
      groupName.trim(),
      selectedMembers.map(m => m.profile_id)
    );
    
    if (thread) {
      setActiveThread({
        ...thread,
        participants: selectedMembers.map(m => ({
          profile_id: m.profile_id,
          full_name: m.full_name,
          email: m.email,
          avatar_url: m.avatar_url,
        })),
      });
      toast.success("Group chat created!");
      setShowNewDM(false);
      setShowGroupConfirm(false);
      setSelectedMembers([]);
      setGroupName("");
      setActiveTab("groups");
      setShowSidebar(false);
    }
    setCreatingGroup(false);
  };

  const handleStartDM = async (member: FamilyMember) => {
    if (member.profile_id === profileId) return;
    
    const thread = await getOrCreateDMThread(member.profile_id);
    if (thread) {
      setActiveThread({
        ...thread,
        other_participant: {
          id: member.profile_id,
          full_name: member.full_name,
          email: member.email,
          role: member.role,
        },
      });
      setShowNewDM(false);
      setActiveTab("direct");
      setShowSidebar(false);
    }
  };

  const handleSelectThread = (thread: MessageThread) => {
    setActiveThread(thread);
    if (isMobile) {
      setShowSidebar(false);
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text("Message Log", 14, 22);
    doc.setFontSize(10);
    doc.text(`Exported: ${format(new Date(), "PPpp")}`, 14, 30);
    doc.text(`Thread: ${activeThread?.name || "Direct Message"}`, 14, 36);

    const tableData = messages.map((msg) => [
      formatTimestamp(msg.created_at),
      resolveSenderName(msg.sender_name),
      msg.sender_role,
      msg.content,
    ]);

    autoTable(doc, {
      head: [["Timestamp", "Sender", "Role", "Message"]],
      body: tableData,
      startY: 42,
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 30 },
        2: { cellWidth: 20 },
        3: { cellWidth: "auto" },
      },
    });

    doc.save(`messages-${format(new Date(), "yyyy-MM-dd")}.pdf`);
  };

  const getThreadDisplayName = (thread: MessageThread) => {
    if (thread.thread_type === "group_chat") {
      return thread.name || "Group Chat";
    }
    if (thread.thread_type === "family_channel") {
      return "Family Chat";
    }
    return thread.other_participant?.full_name || 
           thread.other_participant?.email || 
           "Unknown";
  };

  // Sidebar content - extracted for reuse in mobile sheet and desktop sidebar
  const SidebarContent = () => {
    const tabItems = ["family", "groups", "direct"] as const;
    const familyUnread = showIndicator ? getUnreadByType("family_channel") : 0;
    const groupsUnread = showIndicator ? getUnreadByType("group_chat") : 0;
    const directUnread = showIndicator ? getUnreadByType("direct_message") : 0;

    return (
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "family" | "groups" | "direct")} className="flex flex-col h-full">
        <TabsList className="grid w-full grid-cols-3 mx-2 mb-0" style={{ width: "calc(100% - 16px)" }}>
          <TabsTrigger value="family" className="gap-1 text-xs relative">
            <Hash className="w-3 h-3" />
            <span className="hidden sm:inline">Family</span>
            {familyUnread > 0 && (
              <UnreadBadge count={familyUnread} className="absolute -top-1 -right-1" />
            )}
          </TabsTrigger>
          <TabsTrigger value="groups" className="gap-1 text-xs relative">
            <UsersRound className="w-3 h-3" />
            <span className="hidden sm:inline">Groups</span>
            {groupsUnread > 0 && (
              <UnreadBadge count={groupsUnread} className="absolute -top-1 -right-1" />
            )}
          </TabsTrigger>
          <TabsTrigger value="direct" className="gap-1 text-xs relative">
            <MessageSquare className="w-3 h-3" />
            <span className="hidden sm:inline">Direct</span>
            {directUnread > 0 && (
              <UnreadBadge count={directUnread} className="absolute -top-1 -right-1" />
            )}
          </TabsTrigger>
        </TabsList>

        {isMobile ? (
          <SwipeableTabs
            tabs={[...tabItems]}
            activeTab={activeTab}
            onTabChange={(t) => setActiveTab(t as typeof activeTab)}
            className="flex-1"
          >
            <TabContentInner />
          </SwipeableTabs>
        ) : (
          <TabContentInner />
        )}
      </Tabs>
    );
  };

  const TabContentInner = () => (
    <>
      <TabsContent value="family" className="flex-1 m-0 p-2 overflow-auto">
        {familyChannel && (
          <button
            onClick={() => handleSelectThread(familyChannel)}
            className={cn(
              "w-full p-3 rounded-lg text-left transition-colors relative",
              activeThread?.id === familyChannel.id
                ? "bg-primary/10 border border-primary/20"
                : "hover:bg-muted"
            )}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium">Family Chat</p>
                <p className="text-xs text-muted-foreground">
                  {familyMembers.length} members
                </p>
              </div>
              {showIndicator && getUnreadForThread(familyChannel.id) > 0 && (
                <UnreadBadge count={getUnreadForThread(familyChannel.id)} />
              )}
            </div>
          </button>
        )}

        <div className="mt-4">
          <p className="text-xs font-medium text-muted-foreground px-3 mb-2">
            MEMBERS
          </p>
          {familyMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-3 px-3 py-2"
            >
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarFallback className="text-xs">
                  {getInitials(member.full_name, member.email)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {member.full_name || member.email}
                  {member.profile_id === profileId && " (you)"}
                </p>
              </div>
              {getRoleBadge(member.role)}
            </div>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="groups" className="flex-1 m-0 p-2 overflow-auto">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 mb-2"
          onClick={() => setShowNewDM(true)}
        >
          <Plus className="w-4 h-4" />
          New Group Chat
        </Button>

        {groupChats.map((thread) => (
          <button
            key={thread.id}
            onClick={() => handleSelectThread(thread)}
            className={cn(
              "w-full p-3 rounded-lg text-left transition-colors mb-1 relative",
              activeThread?.id === thread.id
                ? "bg-primary/10 border border-primary/20"
                : "hover:bg-muted"
            )}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                <UsersRound className="w-5 h-5 text-secondary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {thread.name || "Group Chat"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {thread.participants?.length || 0} members
                </p>
              </div>
              {showIndicator && getUnreadForThread(thread.id) > 0 && (
                <UnreadBadge count={getUnreadForThread(thread.id)} />
              )}
            </div>
          </button>
        ))}

        {groupChats.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            No group chats yet
          </p>
        )}
      </TabsContent>

      <TabsContent value="direct" className="flex-1 m-0 p-2 overflow-auto">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 mb-2"
          onClick={() => setShowNewDM(true)}
        >
          <Plus className="w-4 h-4" />
          New Message
        </Button>

        {threads.map((thread) => (
          <button
            key={thread.id}
            onClick={() => handleSelectThread(thread)}
            className={cn(
              "w-full p-3 rounded-lg text-left transition-colors mb-1 relative",
              activeThread?.id === thread.id
                ? "bg-primary/10 border border-primary/20"
                : "hover:bg-muted"
            )}
          >
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 flex-shrink-0">
                <AvatarFallback>
                  {getInitials(
                    thread.other_participant?.full_name,
                    thread.other_participant?.email
                  )}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {thread.other_participant?.full_name || 
                   thread.other_participant?.email || 
                   "Unknown"}
                </p>
                {thread.other_participant?.role && (
                  <div className="mt-1">
                    {getRoleBadge(thread.other_participant.role)}
                  </div>
                )}
              </div>
              {showIndicator && getUnreadForThread(thread.id) > 0 && (
                <UnreadBadge count={getUnreadForThread(thread.id)} />
              )}
            </div>
          </button>
        ))}

        {threads.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            No direct messages yet
          </p>
        )}
      </TabsContent>
    </>
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <TooltipProvider>
        <div className="h-[calc(100vh-8rem)] md:h-[calc(100vh-8rem)] flex flex-col">
          {/* Header - Mobile optimized */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-2 md:mb-4"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                {isMobile && (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="flex-shrink-0 relative"
                    onClick={() => setShowSidebar(true)}
                  >
                    <Menu className="w-5 h-5" />
                    {showIndicator && totalUnread > 0 && (
                      <UnreadBadge 
                        count={totalUnread} 
                        className="absolute -top-1 -right-1"
                        size="sm"
                      />
                    )}
                  </Button>
                )}
                <div className="min-w-0">
                  <h1 className="text-xl md:text-2xl lg:text-3xl font-display font-bold truncate">
                    {isMobile && activeThread ? getThreadDisplayName(activeThread) : "Messages"}
                  </h1>
                  {!isMobile && (
                    <p className="text-muted-foreground mt-1 text-sm">
                      Communicate with your family group
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-1 md:gap-2 flex-shrink-0">
                {isMobile && (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                  >
                    <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size={isMobile ? "icon" : "sm"} 
                  onClick={() => setShowSearch(true)}
                >
                  <Search className="w-4 h-4" />
                  {!isMobile && <span className="ml-2">Search</span>}
                </Button>
                {activeThread && messages.length > 0 && !isMobile && (
                  <Button variant="outline" size="sm" onClick={handleExportPDF}>
                    <FileText className="w-4 h-4 mr-2" />
                    Export PDF
                  </Button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Search Dialog */}
          <Dialog open={showSearch} onOpenChange={setShowSearch}>
            <DialogContent className="max-w-lg mx-4 md:mx-auto">
              <DialogHeader>
                <DialogTitle>Search Messages</DialogTitle>
              </DialogHeader>
              <MessageSearch
                threadId={activeThread?.id}
                onResultClick={(result) => {
                  setShowSearch(false);
                  toast.success("Found message from " + (result.sender_name || "Unknown"));
                }}
                onClose={() => setShowSearch(false)}
              />
            </DialogContent>
          </Dialog>

          {/* Mobile Sidebar Sheet */}
          <Sheet open={showSidebar} onOpenChange={setShowSidebar}>
            <SheetContent side="left" className="w-[300px] p-0">
              <SheetHeader className="p-4 border-b">
                <SheetTitle className="flex items-center gap-2">
                  Conversations
                  {showIndicator && totalUnread > 0 && (
                    <UnreadBadge count={totalUnread} size="md" />
                  )}
                </SheetTitle>
              </SheetHeader>
              <div className="h-[calc(100%-60px)]">
                <SidebarContent />
              </div>
            </SheetContent>
          </Sheet>

          {/* Main content */}
          <div className="flex-1 flex gap-4 min-h-0">
            {/* Desktop Sidebar */}
            {!isMobile && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="w-72 lg:w-80 flex-shrink-0 rounded-xl border border-border bg-card overflow-hidden flex flex-col"
              >
                <SidebarContent />
              </motion.div>
            )}

            {/* Chat area */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 rounded-xl border border-border bg-card overflow-hidden flex flex-col min-w-0"
            >
              {/* Chat header */}
              {activeThread && (
                <div className="p-3 md:p-4 border-b border-border flex items-center gap-3">
                  {activeThread.thread_type === "family_channel" ? (
                    <>
                      <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Users className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <h2 className="font-semibold text-sm md:text-base">Family Chat</h2>
                        <p className="text-xs text-muted-foreground truncate">
                          All messages are saved for records
                        </p>
                      </div>
                    </>
                  ) : activeThread.thread_type === "group_chat" ? (
                    <>
                      <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                        <UsersRound className="w-4 h-4 md:w-5 md:h-5 text-secondary-foreground" />
                      </div>
                      <div className="min-w-0">
                        <h2 className="font-semibold text-sm md:text-base truncate">{activeThread.name || "Group Chat"}</h2>
                        <p className="text-xs text-muted-foreground truncate">
                          {activeThread.participants?.map(p => p.full_name || p.email).join(", ")}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <Avatar className="w-9 h-9 md:w-10 md:h-10 flex-shrink-0">
                        <AvatarFallback className="text-sm">
                          {getInitials(
                            activeThread.other_participant?.full_name,
                            activeThread.other_participant?.email
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <h2 className="font-semibold text-sm md:text-base truncate">
                          {activeThread.other_participant?.full_name || 
                           activeThread.other_participant?.email || 
                           "Unknown"}
                        </h2>
                        {activeThread.other_participant?.role && (
                          getRoleBadge(activeThread.other_participant.role)
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Messages with pull-to-refresh */}
              <div className="flex-1 relative overflow-hidden" ref={scrollAreaRef} data-scroll-area>
                <PullToRefreshIndicator 
                  pullDistance={pullDistance} 
                  isRefreshing={isRefreshing}
                />
                <ScrollArea className="h-full p-3 md:p-4">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-12">
                      <MessageSquare className="w-10 h-10 md:w-12 md:h-12 text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground">No messages yet</p>
                      <p className="text-sm text-muted-foreground/70">
                        Start the conversation!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 md:space-y-4">
                      {messages.map((message) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={cn(
                            "flex gap-2 md:gap-3 group",
                            message.is_from_me ? "flex-row-reverse" : ""
                          )}
                        >
                          <Avatar className="w-7 h-7 md:w-8 md:h-8 flex-shrink-0">
                            <AvatarFallback className="text-xs">
                              {getInitials(message.sender_name, null)}
                            </AvatarFallback>
                          </Avatar>
                          <div className={cn(
                            "max-w-[85%] md:max-w-[70%]",
                            message.is_from_me ? "items-end" : ""
                          )}>
                            <div className={cn(
                              "flex items-center gap-1 md:gap-2 mb-1 flex-wrap",
                              message.is_from_me ? "flex-row-reverse" : ""
                            )}>
                              <span className="text-xs md:text-sm font-medium">
                                {message.sender_name}
                              </span>
                              <span className="hidden md:inline">{getRoleBadge(message.sender_role)}</span>
                              <span className="text-[10px] md:text-xs text-muted-foreground">
                                {isMobile ? formatShortTime(message.created_at) : formatTimestamp(message.created_at)}
                              </span>
                            </div>
                            <div className={cn(
                              "p-2.5 md:p-3 rounded-lg",
                              message.is_from_me
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            )}>
                              <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                            </div>
                            
                            {/* Message Reactions */}
                            <div className={cn(
                              "mt-1",
                              message.is_from_me ? "flex justify-end" : ""
                            )}>
                              <MessageReactions
                                messageId={message.id}
                                reactions={messageReactions.get(message.id)}
                                onReact={handleReaction}
                              />
                            </div>
                            
                            {/* Read receipts */}
                            {message.is_from_me && message.read_by && message.read_by.length > 0 && (
                              <div className={cn("flex items-center gap-1 mt-1", message.is_from_me ? "justify-end" : "")}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex items-center gap-1 text-[10px] md:text-xs text-muted-foreground cursor-default">
                                      <CheckCheck className="w-3 h-3 md:w-3.5 md:h-3.5 text-primary" />
                                      <span>Read</span>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent side="bottom" align={message.is_from_me ? "end" : "start"}>
                                    <div className="space-y-1">
                                      {message.read_by.map((receipt) => (
                                        <div key={receipt.reader_id} className="text-xs">
                                          <span className="font-medium">{receipt.reader_name}</span>
                                          <span className="text-muted-foreground ml-2">
                                            {formatReadTime(receipt.read_at)}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            )}
                            
                            {/* Sent indicator for messages without reads yet */}
                            {message.is_from_me && (!message.read_by || message.read_by.length === 0) && (
                              <div className="flex items-center gap-1 mt-1 justify-end">
                                <Check className="w-3 h-3 md:w-3.5 md:h-3.5 text-muted-foreground" />
                                <span className="text-[10px] md:text-xs text-muted-foreground">Sent</span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollArea>
              </div>

              {/* Input area */}
              {activeThread && (
                <div className="p-3 md:p-4 border-t border-border">
                  {/* Typing indicator */}
                  <AnimatePresence>
                    {typingText && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-2"
                      >
                        <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                          <div className="flex gap-1">
                            <motion.span
                              animate={{ opacity: [0.4, 1, 0.4] }}
                              transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
                              className="w-1 h-1 md:w-1.5 md:h-1.5 bg-primary rounded-full"
                            />
                            <motion.span
                              animate={{ opacity: [0.4, 1, 0.4] }}
                              transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
                              className="w-1 h-1 md:w-1.5 md:h-1.5 bg-primary rounded-full"
                            />
                            <motion.span
                              animate={{ opacity: [0.4, 1, 0.4] }}
                              transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
                              className="w-1 h-1 md:w-1.5 md:h-1.5 bg-primary rounded-full"
                            />
                          </div>
                          <span className="truncate">{typingText}</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={handleInputChange}
                      onKeyPress={handleKeyPress}
                      disabled={sending}
                      className="flex-1 text-base"
                    />
                    <Button 
                      onClick={handleSend} 
                      disabled={!newMessage.trim() || sending}
                      size={isMobile ? "icon" : "default"}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  {!isMobile && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Messages are immutable and saved for court records
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          </div>

          {/* New DM Modal */}
          <Dialog open={showNewDM && !showGroupConfirm} onOpenChange={(open) => {
            setShowNewDM(open);
            if (!open) setSelectedMembers([]);
          }}>
            <DialogContent className="max-w-md mx-4 md:mx-auto max-h-[85vh] overflow-hidden flex flex-col">
              <DialogHeader>
                <DialogTitle>New Conversation</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">
                Select one person for a direct message, or multiple for a group chat:
              </p>
              <ScrollArea className="flex-1 max-h-64">
                <div className="space-y-2 pr-2">
                  {familyMembers
                    .filter((m) => m.profile_id !== profileId)
                    .map((member) => {
                      const isSelected = selectedMembers.some(m => m.profile_id === member.profile_id);
                      return (
                        <button
                          key={member.id}
                          onClick={() => toggleMemberSelection(member)}
                          className={cn(
                            "w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left",
                            isSelected 
                              ? "bg-primary/10 border border-primary/30" 
                              : "hover:bg-muted border border-transparent"
                          )}
                        >
                          <div className={cn(
                            "w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                            isSelected ? "bg-primary border-primary" : "border-muted-foreground/30"
                          )}>
                            {isSelected && <Check className="w-3 h-3 md:w-4 md:h-4 text-primary-foreground" />}
                          </div>
                          <Avatar className="w-9 h-9 md:w-10 md:h-10 flex-shrink-0">
                            <AvatarFallback>
                              {getInitials(member.full_name, member.email)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                              {member.full_name || member.email}
                            </p>
                          </div>
                          {getRoleBadge(member.role)}
                        </button>
                      );
                    })}
                </div>
              </ScrollArea>
              
              {selectedMembers.length > 0 && (
                <div className="p-3 rounded-lg bg-muted/50 text-sm">
                  <span className="font-medium">{selectedMembers.length} selected:</span>{" "}
                  <span className="truncate">{selectedMembers.map(m => m.full_name || m.email).join(", ")}</span>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowNewDM(false);
                    setSelectedMembers([]);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleStartConversation}
                  disabled={selectedMembers.length === 0}
                >
                  {selectedMembers.length > 1 ? "Create Group" : "Start Message"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Group Chat Creation Modal */}
          <Dialog open={showGroupConfirm} onOpenChange={setShowGroupConfirm}>
            <DialogContent className="max-w-md mx-4 md:mx-auto">
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <UsersRound className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                  </div>
                  <div>
                    <DialogTitle>Create Group Chat</DialogTitle>
                    <p className="text-sm text-muted-foreground">
                      {selectedMembers.length} people selected
                    </p>
                  </div>
                </div>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Group Name</label>
                  <Input
                    placeholder="e.g., Weekend Planning"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    autoFocus
                    className="text-base"
                  />
                </div>
                
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Members:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedMembers.map((member) => (
                      <div key={member.profile_id} className="flex items-center gap-1.5 bg-background rounded-full px-2.5 py-1 text-sm">
                        <Avatar className="w-5 h-5">
                          <AvatarFallback className="text-[10px]">
                            {getInitials(member.full_name, member.email)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="truncate max-w-[100px]">{member.full_name || member.email}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowGroupConfirm(false)}
                  disabled={creatingGroup}
                >
                  Back
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleCreateGroupChat}
                  disabled={!groupName.trim() || creatingGroup}
                >
                  {creatingGroup ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">Creating...</span>
                    </>
                  ) : (
                    "Create Group"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </TooltipProvider>
    </DashboardLayout>
  );
};

export default MessagingHubPage;
