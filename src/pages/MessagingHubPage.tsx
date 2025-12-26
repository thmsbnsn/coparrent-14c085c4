import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquare, 
  Users, 
  Send, 
  User, 
  ChevronLeft,
  Plus,
  Hash,
  FileText,
  Check
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useMessagingHub, MessageThread, FamilyMember } from "@/hooks/useMessagingHub";
import { useFamilyRole } from "@/hooks/useFamilyRole";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";

const formatTimestamp = (dateString: string) => {
  return format(new Date(dateString), "MMM d, yyyy h:mm a");
};

const getRoleBadge = (role: string) => {
  switch (role) {
    case "parent":
    case "guardian":
      return <Badge variant="default" className="text-xs">Parent</Badge>;
    case "third_party":
      return <Badge variant="secondary" className="text-xs">Family</Badge>;
    default:
      return null;
  }
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
    ensureFamilyChannel,
  } = useMessagingHub();
  
  const { isThirdParty } = useFamilyRole();
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [showNewDM, setShowNewDM] = useState(false);
  const [activeTab, setActiveTab] = useState<"family" | "direct">("family");
  const [selectedMembers, setSelectedMembers] = useState<FamilyMember[]>([]);
  const [showGroupConfirm, setShowGroupConfirm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      // Show confirmation for group message
      setShowGroupConfirm(true);
      return;
    }
    
    // Start DM with single member
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
    }
  };

  const handleConfirmGroupMessage = () => {
    // For now, redirect to family channel for group messaging
    if (familyChannel) {
      setActiveThread(familyChannel);
      setActiveTab("family");
      toast.info("For group conversations, please use the Family Chat");
    }
    setShowNewDM(false);
    setSelectedMembers([]);
    setShowGroupConfirm(false);
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
      msg.sender_name || "Unknown",
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
      <div className="h-[calc(100vh-8rem)] flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl lg:text-3xl font-display font-bold">Messaging Hub</h1>
              <p className="text-muted-foreground mt-1">
                Communicate with your family group
              </p>
            </div>
            {activeThread && messages.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleExportPDF}>
                <FileText className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
            )}
          </div>
        </motion.div>

        {/* Main content */}
        <div className="flex-1 flex gap-4 min-h-0">
          {/* Sidebar - Thread list */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-80 flex-shrink-0 rounded-xl border border-border bg-card overflow-hidden flex flex-col"
          >
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "family" | "direct")} className="flex flex-col h-full">
              <TabsList className="grid w-full grid-cols-2 m-2 mb-0" style={{ width: "calc(100% - 16px)" }}>
                <TabsTrigger value="family" className="gap-2">
                  <Hash className="w-4 h-4" />
                  Family
                </TabsTrigger>
                <TabsTrigger value="direct" className="gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Direct
                </TabsTrigger>
              </TabsList>

              <TabsContent value="family" className="flex-1 m-0 p-2">
                <ScrollArea className="h-full">
                  {familyChannel && (
                    <button
                      onClick={() => setActiveThread(familyChannel)}
                      className={cn(
                        "w-full p-3 rounded-lg text-left transition-colors",
                        activeThread?.id === familyChannel.id
                          ? "bg-primary/10 border border-primary/20"
                          : "hover:bg-muted"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Family Chat</p>
                          <p className="text-xs text-muted-foreground">
                            {familyMembers.length} members
                          </p>
                        </div>
                      </div>
                    </button>
                  )}

                  {/* Family members list */}
                  <div className="mt-4">
                    <p className="text-xs font-medium text-muted-foreground px-3 mb-2">
                      MEMBERS
                    </p>
                    {familyMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center gap-3 px-3 py-2"
                      >
                        <Avatar className="w-8 h-8">
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
                </ScrollArea>
              </TabsContent>

              <TabsContent value="direct" className="flex-1 m-0 p-2">
                <ScrollArea className="h-full">
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
                      onClick={() => setActiveThread(thread)}
                      className={cn(
                        "w-full p-3 rounded-lg text-left transition-colors mb-1",
                        activeThread?.id === thread.id
                          ? "bg-primary/10 border border-primary/20"
                          : "hover:bg-muted"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
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
                      </div>
                    </button>
                  ))}

                  {threads.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No direct messages yet
                    </p>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </motion.div>

          {/* Chat area */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 rounded-xl border border-border bg-card overflow-hidden flex flex-col"
          >
            {/* Chat header */}
            {activeThread && (
              <div className="p-4 border-b border-border flex items-center gap-3">
                {activeThread.thread_type === "family_channel" ? (
                  <>
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="font-semibold">Family Chat</h2>
                      <p className="text-xs text-muted-foreground">
                        All messages are saved for records
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <Avatar className="w-10 h-10">
                      <AvatarFallback>
                        {getInitials(
                          activeThread.other_participant?.full_name,
                          activeThread.other_participant?.email
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="font-semibold">
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

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <MessageSquare className="w-12 h-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No messages yet</p>
                  <p className="text-sm text-muted-foreground/70">
                    Start the conversation!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "flex gap-3",
                        message.is_from_me ? "flex-row-reverse" : ""
                      )}
                    >
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback className="text-xs">
                          {getInitials(message.sender_name, null)}
                        </AvatarFallback>
                      </Avatar>
                      <div className={cn(
                        "max-w-[70%]",
                        message.is_from_me ? "items-end" : ""
                      )}>
                        <div className={cn(
                          "flex items-center gap-2 mb-1",
                          message.is_from_me ? "flex-row-reverse" : ""
                        )}>
                          <span className="text-sm font-medium">
                            {message.sender_name}
                          </span>
                          {getRoleBadge(message.sender_role)}
                          <span className="text-xs text-muted-foreground">
                            {formatTimestamp(message.created_at)}
                          </span>
                        </div>
                        <div className={cn(
                          "p-3 rounded-lg",
                          message.is_from_me
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        )}>
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Input area */}
            {activeThread && (
              <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={sending}
                    className="flex-1"
                  />
                  <Button onClick={handleSend} disabled={!newMessage.trim() || sending}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Messages are immutable and saved for court records
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* New DM Modal */}
        <AnimatePresence>
          {showNewDM && !showGroupConfirm && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
                onClick={() => {
                  setShowNewDM(false);
                  setSelectedMembers([]);
                }}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card rounded-xl border border-border p-6 z-50"
              >
                <h2 className="text-lg font-semibold mb-2">New Message</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Select one or more family members to message:
                </p>
                <div className="space-y-2 max-h-64 overflow-y-auto">
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
                            "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                            isSelected ? "bg-primary border-primary" : "border-muted-foreground/30"
                          )}>
                            {isSelected && <Check className="w-4 h-4 text-primary-foreground" />}
                          </div>
                          <Avatar className="w-10 h-10">
                            <AvatarFallback>
                              {getInitials(member.full_name, member.email)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium">
                              {member.full_name || member.email}
                            </p>
                          </div>
                          {getRoleBadge(member.role)}
                        </button>
                      );
                    })}
                </div>
                
                {selectedMembers.length > 0 && (
                  <div className="mt-4 p-3 rounded-lg bg-muted/50 text-sm">
                    <span className="font-medium">{selectedMembers.length} selected:</span>{" "}
                    {selectedMembers.map(m => m.full_name || m.email).join(", ")}
                  </div>
                )}
                
                <div className="flex gap-2 mt-4">
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
                    {selectedMembers.length > 1 ? "Start Group Chat" : "Start Message"}
                  </Button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Group Message Confirmation Modal */}
        <AnimatePresence>
          {showGroupConfirm && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
                onClick={() => setShowGroupConfirm(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card rounded-xl border border-border p-6 z-50"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Start Group Message?</h2>
                    <p className="text-sm text-muted-foreground">
                      {selectedMembers.length} people selected
                    </p>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-4">
                  You've selected multiple people. For group conversations, you'll be redirected to the Family Chat where all family members can participate.
                </p>
                
                <div className="p-3 rounded-lg bg-muted/50 mb-4">
                  <p className="text-sm font-medium mb-1">Selected members:</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedMembers.map(m => m.full_name || m.email).join(", ")}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowGroupConfirm(false)}
                  >
                    Go Back
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleConfirmGroupMessage}
                  >
                    Use Family Chat
                  </Button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

export default MessagingHubPage;
