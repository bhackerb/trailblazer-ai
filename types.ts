export interface UserPreferences {
  activityType: 'hike' | 'run';
  distance: number; // in miles
  travelTime: number; // in minutes
  difficulty: ('easy' | 'moderate' | 'hard')[];
  features: string[];
  minRating: number;
}

export interface TrailRecommendation {
  id: string;
  name: string;
  distance: string;
  elevation: string;
  travelTime: string;
  description: string;
  features: string[];
  googleMapsUri?: string;
  imageUrl?: string;
  rating?: number;
  reviewCount?: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}