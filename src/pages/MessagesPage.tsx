import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Download, Info, FileText, Calendar, Check, X, Clock, ArrowRightLeft } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { ScheduleChangeRequestData } from "@/components/calendar/ScheduleChangeRequest";

interface Message {
  id: number;
  from: string;
  fromMe: boolean;
  content: string;
  timestamp: string;
  type?: "message" | "schedule-request";
  scheduleRequest?: ScheduleChangeRequestData;
}

const initialMessages: Message[] = [
  {
    id: 1,
    from: "Sarah",
    fromMe: false,
    content: "Hi, I wanted to discuss the holiday schedule for Christmas. Would it work if I have the kids on Christmas Eve and you have them on Christmas Day?",
    timestamp: "Dec 10, 2024 2:30 PM",
  },
  {
    id: 2,
    from: "You",
    fromMe: true,
    content: "That sounds fair. I'd like to pick them up around 10 AM on Christmas Day if that works for you.",
    timestamp: "Dec 10, 2024 3:15 PM",
  },
  {
    id: 3,
    from: "Sarah",
    fromMe: false,
    content: "10 AM works great. I'll have them ready. Also, Emma mentioned she needs new snow boots - her current ones are too small.",
    timestamp: "Dec 10, 2024 3:45 PM",
  },
  {
    id: 4,
    from: "You",
    fromMe: true,
    content: "Thanks for letting me know about the boots. I can take her shopping this weekend. What size does she need now?",
    timestamp: "Dec 10, 2024 4:00 PM",
  },
  {
    id: 5,
    from: "Sarah",
    fromMe: false,
    content: "She's moved up to a size 3. There's a sale at the outlet mall if you want to check there.",
    timestamp: "Dec 11, 2024 9:30 AM",
  },
];

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getRequestTypeLabel = (type: string) => {
  switch (type) {
    case "swap":
      return "Day Swap Request";
    case "transfer":
      return "Day Transfer Request";
    case "modification":
      return "Time Modification Request";
    default:
      return "Schedule Request";
  }
};

