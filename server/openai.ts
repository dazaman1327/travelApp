import OpenAI from "openai";
import { type TravelPreferences } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Enhanced cache with TTL
const recommendationsCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  const INITIAL_DELAY = 3000; // Start with 3 seconds
  const MAX_DELAY = 15000; // Max 15 seconds

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Always add initial delay for new API keys
      if (attempt === 1) {
        console.log(`Initial delay of ${INITIAL_DELAY}ms for new API key...`);
        await new Promise(resolve => setTimeout(resolve, INITIAL_DELAY));
      }
      return await fn();
    } catch (error: any) {
      const isRateLimit = 
        error.message.includes("exceeded your current quota") ||
        error.message.includes("rate limit") ||
        error.message.includes("429");

      if (isRateLimit) {
        const delay = Math.min(
          INITIAL_DELAY * Math.pow(2, attempt - 1),
          MAX_DELAY
        );
        console.log(`Rate limit hit. Attempt ${attempt}/${maxRetries}. Waiting ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));

        if (attempt === maxRetries) {
          throw new Error(
            "Rate limit exceeded. If you're using a new API key, please note that it may take a few minutes " +
            "for the API to warm up to full capacity. Please wait a moment before trying again."
          );
        }
        continue;
      }
      throw error;
    }
  }
  throw new Error("Maximum retries reached");
}

export async function generateTravelRecommendations(preferences: TravelPreferences) {
  // Create a cache key from preferences
  const cacheKey = JSON.stringify(preferences);
  const now = Date.now();

  // Check cache with TTL
  const cached = recommendationsCache.get(cacheKey);
  if (cached && (now - cached.timestamp) < CACHE_TTL) {
    console.log('Serving travel recommendations from cache');
    return cached.data;
  }

  console.log('Generating new travel recommendations...');

  const prompt = `Generate travel recommendations based on these preferences:
Budget: ${preferences.budget || 'flexible'}
Region: ${preferences.region || 'anywhere'}
Activities: ${preferences.activities?.join(', ') || 'any'}

Please provide recommendations in JSON format with the following structure:
{
  "destinations": [
    {
      "name": string,
      "description": string,
      "estimatedCost": number,
      "recommendedActivities": string[]
    }
  ],
  "suggestedItinerary": string,
  "travelTips": string[]
}`;

  const response = await withRetry(async () => {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });
    return completion;
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error("Failed to get AI response");

  const recommendations = JSON.parse(content);
  // Store in cache with timestamp
  recommendationsCache.set(cacheKey, { 
    data: recommendations, 
    timestamp: now 
  });

  return recommendations;
}

export async function chatResponse(messages: Array<{ role: "user" | "assistant"; content: string }>) {
  console.log('Processing chat response...');

  return withRetry(async () => {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a friendly and knowledgeable travel advisor. Be concise but informative, and always maintain a positive, encouraging tone. Focus on practical advice and unique experiences.",
        },
        ...messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
      ],
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("Failed to get AI response");
    return content;
  });
}