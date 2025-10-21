export default function Arts() {
  return (
    <div className="space-y-8">
      <h2 className="text-4xl font-bold text-slate-900 mb-8">Arts & Creative Pursuits</h2>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-lg shadow-sm text-center">
          <div className="text-6xl mb-4">🧩</div>
          <h3 className="text-xl font-bold text-slate-900 mb-3">Jigsaw Puzzles</h3>
          <p className="text-slate-600">Finding patterns and solving complex problems, one piece at a time.</p>
          <div className="mt-6 text-sm text-slate-500 italic">Gallery coming soon</div>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-sm text-center">
          <div className="text-6xl mb-4">🎨</div>
          <h3 className="text-xl font-bold text-slate-900 mb-3">Art</h3>
          <p className="text-slate-600">Exploring creativity through various mediums and expressions.</p>
          <div className="mt-6 text-sm text-slate-500 italic">Gallery coming soon</div>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-sm text-center">
          <div className="text-6xl mb-4">🎵</div>
          <h3 className="text-xl font-bold text-slate-900 mb-3">Music</h3>
          <p className="text-slate-600">Appreciating the patterns, complexity, and emotion in sound.</p>
          <div className="mt-6 text-sm text-slate-500 italic">Favorites coming soon</div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-lg mt-8">
        <p className="text-slate-700 text-center italic">
          There's something meditative about creating with your hands and seeing patterns emerge—whether in code, jigsaw pieces, or on canvas.
        </p>
      </div>
    </div>
  );
}