const MessagesPage = () => {
  const location = useLocation();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [pendingRequests, setPendingRequests] = useState<ScheduleChangeRequestData[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [viewMode, setViewMode] = useState<"chat" | "court">("chat");

  // Load pending requests from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("scheduleRequests");
    if (stored) {
      setPendingRequests(JSON.parse(stored).filter((r: ScheduleChangeRequestData) => r.status === "pending"));
    }
  }, []);

  // Handle new schedule request from navigation
  useEffect(() => {
    if (location.state?.newScheduleRequest) {
      const request = location.state.newScheduleRequest as ScheduleChangeRequestData;
      
      // Add as a message
      const newMsg: Message = {
        id: Date.now(),
        from: "You",
        fromMe: true,
        content: "",
        timestamp: new Date().toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
        type: "schedule-request",
        scheduleRequest: request,
      };
      
      setMessages((prev) => [...prev, newMsg]);
      
      // Clear the navigation state
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleSend = () => {
    if (newMessage.trim()) {
      const newMsg: Message = {
        id: Date.now(),
        from: "You",
        fromMe: true,
        content: newMessage.trim(),
        timestamp: new Date().toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
      };
      setMessages((prev) => [...prev, newMsg]);
      setNewMessage("");
    }
  };

  const handleRequestResponse = (requestId: string, response: "accepted" | "declined") => {
    // Update local storage
    const stored = JSON.parse(localStorage.getItem("scheduleRequests") || "[]");
    const updated = stored.map((r: ScheduleChangeRequestData) =>
      r.id === requestId ? { ...r, status: response } : r
    );
    localStorage.setItem("scheduleRequests", JSON.stringify(updated));

    // Update pending requests
    setPendingRequests((prev) => prev.filter((r) => r.id !== requestId));

    // Update the message
    setMessages((prev) =>
      prev.map((msg) =>
        msg.scheduleRequest?.id === requestId
          ? { ...msg, scheduleRequest: { ...msg.scheduleRequest, status: response } }
          : msg
      )
    );

    toast({
      title: response === "accepted" ? "Request Accepted" : "Request Declined",
      description:
        response === "accepted"
          ? "The schedule change has been approved."
          : "The schedule change has been declined.",
    });
  };

  const renderScheduleRequestCard = (request: ScheduleChangeRequestData, fromMe: boolean) => (
    <div className={cn(
      "rounded-xl border p-4 space-y-3",
      fromMe 
        ? "bg-primary/10 border-primary/20" 
        : "bg-secondary/50 border-secondary"
    )}>
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-primary" />
        <span className="font-medium text-sm">{getRequestTypeLabel(request.type)}</span>
        {request.status !== "pending" && (
          <span className={cn(
            "ml-auto text-xs px-2 py-0.5 rounded-full font-medium",
            request.status === "accepted" 
              ? "bg-success/20 text-success" 
              : "bg-destructive/20 text-destructive"
          )}>
            {request.status === "accepted" ? "Accepted" : "Declined"}
          </span>
        )}
        {request.status === "pending" && (
          <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-medium bg-warning/20 text-warning flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        )}
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Date:</span>
          <span className="font-medium">{formatDate(request.originalDate)}</span>
          {request.proposedDate && (
            <>
              <ArrowRightLeft className="w-3 h-3 text-muted-foreground" />
              <span className="font-medium">{formatDate(request.proposedDate)}</span>
            </>
          )}
        </div>
        <div>
          <span className="text-muted-foreground">Reason: </span>
          <span>{request.reason}</span>
        </div>
      </div>

      {/* Response buttons for received requests */}
      {!fromMe && request.status === "pending" && (
        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 border-success text-success hover:bg-success hover:text-success-foreground"
            onClick={() => handleRequestResponse(request.id, "accepted")}
          >
            <Check className="w-4 h-4 mr-1" />
            Accept
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            onClick={() => handleRequestResponse(request.id, "declined")}
          >
            <X className="w-4 h-4 mr-1" />
            Decline
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-7rem)] flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4"
        >
          <div>
            <h1 className="text-2xl lg:text-3xl font-display font-bold">Messages</h1>
            <p className="text-muted-foreground mt-1">Secure, documented communication</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "chat" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("chat")}
            >
              Chat View
            </Button>
            <Button
              variant={viewMode === "court" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("court")}
            >
              <FileText className="w-4 h-4 mr-2" />
              Court Log
            </Button>
          </div>
        </motion.div>

        {/* Pending Requests Banner */}
        <AnimatePresence>
          {pendingRequests.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4"
            >
              <div className="flex items-center gap-3 p-4 rounded-xl bg-warning/10 border border-warning/30">
                <Clock className="w-5 h-5 text-warning flex-shrink-0" />
                <div className="text-sm">
                  <strong>Pending Requests:</strong> You have {pendingRequests.length} schedule change request(s) awaiting response.
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-start gap-3 p-4 rounded-xl bg-accent/50 border border-accent-foreground/10 mb-4"
        >
          <Info className="w-5 h-5 text-accent-foreground flex-shrink-0 mt-0.5" />
          <div className="text-sm text-accent-foreground">
            <strong>Court-Friendly Communication:</strong> Messages are timestamped and cannot be edited after sending. 
            Keep communication factual, respectful, and focused on the children.
          </div>
        </motion.div>

        {viewMode === "chat" ? (
          /* Chat View */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col rounded-2xl border border-border bg-card overflow-hidden"
          >
            {/* Chat Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-semibold">
                  S
                </div>
                <div>
                  <p className="font-medium">Sarah</p>
                  <p className="text-xs text-muted-foreground">Co-Parent</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    message.fromMe ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] md:max-w-[70%]",
                      message.type !== "schedule-request" && cn(
                        "rounded-2xl px-4 py-3",
                        message.fromMe
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-muted rounded-bl-sm"
                      )
                    )}
                  >
                    {message.type === "schedule-request" && message.scheduleRequest ? (
                      renderScheduleRequestCard(message.scheduleRequest, message.fromMe)
                    ) : (
                      <>
                        <p className="text-sm">{message.content}</p>
                        <p
                          className={cn(
                            "text-xs mt-2",
                            message.fromMe ? "text-primary-foreground/70" : "text-muted-foreground"
                          )}
                        >
                          {message.timestamp}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border">
              <div className="flex gap-3">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  className="flex-1"
                />
                <Button onClick={handleSend} disabled={!newMessage.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Court Log View */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 rounded-2xl border border-border bg-card overflow-hidden"
          >
            <div className="p-6">
              <div className="text-center mb-8">
                <h2 className="text-xl font-display font-bold mb-2">Communication Log</h2>
                <p className="text-sm text-muted-foreground">
                  Official record of all messages between parties
                </p>
              </div>

              <div className="flex justify-end mb-6">
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export as PDF
                </Button>
              </div>

              <div className="space-y-4 max-w-3xl mx-auto">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className="p-4 rounded-lg bg-muted/30 border border-border"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{message.from}</span>
                      <span className="text-xs text-muted-foreground font-mono">{message.timestamp}</span>
                    </div>
                    {message.type === "schedule-request" && message.scheduleRequest ? (
                      <div className="text-sm space-y-1">
                        <p className="font-medium text-primary">
                          [{getRequestTypeLabel(message.scheduleRequest.type)}]
                        </p>
                        <p>
                          <span className="text-muted-foreground">Date: </span>
                          {formatDate(message.scheduleRequest.originalDate)}
                          {message.scheduleRequest.proposedDate && (
                            <> → {formatDate(message.scheduleRequest.proposedDate)}</>
                          )}
                        </p>
                        <p>
                          <span className="text-muted-foreground">Reason: </span>
                          {message.scheduleRequest.reason}
                        </p>
                        <p>
                          <span className="text-muted-foreground">Status: </span>
                          <span className={cn(
                            "font-medium",
                            message.scheduleRequest.status === "accepted" && "text-success",
                            message.scheduleRequest.status === "declined" && "text-destructive",
                            message.scheduleRequest.status === "pending" && "text-warning"
                          )}>
                            {message.scheduleRequest.status.charAt(0).toUpperCase() + message.scheduleRequest.status.slice(1)}
                          </span>
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm">{message.content}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MessagesPage;
