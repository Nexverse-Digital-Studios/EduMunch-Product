import { useState } from "react";
import { RefreshCw, Search, X, Camera, Paperclip, Mic, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Doubt {
  id: string;
  title: string;
  from: string;
  subject: string;
  topic: string;
}

interface Message {
  id: string;
  sender: string;
  content: string;
  time: string;
  type: "text" | "image";
}

const doubtsData: Doubt[] = [
  { id: "1", title: "i didn't understand the initial part", from: "Kumar Kalani", subject: "Math", topic: "Trigonometry" },
  { id: "2", title: "speed velocity difference", from: "Student test 1", subject: "Phy", topic: "Electromagnetism" },
  { id: "3", title: "we cannot understand your language", from: "Kumar Kalani", subject: "Chemistry", topic: "Physical Chemistry" },
  { id: "4", title: "Cctv", from: "Priya Singh", subject: "Math", topic: "Calculus" },
  { id: "5", title: "Test question", from: "Ram Sir", subject: "Biology", topic: "Animal Kingdom" },
  { id: "6", title: "Doubt created from content section", from: "Kumar Kalani", subject: "Biology", topic: "Animal Kingdom" },
];

const messagesData: Message[] = [
  { id: "1", sender: "Student test 1", content: "speed velocity difference", time: "07:12 PM", type: "text" },
  { id: "2", sender: "Student test 1", content: "", time: "07:13 PM", type: "image" },
];

const Doubts = () => {
  const [showConversation, setShowConversation] = useState(false);
  const [selectedDoubt, setSelectedDoubt] = useState<Doubt | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleDoubtClick = (doubt: Doubt) => {
    setSelectedDoubt(doubt);
    setShowConversation(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground sm:text-2xl md:text-3xl">
          Assigned Doubts
        </h1>
        <Button variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          {/* Filters */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  placeholder="Search questions, students..." 
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Subject</label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  <SelectItem value="math">Math</SelectItem>
                  <SelectItem value="physics">Physics</SelectItem>
                  <SelectItem value="chemistry">Chemistry</SelectItem>
                  <SelectItem value="biology">Biology</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Status</label>
              <Select defaultValue="open">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Sort</label>
              <div className="flex gap-2">
                <Select defaultValue="newest">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="oldest">Oldest</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" className="gap-2 whitespace-nowrap">
                  <X className="h-4 w-4" />
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Showing 8 of 17 total doubts.
          </p>

          {/* Doubts List */}
          <div className="divide-y divide-border">
            {doubtsData.map((doubt) => (
              <div 
                key={doubt.id} 
                className="py-4 cursor-pointer hover:bg-muted/50 px-2 -mx-2 rounded transition-colors"
                onClick={() => handleDoubtClick(doubt)}
              >
                <h3 className="font-medium text-foreground">{doubt.title}</h3>
                <p className="text-sm text-muted-foreground">
                  From: {doubt.from} • {doubt.subject} / {doubt.topic}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Conversation Modal */}
      <Dialog open={showConversation} onOpenChange={setShowConversation}>
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

          {selectedDoubt && (
            <div className="flex flex-col flex-1 min-h-0">
              {/* Doubt Info */}
              <div className="border-b border-border pb-4 mb-4">
                <h3 className="font-semibold text-lg">{selectedDoubt.title}</h3>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Subject:</span> {selectedDoubt.subject} • <span className="font-medium">Topic:</span> {selectedDoubt.topic}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">{selectedDoubt.from[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm"><span className="font-medium">From:</span> {selectedDoubt.from}</span>
                  <span className="text-sm text-muted-foreground mx-2">→</span>
                  <div className="flex items-center gap-1">
                    <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium">Z</div>
                    <span className="text-sm"><span className="font-medium">To:</span> ZAP</span>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 min-h-[200px] max-h-[300px]">
                <div className="space-y-4 pr-4">
                  {messagesData.map((message) => (
                    <div key={message.id} className="flex gap-3">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarFallback className="text-xs bg-primary/20">S</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="bg-muted rounded-lg p-3 inline-block max-w-full">
                          <p className="text-sm font-medium">{message.sender}</p>
                          {message.type === "text" ? (
                            <p className="text-sm">{message.content}</p>
                          ) : (
                            <div className="w-full h-40 bg-card rounded mt-2 flex items-center justify-center">
                              <span className="text-muted-foreground text-sm">[Image attachment]</span>
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">{message.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
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
    </div>
  );
};

export default Doubts;
