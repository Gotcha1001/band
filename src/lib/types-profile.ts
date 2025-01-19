import { Band, GigProvider } from "@prisma/client";

export interface BaseProfile {
  name: string;
  imageUrl: string;
  location: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  website?: string;
  email?: string; // New field
  phoneNumber?: string; // New field
  headerImage?: string; // New field
  facebookUrl?: string; // New field
  instagramUrl?: string; // New field
}

export interface BandProfile extends BaseProfile {
  profileType: "band";
  genre: string;
  videoUrl?: string;
  services?: undefined; // Ensures services are not used for bands
  bandMembers?: string[]; // New field
  audioTracks?: AudioTrack[]; // Fix: Use consistent type for audioTracks
}

export interface GigProviderProfile extends BaseProfile {
  profileType: "gigProvider";
  services: string;
  genre?: undefined; // Ensures genre is not used for gig providers
  videoUrl?: undefined; // Gig providers do not have video URLs
  photos?: string[]; // New field
  audioTracks?: AudioTrack[]; // Fix: Use consistent type for audioTracks
}

export type Profile = BandProfile | GigProviderProfile;

export interface ProfileResponse {
  id: string;
  name: string;
  imageUrl: string;
  location: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  website?: string;
  genre?: string; // Optional because it's specific to bands
  services?: string; // Optional because it's specific to gig providers
  videoUrl?: string; // Optional because it's specific to bands
  email?: string; // New field
  phoneNumber?: string; // New field
  headerImage?: string; // New field
  facebookUrl?: string; // New field
  instagramUrl?: string; // New field
  bandMembers?: string[]; // Optional because it's specific to bands
  photos?: string[]; // Optional because it's specific to gig providers
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  audioTracks?: AudioTrack[]; // Fix: Use consistent type for audioTracks
}

export interface ProfileFormData {
  name: string;
  imageUrl: string;
  location: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  website?: string;
  genre?: string; // Optional because it's specific to bands
  services?: string; // Optional because it's specific to gig providers
  videoUrl?: string; // Optional because it's specific to bands
  email?: string; // New field
  phoneNumber?: string; // New field
  headerImage?: string; // New field
  facebookUrl?: string; // New field
  instagramUrl?: string; // New field
  bandMembers?: string[]; // Optional because it's specific to bands
  photos?: string[]; // Optional because it's specific to gig providers
  audioTracks?: AudioTrack[]; // Fix: Use consistent type for audioTracks
}

export interface SharedProfileData {
  id: string;
  userId: string;
  sharedBy: string;
  profileType: "band" | "gigProvider";
  shareDate: Date;
  shareMessage?: string;
  user: {
    name: string;
    imageUrl: string;
    band?: Band | null; // Band type or null
    gigProvider?: GigProvider | null; // GigProvider type or null
  };
}

export interface ShareProfileFormData {
  userId: string;
  profileType: "band" | "gigProvider";
  shareMessage?: string;
}

export interface AudioTrack {
  name: string;
  url: string;
}
