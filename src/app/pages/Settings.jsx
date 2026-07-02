import { useState, useEffect } from "react";
import { Users, Settings as SettingsIcon, Stethoscope, BrainCircuit, Plus, Mail, Smartphone, Eye, EyeOff, Wifi, RefreshCw, KeyRound, Lock, Activity, Crown, Unlock, AlertCircle, AlertTriangle, AlertOctagon, CheckCircle2, Pencil, Trash2, X } from "lucide-react";
import { publishMQTT, isMQTTConnected } from "../../services/mqttClient";
export function Settings() {
  const [showPIN, setShowPIN] = useState(false);
  const [pinValue, setPinValue] = useState(() => {
    return localStorage.getItem("doctorPIN") || "492-815";
  });
  const [accessLogs, setAccessLogs] = useState(() => {
    const saved = localStorage.getItem("accessLogs");
    if (saved) return JSON.parse(saved);
    return [
      { id: 1, text: "Dr. Smith accessed dashboard", time: "Today, 10:45 AM", type: 'user' }
    ];
  });
  useEffect(() => {
    localStorage.setItem("accessLogs", JSON.stringify(accessLogs));
  }, [accessLogs]);

  const generateNewPIN = () => {
    const p1 = Math.floor(100 + Math.random() * 900);
    const p2 = Math.floor(100 + Math.random() * 900);
    const newPIN = `${p1}-${p2}`;
    setPinValue(newPIN);
    localStorage.setItem("doctorPIN", newPIN);
    
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const formattedTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    setAccessLogs(prev => [
      { id: Date.now(), text: `New PIN generated`, time: `${formattedDate}, ${formattedTime}`, type: 'system' },
      ...prev
    ].slice(0, 3));
  };
  const [wifiSSID, setWifiSSID] = useState(() => {
    return localStorage.getItem("wifiSSID") || "iPhone";
  });
  const [wifiPassword, setWifiPassword] = useState(() => {
    return localStorage.getItem("wifiPassword") || "suppanat";
  });
  const [showWifiPass, setShowWifiPass] = useState(false);
  const [wifiSaved, setWifiSaved] = useState(false);
  const [wifiModal, setWifiModal] = useState(null); // 'empty', 'error', 'confirm', null

  // --- Caregiver State ---
  const [caregivers, setCaregivers] = useState(() => {
    const saved = localStorage.getItem("caregivers");
    if (saved) return JSON.parse(saved);
    return [
      { id: 1, name: "Mom (Primary)", contact: "+66 81 234 5678", type: "phone", active: true },
      { id: 2, name: "Teacher Sarah", contact: "sarah@gmail.com", type: "email", active: true }
    ];
  });
  useEffect(() => {
    localStorage.setItem("caregivers", JSON.stringify(caregivers));
  }, [caregivers]);

  const [caregiverModal, setCaregiverModal] = useState(null); // null, { mode: 'add' | 'edit', data: { id, name, contact, type } }
  const [alertModal, setAlertModal] = useState(null); // { type: 'error' | 'confirm', title: string, message: string, onConfirm?: () => void }

  function handleSaveWifi() {
    if (!wifiSSID.trim()) {
      setWifiModal("empty");
      return;
    }

    if (!isMQTTConnected()) {
      setWifiModal("error");
      return;
    }

    setWifiModal("confirm");
  }

  function executeSaveWifi() {
    localStorage.setItem("wifiSSID", wifiSSID);
    localStorage.setItem("wifiPassword", wifiPassword);
    const payload = `WIFI:${wifiSSID}:${wifiPassword}`;
    publishMQTT("sensor/control", payload);
    setWifiSaved(true);
    setTimeout(() => setWifiSaved(false), 2e3);
    setWifiModal(null);
  }

  // --- Haptic Pattern Control State ---
  const [activePattern, setActivePattern] = useState(() => {
    const saved = localStorage.getItem("activePattern");
    return saved !== null ? parseInt(saved) : 1;
  });
  const [intensity, setIntensity] = useState(() => {
    const saved = localStorage.getItem("intensity");
    return saved !== null ? parseInt(saved) : 150;
  });

  // Function to send MQTT control command
  const sendControlCommand = (patternId, pwmValue) => {
    localStorage.setItem("activePattern", patternId);
    localStorage.setItem("intensity", pwmValue);
    // Topic: sensor/control
    // Payload e.g. "P1_150" (Pattern 1, Intensity 150)
    const payload = `P${patternId}_${pwmValue}`;
    publishMQTT("sensor/control", payload);
  };

  const handlePatternChange = (patternId) => {
    if (!isMQTTConnected()) {
      setWifiModal("error");
      return;
    }
    setActivePattern(patternId);
    sendControlCommand(patternId, intensity);
  };

  const handleIntensityChange = (e) => {
    if (!isMQTTConnected()) {
      setWifiModal("error");
      return;
    }
    const val = parseInt(e.target.value);
    setIntensity(val);
    sendControlCommand(activePattern, val);
  };
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
            <span className="ml-auto flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <Unlock className="w-3 h-3" />
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
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              <Crown className="w-3 h-3" />
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
            {caregivers.map((cg) => (
              <div key={cg.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100 gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 flex-shrink-0">
                    {cg.type === 'phone' ? <Smartphone className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-700">{cg.name}</p>
                    <p className="text-xs text-slate-400">{cg.contact}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setCaregiverModal({ mode: 'edit', data: cg })}
                    className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => {
                      setAlertModal({
                        type: 'confirm',
                        title: 'Remove Caregiver',
                        message: `Are you sure you want to remove ${cg.name}? This action cannot be undone.`,
                        onConfirm: () => {
                          setCaregivers(prev => prev.filter(c => c.id !== cg.id));
                        }
                      });
                    }}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="ml-2 flex items-center">
                    <input
                      type="checkbox"
                      id={`checkbox-${cg.id}`}
                      checked={cg.active}
                      onChange={(e) => setCaregivers(prev => prev.map(c => c.id === cg.id ? { ...c, active: e.target.checked } : c))}
                      className="rounded border-slate-300 text-blue-500 focus:ring-blue-500 w-5 h-5 cursor-pointer shadow-sm transition-all hover:border-blue-400"
                    />
                  </div>
                </div>
              </div>
            ))}
            
            {caregivers.length === 0 && (
              <div className="text-center py-6 text-sm text-slate-400 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                No caregivers added yet.
              </div>
            )}
          </div>

          <button 
            onClick={() => setCaregiverModal({ mode: 'add', data: { name: "", contact: "+66 ", type: "phone" } })}
            className="w-full py-3 rounded-xl border border-dashed border-slate-300 text-slate-400 hover:text-slate-600 hover:border-slate-400 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Caregiver
          </button>
        </div>

        {
    /* ── Doctor Remote Access (Premium) — with PIN eye toggle ── */
  }
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col relative overflow-hidden">
          <div className="absolute top-3 right-3">
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              <Crown className="w-3 h-3" />
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
            <button 
              onClick={generateNewPIN}
              className="text-sm bg-white hover:bg-slate-50 px-4 py-2 rounded-lg text-slate-600 border border-slate-200 transition-colors shadow-sm ml-4 flex-shrink-0 active:bg-slate-100"
            >
              Regenerate
            </button>
          </div>

          <div className="mt-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Recent Access Log</h3>
            <div className="space-y-2">
              {accessLogs.map(log => (
                <div key={log.id} className="text-xs text-slate-500 flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${log.type === 'system' ? 'bg-blue-400' : 'bg-emerald-500'}`} />
                  <span className="flex-1 font-medium text-slate-600">{log.text}</span>
                  <span className="text-slate-400">{log.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {
    /* ── Therapy Parameters (Premium) ── */
  }
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col relative overflow-hidden">
          <div className="absolute top-3 right-3">
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              <Crown className="w-3 h-3" />
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
            {/* DTP Duration (Mock - Disabled) */}
            <div className="opacity-50 pointer-events-none select-none">
              <div className="flex justify-between mb-2 text-sm">
                <span className="text-slate-500">DTP Duration</span>
                <span className="text-slate-400 font-medium">10 Minutes</span>
              </div>
              <input
                type="range"
                min="5"
                max="20"
                step="1"
                defaultValue="10"
                disabled
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none accent-slate-300"
              />
              <div className="flex justify-between mt-2 text-[10px] text-slate-400">
                <span>5m</span><span>15m</span><span>20m+</span>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Vibration Intensity Control */}
            <div>
              <div className="flex justify-between mb-2 text-sm">
                <span className="text-slate-600 flex items-center gap-1.5"><Activity className="w-4 h-4 text-rose-500"/> Vibration Intensity (PWM)</span>
                <span className="text-rose-500 font-medium">{intensity}</span>
              </div>
              <input
                type="range"
                min="50"
                max="255"
                step="5"
                value={intensity}
                onChange={handleIntensityChange}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
              <div className="flex justify-between mt-2 text-[10px] text-slate-400">
                <span>Gentle (50)</span><span>Strong (255)</span>
              </div>
            </div>

            {/* Vibration Pattern Selection */}
            <div>
              <span className="text-slate-600 text-sm block mb-3">Vibration Pattern</span>
              
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    <Unlock className="w-3 h-3" />
                    Free Basic
                  </span>
                  <span className="text-xs text-slate-400">Essential deep touch pressure</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => handlePatternChange(1)}
                    className={`py-2.5 rounded-xl text-sm font-medium transition-all ${activePattern === 1 ? 'border text-white shadow-sm' : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                    style={activePattern === 1 ? { background: "linear-gradient(135deg, #4361ee, #3a56d4)", borderColor: "#4361ee" } : {}}
                  >
                    Continuous
                  </button>
                  <button 
                    onClick={() => handlePatternChange(2)}
                    className={`py-2.5 rounded-xl text-sm font-medium transition-all ${activePattern === 2 ? 'border text-white shadow-sm' : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                    style={activePattern === 2 ? { background: "linear-gradient(135deg, #4361ee, #3a56d4)", borderColor: "#4361ee" } : {}}
                  >
                    Breathing Sync
                  </button>
                </div>
              </div>

              <div className="mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                    <Crown className="w-3 h-3" />
                    Premium
                  </span>
                  <span className="text-xs text-slate-400">Advanced sensory patterns</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => handlePatternChange(3)}
                    className={`py-2.5 rounded-xl text-sm font-medium transition-all ${activePattern === 3 ? 'border text-white shadow-sm' : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                    style={activePattern === 3 ? { background: "linear-gradient(135deg, #4361ee, #3a56d4)", borderColor: "#4361ee" } : {}}
                  >
                    Pulse Waves
                  </button>
                  <button 
                    onClick={() => handlePatternChange(4)}
                    className={`py-2.5 rounded-xl text-sm font-medium transition-all ${activePattern === 4 ? 'border text-white shadow-sm' : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                    style={activePattern === 4 ? { background: "linear-gradient(135deg, #4361ee, #3a56d4)", borderColor: "#4361ee" } : {}}
                  >
                    Gentle Taps
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {
    /* ── Personalized AI Model (Premium) ── */
  }
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col relative overflow-hidden lg:col-span-2">
          <div className="absolute top-3 right-3">
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              <Crown className="w-3 h-3" />
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
                  <div className="h-2.5 rounded-full" style={{ width: "95%", background: "linear-gradient(90deg, #ec4899, #8b5cf6)" }} />
                </div>
                <span className="text-sm font-bold text-slate-600 flex-shrink-0">95%</span>
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

      {/* ── Custom Modals ── */}
      {/* ── Caregiver Form Modal ── */}
      {caregiverModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">
                {caregiverModal.mode === 'add' ? 'Add Caregiver' : 'Edit Caregiver'}
              </h3>
              <button onClick={() => setCaregiverModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Caregiver Name</label>
                <input 
                  type="text" 
                  value={caregiverModal.data.name}
                  onChange={e => setCaregiverModal(prev => ({...prev, data: {...prev.data, name: e.target.value}}))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                  placeholder="e.g. Dad, Teacher Sarah"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Notification Type</label>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setCaregiverModal(prev => ({...prev, data: {...prev.data, type: 'phone', contact: '+66 '}}))}
                    className={`flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-colors flex items-center justify-center gap-2 ${caregiverModal.data.type === 'phone' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                  >
                    <Smartphone className="w-4 h-4" /> SMS
                  </button>
                  <button 
                    onClick={() => setCaregiverModal(prev => ({...prev, data: {...prev.data, type: 'email', contact: '@gmail.com'}}))}
                    className={`flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-colors flex items-center justify-center gap-2 ${caregiverModal.data.type === 'email' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                  >
                    <Mail className="w-4 h-4" /> Email
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Contact Detail</label>
                <input 
                  type="text" 
                  value={caregiverModal.data.contact}
                  onChange={e => setCaregiverModal(prev => ({...prev, data: {...prev.data, contact: e.target.value}}))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                  placeholder={caregiverModal.data.type === 'phone' ? "+66 81 234 5678" : "name@gmail.com"}
                />
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
              <button
                onClick={() => setCaregiverModal(null)}
                className="flex-1 py-3 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!caregiverModal.data.name || !caregiverModal.data.contact) {
                    setAlertModal({
                      type: 'error',
                      title: 'Incomplete Information',
                      message: 'Please fill in both the Caregiver Name and Contact Detail.'
                    });
                    return;
                  }
                  if (caregiverModal.mode === 'add') {
                    setCaregivers(prev => [...prev, { ...caregiverModal.data, id: Date.now(), active: true }]);
                  } else {
                    setCaregivers(prev => prev.map(c => c.id === caregiverModal.data.id ? { ...caregiverModal.data, active: c.active } : c));
                  }
                  setCaregiverModal(null);
                }}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-sm shadow-blue-500/20"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {wifiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
            {wifiModal === "empty" && (
              <>
                <div className="p-6 text-center border-b bg-amber-50/50 border-amber-100">
                  <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center mb-4 bg-amber-100 text-amber-500">
                    <AlertTriangle className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">Incomplete Information</h3>
                </div>
                <div className="p-6">
                  <p className="text-slate-600 text-center mb-8">Please provide the Network Name (SSID) of the Wi-Fi you want the device to connect to.</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setWifiModal(null)}
                      className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-600 shadow-amber-500/20 text-white font-medium rounded-xl transition-colors shadow-sm"
                    >
                      OK
                    </button>
                  </div>
                </div>
              </>
            )}
            
            {wifiModal === "error" && (
              <>
                <div className="p-6 text-center border-b bg-red-50/50 border-red-100">
                  <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center mb-4 bg-red-100 text-red-500">
                    <AlertOctagon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">Connection Error</h3>
                </div>
                <div className="p-6">
                  <p className="text-slate-600 text-center mb-8">
                    Cannot change Wi-Fi settings at this time because AuraVest is currently disconnected from the cloud.
                    <br/><br/>
                    Please ensure the device is powered on and connected to its current network.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setWifiModal(null)}
                      className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 shadow-red-500/20 text-white font-medium rounded-xl transition-colors shadow-sm"
                    >
                      Acknowledge
                    </button>
                  </div>
                </div>
              </>
            )}

            {wifiModal === "confirm" && (
              <>
                <div className="p-6 text-center border-b bg-sky-50/50 border-sky-100">
                  <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center mb-4 bg-sky-100 text-sky-500">
                    <RefreshCw className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">Confirm Wi-Fi Change?</h3>
                </div>
                <div className="p-6">
                  <p className="text-slate-600 text-center mb-8">
                    If you confirm, the device will save the new Wi-Fi credentials and <strong className="text-sky-600">restart immediately</strong> to connect to the new network.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setWifiModal(null)}
                      className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={executeSaveWifi}
                      className="flex-1 py-3 px-4 bg-sky-500 hover:bg-sky-600 shadow-sky-500/20 text-white font-medium rounded-xl transition-colors shadow-sm"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Generic Alert Modal ── */}
      {alertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" style={{ zIndex: 9999 }}>
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
            {alertModal.type === 'error' && (
              <>
                <div className="p-6 text-center border-b bg-amber-50/50 border-amber-100">
                  <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center mb-4 bg-amber-100 text-amber-500">
                    <AlertTriangle className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">{alertModal.title}</h3>
                </div>
                <div className="p-6">
                  <p className="text-slate-600 text-center mb-8">{alertModal.message}</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setAlertModal(null)}
                      className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-600 shadow-amber-500/20 text-white font-medium rounded-xl transition-colors shadow-sm"
                    >
                      OK
                    </button>
                  </div>
                </div>
              </>
            )}

            {alertModal.type === 'confirm' && (
              <>
                <div className="p-6 text-center border-b bg-red-50/50 border-red-100">
                  <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center mb-4 bg-red-100 text-red-500">
                    <AlertOctagon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">{alertModal.title}</h3>
                </div>
                <div className="p-6">
                  <p className="text-slate-600 text-center mb-8">{alertModal.message}</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setAlertModal(null)}
                      className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (alertModal.onConfirm) alertModal.onConfirm();
                        setAlertModal(null);
                      }}
                      className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 shadow-red-500/20 text-white font-medium rounded-xl transition-colors shadow-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>;
}
