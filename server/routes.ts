import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { generateTravelRecommendations, chatResponse } from "./openai";
import { insertConversationSchema } from "@shared/schema";
import { ZodError } from "zod";

// Add this check at the start of handlers that use OpenAI
async function verifyOpenAIKey() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key is not configured");
  }
  console.log("OpenAI API key is configured and present");
  return true;
}

export async function registerRoutes(app: Express) {
  const httpServer = createServer(app);

  app.post("/api/conversations", async (req, res) => {
    try {
      const data = insertConversationSchema.parse(req.body);
      const conversation = await storage.createConversation(data);
      res.json(conversation);
    } catch (error) {
      const message = error instanceof ZodError ? error.message : "Invalid request data";
      res.status(400).json({ error: message });
    }
  });

  app.get("/api/conversations/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const conversation = await storage.getConversation(Number(id));
      if (!conversation) {
        res.status(404).json({ error: "Conversation not found" });
        return;
      }
      res.json(conversation);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to get conversation";
      res.status(400).json({ error: message });
    }
  });

  app.post("/api/conversations/:id/messages", async (req, res) => {
    try {
      await verifyOpenAIKey();
      const { id } = req.params;
      const { content, isSystemMessage } = req.body;

      const message = {
        role: "user" as const,
        content,
        timestamp: Date.now(),
      };

      let conversation = await storage.addMessage(Number(id), message);

      // Only get AI response for user messages
      if (!isSystemMessage) {
        const messages = Array.isArray(conversation.messages) ? conversation.messages : [];

        try {
          const aiResponse = await chatResponse(
            messages.map(m => ({
              role: m.role,
              content: m.content,
            }))
          );

          const aiMessage = {
            role: "assistant" as const,
            content: aiResponse,
            timestamp: Date.now(),
          };

          conversation = await storage.addMessage(Number(id), aiMessage);
        } catch (error) {
          if (error instanceof Error) {
            console.error("OpenAI API Error:", error.message);
            if (error.message.includes("exceeded your current quota")) {
              throw new Error("API rate limit exceeded. Please try again in a few moments.");
            }
          }
          throw error;
        }
      }

      res.json(conversation);
    } catch (error) {
      let message = "Failed to process message";
      let status = 400;

      if (error instanceof Error) {
        console.error("Error in message processing:", error.message);
        if (error.message.includes("exceeded your current quota")) {
          message = "API rate limit exceeded. Please try again later.";
          status = 429;
        } else if (error.message.includes("OpenAI API key")) {
          message = "OpenAI API key is not properly configured.";
          status = 500;
        } else {
          message = error.message;
        }
      }

      res.status(status).json({ error: message });
    }
  });

  app.post("/api/recommendations", async (req, res) => {
    try {
      await verifyOpenAIKey();
      console.log("Generating recommendations with preferences:", req.body);

      const recommendations = await generateTravelRecommendations(req.body);

      const formattedRecommendations = {
        destinations: recommendations.destinations.map((d: any) =>
          `${d.name}: ${d.description} (Estimated Cost: $${d.estimatedCost})`
        ).join('\n'),
        itinerary: recommendations.suggestedItinerary,
        tips: recommendations.travelTips.join('\n')
      };

      const welcomeMessage = `👋 Hello! Based on your preferences, here are some personalized travel recommendations:

🌍 Recommended Destinations:
${formattedRecommendations.destinations}

✈️ Suggested Itinerary:
${formattedRecommendations.itinerary}

💡 Travel Tips:
${formattedRecommendations.tips}

Feel free to ask me any questions about these recommendations or explore other travel options!`;

      res.json({ message: welcomeMessage });
    } catch (error) {
      let message = "Failed to generate recommendations";
      let status = 400;

      if (error instanceof Error) {
        console.error("Error generating recommendations:", error.message);
        if (error.message.includes("exceeded your current quota")) {
          message = "API rate limit exceeded. Please try again later.";
          status = 429;
        } else if (error.message.includes("OpenAI API key")) {
          message = "OpenAI API key is not properly configured.";
          status = 500;
        } else {
          message = error.message;
        }
      }

      res.status(status).json({ error: message });
    }
  });

  return httpServer;
}