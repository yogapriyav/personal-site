export default function About() {
  return (
    <div className="space-y-8">
      <div className="bg-white p-10 rounded-lg shadow-sm max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-10 items-start">
          {/* Photo */}
          <div className="flex justify-center">
            <img 
              src="/images/profile.jpg" 
              alt="Yogapriya at Great Ocean Road"
              className="w-full max-w-sm h-auto object-cover rounded-lg shadow-lg"
            />
          </div>

          {/* Text */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">Yogapriya Veturi</h1>
              <p className="text-lg text-slate-600">Engineering Leader | SRE | Builder of Teams</p>
            </div>

            <p className="text-slate-700 leading-relaxed text-justify">
              Over the years, I've realised how much I enjoy building teams and recognizing potential 
              in people. I also quite love transforming complex technical challenges into simpler, 
              dare-I-say elegant, solutions by bringing the right people together and giving them space 
              to thrive. I'm biased toward automation over manual work, quality over quantity, and clear 
              communication - especially crucial during high-stakes situations. Skills I've built over 19 
              years in tech.
            </p>
            
            <p className="text-slate-700 leading-relaxed text-justify">
              Right now, I'm learning by building - deploying this site on Kubernetes with Terraform, 
              sharpening my coding skills, and exploring how AI can help reliability engineering.
            </p>
            
            <p className="text-slate-700 leading-relaxed text-justify">
              Outside of work, I find quiet joy in nature, art, and solving puzzles. I love conversations 
              about everything from philosophy to music - usually asking questions and listening to 
              different perspectives.
            </p>

            <div className="flex flex-wrap gap-2 pt-4">
              <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs">19+ years</span>
              <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs">DevOps & SRE</span>
              <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs">Multi-region</span>
              <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs">99.9% uptime</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}