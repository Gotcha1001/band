"use client";
import { useEffect, useState } from "react";
import {
  getUserProfileById,
  updateAudioTracks,
} from "../../../../../actions/profile";
import { useParams } from "next/navigation";
import MotionWrapperDelay from "@/components/MotionWrapperDelay";
import MotionImageAll from "@/components/MotionImageAll";
import VideoDisplay from "@/components/VideoDisplay";
import { FacebookIcon, InstagramIcon } from "@/components/icons/social-icons";
import BandPhotosCarousel from "@/components/BandPhotosCarousel";
import loader from "@/lib/googleMapsLoader";
import MapDisplay from "@/components/MapDisplay";
import { parseLocation } from "@/lib/locationUtils";
import { useUser } from "@clerk/nextjs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { audioTrackSchema } from "@/lib/validation";
import AudioUpload from "@/components/AudioUpload";

import { AudioTrack } from "@/lib/types-profile";
import AudioPlayer from "@/components/AudioPlayer";

interface Profile {
  name: string;
  imageUrl: string;
  profileType: "band" | "gigProvider" | null;
  profile: {
    name: string;
    imageUrl: string;
    location: string;
    latitude?: number;
    longitude?: number;
    description?: string;
    website?: string;
    genre?: string;
    videoUrl?: string;
    services?: string;
    email?: string;
    phoneNumber?: string;
    headerImage?: string;
    facebookUrl?: string;
    instagramUrl?: string;
    bandMembers: string[];
    photos: string[];
    userId: string;
    audioTracks?: AudioTrack[]; // Changed from string[] to AudioTrack[]
    clerkUserId: string;
  };
}

// Updated AudioFormValues type
type AudioFormValues = {
  audioTracks: AudioTrack[]; // Changed from string[] to AudioTrack[]
};

declare global {
  interface Window {
    google: typeof google;
  }
}

