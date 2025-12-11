import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Download, Info, FileText } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const messages = [
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

const MessagesPage = () => {
  const [newMessage, setNewMessage] = useState("");
  const [viewMode, setViewMode] = useState<"chat" | "court">("chat");

  const handleSend = () => {
    if (newMessage.trim()) {
      // Handle sending message
      setNewMessage("");
    }
  };

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
                      "max-w-[80%] md:max-w-[60%] rounded-2xl px-4 py-3",
                      message.fromMe
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-muted rounded-bl-sm"
                    )}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p
                      className={cn(
                        "text-xs mt-2",
                        message.fromMe ? "text-primary-foreground/70" : "text-muted-foreground"
                      )}
                    >
                      {message.timestamp}
                    </p>
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
                    <p className="text-sm">{message.content}</p>
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
