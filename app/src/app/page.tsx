'use client';

import React, { useState } from 'react';

export default function Portfolio() {
  const [activeSection, setActiveSection] = useState('about');

  const navigation = [
    { id: 'about', label: 'About' },
    { id: 'tech', label: 'Tech' },
    { id: 'arts', label: 'Arts' },
    { id: 'volunteering', label: 'Volunteering' },
    { id: 'contact', label: 'Contact' }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-center">
            <div className="flex gap-8">
              {navigation.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`text-sm font-medium transition-colors ${
                    activeSection === item.id 
                      ? 'text-cyan-600 border-b-2 border-cyan-600' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-16">
        {/* About Section */}
        {activeSection === 'about' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="bg-white p-10 rounded-lg shadow-sm max-w-5xl mx-auto">
             <div className="grid md:grid-cols-5 gap-10 items-start">
                {/* Photo - takes 2 columns */}
                <div className="md:col-span-2 flex justify-center">
                  <img 
                    src="/images/profile.jpg" 
                    alt="Yogapriya at Great Ocean Road"
                    className="w-full max-w-sm h-auto object-cover rounded-lg shadow-lg"
                  />
                </div>

                {/* Text - takes 4 columns */}
                <div className="md:col-span-3 space-y-6">
                  <div>
                    <h1 className="text-3xl font-bold text-slate-800 mb-2">Yogapriya Veturi</h1>
                    <p className="text-lg text-slate-600">Engineering Leader | SRE | Builder of Teams</p>
                  </div>

                  <p className="text-slate-700 leading-relaxed text-justify">
                    Over the years, I've realised how much I enjoy building teams and recognizing potential in people. I also quite love transforming complex 
                    technical challenges into simpler, dare-I-say elegant, solutions by bringing the right people together and giving them space to thrive.
                    I'm biased toward automation over manual work, quality over quantity, and clear communication - especially crucial 
                    during high-stakes situations. Skills I've built over 19 years in tech.
                  </p>
                  
                  <p className="text-slate-700 leading-relaxed text-justify">
                    Right now, I'm learning by building - deploying this site on Kubernetes with Terraform, sharpening my 
                    coding skills, and exploring how AI can help reliability engineering.
                  </p>
                  
                  <p className="text-slate-700 leading-relaxed text-justify">
                    Outside of work, I find quiet joy in nature, art, and solving puzzles. I love conversations about everything 
                    from philosophy to music - usually asking questions and listening to different perspectives.
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
        )}

        {/* Tech Section */}
        {activeSection === 'tech' && (
          <div className="space-y-8 animate-fadeIn">
            <h2 className="text-4xl font-bold text-slate-900 mb-8">Tech & Projects</h2>
            
            <div className="bg-white p-8 rounded-lg shadow-sm mb-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Building in Public</h3>
              <p className="text-slate-700 mb-6">
                I'm currently exploring AI-native SRE practices and building projects that demonstrate production-grade 
                infrastructure patterns. This very site is a learning exercise—built with Next.js, deployed on Kubernetes, 
                managed with Terraform, and monitored with Prometheus/Grafana.
              </p>
              <a 
                href="https://github.com/yogapriyav" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                View My GitHub
              </a>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Blog</h3>
              <p className="text-slate-600 italic">Coming soon: Technical essays on SRE, automation, and AI-native operations.</p>
            </div>

            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 rounded-lg text-white">
              <h3 className="text-2xl font-bold mb-4">Technical Expertise</h3>
              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div>
                  <h4 className="font-semibold text-cyan-400 mb-3">Cloud & Infrastructure</h4>
                  <p className="text-slate-300 text-sm">OCI, AWS, Terraform, Kubernetes, Infrastructure as Code, Multi-region deployments</p>
                </div>
                <div>
                  <h4 className="font-semibold text-cyan-400 mb-3">Observability</h4>
                  <p className="text-slate-300 text-sm">Prometheus, Grafana, ELK, Custom metrics, Distributed tracing, Performance optimization</p>
                </div>
                <div>
                  <h4 className="font-semibold text-cyan-400 mb-3">SRE Practices</h4>
                  <p className="text-slate-300 text-sm">Incident management, SLO/SLI frameworks, Capacity planning, On-call optimization, Blameless postmortems</p>
                </div>
                <div>
                  <h4 className="font-semibold text-cyan-400 mb-3">Automation & CI/CD</h4>
                  <p className="text-slate-300 text-sm">GitOps, GitHub Actions, Jenkins, Automated provisioning, Infrastructure automation</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Arts Section */}
        {activeSection === 'arts' && (
          <div className="space-y-8 animate-fadeIn">
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
                "I find quiet joy in nature, art, and solving puzzles. There's something meditative about creating with your hands 
                and seeing patterns emerge—whether in code, jigsaw pieces, or on canvas."
              </p>
            </div>
          </div>
        )}

        {/* Volunteering Section */}
        {activeSection === 'volunteering' && (
          <div className="space-y-8 animate-fadeIn">
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
                      Participated in food sorting and distribution efforts through Oracle's volunteer initiatives, 
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
                  "Giving back to the community reminds me what really matters—people, connection, and making a small difference where I can."
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Contact Section */}
        {activeSection === 'contact' && (
          <div className="space-y-8 animate-fadeIn">
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
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-8 mt-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-slate-400 text-sm">
            Built with Next.js • Deployed on Kubernetes • Managed with Terraform • Monitored with AI
          </p>
          <p className="text-slate-500 text-xs mt-2">
            © 2025 Yogapriya Veturi
          </p>
        </div>
      </footer>
    </div>
  );
}