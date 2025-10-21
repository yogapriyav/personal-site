export default function Tech() {
  return (
    <div className="space-y-8">
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
  );
}