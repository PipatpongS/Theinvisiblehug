import { useState, useEffect, useRef } from "react";
import { Play, Square, AlertOctagon, Vibrate, CheckCircle2, History, Trash2 } from "lucide-react";
import clsx from "clsx";
import { publishMQTT, isMQTTConnected } from "../../services/mqttClient";
export function Controls() {
  const [isEmergencyStop, setIsEmergencyStop] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const vibrationTimeoutRef = useRef(null);
  const [baselines, setBaselines] = useState([
    { id: 1, date: "24 Apr 2026", time: "08:30 AM", duration: "5 mins", hr: 82, eda: 3615.5, temp: 24.8, imu: 0.15 },
    { id: 2, date: "22 Apr 2026", time: "09:00 AM", duration: "10 mins", hr: 80, eda: 3605.2, temp: 24.7, imu: 0.12 },
    { id: 3, date: "20 Apr 2026", time: "07:45 AM", duration: "5 mins", hr: 78, eda: 3590.8, temp: 24.6, imu: 0.10 },
    { id: 4, date: "17 Apr 2026", time: "08:15 AM", duration: "10 mins", hr: 84, eda: 3620.0, temp: 24.9, imu: 0.18 }
  ]);
  const [selectedBaselines, setSelectedBaselines] = useState([1]);
  
  const activeBaselines = baselines.filter(b => selectedBaselines.includes(b.id));
  const avgHR = activeBaselines.length ? (activeBaselines.reduce((sum, b) => sum + b.hr, 0) / activeBaselines.length).toFixed(1) : "0.0";
  const avgEDA = activeBaselines.length ? (activeBaselines.reduce((sum, b) => sum + b.eda, 0) / activeBaselines.length).toFixed(1) : "0.0";
  const avgTemp = activeBaselines.length ? (activeBaselines.reduce((sum, b) => sum + b.temp, 0) / activeBaselines.length).toFixed(1) : "0.0";
  const avgIMU = activeBaselines.length ? (activeBaselines.reduce((sum, b) => sum + b.imu, 0) / activeBaselines.length).toFixed(2) : "0.00";
  const totalSessions = activeBaselines.length;

  const toggleBaseline = (id) => {
    setSelectedBaselines(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  useEffect(() => {
    localStorage.setItem("baseline_hr", avgHR);
    localStorage.setItem("baseline_eda", avgEDA);
    localStorage.setItem("baseline_temp", avgTemp);
    localStorage.setItem("baseline_imu", avgIMU);
    window.dispatchEvent(new Event("baselineUpdated"));
  }, [avgHR, avgEDA, avgTemp]);

  return <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Basic Control Panel</h1>
          <p className="text-slate-500 mt-2">Manual overrides and baseline calibration.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {
    /* Manual Overrides */
  }
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ background: "radial-gradient(circle, #4361ee, transparent)" }} />

          <div className="relative z-10">
            <h2 className="text-xl font-semibold text-slate-800 mb-1">Manual Override</h2>
            <p className="text-sm text-slate-500">Force start DTP or vibration before AI triggers it automatically.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-2 relative z-10">
            <div className="flex-1 flex flex-col gap-2">
              <button
                className="w-full bg-slate-50 text-slate-400 border border-slate-200 font-medium py-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-not-allowed"
                title="DTP hardware not yet installed"
              >
                <Play className="w-5 h-5" />
                Start DTP (Pressure)
              </button>
              <button
                className="w-full bg-slate-50 text-slate-400 border border-slate-200 font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-not-allowed"
                title="DTP hardware not yet installed"
              >
                <Square className="w-4 h-4" />
                Stop DTP
              </button>
            </div>
            
            <div className="flex-1 flex flex-col gap-2">
              <button
                onClick={() => {
                  if (!isMQTTConnected()) {
                    setConfirmDialog({
                      title: "Connection Offline",
                      message: "Cannot send command. The system is currently disconnected.",
                      isDanger: true,
                      isAlert: true,
                    });
                    return;
                  }
                  setConfirmDialog({
                    title: "Start Vibration",
                    message: "Are you sure you want to START VIBRATION manually? It will run continuously for 3 minutes before auto-stopping.",
                    isDanger: false,
                    onConfirm: () => {
                      const pat = localStorage.getItem("activePattern") || 1;
                      const pwm = localStorage.getItem("intensity") || 150;
                      publishMQTT("sensor/control", `P${pat}_${pwm}`);
                      
                      if (vibrationTimeoutRef.current) clearTimeout(vibrationTimeoutRef.current);
                      vibrationTimeoutRef.current = setTimeout(() => {
                        if (isMQTTConnected()) publishMQTT("sensor/control", "P0_0");
                      }, 180000); // 3 minutes
                    }
                  });
                }}
                className="w-full text-white font-medium py-4 rounded-xl flex items-center justify-center gap-2 transition-all border hover:-translate-y-0.5 shadow-sm"
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #9333ea)",
                  borderColor: "#7c3aed",
                  boxShadow: "0 4px 16px rgba(124,58,237,0.3)"
                }}
              >
                <Vibrate className="w-5 h-5" />
                Start Vibration
              </button>
              <button
                onClick={() => {
                  if (!isMQTTConnected()) {
                    setConfirmDialog({
                      title: "Connection Offline",
                      message: "Cannot send command. The system is currently disconnected.",
                      isDanger: true,
                      isAlert: true,
                    });
                    return;
                  }
                  setConfirmDialog({
                    title: "Stop Vibration",
                    message: "Are you sure you want to STOP VIBRATION?",
                    isDanger: false,
                    onConfirm: () => {
                      publishMQTT("sensor/control", "P0_0");
                      if (vibrationTimeoutRef.current) clearTimeout(vibrationTimeoutRef.current);
                    }
                  });
                }}
                className="w-full bg-slate-50 text-slate-600 border border-slate-200 font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-all hover:bg-slate-100 hover:text-slate-800"
              >
                <Square className="w-4 h-4" />
                Stop Vibration
              </button>
            </div>
          </div>

          <div className="mt-auto pt-8 border-t border-slate-100 relative z-10">
            <button
              onClick={() => {
                if (!isMQTTConnected()) {
                  setConfirmDialog({
                    title: "Connection Offline",
                    message: "Cannot send command. The system is currently disconnected.",
                    isDanger: true,
                    isAlert: true,
                  });
                  return;
                }
                if (!isEmergencyStop) {
                  setConfirmDialog({
                    title: "EMERGENCY STOP",
                    message: "Are you sure you want to immediately cut power to all motors and actuators?",
                    isDanger: true,
                    onConfirm: () => {
                      setIsEmergencyStop(true);
                      publishMQTT("sensor/control", "P0_0");
                      if (vibrationTimeoutRef.current) clearTimeout(vibrationTimeoutRef.current);
                    }
                  });
                } else {
                  setConfirmDialog({
                    title: "Clear Emergency Stop",
                    message: "Are you sure you want to clear the Emergency Stop state?",
                    isDanger: false,
                    onConfirm: () => {
                      setIsEmergencyStop(false);
                    }
                  });
                }
              }}
              className={clsx(
                "w-full font-bold py-5 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all border-2",
                isEmergencyStop ? "bg-slate-100 text-red-400 border-red-200" : "bg-red-50 hover:bg-red-100 text-red-600 border-red-300 shadow-[0_4px_20px_rgba(220,38,38,0.15)] hover:shadow-[0_4px_28px_rgba(220,38,38,0.25)] hover:-translate-y-0.5"
              )}
            >
              <AlertOctagon className={clsx("w-8 h-8", isEmergencyStop ? "opacity-50" : "animate-pulse")} />
              <span className="text-xl tracking-wider uppercase">Emergency Stop</span>
              <span className="text-[11px] font-normal opacity-80 uppercase tracking-widest">
                Cuts power to Nitinol &amp; motors immediately
              </span>
            </button>
          </div>
        </div>

        {
    /* Baseline Recording */
  }
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col gap-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ background: "radial-gradient(circle, #10b981, transparent)" }} />

          <div className="relative z-10">
            <h2 className="text-xl font-semibold text-slate-800 mb-1">Baseline Calibration</h2>
            <p className="text-sm text-slate-500">
              Record a new baseline when the wearer is completely calm. This acts as a reference for the AI.
            </p>
          </div>

          <div className="flex-1 flex items-center justify-center py-8 relative z-10">
            <div className="relative">
              {isRecording && <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-15" />}
              <button
    onClick={() => {
      if (!isMQTTConnected()) {
        setConfirmDialog({
          title: "Connection Offline",
          message: "Cannot start calibration. The system is currently disconnected.",
          isDanger: true,
          isAlert: true,
        });
        return;
      }
      
      if (!isRecording) {
        setConfirmDialog({
          title: "Start Calibration",
          message: "The wearer should be completely calm before starting. Continue?",
          isDanger: false,
          onConfirm: () => {
            setIsRecording(true);
            publishMQTT("sensor/control", "CAL_START");
            // Simulate 5 min calibration ending quickly for demo
            setTimeout(() => {
              setIsRecording(false);
              publishMQTT("sensor/control", "CAL_STOP");
              
              const now = new Date();
              const newId = Date.now();
              const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
              const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
              
              setBaselines(prev => [{
                id: newId,
                date: dateStr,
                time: timeStr,
                duration: "5 mins",
                hr: Math.floor(Math.random() * (90 - 70 + 1) + 70),
                eda: parseFloat((Math.random() * (3650 - 3550) + 3550).toFixed(1)),
                temp: parseFloat((Math.random() * (25.2 - 24.5) + 24.5).toFixed(1)),
                imu: parseFloat((Math.random() * (0.2 - 0.05) + 0.05).toFixed(2))
              }, ...prev]);
            }, 3000);
          }
        });
      } else {
        setConfirmDialog({
          title: "Stop Calibration",
          message: "Are you sure you want to cancel the current calibration?",
          isDanger: true,
          onConfirm: () => {
            setIsRecording(false);
            publishMQTT("sensor/control", "CAL_STOP");
          }
        });
      }
    }}
    className={clsx(
      "relative w-48 h-48 rounded-full flex flex-col items-center justify-center gap-3 transition-all duration-500 border-4",
      isRecording ? "bg-white border-red-400 text-red-500 shadow-[0_0_40px_rgba(239,68,68,0.2)]" : "bg-slate-50 border-slate-200 text-slate-500 hover:border-blue-400/50 hover:text-blue-500 hover:bg-blue-50/50"
    )}
  >
                {isRecording ? <>
                    <Square className="w-10 h-10 fill-current animate-pulse" />
                    <span className="font-bold text-lg tracking-wide uppercase">Stop Rec</span>
                    <span className="text-sm font-mono text-slate-500">
                      02:14 <span className="text-slate-400">/ 05:00</span>
                    </span>
                  </> : <>
                    <div className="w-10 h-10 rounded-full bg-current opacity-80" />
                    <span className="font-bold text-lg tracking-wide uppercase">Record</span>
                    <span className="text-xs text-slate-400 font-medium">5 Min Calibration</span>
                  </>}
              </button>
            </div>
          </div>
        </div>
      </div>

      {
    /* Baseline Average Summary */
  }
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm mt-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-blue-50">
                <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 3v18h18" /><path d="m7 16 4-4 4 4 4-7" />
                </svg>
              </span>
              Baseline Average Summary
            </h2>
            <p className="text-sm text-slate-400 mt-1 ml-11">Aggregate across {totalSessions} selected sessions</p>
          </div>
          <span className="self-start sm:self-auto inline-flex items-center gap-1.5 text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
            {totalSessions} Sessions Total
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {
    /* Avg HR */
  }
          <div className="relative overflow-hidden rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50 to-white p-6">
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-30 pointer-events-none" style={{ background: "radial-gradient(circle, #f43f5e, transparent)" }} />
            <p className="text-xs font-semibold uppercase tracking-widest text-rose-400 mb-3">Avg Heart Rate</p>
            <p className="font-mono text-3xl font-bold text-rose-500">{avgHR} <span className="text-base font-normal text-rose-400">BPM</span></p>
            <div className="mt-4 flex flex-wrap gap-2">
              {activeBaselines.length > 0 ? activeBaselines.map((b) => <span key={b.id} className="text-[11px] font-mono bg-rose-100 text-rose-500 px-2 py-0.5 rounded-md border border-rose-200">
                  #{b.id}: {b.hr}
                </span>) : <span className="text-xs text-slate-400">No baseline selected</span>}
            </div>
          </div>

          {
    /* Avg EDA */
  }
          <div className="relative overflow-hidden rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-white p-6">
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-30 pointer-events-none" style={{ background: "radial-gradient(circle, #7c3aed, transparent)" }} />
            <p className="text-xs font-semibold uppercase tracking-widest text-violet-400 mb-3">Avg EDA Level</p>
            <p className="font-mono text-3xl font-bold text-violet-500">{avgEDA} <span className="text-base font-normal text-violet-400">µS</span></p>
            <div className="mt-4 flex flex-wrap gap-2">
              {activeBaselines.length > 0 ? activeBaselines.map((b) => <span key={b.id} className="text-[11px] font-mono bg-violet-100 text-violet-500 px-2 py-0.5 rounded-md border border-violet-200">
                  #{b.id}: {b.eda.toFixed(1)}
                </span>) : <span className="text-xs text-slate-400">No baseline selected</span>}
            </div>
          </div>

          {
    /* Avg Temp */
  }
          <div className="relative overflow-hidden rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-6">
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-30 pointer-events-none" style={{ background: "radial-gradient(circle, #f59e0b, transparent)" }} />
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-400 mb-3">Avg Body Temp</p>
            <p className="font-mono text-3xl font-bold text-amber-500">{avgTemp} <span className="text-base font-normal text-amber-400">°C</span></p>
            <div className="mt-4 flex flex-wrap gap-2">
              {activeBaselines.length > 0 ? activeBaselines.map((b) => <span key={b.id} className="text-[11px] font-mono bg-amber-100 text-amber-500 px-2 py-0.5 rounded-md border border-amber-200">
                  #{b.id}: {b.temp.toFixed(1)}
                </span>) : <span className="text-xs text-slate-400">No baseline selected</span>}
            </div>
          </div>
        </div>
      </div>

      {
    /* Baseline History */
  }
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm mt-8">
        <h2 className="text-xl font-semibold text-slate-800 mb-8 flex items-center gap-3">
          <History className="w-6 h-6 text-blue-500" />
          Baseline History
        </h2>

        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-50/50">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-400 text-[11px] uppercase tracking-wider">
                <th className="p-5 font-semibold w-12"></th>
                <th className="p-5 font-semibold">Date &amp; Time</th>
                <th className="p-5 font-semibold">Duration</th>
                <th className="p-5 font-semibold">Avg HR</th>
                <th className="p-5 font-semibold">Avg EDA</th>
                <th className="p-5 font-semibold">Avg Temp</th>
                <th className="py-4 px-6 text-left font-bold tracking-wider">STATUS</th>
                <th className="py-4 px-6 text-center font-bold tracking-wider w-16"></th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {baselines.map((bl) => {
                const isSelected = selectedBaselines.includes(bl.id);
                return (
                  <tr key={bl.id} className={clsx("hover:bg-slate-50 transition-colors cursor-pointer", isSelected && "bg-blue-50/30")} onClick={() => toggleBaseline(bl.id)}>
                    <td className="p-5">
                      <div className={clsx("w-5 h-5 rounded border flex items-center justify-center transition-colors", isSelected ? "bg-blue-500 border-blue-500 text-white" : "border-slate-300 bg-white")}>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                    </td>
                    <td className="p-5 text-slate-700 font-medium">
                      {bl.date} <span className="text-slate-400 ml-2">{bl.time}</span>
                    </td>
                    <td className="p-5 text-slate-500">{bl.duration}</td>
                    <td className="p-5 text-rose-500 font-mono">{bl.hr} BPM</td>
                    <td className="p-5 text-violet-500 font-mono">{bl.eda.toFixed(1)}</td>
                    <td className="p-5 text-amber-500 font-mono">{bl.temp.toFixed(1)}°C</td>
                    <td className="py-4 px-6">
                      <span className={clsx("flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full w-fit border", isSelected ? "text-emerald-600 bg-emerald-50 border-emerald-200" : "text-slate-500 bg-slate-100 border-slate-200")}>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {isSelected ? "Applied as Active" : "Archived"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDialog({
                            title: "Delete Baseline",
                            message: `Are you sure you want to delete the baseline from ${bl.date}?`,
                            isDanger: true,
                            onConfirm: () => {
                              setBaselines(prev => prev.filter(b => b.id !== bl.id));
                              setSelectedBaselines(prev => prev.filter(id => id !== bl.id));
                            }
                          });
                        }}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom Confirm Modal */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className={clsx("p-6 text-center border-b", confirmDialog.isDanger ? "bg-red-50/50 border-red-100" : "bg-slate-50/50 border-slate-100")}>
              <div className={clsx("w-14 h-14 rounded-full mx-auto flex items-center justify-center mb-4", confirmDialog.isDanger ? "bg-red-100 text-red-500" : "bg-blue-100 text-blue-500")}>
                <AlertOctagon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">{confirmDialog.title}</h3>
            </div>
            <div className="p-6">
              <p className="text-slate-600 text-center mb-8">{confirmDialog.message}</p>
              <div className="flex gap-3">
                {!confirmDialog.isAlert && (
                  <button
                    onClick={() => setConfirmDialog(null)}
                    className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={() => {
                    if (confirmDialog.onConfirm) confirmDialog.onConfirm();
                    setConfirmDialog(null);
                  }}
                  className={clsx("flex-1 py-3 px-4 text-white font-medium rounded-xl transition-colors shadow-sm", confirmDialog.isDanger ? "bg-red-500 hover:bg-red-600 shadow-red-500/20" : "bg-blue-500 hover:bg-blue-600 shadow-blue-500/20")}
                >
                  {confirmDialog.isAlert ? "OK" : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>;
}
