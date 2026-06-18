import { useState } from "react";
import { Users, Settings as SettingsIcon, Stethoscope, BrainCircuit, Plus, Mail, Smartphone, Eye, EyeOff, Wifi, RefreshCw, KeyRound, Lock } from "lucide-react";
export function Settings() {
  const [showPIN, setShowPIN] = useState(false);
  const [pinValue] = useState("492-815");
  const [wifiSSID, setWifiSSID] = useState("HomeNetwork_5G");
  const [wifiPassword, setWifiPassword] = useState("mypassword123");
  const [showWifiPass, setShowWifiPass] = useState(false);
  const [wifiSaved, setWifiSaved] = useState(false);
  function handleSaveWifi() {
    setWifiSaved(true);
    setTimeout(() => setWifiSaved(false), 2e3);
  }
  return <div className="space-y-8 pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">System Settings</h1>
        <p className="text-slate-500 mt-2">Manage device configuration and premium cloud features.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {
    /* ── WiFi Configuration (Free) ── */
  }
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col relative overflow-hidden">
          <div className="absolute top-0 left-0 w-40 h-40 rounded-full blur-3xl opacity-10 pointer-events-none" style={{ background: "radial-gradient(circle, #3b82f6, transparent)" }} />

          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-sky-50 rounded-xl text-sky-500">
              <Wifi className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800">Wi-Fi Configuration</h2>
            <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200">
              Free
            </span>
          </div>
          <p className="text-sm text-slate-500 mb-6 ml-[52px]">
            Connect AuraVest to your home or clinic Wi-Fi for data sync.
          </p>

          <div className="space-y-4">
            {
    /* SSID */
  }
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 block">
                Network Name (SSID)
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Wifi className="w-4 h-4" />
                </div>
                <input
    type="text"
    value={wifiSSID}
    onChange={(e) => setWifiSSID(e.target.value)}
    placeholder="Enter Wi-Fi name"
    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all"
  />
              </div>
            </div>

            {
    /* Password */
  }
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 block">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
    type={showWifiPass ? "text" : "password"}
    value={wifiPassword}
    onChange={(e) => setWifiPassword(e.target.value)}
    placeholder="Enter Wi-Fi password"
    className="w-full pl-10 pr-12 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all"
  />
                <button
    onClick={() => setShowWifiPass((v) => !v)}
    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-0.5"
    type="button"
  >
                  {showWifiPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
    onClick={handleSaveWifi}
    className="w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 mt-2"
    style={{
      background: wifiSaved ? "linear-gradient(135deg, #10b981, #059669)" : "linear-gradient(135deg, #0ea5e9, #0284c7)",
      color: "white",
      boxShadow: wifiSaved ? "0 4px 14px rgba(16,185,129,0.3)" : "0 4px 14px rgba(14,165,233,0.3)"
    }}
  >
              {wifiSaved ? <><span className="text-base">✓</span> Saved Successfully</> : <><RefreshCw className="w-4 h-4" /> Save & Connect</>}
            </button>
          </div>
        </div>

        {
    /* ── Multi-Caregiver Alerts (Premium) ── */
  }
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col relative overflow-hidden">
          <div className="absolute top-3 right-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
              Premium
            </span>
          </div>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-blue-50 rounded-xl text-blue-500">
              <Users className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800">Multi-Caregiver Alerts</h2>
          </div>

          <p className="text-sm text-slate-500 mb-6">
            Instantly notify network via SMS/Email when AI detects Meltdown Risk.
          </p>

          <div className="space-y-4 mb-6 flex-1">
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">Mom (Primary)</p>
                  <p className="text-xs text-slate-400">+1 (555) 123-4567</p>
                </div>
              </div>
              <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                <input
    type="checkbox"
    name="toggle"
    id="toggle1"
    defaultChecked
    className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer translate-x-5 border-blue-500"
    style={{ right: 0 }}
  />
                <label htmlFor="toggle1" className="toggle-label block overflow-hidden h-5 rounded-full bg-blue-500 cursor-pointer" />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">Teacher Sarah</p>
                  <p className="text-xs text-slate-400">sarah@school.edu</p>
                </div>
              </div>
              <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                <input
    type="checkbox"
    name="toggle"
    id="toggle2"
    defaultChecked
    className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer translate-x-5 border-blue-500"
    style={{ right: 0 }}
  />
                <label htmlFor="toggle2" className="toggle-label block overflow-hidden h-5 rounded-full bg-blue-500 cursor-pointer" />
              </div>
            </div>
          </div>

          <button className="w-full py-3 rounded-xl border border-dashed border-slate-300 text-slate-400 hover:text-slate-600 hover:border-slate-400 transition-colors flex items-center justify-center gap-2 text-sm font-medium">
            <Plus className="w-4 h-4" />
            Add Caregiver
          </button>
        </div>

        {
    /* ── Doctor Remote Access (Premium) — with PIN eye toggle ── */
  }
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col relative overflow-hidden">
          <div className="absolute top-3 right-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
              Premium
            </span>
          </div>
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-10 pointer-events-none" style={{ background: "radial-gradient(circle, #10b981, transparent)" }} />

          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-500">
              <Stethoscope className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800">Doctor / Therapist Access</h2>
          </div>

          <p className="text-sm text-slate-500 mb-6">
            Generate a secure PIN or link for your therapist to review analytics and adjust parameters remotely.
          </p>

          {
    /* PIN Card */
  }
          <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl flex items-center justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                <p className="text-xs text-slate-400 uppercase tracking-wide">Active Access PIN</p>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-2xl font-mono text-slate-700 tracking-[0.3em] select-none">
                  {showPIN ? pinValue : "\u25CF\u25CF\u25CF-\u25CF\u25CF\u25CF"}
                </p>
                <button
    onClick={() => setShowPIN((v) => !v)}
    className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-slate-700 hover:border-slate-300 hover:shadow-sm transition-all"
    type="button"
    title={showPIN ? "Hide PIN" : "Show PIN"}
  >
                  {showPIN ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button className="text-sm bg-white hover:bg-slate-50 px-4 py-2 rounded-lg text-slate-600 border border-slate-200 transition-colors shadow-sm ml-4 flex-shrink-0">
              Regenerate
            </button>
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
            Dr. Smith last accessed: Today, 10:45 AM
          </div>
        </div>

        {
    /* ── Therapy Parameters (Premium) ── */
  }
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col relative overflow-hidden">
          <div className="absolute top-3 right-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
              Premium
            </span>
          </div>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-amber-50 rounded-xl text-amber-500">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800">Therapy Parameters</h2>
          </div>

          <p className="text-sm text-slate-500 mb-6">
            Fine-tune Deep Touch Pressure (DTP) and vibration behaviors.
          </p>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2 text-sm">
                <span className="text-slate-600">DTP Duration</span>
                <span className="text-blue-500 font-medium">10 Minutes</span>
              </div>
              <input
    type="range"
    min="5"
    max="20"
    step="1"
    defaultValue="10"
    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
  />
              <div className="flex justify-between mt-2 text-[10px] text-slate-400">
                <span>5m</span><span>15m</span><span>20m+</span>
              </div>
            </div>

            <div>
              <span className="text-slate-600 text-sm block mb-3">Vibration Pattern</span>
              <div className="grid grid-cols-2 gap-3">
                <button className="bg-slate-50 border border-slate-200 text-slate-600 py-2.5 rounded-xl text-sm transition-colors hover:bg-slate-100">Continuous</button>
                <button
    className="border text-white py-2.5 rounded-xl text-sm font-medium shadow-sm"
    style={{ background: "linear-gradient(135deg, #4361ee, #3a56d4)", borderColor: "#4361ee" }}
  >
                  Breathing Sync
                </button>
                <button className="bg-slate-50 border border-slate-200 text-slate-600 py-2.5 rounded-xl text-sm transition-colors hover:bg-slate-100">Pulse Waves</button>
                <button className="bg-slate-50 border border-slate-200 text-slate-600 py-2.5 rounded-xl text-sm transition-colors hover:bg-slate-100">Gentle Taps</button>
              </div>
            </div>
          </div>
        </div>

        {
    /* ── Personalized AI Model (Premium) ── */
  }
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col relative overflow-hidden lg:col-span-2">
          <div className="absolute top-3 right-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
              Premium
            </span>
          </div>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-pink-50 rounded-xl text-pink-500">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800">Personalized Cloud AI</h2>
          </div>

          <p className="text-sm text-slate-500 mb-6">
            Your vest continuously trains its AI based on the wearer's unique triggers and biometric patterns on the Cloud.
          </p>

          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 w-full space-y-3">
              <div className="flex items-center gap-4">
                <div className="w-full bg-slate-200 rounded-full h-2.5">
                  <div className="h-2.5 rounded-full" style={{ width: "75%", background: "linear-gradient(90deg, #ec4899, #8b5cf6)" }} />
                </div>
                <span className="text-sm font-bold text-slate-600 flex-shrink-0">75%</span>
              </div>
              <p className="text-xs text-slate-400">Personalization Accuracy Confidence</p>
            </div>
            <button className="flex-shrink-0 bg-slate-50 hover:bg-slate-100 text-slate-700 py-3 px-6 rounded-xl border border-slate-200 transition-colors text-sm font-medium flex items-center justify-center gap-2">
              <BrainCircuit className="w-4 h-4" />
              Force Cloud Sync &amp; Update Model
            </button>
          </div>
        </div>

      </div>
    </div>;
}
