import { useState } from "react";
import { Alert, AlertDescription } from "./ui/alert";
import { Button } from "./ui/button";
import { storage } from "@/lib/firebase";
import { AudioTrack } from "@/lib/types-profile";
import { uploadBytes, getDownloadURL, ref } from "@firebase/storage";
import { toast } from "sonner";

interface AudioUploadProps {
  onUploadComplete: (tracks: AudioTrack[]) => void;
  existingTracks?: AudioTrack[];
}

export default function AudioUpload({
  onUploadComplete,
  existingTracks = [],
}: AudioUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [trackName, setTrackName] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("No file selected");
      return;
    }

    if (!trackName.trim()) {
      setError("Track name is required");
      return;
    }

    // Check file count
    if (existingTracks.length >= 4) {
      setError("Maximum 4 audio tracks allowed");
      return;
    }

    // ✅ Step 1: Ensure File Is an Audio File
    const validAudioTypes = ["audio/mpeg", "audio/wav", "audio/ogg"];
    if (!validAudioTypes.includes(selectedFile.type)) {
      setError("Invalid file type. Please upload an MP3, WAV, or OGG file.");
      return;
    }

    // ✅ Step 2: Check If File Is Empty
    if (selectedFile.size === 0) {
      setError("File is empty. Please select a valid audio file.");
      return;
    }

    // Check file size
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File must be under 10MB");
      return;
    }

    try {
      setUploading(true);
      setError(null);
      toast.loading("Uploading your track...");

      const fileName = `audio-tracks/${Date.now()}-${selectedFile.name}`;
      const storageRef = ref(storage, fileName);
      const metadata = { contentType: selectedFile.type || "audio/mpeg" };

      // ✅ Step 3: Verify Upload Completes Before Getting URL
      await uploadBytes(storageRef, selectedFile, metadata);
      const downloadUrl = await getDownloadURL(storageRef);

      console.log("✅ Uploaded file URL:", downloadUrl); // Debug log

      const newTrack: AudioTrack = { name: trackName, url: downloadUrl };

      // Create a new array with the new track
      const updatedTracks = [...(existingTracks || []), newTrack];
      onUploadComplete(updatedTracks);

      // Reset state
      setSelectedFile(null);
      setTrackName("");

      // Force a page refresh to show the new track
      // This is a workaround for the refresh issue mentioned
      window.location.reload();
    } catch (error) {
      setError("Upload failed");
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <input
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
          className="hidden"
          id="audio-upload"
        />
        <Button
          onClick={() => document.getElementById("audio-upload")?.click()}
          disabled={uploading || existingTracks.length >= 4}
          className="w-full"
        >
          Select Audio File
        </Button>
        <p className="text-sm text-gray-500 mt-2">
          {`${
            4 - existingTracks.length
          } slots remaining (max 4 tracks, 10MB per file)`}
        </p>
      </div>

      {/* Track Name Input */}
      {selectedFile && (
        <div>
          <input
            type="text"
            placeholder="Enter track name"
            value={trackName}
            onChange={(e) => setTrackName(e.target.value)}
            className="border p-2 rounded w-full"
          />
          <Button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full mt-2"
          >
            {uploading ? "Uploading..." : "Upload Track"}
          </Button>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Display existing tracks with delete buttons */}
      {/* {existingTracks.length > 0 && (
        <div className="space-y-2 mt-4">
          <h4 className="font-medium">Uploaded Tracks:</h4>
          {existingTracks.map((track, index) => (
            <div
              key={track.url}
              className="flex items-center justify-between p-2 bg-gray-100 rounded"
            >
              <span className="text-black">
                {track.name || `Track ${index + 1}`}
              </span>
            </div>
          ))}
        </div>
      )} */}
    </div>
  );
}
