import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "@firebase/storage";
import { useState } from "react";
import { Alert, AlertDescription } from "./ui/alert";
import { Button } from "./ui/button";
import { storage } from "@/lib/firebase";

interface AudioUploadProps {
  onUploadComplete: (tracks: string[]) => void;
  existingTracks?: string[];
}

export default function AudioUpload({
  onUploadComplete,
  existingTracks = [],
}: AudioUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      setError(null);
      const files = e.target.files;
      if (!files) return;

      // Check file count
      if (files.length + existingTracks.length > 4) {
        throw new Error("Maximum 4 audio tracks allowed");
      }

      // Check file types and sizes
      for (const file of files) {
        if (!file.type.startsWith("audio/")) {
          throw new Error("Only audio files are allowed");
        }
        if (file.size > 10 * 1024 * 1024) {
          throw new Error("Files must be under 10MB");
        }
      }

      const uploadPromises = Array.from(files).map(async (file) => {
        const fileName = `audio-tracks/${Date.now()}-${file.name}`;
        const storageRef = ref(storage, fileName);
        await uploadBytes(storageRef, file);
        return getDownloadURL(storageRef);
      });

      const newUrls = await Promise.all(uploadPromises);

      if (newUrls && newUrls.length > 0) {
        onUploadComplete([...existingTracks, ...newUrls]);
      } else {
        throw new Error("No valid tracks uploaded");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (trackUrl: string) => {
    try {
      const fileRef = ref(storage, trackUrl);
      await deleteObject(fileRef);
      const newTracks = existingTracks.filter((url) => url !== trackUrl);
      onUploadComplete(newTracks);
    } catch {
      setError("Failed to delete track");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <input
          type="file"
          accept="audio/*"
          multiple
          onChange={handleUpload}
          disabled={uploading || existingTracks.length >= 4}
          className="hidden"
          id="audio-upload"
        />
        <Button
          onClick={() => document.getElementById("audio-upload")?.click()}
          disabled={uploading || existingTracks.length >= 4}
          className="w-full"
        >
          {uploading ? "Uploading..." : "Upload Audio Tracks"}
        </Button>
        <p className="text-sm text-gray-500 mt-2">
          {`${
            4 - existingTracks.length
          } slots remaining (max 4 tracks, 10MB per file)`}
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {existingTracks.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Uploaded Tracks:</h4>
          {existingTracks.map((url, index) => (
            <div
              key={url}
              className="flex items-center justify-between p-2 bg-gray-100 rounded"
            >
              <span>Track {index + 1}</span>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(url)}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
