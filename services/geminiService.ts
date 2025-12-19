
import { GoogleGenAI, Type } from "@google/genai";
import { OrderInput, TrackingData, GroundingSource } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getTrackingPrediction = async (input: OrderInput, userLocation?: { lat: number; lng: number }): Promise<TrackingData> => {
  const isRail = input.transportMode === 'rail';
  
  const prompt = `
    Act as a high-performance "Global Multi-Modal Logistics Intelligence Engine". 
    A secure telemetry session has been initialized for ${input.transportMode.toUpperCase()} transport.
    
    MANIFEST & LOGISTICS DATA:
    - Mode: ${input.transportMode}
    - ${isRail ? 'Train Number' : 'Vehicle/Tracking ID'}: ${input.trackingId}
    - Target Order ID: ${input.userOrderId}
    - Origin Station: ${input.district}, ${input.state} (Pincode: ${input.pincode})
    - Final Destination: ${input.address}
    - Consignee Contact: ${input.phoneNumber}
    
    SIMULATION TASK:
    1. Perform "Transit Triangulation" for the specified mode (${input.transportMode}). 
       - If 'rail', strictly follow real-world rail roads and rail networks. Use precise railroad coordinates.
       - If 'road', simulate actual road traffic and terrain pathing.
    2. Pinpoint the current GPS coordinates on its active route from ${input.pincode} towards ${input.address}.
    3. Analyze "Live Traffic/Density" (congestion, weather, or capacity) along the path.
    4. Provide a 'productName' which represents the estimated category of items associated with Order ${input.userOrderId}.
    5. Generate a 'route' array of 'RouteSegment' objects.
    6. Include the 'transportMode' in the response.
    7. Return a valid JSON object matching the following structure:
       {
         "orderId": string,
         "productName": string,
         "transportMode": string,
         "currentLocation": { "lat": number, "lng": number, "address": string },
         "destinationLocation": { "lat": number, "lng": number },
         "driver": { "name": string, "vehicle": string, "phone": string, "rating": number, "speed": string },
         "trafficInfo": { "density": string, "delayMinutes": number, "status": string },
         "route": [ { "points": [[number, number], ...], "trafficDensity": "low" | "moderate" | "heavy" } ],
         "eta": string,
         "carrier": string,
         "predictionConfidence": number,
         "steps": [ { "status": string, "location": string, "timestamp": string, "description": string, "icon": string } ]
       }
    ${isRail ? "CRITICAL: Because you are using Google Maps tool, the JSON must be returned inside the text response block." : ""}
  `;

  const config: any = {
    model: isRail ? "gemini-2.5-flash" : "gemini-3-flash-preview",
  };

  if (isRail) {
    config.tools = [{ googleMaps: {} }];
    if (userLocation) {
      config.toolConfig = {
        retrievalConfig: {
          latLng: {
            latitude: userLocation.lat,
            longitude: userLocation.lng
          }
        }
      };
    }
  } else {
    config.responseMimeType = "application/json";
    config.responseSchema = {
      type: Type.OBJECT,
      properties: {
        orderId: { type: Type.STRING },
        productName: { type: Type.STRING },
        transportMode: { type: Type.STRING },
        currentLocation: {
          type: Type.OBJECT,
          properties: {
            lat: { type: Type.NUMBER },
            lng: { type: Type.NUMBER },
            address: { type: Type.STRING }
          },
          required: ["lat", "lng", "address"]
        },
        destinationLocation: {
          type: Type.OBJECT,
          properties: {
            lat: { type: Type.NUMBER },
            lng: { type: Type.NUMBER }
          },
          required: ["lat", "lng"]
        },
        driver: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            vehicle: { type: Type.STRING },
            phone: { type: Type.STRING },
            rating: { type: Type.NUMBER },
            speed: { type: Type.STRING }
          },
          required: ["name", "vehicle", "phone", "rating", "speed"]
        },
        trafficInfo: {
          type: Type.OBJECT,
          properties: {
            density: { type: Type.STRING },
            delayMinutes: { type: Type.NUMBER },
            status: { type: Type.STRING }
          },
          required: ["density", "delayMinutes", "status"]
        },
        route: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              points: { 
                type: Type.ARRAY, 
                items: { 
                  type: Type.ARRAY, 
                  items: { type: Type.NUMBER }
                }
              },
              trafficDensity: { type: Type.STRING }
            },
            required: ["points", "trafficDensity"]
          }
        },
        eta: { type: Type.STRING },
        carrier: { type: Type.STRING },
        predictionConfidence: { type: Type.NUMBER },
        steps: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              status: { type: Type.STRING },
              location: { type: Type.STRING },
              timestamp: { type: Type.STRING },
              description: { type: Type.STRING },
              icon: { type: Type.STRING }
            },
            required: ["status", "location", "timestamp", "description", "icon"]
          }
        }
      },
      required: ["orderId", "productName", "transportMode", "currentLocation", "destinationLocation", "driver", "trafficInfo", "route", "eta", "steps", "carrier", "predictionConfidence"]
    };
  }

  const response = await ai.models.generateContent({
    model: config.model,
    contents: prompt,
    config: {
      tools: config.tools,
      toolConfig: config.toolConfig,
      responseMimeType: config.responseMimeType,
      responseSchema: config.responseSchema,
    }
  });

  let rawText = response.text;
  let jsonData: TrackingData;

  if (isRail) {
    // Try to extract JSON from markdown if necessary
    const jsonMatch = rawText.match(/```json\n([\s\S]*?)\n```/) || rawText.match(/(\{[\s\S]*\})/);
    if (jsonMatch) {
      jsonData = JSON.parse(jsonMatch[1]);
    } else {
      throw new Error("Could not parse logistics telemetry from engine output.");
    }

    // Extract grounding URLs
    const sources: GroundingSource[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.maps) {
          sources.push({
            uri: chunk.maps.uri,
            title: chunk.maps.title || "Map Location Source"
          });
        }
      });
    }
    jsonData.groundingSources = sources;
  } else {
    jsonData = JSON.parse(rawText);
  }

  return jsonData;
};
