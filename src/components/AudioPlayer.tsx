export default function AudioPlayer({ tracks }: { tracks: string[] }) {
  return (
    <div className="space-y-4">
      {tracks.map((trackUrl, index) => (
        <div key={index} className="p-4 bg-gray-100 rounded-lg">
          <p className="mb-2 font-medium">{`Track ${index + 1}`}</p>
          <audio controls className="w-full">
            <source src={trackUrl} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </div>
      ))}
    </div>
  );
}
