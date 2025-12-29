
import { UserProfile, Itinerary } from "../types";
import { api } from './api';

/**
 * @deprecated This service is deprecated. Use 'api' service for Neon DB persistence.
 * These methods are kept for compatibility but are now largely no-ops or simple wrappers.
 */

export const getProfile = (): UserProfile => {
  // Synchronous fetch is not supported by DB, returning default. 
  // Components should use await api.getUserProfile()
  console.warn("Using deprecated synchronous getProfile. Please migrate to api.getUserProfile()");
  return {
    name: 'Traveler',
    bio: 'Loading...',
    homeBase: '',
    defaultBudget: 'Moderate',
    defaultInterests: []
  };
};

export const saveProfile = (profile: UserProfile): void => {
  api.updateUserProfile(profile);
};

export const getSavedItineraries = (): Itinerary[] => {
  console.warn("Using deprecated synchronous getSavedItineraries. Please migrate to api.getItineraries()");
  return [];
};

export const saveItinerary = (itinerary: Itinerary): void => {
  api.createItinerary(itinerary);
};

export const deleteItinerary = (id: string): void => {
  api.deleteItinerary(id);
};
