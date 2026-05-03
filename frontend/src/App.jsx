/**
 * FRONTEND DASHBOARD SIMULATOR TIKET (TUGAS #7)
 * Menampilkan perbandingan Race Condition vs RabbitMQ secara Visual
 */

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Activity, 
  ShieldCheck, 
  ShieldAlert, 
  RefreshCcw, 
  Cpu, 
  Database, 
  Zap,
  Terminal as TerminalIcon,
  Ticket
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = 'http://localhost:5000';

export default function App() {
  const [status, setStatus] = useState({ sisa_tiket: 100, logs: [], isProcessing: false, timeTaken: 0 });
  const [requestsCount, setRequestsCount] = useState(500);
  const [mode, setMode] = useState(null); // 'unsafe' or 'safe'
  const logEndRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${API_BASE}/status`);
        setStatus(res.data);
      } catch (err) {
        console.error("Connection failed");
      }
    }, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [status.logs]);

  const handleSimulate = async (type) => {
    setMode(type);
    try {
      await axios.post(`${API_BASE}/simulate/${type}`, { requestsCount });
    } catch (err) {
      alert("Simulation failed");
    }
  };

  const handleReset = async () => {
    setMode(null);
    await axios.post(`${API_BASE}/reset`);
  };

  const successData = status.logs
    .filter(l => l.status === 'SUCCESS')
    .map((l, i) => ({ name: i, remaining: l.remaining }));

  return (
    <div className="min-h-screen bg-[#0a0b1e] text-blue-100 cyber-grid p-4 md:p-8">
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-500/20 rounded-lg neon-border">
            <Ticket className="w-8 h-8 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-widest neon-text">
              Ticket<span className="text-cyan-400">Lock</span> v1.0
            </h1>
            <p className="text-xs text-cyan-500/60 font-mono">Tugas #7: Mutex & Semaphore Simulator</p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="glass px-6 py-2 rounded-full flex items-center gap-4 border-cyan-500/30">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${status.isProcessing ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`} />
              <span className="text-xs font-mono uppercase">{status.isProcessing ? 'Processing' : 'Standby'}</span>
            </div>
            <div className="h-4 w-[1px] bg-cyan-500/30" />
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono">{status.timeTaken}ms</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Panel: Control */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <section className="glass p-6 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Zap className="w-16 h-16 text-cyan-400" />
            </div>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" /> Control Unit
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-mono text-cyan-500 uppercase block mb-2">Simulated Requests</label>
                <input 
                  type="range" min="100" max="1000" step="100"
                  value={requestsCount}
                  onChange={(e) => setRequestsCount(parseInt(e.target.value))}
                  className="w-full accent-cyan-400 bg-cyan-900/30 rounded-lg h-2"
                />
                <div className="flex justify-between text-[10px] font-mono mt-1 opacity-60">
                  <span>100 REQ</span>
                  <span className="text-cyan-400 font-bold">{requestsCount} REQ</span>
                  <span>1000 REQ</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <button 
                  onClick={() => handleSimulate('unsafe')}
                  disabled={status.isProcessing}
                  className="btn-cyber bg-red-500/20 border border-red-500/40 hover:bg-red-500/40 p-4 flex items-center justify-between group disabled:opacity-50"
                >
                  <div className="text-left">
                    <span className="block text-xs font-bold text-red-400 uppercase tracking-tighter">Phase 1</span>
                    <span className="text-sm font-black">UNSAFE SIMULATION</span>
                  </div>
                  <ShieldAlert className="w-6 h-6 text-red-400 group-hover:scale-110 transition-transform" />
                </button>

                <button 
                  onClick={() => handleSimulate('safe')}
                  disabled={status.isProcessing}
                  className="btn-cyber bg-cyan-500/20 border border-cyan-500/40 hover:bg-cyan-500/40 p-4 flex items-center justify-between group disabled:opacity-50"
                >
                  <div className="text-left">
                    <span className="block text-xs font-bold text-cyan-400 uppercase tracking-tighter">Phase 2</span>
                    <span className="text-sm font-black">RABBITMQ SECURE</span>
                  </div>
                  <ShieldCheck className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform" />
                </button>

                <button 
                  onClick={handleReset}
                  className="flex items-center justify-center gap-2 text-xs font-mono opacity-50 hover:opacity-100 transition-opacity mt-2"
                >
                  <RefreshCcw className="w-3 h-3" /> System Reset
                </button>
              </div>
            </div>
          </section>

          {/* Stock Monitor */}
          <section className="glass p-6 rounded-2xl flex flex-col items-center justify-center relative">
             <div className="text-xs font-mono text-cyan-500 uppercase absolute top-4 left-4">Ticket Inventory</div>
             <div className="text-7xl font-black mb-2 flex items-baseline gap-2">
                <span className={`${status.sisa_tiket <= 0 ? 'text-red-500 neon-text' : 'text-cyan-400 neon-text'}`}>
                  {status.sisa_tiket}
                </span>
                <span className="text-xl text-cyan-900 font-mono">/ 100</span>
             </div>
             <div className="w-full bg-cyan-900/30 h-2 rounded-full overflow-hidden mt-4">
                <motion.div 
                  className={`h-full ${status.sisa_tiket <= 0 ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : 'bg-cyan-400 shadow-[0_0_10px_#22d3ee]'}`}
                  initial={{ width: '100%' }}
                  animate={{ width: `${Math.max(0, status.sisa_tiket)}%` }}
                />
             </div>
             {status.sisa_tiket < 0 && (
               <div className="mt-4 px-3 py-1 bg-red-500/20 border border-red-500/50 text-red-400 text-[10px] font-bold rounded animate-bounce">
                 CRITICAL: RACE CONDITION DETECTED!
               </div>
             )}
          </section>
        </div>

        {/* Middle Panel: Charts */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <section className="glass p-6 rounded-2xl h-full min-h-[400px]">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Database className="w-5 h-5 text-cyan-400" /> Real-time Telemetry
            </h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={successData}>
                  <defs>
                    <linearGradient id="colorStock" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" hide />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0a0b1e', border: '1px solid #22d3ee', color: '#fff' }}
                    itemStyle={{ color: '#22d3ee' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="remaining" 
                    stroke="#22d3ee" 
                    fillOpacity={1} 
                    fill="url(#colorStock)" 
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 p-4 bg-black/40 rounded-xl border border-white/5 font-mono text-[10px]">
               <div className="grid grid-cols-2 gap-2">
                  <div className="text-gray-500">ENGINE_STATUS</div>
                  <div className="text-cyan-400 text-right">ACTIVE_READY</div>
                  <div className="text-gray-500">DISTRIBUTED_LOCK</div>
                  <div className="text-cyan-400 text-right">{mode === 'safe' ? 'RABBIT_MQ_ON' : 'OFF'}</div>
               </div>
            </div>
          </section>
        </div>

        {/* Right Panel: Logs */}
        <div className="lg:col-span-3">
          <section className="glass p-4 rounded-2xl h-full flex flex-col">
            <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
              <TerminalIcon className="w-4 h-4 text-cyan-400" /> Transaction Logs
            </h2>
            <div className="flex-1 overflow-y-auto font-mono text-[10px] space-y-1 pr-2 max-h-[500px] scrollbar-thin scrollbar-thumb-cyan-900">
              <AnimatePresence initial={false}>
                {status.logs.slice().reverse().slice(0, 50).map((log, i) => (
                  <motion.div 
                    key={log.id + i}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-2 rounded border-l-2 ${log.status === 'SUCCESS' ? 'bg-cyan-500/5 border-cyan-500/40 text-cyan-200' : 'bg-red-500/5 border-red-500/40 text-red-300'}`}
                  >
                    <div className="flex justify-between font-bold mb-1">
                      <span>REQ#{log.id}</span>
                      <span>{log.status}</span>
                    </div>
                    <div className="opacity-60">
                      {log.status === 'SUCCESS' ? `STOCK_DEC -> ${log.remaining}` : log.message}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={logEndRef} />
            </div>
          </section>
        </div>
      </main>

      {/* Comparison Summary */}
      <section className="max-w-7xl mx-auto mt-6">
        <div className="glass p-6 rounded-2xl">
          <h2 className="text-sm font-bold mb-4 flex items-center gap-2 uppercase tracking-widest text-cyan-400">
            <Activity className="w-4 h-4" /> Comparison Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
               <div className="text-[10px] text-red-400 font-mono mb-1">UNSAFE_RESULT</div>
               <div className="flex justify-between items-end">
                  <div className="text-2xl font-black">{status.logs.length >= 100 && mode === 'unsafe' ? status.sisa_tiket : '--'} <span className="text-xs font-normal opacity-50">FINAL_STOCK</span></div>
                  <div className="text-xs font-mono text-red-400/60">{mode === 'unsafe' ? status.timeTaken : 0}ms</div>
               </div>
            </div>
            <div className="p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-xl">
               <div className="text-[10px] text-cyan-400 font-mono mb-1">SECURE_RESULT</div>
               <div className="flex justify-between items-end">
                  <div className="text-2xl font-black">{status.logs.length >= 100 && mode === 'safe' ? status.sisa_tiket : '--'} <span className="text-xs font-normal opacity-50">FINAL_STOCK</span></div>
                  <div className="text-xs font-mono text-cyan-400/60">{mode === 'safe' ? status.timeTaken : 0}ms</div>
               </div>
            </div>
          </div>
          <div className="mt-4 text-[10px] font-mono text-gray-500 text-center">
            * Comparison data updates automatically after each simulation run.
          </div>
        </div>
      </section>

      {/* Footer Info */}
      <footer className="max-w-7xl mx-auto mt-8 border-t border-cyan-900/30 pt-4 flex justify-between items-center opacity-40 text-[10px] font-mono">
        <div>SYSTEM_VERSION_1.0.0_PRODUCTION</div>
        <div>CLOUD_AMQP_CONNECTED: fuji.lmq.cloudamqp.com</div>
      </footer>
    </div>
  );
}
