
import { GoogleGenAI, Type, Schema, FunctionDeclaration, Tool, Modality } from "@google/genai";
import { UserPreferences, Itinerary, Activity, TravelSuggestions } from "../types";
import { aiRateLimiter, sanitizeInput, SecurityError } from "./security";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// ... existing schemas (activitySchema, daySchema, itinerarySchema) ...
const activitySchema: Schema = {
  type: Type.OBJECT,
  properties: {
    time: { type: Type.STRING, description: "Time of day (e.g., 09:00 AM)" },
    activity: { type: Type.STRING, description: "Name of the activity" },
    location: { type: Type.STRING, description: "Location name or address" },
    description: { type: Type.STRING, description: "Brief description of what to do there" },
    type: { type: Type.STRING, enum: ['food', 'culture', 'nature', 'adventure', 'relax'] },
    cost_estimate: { type: Type.STRING, description: "Estimated cost in local currency" },
    coordinates: {
      type: Type.OBJECT,
      properties: {
        lat: { type: Type.NUMBER, description: "Latitude of the location" },
        lng: { type: Type.NUMBER, description: "Longitude of the location" }
      },
      required: ["lat", "lng"]
    }
  },
  required: ["time", "activity", "location", "type", "coordinates"]
};

const daySchema: Schema = {
  type: Type.OBJECT,
  properties: {
    day: { type: Type.INTEGER },
    theme: { type: Type.STRING, description: "Theme for the day" },
    activities: { 
      type: Type.ARRAY,
      items: activitySchema
    }
  },
  required: ["day", "activities"]
};

const itinerarySchema: Schema = {
  type: Type.OBJECT,
  properties: {
    destination: { type: Type.STRING },
    duration: { type: Type.INTEGER },
    budget: { type: Type.STRING },
    days: {
      type: Type.ARRAY,
      items: daySchema
    }
  },
  required: ["destination", "days"]
};

export const getTravelSuggestions = async (prefs: UserPreferences): Promise<TravelSuggestions> => {
  if (!aiRateLimiter.check()) throw new SecurityError("Rate limit exceeded.");

  // Note: We cannot use responseMimeType: "application/json" with googleSearch tool.
  // We will prompt the model to return a JSON block and parse it manually.
  const prompt = `
    Using Google Search, find one specific recommended flight and one specific recommended hotel for a trip to ${prefs.destination}.
    Dates: ${prefs.startDate || 'Upcoming months'}.
    Budget level: ${prefs.budget}.
    Travelers: ${prefs.travelers}.
    
    IMPORTANT: Your response MUST be valid JSON wrapped in a code block.
    
    JSON Schema:
    {
      "flight": {
        "airline": string,
        "price": string,
        "route": string,
        "note": string
      },
      "hotel": {
        "name": string,
        "price": string,
        "rating": string,
        "description": string
      }
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        // responseMimeType: "application/json" is EXCLUDED here to prevent the 400 error.
        systemInstruction: "You are a travel booking expert. Provide realistic, grounded suggestions using current market data. Always respond with a single JSON object in a markdown code block.",
      }
    });

    const text = response.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as TravelSuggestions;
    }
    throw new Error("Could not parse suggestions JSON.");
  } catch (error) {
    console.error("Suggestions Error:", error);
    // Fallback static data
    return {
      flight: { airline: "Search airlines", price: "$---", route: "Direct/Connecting", note: "Live data unavailable" },
      hotel: { name: "Boutique Stay", price: "$---", rating: "4.5", description: "Minimalist accommodation nearby." }
    };
  }
};

export const generateItinerary = async (prefs: UserPreferences): Promise<Itinerary> => {
  if (!aiRateLimiter.check()) {
     const waitTime = aiRateLimiter.getTimeToReset();
     throw new SecurityError(`Rate limit exceeded. Please wait ${waitTime} seconds before generating a new plan.`);
  }

  const safeDestination = sanitizeInput(prefs.destination);
  const safeInterests = prefs.interests.map(i => sanitizeInput(i)).join(', ');
  const safeGroup = prefs.groupComposition.map(g => sanitizeInput(g)).join(', ');

  const prompt = `
    Create a detailed ${prefs.days}-day travel itinerary for a trip to ${safeDestination}.
    Start Date: ${prefs.startDate || 'flexible'}.
    Travelers: ${prefs.travelers} person(s).
    Group Composition: ${safeGroup || 'Standard'}.
    Budget level: ${prefs.budget}.
    Interests: ${safeInterests}.
    Include accurate geolocation data.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: itinerarySchema,
        systemInstruction: "You are an expert travel guide. Create authentic, personalized travel itineraries.",
      }
    });

    const data = JSON.parse(response.text || '{}');
    return {
      id: crypto.randomUUID(),
      destination: safeDestination,
      startDate: prefs.startDate,
      duration: prefs.days,
      budget: prefs.budget,
      travelers: prefs.travelers,
      groupType: prefs.groupComposition,
      days: data.days || []
    } as Itinerary;

  } catch (error) {
    if (error instanceof SecurityError) throw error;
    console.error("Gemini Itinerary Error:", error);
    throw new Error("Failed to generate itinerary.");
  }
};