export default function ProfileDisplay() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const { profileSlug } = useParams();

  const { user } = useUser();

  console.log("Comparing IDs:", {
    clerkUserId: user?.id,
    profileUserId: profile?.profile.userId,
    isOwnProfile: user?.id === profile?.profile.userId,
  });

  const isOwnProfile = user?.id === profile?.profile.clerkUserId;

  // Add this debug log
  console.log("Profile comparison:", {
    userClerkId: user?.id,
    profileClerkId: profile?.profile.clerkUserId,
    isOwnProfile,
  });

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (profileSlug) {
          const userData = await getUserProfileById(profileSlug);
          if (!userData || !userData.profile) {
            setError("Profile not found for ID " + profileSlug);
          } else {
            setProfile({
              ...userData,
              profileType:
                userData.profileType === "band" ||
                userData.profileType === "gigProvider"
                  ? userData.profileType
                  : null,
            });
          }
        } else {
          setError("No user ID provided in URL");
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [profileSlug]);

  // Initialize Google Maps
  // Inside the second useEffect that handles map initialization
  useEffect(() => {
    let mounted = true;

    // Add this console log to check latitude and longitude
    console.log("Profile data:", {
      lat: profile?.profile.latitude,
      lng: profile?.profile.longitude,
      mapLoaded,
    });

    if (
      !mapLoaded &&
      profile?.profile.latitude !== undefined &&
      profile?.profile.longitude !== undefined
    ) {
      const initMap = async () => {
        try {
          await loader.load();
          if (!mounted) return;

          const mapDiv = document.getElementById("profile-map");
          // Add this console log to check if map div exists
          console.log("Map container element:", mapDiv);

          if (!mapDiv) {
            console.log("Map container not available yet");
            return;
          }

          // Add this console log before map initialization
          console.log("Attempting to initialize map with:", {
            lat: profile.profile.latitude,
            lng: profile.profile.longitude,
          });

          const map = new google.maps.Map(mapDiv, {
            center: {
              lat: profile.profile.latitude!,
              lng: profile.profile.longitude!,
            },
            zoom: 14,
          });

          new google.maps.Marker({
            position: {
              lat: profile.profile.latitude!,
              lng: profile.profile.longitude!,
            },
            map,
            title: profile.profile.name,
          });

          setMapLoaded(true);
        } catch (error) {
          // Enhance error logging
          console.error("Error initializing map:", error);
          console.error("Error details:", {
            profileExists: !!profile,
            lat: profile?.profile.latitude,
            lng: profile?.profile.longitude,
          });
          if (mounted) {
            setError("Failed to initialize map");
          }
        }
      };

      initMap();
    }

    return () => {
      mounted = false;
    };
  }, [profile, mapLoaded]);

  // Add form setup for audio tracks
  const form = useForm<AudioFormValues>({
    resolver: zodResolver(audioTrackSchema),
    defaultValues: {
      audioTracks: profile?.profile.audioTracks || [],
    },
  });

  // Update form values when profile data changes
  useEffect(() => {
    if (profile?.profile.audioTracks) {
      form.reset({
        audioTracks: profile.profile.audioTracks,
      });
    }
  }, [profile?.profile.audioTracks, form]);

  // Handle audio track updates
  const handleAudioUpdate = async (newTracks: AudioTrack[]) => {
    console.log("📤 Sending audio tracks for update:", newTracks);

    if (!newTracks || newTracks.length === 0) {
      console.error("❌ No valid audio tracks provided");
      return;
    }

    try {
      await updateAudioTracks({
        audioTracks: newTracks,
      });

      console.log("✅ Audio update completed successfully");
      form.setValue("audioTracks", newTracks);
    } catch (error) {
      console.error("🚨 Error updating audio tracks:", error);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-800 to-purple-900">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute top-1 left-1 w-14 h-14 border-4 border-purple-500 border-t-transparent rounded-full animate-spin-slow"></div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-800 to-purple-900">
        <div className="backdrop-blur-lg bg-white/10 p-8 rounded-2xl shadow-2xl border border-white/20">
          <h2 className="text-red-400 text-2xl font-bold">
            Error Loading Profile
          </h2>
          <p className="text-gray-300 mt-4">{error}</p>
        </div>
      </div>
    );

  if (!profile)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-800 to-purple-900">
        <div className="backdrop-blur-lg bg-white/10 p-8 rounded-2xl shadow-2xl border border-white/20">
          <h2 className="text-yellow-400 text-2xl font-bold">
            No Profile Found Yet
          </h2>
          <p className="text-gray-300 mt-4">
            Please create a profile to get started.
          </p>
        </div>
      </div>
    );

  // Add this before the return statement in ProfileDisplay
  console.log("Profile location:", profile.profile.location);
  const coordinates = parseLocation(profile.profile.location);
  console.log("Parsed coordinates:", coordinates);

  return (
    <div className="min-h-screen gradient-background9  py-12 px-4 sm:px-6 lg:px-8 rounded-lg flex justify-center items-center">
      <div className="w-full max-w-4xl mx-auto">
        <MotionWrapperDelay
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          variants={{
            hidden: { opacity: 0, x: 100 },
            visible: { opacity: 1, x: 0 },
          }}
        >
          <MotionImageAll>
            <h1 className="text-6xl sm:text-3xl md:text-6xl lg:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-4 gradient-title text-center">
              {profile.profile.name}
            </h1>
          </MotionImageAll>
        </MotionWrapperDelay>

        {/* Hero Section */}
        <div className="relative mb-24">
          <MotionWrapperDelay
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            variants={{
              hidden: { opacity: 0, y: 100 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            <div className="h-64 rounded-3xl overflow-hidden relative">
              <img
                src={profile.profile.headerImage || "/bg.jpg"} // Use the headerImage if available, fallback to default
                alt="Header image"
                className="w-full h-full object-cover object-center rounded-3xl"
              />
            </div>
          </MotionWrapperDelay>

          <MotionImageAll>
            <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur"></div>
                <img
                  src={profile.profile.imageUrl}
                  alt={profile.profile.name}
                  className="relative w-32 h-32 rounded-full border-2 border-white/50 shadow-2xl object-cover"
                />
              </div>
            </div>
          </MotionImageAll>
        </div>

        {/* Carousel section  */}
        {profile.profile.photos && profile.profile.photos.length > 0 && (
          <BandPhotosCarousel photos={profile.profile.photos} />
        )}

        {/* carousel for the gig providers
        {profile.profile.photos && profile.profile.photos.length > 0 && (
          <BandPhotosCarousel photos={profile.profile.photos} />
        )} */}

        {/* Profile Content */}
        <div className="backdrop-blur-lg gradient-background10  rounded-3xl border  p-8 shadow-2xl">
          {/* Profile Type Badge */}
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-white/10 text-blue-300">
              {profile.profileType === "band" ? "Band" : "Gig Provider"}
            </span>
          </div>
          {profile.profileType === "gigProvider" && (
            <>
              <MotionWrapperDelay
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                variants={{
                  hidden: { opacity: 0, y: 100 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <div className="text-center mb-12 p-6 backdrop-blur-lg bg-indigo-900/20 border border-white/20 hover:shadow-2xl hover:bg-gradient-to-r from-red-600 to-purple-600 hover:text-white transition-all duration-300 rounded-3xl shadow-lg">
                  <h3 className="text-3xl text-white font-semibold mb-4">
                    Live Music Every Week
                  </h3>
                  <p className="text-lg text-gray-100 mb-6">
                    We provide live entertainment throughout the week. Contact
                    us to secure your bands performance slot and be part of our
                    vibrant music scene.
                  </p>
                  {profile.profile.email && (
                    <a
                      href={`mailto:${profile.profile.email}`}
                      className="inline-block px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white text-lg font-semibold hover:opacity-90 transition-opacity"
                    >
                      Contact For Booking
                    </a>
                  )}
                </div>
              </MotionWrapperDelay>
            </>
          )}

          {profile.profileType === "band" && (
            <div className="col-span-1 lg:col-span-2 space-y-6">
              <div className="backdrop-blur-lg bg-indigo-900/20 p-6 rounded-2xl border border-white/20 hover:shadow-2xl hover:bg-gradient-to-r from-red-600 to-purple-600 hover:text-white transition-all duration-300">
                <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-3">
                  Audio Tracks
                </h3>
                {/* Display audio tracks for all profiles */}
                {profile?.profile.audioTracks &&
                profile.profile.audioTracks.length > 0 ? (
                  <AudioPlayer
                    tracks={profile.profile.audioTracks}
                    setTracks={(newTracks: AudioTrack[]) =>
                      form.setValue("audioTracks", newTracks)
                    }
                    isOwnProfile={isOwnProfile}
                  />
                ) : (
                  <p className="text-gray-400">No audio tracks available.</p>
                )}

                {/* Allow upload/edit only if it's the user's own profile */}
                {isOwnProfile && (
                  <div className="mt-4">
                    <h4 className="text-lg font-bold text-gray-300 mb-2">
                      Upload New Audio Track
                    </h4>
                    <AudioUpload
                      onUploadComplete={handleAudioUpdate}
                      existingTracks={form.watch("audioTracks") || []}
                    />
                    {/* <AudioPlayer
                      tracks={profile?.profile.audioTracks || []}
                      setTracks={(newTracks: AudioTrack[]) =>
                        form.setValue("audioTracks", newTracks)
                      }
                      isOwnProfile={isOwnProfile}
                    /> */}
                  </div>
                )}
              </div>
            </div>
          )}
          {/* Location */}
          {profile.profile.location && (
            <MotionWrapperDelay
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              variants={{
                hidden: { opacity: 0, x: 100 },
                visible: { opacity: 1, x: 0 },
              }}
            >
              <div className="mb-8">
                <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-3 text-center">
                  Location
                </h3>

                {/* Display location name */}
                {(() => {
                  try {
                    const locationData = JSON.parse(profile.profile.location);
                    return (
                      <p className="text-center text-gray-300 mb-4">
                        {locationData.location}
                      </p>
                    );
                  } catch {
                    return null;
                  }
                })()}

                <MapDisplay
                  location={profile.profile.location}
                  name={profile.profile.name}
                />
              </div>
            </MotionWrapperDelay>
          )}
          {/* Video */}
          {profile.profile.videoUrl && (
            <div className="mb-16 w-full flex justify-center">
              <div className="w-full max-w-3xl">
                <VideoDisplay url={profile.profile.videoUrl} />
              </div>
            </div>
          )}
          {/* Profile Information Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Genre (for band) or Services (for gig provider) */}
              {profile.profileType === "band" && profile.profile.genre && (
                <div className="backdrop-blur-lg bg-indigo-900/20 p-6 rounded-2xl border border-white/20 hover:shadow-2xl hover:bg-gradient-to-r from-red-600 to-purple-600 hover:text-white transition-all duration-300">
                  <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-3">
                    Genre
                  </h3>
                  <p className="text-gray-300">{profile.profile.genre}</p>
                </div>
              )}

              {/* Contact Information */}
              {(profile.profile.email || profile.profile.phoneNumber) && (
                <MotionWrapperDelay
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                  variants={{
                    hidden: { opacity: 0, y: 100 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  <div className="backdrop-blur-lg bg-indigo-900/20 p-6 rounded-2xl border border-white/20 hover:shadow-2xl hover:bg-gradient-to-r from-red-600 to-purple-600 hover:text-white transition-all duration-300">
                    <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-3">
                      Contact Information
                    </h3>
                    {profile.profile.email && (
                      <p className="text-gray-300 mb-2">
                        <span className="font-medium">Email:</span>{" "}
                        <a
                          href={`mailto:${profile.profile.email}`}
                          className="hover:text-blue-400 transition-colors duration-300"
                        >
                          {profile.profile.email}
                        </a>
                      </p>
                    )}
                    {profile.profile.phoneNumber && (
                      <p className="text-gray-300">
                        <span className="font-medium">Phone:</span>{" "}
                        <a
                          href={`tel:+27${
                            profile.profile.phoneNumber.startsWith("0")
                              ? profile.profile.phoneNumber.slice(1)
                              : profile.profile.phoneNumber
                          }`}
                          className="hover:text-blue-400 transition-colors duration-300"
                        >
                          {profile.profile.phoneNumber}
                        </a>
                      </p>
                    )}
                  </div>
                </MotionWrapperDelay>
              )}

              {/* Social Media Links */}
              {(profile.profile.facebookUrl ||
                profile.profile.instagramUrl) && (
                <MotionWrapperDelay
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                  variants={{
                    hidden: { opacity: 0, y: 100 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  <div className="backdrop-blur-lg bg-indigo-900/20 p-6 rounded-2xl border border-white/20 hover:shadow-2xl hover:bg-gradient-to-r from-red-600 to-purple-600 hover:text-white transition-all duration-300">
                    <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-3">
                      Social Media
                    </h3>
                    <div className="space-y-3">
                      {profile.profile.facebookUrl && (
                        <a
                          href={profile.profile.facebookUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 text-gray-300 hover:text-blue-400 transition-colors duration-300"
                        >
                          <FacebookIcon className="w-5 h-5 text-blue-500" />
                          <span>Facebook Profile</span>
                        </a>
                      )}
                      {profile.profile.instagramUrl && (
                        <a
                          href={profile.profile.instagramUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 text-gray-300 hover:text-pink-400 transition-colors duration-300"
                        >
                          <InstagramIcon className="w-5 h-5 text-pink-500" />
                          <span>Instagram Profile</span>
                        </a>
                      )}
                    </div>
                  </div>
                </MotionWrapperDelay>
              )}

              {profile.profileType === "gigProvider" &&
                profile.profile.services && (
                  <MotionWrapperDelay
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    variants={{
                      hidden: { opacity: 0, x: 100 },
                      visible: { opacity: 1, x: 0 },
                    }}
                  >
                    <div className="backdrop-blur-lg bg-indigo-900/20 p-6 rounded-2xl border border-white/20 hover:shadow-2xl hover:bg-gradient-to-r from-red-600 to-purple-600 hover:text-white transition-all duration-300">
                      <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-3">
                        Services
                      </h3>
                      <p className="text-gray-300">
                        {profile.profile.services}
                      </p>
                    </div>
                  </MotionWrapperDelay>
                )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* About */}
              {profile.profile.description && (
                <MotionWrapperDelay
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                  variants={{
                    hidden: { opacity: 0, y: 100 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  <div className="backdrop-blur-lg bg-indigo-900/20 p-6 rounded-2xl border border-white/20 hover:shadow-2xl hover:bg-gradient-to-r from-red-600 to-purple-600 hover:text-white transition-all duration-300">
                    <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-3">
                      About
                    </h3>
                    <p className="text-gray-300">
                      {profile.profile.description}
                    </p>
                  </div>
                </MotionWrapperDelay>
              )}

              {/* Website */}
              {profile.profile.website && (
                <MotionWrapperDelay
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  variants={{
                    hidden: { opacity: 0, x: -100 },
                    visible: { opacity: 1, x: 0 },
                  }}
                >
                  <div className="backdrop-blur-lg bg-indigo-900/20 p-6 rounded-2xl border border-white/20 hover:shadow-2xl hover:bg-gradient-to-r from-red-600 to-purple-600 hover:text-white transition-all duration-300">
                    <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-3">
                      Website
                    </h3>
                    <a
                      href={profile.profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
                    >
                      {profile.profile.website}
                    </a>
                  </div>
                </MotionWrapperDelay>
              )}

              {profile.profileType === "band" &&
                profile.profile.bandMembers &&
                profile.profile.bandMembers.length > 0 && (
                  <MotionWrapperDelay
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    variants={{
                      hidden: { opacity: 0, y: 100 },
                      visible: { opacity: 1, y: 0 },
                    }}
                  >
                    <div className="backdrop-blur-lg bg-indigo-900/20 p-6 rounded-2xl border border-white/20 hover:shadow-2xl hover:bg-gradient-to-r from-red-600 to-purple-600 hover:text-white transition-all duration-300">
                      <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-3">
                        Band Members
                      </h3>
                      <div className="space-y-2">
                        {profile.profile.bandMembers.map(
                          (member, index) =>
                            member && (
                              <p key={index} className="text-gray-300">
                                {member}
                              </p>
                            )
                        )}
                      </div>
                    </div>
                  </MotionWrapperDelay>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
