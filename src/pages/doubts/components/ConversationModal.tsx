import {
  RefreshCw,
  Camera,
  Paperclip,
  Mic,
  Send,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Doubt, Message } from "./types";

interface ConversationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doubt: Doubt | null;
  messages: Message[];
}

export const ConversationModal = ({
  open,
  onOpenChange,
  doubt,
  messages,
}: ConversationModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle>Doubt Conversation</DialogTitle>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {doubt && (
          <div className="flex flex-col flex-1 min-h-0">
            {/* Doubt Info */}
            <div className="border-b border-border pb-4 mb-4">
              <h3 className="font-semibold text-lg">{doubt.title}</h3>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Subject:</span> {doubt.subject} •{" "}
                <span className="font-medium">Topic:</span> {doubt.topic}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">
                    {doubt.from[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">
                  <span className="font-medium">From:</span> {doubt.from}
                </span>
                <span className="text-sm text-muted-foreground mx-2">→</span>
                <div className="flex items-center gap-1">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium">
                    T
                  </div>
                  <span className="text-sm">
                    <span className="font-medium">To:</span> Teacher
                  </span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 min-h-[200px] max-h-[300px]">
              <div className="space-y-4 pr-4">
                {messages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No messages yet. Start the conversation.
                  </div>
                ) : (
                  messages.map((message) => (
                    <div key={message.id} className="flex gap-3">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarFallback className="text-xs bg-primary/20">
                          {message.sender[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="bg-muted rounded-lg p-3 inline-block max-w-full">
                          <p className="text-sm font-medium">
                            {message.sender}
                          </p>
                          {message.type === "text" ? (
                            <p className="text-sm">{message.content}</p>
                          ) : (
                            <div className="w-full h-40 bg-card rounded mt-2 flex items-center justify-center">
                              <span className="text-muted-foreground text-sm">
                                [{message.type} attachment]
                              </span>
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {message.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="border-t border-border pt-4 mt-4 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Camera className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Paperclip className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Mic className="h-5 w-5" />
                </Button>
                <Input placeholder="Type message..." className="flex-1" />
                <Button size="icon">
                  <Send className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="outline">
                  <CheckCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
