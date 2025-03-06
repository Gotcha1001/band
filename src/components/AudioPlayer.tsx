import { deleteObject, ref } from "@firebase/storage";
import { storage } from "@/lib/firebase";
import { AudioTrack } from "@/lib/types-profile";
import { updateAudioTracks } from "../../actions/profile";
import { toast } from "sonner";

type AudioPlayerProps = {
  tracks: AudioTrack[];
  setTracks: (tracks: AudioTrack[]) => void;
  isOwnProfile: boolean; // <-- New prop to check if the user owns the profile
};

export default function AudioPlayer({
  tracks,
  setTracks,
  isOwnProfile,
}: AudioPlayerProps) {
  if (!Array.isArray(tracks) || tracks.length === 0) {
    return (
      <div className="text-gray-500 text-center p-4">
        🎵 No tracks available. Upload some music!
      </div>
    );
  }

  const handleDelete = async (trackUrl: string) => {
    try {
      toast.loading("Deleting your track...");

      // Step 1: Delete from Firebase Storage
      try {
        const urlPath = trackUrl.split("?")[0].split("/o/")[1];
        const decodedPath = decodeURIComponent(urlPath);
        console.log("🔍 Attempting to delete file:", decodedPath);

        const fileRef = ref(storage, decodedPath);
        await deleteObject(fileRef);
        console.log("✅ Successfully deleted file from Firebase Storage");
      } catch (storageError) {
        console.log(
          "⚠️ File may already be deleted from storage:",
          storageError
        );
      }

      // Step 2: Update the local state
      const updatedTracks = tracks.filter((track) => track.url !== trackUrl);
      setTracks(updatedTracks);
      console.log(
        "✅ Local state updated, remaining tracks:",
        updatedTracks.length
      );

      // Step 3: Update the database
      try {
        const result = await updateAudioTracks({ audioTracks: updatedTracks });
        console.log("✅ Database update result:", result);
        toast.success("Track deleted successfully");

        // Step 4: Refresh the page to reflect changes immediately
        window.location.reload();
      } catch (dbError) {
        console.error("❌ Failed to update database:", dbError);
        setTracks(tracks);
        toast.error("Failed to update the database. Please try again.");
        throw dbError;
      }
    } catch (error) {
      console.error("❌ Failed to delete track:", error);
      toast.error("Failed to delete track. Please try again.");
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-gray-800 py-5">
        🎶 Audio Tracks
      </h2>
      {tracks.map((track, index) => (
        <div key={track.url || index} className="p-4 bg-gray-100 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <p className="font-medium text-black">
              {track.name || `Track ${index + 1}`}
            </p>
            {/* Show Remove button only if the user owns the profile */}
            {isOwnProfile && (
              <button
                onClick={() => handleDelete(track.url)}
                className="text-red-500 hover:text-red-700 transition"
              >
                Remove
              </button>
            )}
          </div>
          <audio controls className="w-full">
            <source src={track.url} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </div>
      ))}
    </div>
  );
}
