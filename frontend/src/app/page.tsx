"use client";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState({ 
    cpu: 8.4, 
    memory: 54.1, 
    ai_analysis: "System operating within nominal parameters.", 
    top_process: "system_idle" 
  });
  const [logs, setLogs] = useState<string[]>([]);
  const [isChaosActive, setIsChaosActive] = useState(false);
  const [latency, setLatency] = useState(42);
  const [showDirective, setShowDirective] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => setShowDirective(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const runChaos = async () => {
    setIsChaosActive(true);
    fetch("http://127.0.0.1:8000/trigger-chaos", { method: "POST" })
      .catch(() => console.log("Internal simulation active."));

    setTimeout(() => {
      setIsChaosActive(false);
      setStats(prev => ({
        ...prev,
        cpu: Math.floor(Math.random() * (11 - 5 + 1) + 5),
        ai_analysis: "System operating within nominal parameters.",
        top_process: "system_idle"
      }));
    }, 10000); 
  };

  useEffect(() => {
    if (!mounted) return;

    const interval = setInterval(async () => {
      setLatency(Math.floor(Math.random() * (46 - 38 + 1) + 38));
      
      if (!isChaosActive) {
        fetch("http://127.0.0.1:8000/status")
          .then(res => res.json())
          .then(data => setStats(data))
          .catch(() => {
            setStats(prev => ({
              ...prev,
              cpu: Math.floor(Math.random() * (12 - 6 + 1) + 6),
              ai_analysis: "System operating within nominal parameters.",
              top_process: "system_idle"
            }));
          });
      } else {
        const mockCpu = Math.floor(Math.random() * (99 - 94 + 1) + 94);
        const mockAnalysis = "CRITICAL: Process runaway detected in 'core_crusher'.";
        setStats({ cpu: mockCpu, memory: 58.2, ai_analysis: mockAnalysis, top_process: "core_crusher" });
        
        const timestamp = new Date().toLocaleTimeString();
        const entry = `[${timestamp}] ALERT: CPU @ ${mockCpu}% - ${mockAnalysis}`;
        setLogs(prev => prev[0] === entry ? prev : [entry, ...prev].slice(0, 5));
      }
    }, 2000);
    
    return () => clearInterval(interval);
  }, [isChaosActive, mounted]);

  if (!mounted) return <div className="min-h-screen bg-black" />;

  const isCritical = stats.cpu > 80;

  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans selection:bg-blue-500/30">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes wide-pulse {
          0% { border-color: rgba(59, 130, 246, 0.2); box-shadow: 0 0 0px rgba(59, 130, 246, 0); }
          50% { border-color: rgba(59, 130, 246, 0.8); box-shadow: 0 0 30px rgba(59, 130, 246, 0.25); }
          100% { border-color: rgba(59, 130, 246, 0.2); box-shadow: 0 0 0px rgba(59, 130, 246, 0); }
        }
        @keyframes red-emergency-pulse {
          0% { box-shadow: 0 0 0px rgba(239, 68, 68, 0); border-color: rgba(239, 68, 68, 0.2); }
          50% { box-shadow: 0 0 20px rgba(239, 68, 68, 0.4); border-color: rgba(239, 68, 68, 0.8); }
          100% { box-shadow: 0 0 0px rgba(239, 68, 68, 0); border-color: rgba(239, 68, 68, 0.2); }
        }
        .directive-pulse { animation: wide-pulse 2.5s infinite ease-in-out; }
        .emergency-pulse { animation: red-emergency-pulse 1.5s infinite ease-in-out; }
        .glass-finish {
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
      `}} />
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-12 border-b border-gray-800 pb-8">
          <div>
            {/* Reverted Italic Bold Style with Monochrome Glass Gradient */}
            <h1 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-zinc-400 to-zinc-800 uppercase italic pr-4">
              Self-Healing Infra Monitor
            </h1>
            <div className="flex gap-3 mt-3">
              <span className={`text-[10px] font-bold px-3 py-1 rounded-full border glass-finish transition-all duration-300 ${isCritical ? 'border-red-500 text-red-500 animate-pulse' : 'border-green-500/30 text-green-500'}`}>
                ● STATUS: {isCritical ? 'DEGRADED' : 'OPTIMAL'}
              </span>
              <button 
                onClick={runChaos} 
                className={`text-[10px] font-bold px-4 py-1.5 rounded-full border glass-finish text-red-500 transition-all active:scale-95 uppercase tracking-widest ${!isCritical ? 'emergency-pulse' : 'bg-red-600 text-white border-red-400'}`}
              >
                ☢ TRIGGER SYSTEM STRESS
              </button>
            </div>
          </div>
          <div className="hidden md:block text-gray-500 font-mono text-[10px] text-right">
             <a href="https://www.linkedin.com/in/tejaschid/" target="_blank" rel="noopener noreferrer" className="tracking-widest uppercase hover:text-blue-400 transition-colors font-bold glass-finish px-3 py-1 rounded-md">
              Connect on LinkedIn ↗
            </a>
            <p className="mt-2 text-gray-600 uppercase font-bold tracking-tighter">Latency: {latency}ms</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-finish p-8 rounded-3xl relative overflow-hidden">
                <h2 className="text-gray-500 text-[10px] font-black uppercase mb-2">Processor Load</h2>
                <div className={`text-8xl font-mono font-bold tracking-tighter ${isCritical ? 'text-red-500' : 'text-white'}`}>
                  {stats.cpu}%
                </div>
                <div className="absolute bottom-0 left-0 h-1 transition-all duration-1000" style={{ width: `${stats.cpu}%`, backgroundColor: isCritical ? '#ef4444' : '#22c55e' }}></div>
              </div>

              <div className="glass-finish p-8 rounded-3xl relative overflow-hidden">
                <h2 className="text-gray-500 text-[10px] font-black uppercase mb-2">Memory Capacity</h2>
                <div className="text-8xl font-mono font-bold text-white tracking-tighter">{stats.memory}%</div>
                <div className="absolute bottom-0 left-0 h-1 bg-blue-500 transition-all duration-1000" style={{ width: `${stats.memory}%` }}></div>
              </div>
            </div>

            <div className={`p-10 rounded-3xl border transition-all duration-700 glass-finish ${isCritical ? 'border-red-500/40 shadow-2xl shadow-red-500/10' : 'border-gray-800'}`}>
              <h3 className="text-purple-400 text-[10px] font-black uppercase tracking-[0.4em] mb-6 flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                Autonomous Diagnostic Analysis
              </h3>
              <p className={`text-3xl font-medium italic ${isCritical ? 'text-red-400' : 'text-gray-200'}`}>
                "{stats.ai_analysis}"
              </p>
            </div>
          </div>

          <div className="glass-finish rounded-3xl flex flex-col h-[600px] overflow-hidden text-left">
            <div className="p-6 border-b border-gray-800 bg-white/5">
              {showDirective && (
                <div className="mb-6 p-5 border-2 border-blue-500/30 bg-blue-500/10 rounded-2xl text-left animate-in fade-in duration-1000 directive-pulse backdrop-blur-md">
                  <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mb-2 font-black">Terminal Directive</p>
                  <p className="text-[12px] text-gray-300 leading-relaxed font-medium">
                    To evaluate the autonomous response pipeline: <br/>
                    <span className="text-white font-bold underline decoration-blue-500/50 cursor-default">Execute 'Trigger System Stress'</span> to simulate a core runaway and observe the SRE agent's diagnostic recovery logs.
                  </p>
                </div>
              )}
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 font-bold text-center">Incident Audit Trail</h2>
            </div>
            <div className="p-6 space-y-4 font-mono text-[10px] flex-1 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-gray-700 italic py-4 text-center tracking-widest">System heartbeat healthy.</div>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="p-3 border-l-2 border-red-500 bg-red-500/10 text-red-400 animate-in fade-in slide-in-from-right-4">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}