import { GoogleGenAI } from "@google/genai";
import { UserPreferences, Coordinates, TrailRecommendation } from "../types";

const parseRecommendations = (text: string, groundingChunks: any[]): TrailRecommendation[] => {
  const recommendations: TrailRecommendation[] = [];
  const entries = text.split(/---ENTRY---/g);

  entries.forEach((entry, index) => {
    if (!entry.trim()) return;

    // Regex to extract fields based on the requested format
    const nameMatch = entry.match(/##\s*(.*?)(?:\n|$)/);
    const distanceMatch = entry.match(/\*\*Distance:\*\*\s*(.*?)(?:\n|$)/);
    const elevationMatch = entry.match(/\*\*Elevation:\*\*\s*(.*?)(?:\n|$)/);
    const travelTimeMatch = entry.match(/\*\*Travel Time:\*\*\s*(.*?)(?:\n|$)/);
    const ratingMatch = entry.match(/\*\*Rating:\*\*\s*(.*?)(?:\n|$)/);
    const reviewCountMatch = entry.match(/\*\*Review Count:\*\*\s*(.*?)(?:\n|$)/);
    const descriptionMatch = entry.match(/\*\*Description:\*\*\s*(.*?)(?:\n|$)/);
    const featuresMatch = entry.match(/\*\*Features:\*\*\s*(.*?)(?:\n|$)/);

    if (nameMatch) {
      const trailName = nameMatch[1].trim();
      let googleMapsUri = "";
      let imageUrl = "";
      
      // Attempt to match the trail name with grounding chunks to find a specific URI and Place ID
      if (groundingChunks) {
        const chunk = groundingChunks.find((c: any) => 
            c.web?.title?.toLowerCase().includes(trailName.toLowerCase()) || 
            c.maps?.title?.toLowerCase().includes(trailName.toLowerCase())
        );

        if (chunk) {
          // 1. Extract URI
          if (chunk.maps?.uri) {
            googleMapsUri = chunk.maps.uri;
          } else if (chunk.web?.uri) {
            googleMapsUri = chunk.web.uri;
          }

          // 2. Generate Image URL ONLY if a real photo is provided
          if (chunk.maps?.photos?.[0]?.uri) {
            imageUrl = chunk.maps.photos[0].uri;
          } 
        }
      }

      // Fallback: If no direct grounding URI found, construct a search link
      if (!googleMapsUri) {
         googleMapsUri = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trailName)}`;
      }

      recommendations.push({
        id: `trail-${index}-${Date.now()}`,
        name: trailName,
        distance: distanceMatch ? distanceMatch[1].trim() : "Unknown",
        elevation: elevationMatch ? elevationMatch[1].trim() : "Unknown",
        travelTime: travelTimeMatch ? travelTimeMatch[1].trim() : "Unknown",
        description: descriptionMatch ? descriptionMatch[1].trim() : "No description available.",
        features: featuresMatch ? featuresMatch[1].split(',').map(f => f.trim()) : [],
        googleMapsUri,
        imageUrl: imageUrl || undefined,
        rating: ratingMatch ? parseFloat(ratingMatch[1].trim()) : undefined,
        reviewCount: reviewCountMatch ? reviewCountMatch[1].trim() : undefined
      });
    }
  });

  // Sort by rating (highest to lowest)
  // If rating is undefined, put it at the end
  recommendations.sort((a, b) => {
    const ratingA = a.rating || 0;
    const ratingB = b.rating || 0;
    return ratingB - ratingA;
  });

  return recommendations;
};

export const getTrailSuggestions = async (
  prefs: UserPreferences,
  location: Coordinates
): Promise<TrailRecommendation[]> => {
  
  if (!process.env.API_KEY) {
    throw new Error("API Key not found");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const difficultyString = prefs.difficulty.length > 0 ? prefs.difficulty.join(" or ") : "any";

  const prompt = `
    I am currently at Latitude: ${location.latitude}, Longitude: ${location.longitude}.
    
    Please suggest 3 distinct ${prefs.activityType} options near me.
    
    My preferences are:
    - Preferred Trail Length: Around ${prefs.distance} miles.
    - Max Travel Time to Trailhead: ${prefs.travelTime} minutes.
    - Difficulty/Elevation: ${difficultyString}.
    - Minimum Google Maps Rating: ${prefs.minRating} stars (Strictly enforce this).
    - Desired Features: ${prefs.features.length > 0 ? prefs.features.join(", ") : "Scenic views"}.

    Use Google Maps to verify these trails exist, are reachable, and check their ratings.
    Please sort the suggestions by the highest Google Maps rating.
    
    CRITICAL: You must format your response specifically for parsing. Use the separator "---ENTRY---" between each trail.
    Follow this format exactly for each trail:

    ---ENTRY---
    ## [Name of Trail]
    **Distance:** [Approximate distance in miles]
    **Elevation:** [Elevation gain in feet/meters]
    **Travel Time:** [Approximate driving time from my location]
    **Rating:** [Google Maps numeric rating, e.g. 4.7]
    **Review Count:** [Approximate number of reviews, e.g. 350]
    **Description:** [A short, engaging description of the trail and why it fits my request]
    **Features:** [Comma separated list of key features]
    
    Do not add introductory text before the first entry.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
            googleSearchRetrieval: {
                dynamicRetrievalConfig: {
                    mode: "MODE_UNSPECIFIED",
                    dynamicThreshold: 0.7
                }
            }
        }
      },
    });

    const text = response.text || "";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    return parseRecommendations(text, groundingChunks);

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};