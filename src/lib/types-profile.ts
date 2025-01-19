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
  phoneNumber?: string;
  headerImage?: string;
  facebookUrl?: string; // New field
  instagramUrl?: string; // New field
}

export interface BandProfile extends BaseProfile {
  profileType: "band";
  genre: string;
  videoUrl?: string;
  services?: undefined;
  bandMembers?: string[]; // New field
  audioTracks?: string[];
}

export interface GigProviderProfile extends BaseProfile {
  profileType: "gigProvider";
  services: string;
  genre?: undefined;
  videoUrl?: undefined;
  photos?: string[]; // Add this line
  audioTracks?: AudioTrack[];
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
  genre?: string;
  services?: string;
  videoUrl?: string;
  email?: string; // New field
  phoneNumber?: string; // New field
  headerImage?: string; // Add this line
  facebookUrl?: string; // New field
  instagramUrl?: string; // New field
  bandMembers?: string[]; // New field
  photos?: string[]; // Add this line only
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  audioTracks?: string[];
}

export interface ProfileFormData {
  name: string;
  imageUrl: string;
  location: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  website?: string;
  genre?: string;
  services?: string;
  videoUrl?: string;
  email?: string; // New field
  phoneNumber?: string; // New field
  headerImage?: string; // Add this line
  facebookUrl?: string; // New field
  instagramUrl?: string; // New field
  bandMembers?: string[]; // New field
  photos?: string[]; // Add this line only
  audioTracks?: string[];
}

export interface SharedProfileData {
  id: string;
  userId: string;
  sharedBy: string;
  profileType: string;
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
  profileType: string;
  shareMessage?: string;
}
export interface AudioTrack {
  name: string;
  url: string;
}
