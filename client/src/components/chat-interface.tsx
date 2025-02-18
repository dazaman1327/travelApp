import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, RefreshCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Message } from "@shared/schema";

interface ChatInterfaceProps {
  conversationId: number;
  messages: Message[];
}

export function ChatInterface({ conversationId, messages }: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { mutate: sendMessage, isPending } = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", `/api/conversations/${conversationId}/messages`, {
        content,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/conversations/${conversationId}`] });
      setInput("");
    },
    onError: (error: any) => {
      const errorMessage = error?.message || "Failed to send message";
      const isRateLimit = errorMessage.includes("rate limit") || errorMessage.includes("quota");

      toast({
        title: isRateLimit ? "API Rate Limit" : "Error",
        description: isRateLimit 
          ? "The AI is a bit busy. Please wait a moment and try again."
          : "Failed to send message. Please try again.",
        variant: "destructive",
        action: isRateLimit ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (input.trim()) {
                sendMessage(input.trim());
              }
            }}
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        ) : undefined,
      });
    },
  });

  return (
    <div className="flex flex-col h-[600px] border rounded-lg">
      <ScrollArea className="flex-1 p-4">
        {messages.map((message, i) => (
          <div
            key={i}
            className={`mb-4 ${
              message.role === "user" ? "text-right" : "text-left"
            }`}
          >
            <div
              className={`inline-block px-4 py-2 rounded-lg ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
      </ScrollArea>
      <div className="p-4 border-t">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (input.trim()) {
              sendMessage(input.trim());
            }
          }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about travel..."
            disabled={isPending}
          />
          <Button type="submit" disabled={isPending}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}