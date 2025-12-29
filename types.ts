
export interface Activity {
  time: string;
  activity: string;
  location: string;
  description: string;
  type: 'food' | 'culture' | 'nature' | 'adventure' | 'relax';
  cost_estimate: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  booked?: boolean;
}

export interface DayItinerary {
  day: number;
  theme: string;
  activities: Activity[];
}

export interface TravelSuggestions {
  flight: {
    airline: string;
    price: string;
    route: string;
    note: string;
  };
  hotel: {
    name: string;
    price: string;
    rating: string;
    description: string;
  };
}

export interface Itinerary {
  id: string;
  destination: string;
  duration: number; // days
  startDate?: string;
  travelers?: number;
  groupType?: string[];
  budget: string;
  days: DayItinerary[];
  createdAt?: number;
  suggestions?: TravelSuggestions;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  sources?: { title: string; uri: string }[];
}

export interface UserPreferences {
  destination: string;
  days: number;
  startDate: string;
  travelers: number;
  groupComposition: string[]; // e.g. 'Kids', 'Elderly', 'Couple'
  budget: 'Budget' | 'Moderate' | 'Luxury';
  interests: string[];
}

export interface UserProfile {
  name: string;
  bio: string;
  homeBase: string;
  defaultBudget: 'Budget' | 'Moderate' | 'Luxury';
  defaultInterests: string[];
  hasCompletedOnboarding?: boolean;
}

export interface CuratedItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  prefs: Partial<UserPreferences>;
  details: {
    bestTime: string;
    visa: string;
    customs: string[];
    bookingLink?: string;
    bookingText?: string;
  };
  homeDisplay?: {
    tag?: string;
    label: string;
  };
}

export enum AppView {
  LANDING = 'LANDING',
  AUTH = 'AUTH',
  ONBOARDING = 'ONBOARDING',
  HOME = 'HOME',
  PLANNER = 'PLANNER',
  ITINERARY = 'ITINERARY',
  EXPLORE = 'EXPLORE',
  PROFILE = 'PROFILE',
  CURATED = 'CURATED'
}
