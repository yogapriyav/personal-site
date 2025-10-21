export default function Volunteering() {
  return (
    <div className="space-y-8">
      <h2 className="text-4xl font-bold text-slate-900 mb-8">Volunteering & Community</h2>
      
      <div className="space-y-6">
        <div className="bg-white p-8 rounded-lg shadow-sm">
          <h3 className="text-2xl font-bold text-slate-900 mb-2">Current</h3>
          <div className="border-l-4 border-cyan-500 pl-6 py-4">
            <h4 className="text-xl font-semibold text-slate-900 mb-2">Alameda County Community Food Bank</h4>
            <p className="text-slate-600 mb-3">Present</p>
            <p className="text-slate-700 mb-3">
              Supporting local communities in addressing food insecurity and hunger relief.
            </p>
            <a 
              href="https://www.accfb.org/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-cyan-600 hover:text-cyan-700 font-medium"
            >
              Learn more →
            </a>
          </div>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-sm">
          <h3 className="text-2xl font-bold text-slate-900 mb-4">Past Volunteer Work</h3>
          
          <div className="space-y-6">
            <div className="border-l-4 border-slate-300 pl-6 py-4">
              <h4 className="text-xl font-semibold text-slate-900 mb-2">Second Harvest of Silicon Valley</h4>
              <p className="text-slate-600 mb-3">2020 – 2025 | Oracle Corporate Volunteer Program</p>
              <p className="text-slate-700 mb-3">
                Participated in food sorting and distribution efforts through Oracle volunteer initiatives, 
                helping provide meals to families across Silicon Valley.
              </p>
              <a 
                href="https://www.shfb.org/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-cyan-600 hover:text-cyan-700 font-medium"
              >
                Learn more →
              </a>
            </div>

            <div className="border-l-4 border-slate-300 pl-6 py-4">
              <h4 className="text-xl font-semibold text-slate-900 mb-2">Bay Area Tutor</h4>
              <p className="text-slate-600 mb-3">2016 – 2018</p>
              <p className="text-slate-700 mb-3">
                Provided educational support and mentorship to students, helping build confidence and 
                academic skills in STEM subjects.
              </p>
              <a 
                href="https://bayareatutor.org/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-cyan-600 hover:text-cyan-700 font-medium"
              >
                Learn more →
              </a>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-8 rounded-lg">
          <p className="text-slate-700 italic">
            Giving back to the community reminds me what really matters—people, connection, and making a small difference where I can.
          </p>
        </div>
      </div>
    </div>
  );
}