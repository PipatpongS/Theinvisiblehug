import { BrainCircuit, CheckCircle2, ShieldCheck, Target, Zap, Activity, Info } from "lucide-react";
import clsx from "clsx";

export function AiInfo() {
  return (
    <div className="h-full max-h-screen flex flex-col p-6 gap-6 bg-[#f8fafc] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-5 flex-shrink-0">
        <div className="p-4 bg-white rounded-3xl shadow-sm text-indigo-600 border border-indigo-50">
          <BrainCircuit className="w-12 h-12" />
        </div>
        <div>
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">AI Performance & Insights</h1>
          <p className="text-lg text-slate-500 mt-1">Understanding how accurately the system detects stress and meltdowns in real-world scenarios.</p>
        </div>
      </div>

      {/* Top Row: 3 Highlight Cards */}
      <div className="grid grid-cols-3 gap-6 flex-shrink-0 h-[45%] min-h-[250px]">
        
        {/* Card 1: Overall Accuracy */}
        <div className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden h-full">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
          
          <h2 className="text-2xl font-extrabold text-slate-700 mb-2 flex items-center gap-3">
            <Target className="w-8 h-8 text-indigo-500" />
            Overall Accuracy
          </h2>
          
          <div className="relative flex items-center justify-center flex-1 w-full min-h-0 py-2">
            <svg className="h-full transform -rotate-90" viewBox="0 0 200 200" style={{ maxHeight: '200px' }}>
              <circle cx="100" cy="100" r="85" stroke="currentColor" strokeWidth="18" fill="transparent" className="text-slate-100" />
              <circle cx="100" cy="100" r="85" stroke="currentColor" strokeWidth="18" fill="transparent" 
                strokeDasharray="534" strokeDashoffset={534 - (534 * 95) / 100}
                className="text-indigo-500 transition-all duration-1000 ease-out drop-shadow-sm" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-5xl font-black text-slate-800 tracking-tighter" style={{ fontSize: '80px' }}>95<span className="text-slate-400" style={{ fontSize: '36px' }}>%</span></span>
            </div>
          </div>
          <p className="text-base font-bold text-indigo-600 bg-indigo-50 px-5 py-2 rounded-full mt-2">
            Highly Reliable
          </p>
        </div>

        {/* Card 2: Baseline Detection */}
        <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm flex flex-col relative overflow-hidden h-full">
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
          <div className="p-3 bg-emerald-50 rounded-2xl w-fit mb-4 text-emerald-600 border border-emerald-100">
            <Activity className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-700 mb-2">Normal State (Baseline)</h2>
          <p className="text-slate-500 text-base mb-4">Accuracy when the wearer is calm</p>
          
          <div className="mt-auto">
            <div className="flex items-end justify-between mb-3">
              <span className="font-black text-emerald-600 tracking-tighter" style={{ fontSize: '85px', lineHeight: '1' }}>96<span className="text-emerald-400" style={{ fontSize: '40px' }}>%</span></span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-4 mt-2">
              <div className="bg-emerald-500 h-4 rounded-full" style={{ width: '96%' }}></div>
            </div>
          </div>
        </div>

        {/* Card 3: Stress Detection */}
        <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm flex flex-col relative overflow-hidden h-full">
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-rose-50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
          <div className="p-3 bg-rose-50 rounded-2xl w-fit mb-4 text-rose-500 border border-rose-100">
            <Zap className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-700 mb-2">Stress / Meltdown Risk</h2>
          <p className="text-slate-500 text-base mb-4">Accuracy in catching early stress signs</p>
          
          <div className="mt-auto">
            <div className="flex items-end justify-between mb-3">
              <span className="font-black text-rose-500 tracking-tighter" style={{ fontSize: '85px', lineHeight: '1' }}>93<span className="text-rose-400" style={{ fontSize: '40px' }}>%</span></span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-4 mt-2">
              <div className="bg-rose-500 h-4 rounded-full" style={{ width: '93%' }}></div>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Row: Confusion Matrix & Explanations */}
      <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm flex flex-row items-center gap-10 flex-1 min-h-0 h-[45%]">
        
        {/* Matrix Image */}
        <div className="w-5/12 h-full rounded-2xl overflow-hidden border-2 border-slate-100 bg-slate-50 flex items-center justify-center p-0">
          <img 
            src="/confusion_matrix_result.png?v=3" 
            alt="Confusion Matrix" 
            className="w-full h-full object-contain mix-blend-multiply scale-105"
          />
        </div>

        {/* Text Explanation */}
        <div className="w-7/12 h-full flex flex-col justify-center overflow-y-auto pr-4 py-2">
          <h3 className="font-extrabold text-slate-800 text-2xl mb-3 flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-blue-500" />
            Real-world Test Results
          </h3>
          <p className="text-slate-500 text-base mb-4 border-l-4 border-indigo-200 pl-4 py-0.5">Based on a test of 1,836 data samples using the Stacking Ensemble AI (Heart rate & EDA).</p>
          
          <ul className="space-y-4 text-lg text-slate-600 font-medium">
            <li className="flex items-start gap-4">
              <CheckCircle2 className="w-7 h-7 text-emerald-500 flex-shrink-0 mt-0.5" />
              <span className="leading-snug"><strong>High Safety:</strong> Successfully caught <strong>611 out of 662</strong> actual stress events (92%). The system reliably detects meltdowns before they escalate.</span>
            </li>
            <li className="flex items-start gap-4">
              <CheckCircle2 className="w-7 h-7 text-emerald-500 flex-shrink-0 mt-0.5" />
              <span className="leading-snug"><strong>Low False Alarms:</strong> Out of 1,174 calm moments, it triggered incorrectly only 37 times (3%). You won't be bothered by false notifications.</span>
            </li>
          </ul>
        </div>
        
      </div>

    </div>
  );
}
