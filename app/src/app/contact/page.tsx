export default function Contact() {
  return (
    <div className="space-y-8">
      <h2 className="text-4xl font-bold text-slate-900 mb-8 text-center">Let's Connect</h2>
      
      <div className="max-w-2xl mx-auto">
        <div className="bg-white p-10 rounded-lg shadow-sm text-center">
          <p className="text-slate-700 mb-8 text-lg">
            I'm always interested in conversations about SRE, team building, automation, or any of the topics 
            I've shared here. Feel free to reach out!
          </p>

          <div className="space-y-4">
            <a 
              href="mailto:yogapriya.veturi@gmail.com"
              className="block bg-slate-900 text-white px-8 py-4 rounded-lg hover:bg-slate-800 transition-colors text-lg font-medium"
            >
              yogapriya.veturi@gmail.com
            </a>

            <a 
              href="https://linkedin.com/in/yogapriyaveturi"
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-cyan-600 text-white px-8 py-4 rounded-lg hover:bg-cyan-700 transition-colors text-lg font-medium"
            >
              Connect on LinkedIn
            </a>

            <a 
              href="https://github.com/yogapriyav"
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-slate-700 text-white px-8 py-4 rounded-lg hover:bg-slate-600 transition-colors text-lg font-medium"
            >
              Follow on GitHub
            </a>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-200">
            <p className="text-slate-600">
              📍 Oakland, California
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}