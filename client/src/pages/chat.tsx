import { useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChatInterface } from "@/components/chat-interface";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, RefreshCcw } from "lucide-react";
import type { Conversation, Message, TravelPreferences } from "@shared/schema";

export default function Chat() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: conversation, isLoading } = useQuery<Conversation>({
    queryKey: [`/api/conversations/${params.id}`],
  });

  const { mutate: getRecommendations, isPending: isGettingRecommendations } = useMutation({
    mutationFn: async () => {
      if (!conversation) return;
      const res = await apiRequest("POST", "/api/recommendations", conversation.preferences);
      return res.json();
    },
    onSuccess: async (data) => {
      if (!data) return;
      if (data.message) {
        // Add the welcome message as an AI message
        await apiRequest("POST", `/api/conversations/${params.id}/messages`, {
          content: data.message,
          isSystemMessage: true
        });
        queryClient.invalidateQueries({ queryKey: [`/api/conversations/${params.id}`] });
      }
    },
    onError: (error: any) => {
      const errorMessage = error?.message || "Failed to get recommendations";
      const isRateLimit = errorMessage.includes("rate limit") || errorMessage.includes("quota");
      const isNewApiKey = errorMessage.includes("new API key");

      toast({
        title: isRateLimit ? "API Rate Limit" : "Error",
        description: isNewApiKey 
          ? "Your OpenAI API key is new and has lower initial rate limits. Please wait a moment before retrying."
          : errorMessage,
        variant: "destructive",
        action: isRateLimit ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => getRecommendations()}
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        ) : undefined,
      });
    },
  });

  useEffect(() => {
    if (conversation && (!conversation.messages || conversation.messages.length === 0)) {
      getRecommendations();
    }
  }, [conversation, getRecommendations]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Conversation not found</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/")}>Return Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => setLocation("/")}
          className="mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Planning
        </Button>

        {isGettingRecommendations && (
          <div className="mb-4 flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Getting personalized recommendations...</span>
          </div>
        )}

        <div className="grid md:grid-cols-[2fr,1fr] gap-8">
          <ChatInterface
            conversationId={Number(params.id)}
            messages={Array.isArray(conversation.messages) ? conversation.messages : []}
          />

          <Card>
            <CardHeader>
              <CardTitle>Your Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <strong>Budget:</strong>{" "}
                ${(conversation.preferences as TravelPreferences).budget?.toLocaleString()}
              </div>
              {(conversation.preferences as TravelPreferences).region && (
                <div>
                  <strong>Region:</strong> {(conversation.preferences as TravelPreferences).region}
                </div>
              )}
              {(conversation.preferences as TravelPreferences).activities?.length > 0 && (
                <div>
                  <strong>Activities:</strong>{" "}
                  {(conversation.preferences as TravelPreferences).activities.join(", ")}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}