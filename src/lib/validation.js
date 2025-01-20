import { z } from "zod";

const commonFields = {
  email: z.string().email("Invalid email format").optional(),
  phoneNumber: z
    .string()
    .regex(/^\+?[\d\s-()]{10,}$/, "Invalid phone number format")
    .optional(),
  headerImage: z.string().url("Invalid URL format").optional(),
  // Add social media fields to common fields
  facebookUrl: z.string().url("Invalid Facebook URL").optional(),
  instagramUrl: z.string().url("Invalid Instagram URL").optional(),
  location: z.string().min(1, "Location Required"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
};

export const profileSchema = z.object({
  name: z
    .string()
    .min(1, "Band Name Required")
    .max(100, "Band Name Cannot Exceed 100 Characters"),
  genre: z
    .string()
    .min(1, "Band Genere Required")
    .max(100, "Band Genere Cannot Exceed 100 Characters"),
  location: z
    .string()
    .min(1, "Location Required")
    .max(100, "Location Cannot Exceed 100 Characters"),
  description: z
    .string()
    .max(500, "Description must be under 500 Characters")
    .optional(),
  website: z.string().url("Invalid URL format").optional(),
  videoUrl: z
    .string()
    .min(1, "VideoUrl Required")
    .max(100, "VideoUrl Cannot Exceed 100 Characters")
    .optional(),
  imageUrl: z
    .string()
    .min(1, "ImageUrl Required")
    .max(200, "ImageUrl Cannot Exceed 100 Characters")
    .optional(),
  bandMembers: z
    .array(z.string())
    .max(7, "Cannot have more than 7 band members")
    .optional(),
  photos: z
    .array(z.string().url("Invalid photo URL"))
    .max(7, "Cannot have more than 7 photos")
    .optional(),
  audioTracks: z
    .array(z.string().url("Invalid audio URL"))
    .max(4, "Cannot have more than 4 audio tracks")
    .optional(),

  ...commonFields,
});

export const gigProviderSchema = z.object({
  name: z
    .string()
    .min(1, "Gig Provider Name is Required")
    .max(100, "Name Cannot Exceed 100 Characters"),
  services: z
    .string()
    .min(1, "Services Offered are Required")
    .max(500, "Services Cannot Exceed 500 Characters"),
  location: z
    .string()
    .min(1, "Location is Required")
    .max(100, "Location Cannot Exceed 100 Characters"),
  description: z
    .string()
    .max(500, "Description Cannot Exceed 500 Characters")
    .optional(),
  website: z.string().url("Invalid URL Format").optional(),
  imageUrl: z.string().url("Invalid URL Format").optional(),
  photos: z
    .array(z.string().url("Invalid photo URL"))
    .max(7, "Cannot have more than 7 photos")
    .optional(),
  ...commonFields,
});

// Add to your existing validation schema
export const audioTrackSchema = z.object({
  audioTracks: z
    .array(z.string().url("Invalid audio track URL"))
    .max(4, "Cannot have more than 4 audio tracks"),
});
