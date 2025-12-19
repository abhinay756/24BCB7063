import { GoogleGenAI } from "@google/genai";
import { OrderInput, TrackingData } from "../types";

export const getTrackingPrediction = async (
  input: OrderInput, 
  userLocation?: { lat: number; lng: number },
  lang: string = 'en'
): Promise<TrackingData> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const currentTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  
  const prompt = `
    Act as a "Neural Logistics Intelligence Engine" trained on historical Indian Railways (IRCTC) and National Highway datasets (Kaggle-derived logistics patterns).
    Your objective: Predict the precise real-time location of a consignment using historical daily timing patterns for each Indian State.

    INPUT DATA:
    - ORIGIN: ${input.originCity}, ${input.originState} (PIN: ${input.originPincode})
    - DESTINATION: ${input.destCity}, ${input.destState} (PIN: ${input.destPincode})
    - CURRENT TIME: ${currentTime}

    MODEL INFERENCE LOGIC (TRAINED ON HISTORICAL DATA):
    1. CALCULATE STATE DYNAMICS: 
       - Account for regional transit efficiency (e.g., slower movement in hilly North-East, high congestion in Delhi/NCR/Mumbai, efficient corridors in South India).
       - Factor in "Daily Timing Peaks": If current time is between 08:00-11:00 or 17:00-20:00, increase predicted delay for "road" mode.
    2. RAILWAY TIMING PREDICTION:
       - If distance >= 300km, use "rail".
       - Consult internal knowledge of Indian Railway schedules (Superfast/Express average speeds). 
       - Identify the most likely train route between the origin and destination hubs.
    3. PRECISE INTERPOLATION:
       - Calculate the % of journey completed based on the current hour vs typical transit duration (Road: 40km/h avg, Rail: 65km/h avg).
       - For RAIL: Output address MUST be the "Approaching [Station] Junction" or "Last Station Crossed: [Station]".
       - For ROAD: Output address MUST be the "Current Hub/Landmark" or "Entering [State/District] Border".

    DATA REQUIREMENTS:
    - Language: ${lang === 'te' ? 'Telugu' : lang === 'hi' ? 'Hindi' : 'English'}.
    - Prediction Confidence: Should reflect historical accuracy (usually 0.88 - 0.97).

    JSON OUTPUT FORMAT (STRICT):
    {
      "orderId": "${input.userOrderId}",
      "productName": "E-Commerce Package",
      "transportMode": "road" | "rail",
      "distanceKm": number,
      "currentLocation": { "lat": number, "lng": number, "address": string },
      "destinationLocation": { "lat": number, "lng": number },
      "driver": { "name": string, "vehicle": string, "phone": string, "rating": number, "speed": string },
      "trafficInfo": { "density": string, "delayMinutes": number, "status": string },
      "route": [ { "points": [[number, number], ...], "trafficDensity": "low" | "moderate" | "heavy" } ],
      "eta": string,
      "carrier": "India Post - National Transit Grid",
      "predictionConfidence": number,
      "steps": [ 
        { 
          "status": "Actual" | "Predicted", 
          "location": string, 
          "timestamp": string, 
          "description": string, 
          "icon": string 
        } 
      ]
    }
    
    Return ONLY JSON. No markdown blocks.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      tools: [{ googleMaps: {} }],
      toolConfig: {
        retrievalConfig: {
          latLng: userLocation ? {
            latitude: userLocation.lat,
            longitude: userLocation.lng
          } : undefined
        }
      }
    },
  });

  const rawText = response.text || "";
  const jsonString = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
  
  try {
    const data = JSON.parse(jsonString);
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (groundingChunks) {
      data.groundingSources = groundingChunks
        .filter((c: any) => c.maps)
        .map((c: any) => ({
          uri: c.maps.uri,
          title: c.maps.title
        }));
    }
    return data;
  } catch (e) {
    console.error("Failed to parse AI response:", jsonString);
    throw new Error("Logistics engine calculation error.");
  }
};