export interface ChatResponse {
  text: string;
  toolCalls?: any[];
  groundingChunks?: any[];
}

const updateDayTool: FunctionDeclaration = {
  name: "update_day_activities",
  description: "Update the activities for a specific day in the itinerary.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      day: { type: Type.INTEGER, description: "The day number to update (e.g., 1)" },
      theme: { type: Type.STRING, description: "New theme for the day if changed" },
      activities: { 
        type: Type.ARRAY, 
        items: activitySchema,
        description: "The complete new list of activities for this day."
      }
    },
    required: ["day", "activities"]
  }
};

export const chatWithTravelAssistant = async (
  history: { role: string; parts: { text: string }[] }[],
  message: string,
  itineraryContext?: Itinerary
): Promise<ChatResponse> => {
  if (!aiRateLimiter.check()) {
    return { text: `Rate limit reached. Please wait ${aiRateLimiter.getTimeToReset()}s.` };
  }
  const safeMessage = sanitizeInput(message);
  if (!safeMessage) return { text: "" };
  try {
    let systemInstruction = `You are a helpful, knowledgeable AI travel assistant for the Kanso app.`;
    const tools: Tool[] = [{ googleSearch: {} }];
    if (itineraryContext) {
      systemInstruction += `\n\nCURRENT ITINERARY CONTEXT:\n${JSON.stringify(itineraryContext)}`;
      tools.push({ functionDeclarations: [updateDayTool] });
    }
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: { systemInstruction, tools: tools },
      history: history
    });
    const result = await chat.sendMessage({ message: safeMessage });
    return {
      text: result.text || "Processed.",
      toolCalls: result.functionCalls,
      groundingChunks: result.candidates?.[0]?.groundingMetadata?.groundingChunks
    };
  } catch (error) {
    return { text: "I am having trouble connecting right now." };
  }
};

export const generateSpeech = async (text: string): Promise<string> => {
  if (!aiRateLimiter.check()) throw new SecurityError("Rate limit exceeded.");
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: sanitizeInput(text) }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
      },
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio data");
    return base64Audio;
  } catch (error) { throw error; }
};

export const searchNearbyPlaces = async (lat: number, lng: number, query: string = "interesting places"): Promise<any[]> => {
  if (!aiRateLimiter.check()) return [];
  try {
    const prompt = `Find 5 ${sanitizeInput(query)} near latitude ${lat}, longitude ${lng}. Return a JSON array.`;
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: { retrievalConfig: { latLng: { latitude: lat, longitude: lng } } },
        systemInstruction: "You are a location finder. Format the response as a JSON array."
      },
    });
    let text = response.text || "[]";
    const match = text.match(/\[.*\]/s);
    if (match) text = match[0];
    const places = JSON.parse(text);
    return places.map((p: any, i: number) => ({
      id: i + 100,
      lat: p.lat || lat + (Math.random() - 0.5) * 0.02, 
      lng: p.lng || lng + (Math.random() - 0.5) * 0.02,
      name: p.name,
      category: p.category || 'General',
      image: `https://source.unsplash.com/800x600/?${p.category || 'travel'}`, 
      description: p.description,
      rating: p.rating || 4.5,
      openTime: '09:00 - 18:00'
    }));
  } catch (e) { return []; }
}
