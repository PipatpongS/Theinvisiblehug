import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ReferenceLine
} from "recharts";
import {
  Heart,
  Activity,
  Thermometer,
  Zap,
  Wifi,
  HardDrive,
  Battery,
  PieChart as PieChartIcon,
  Cpu,
  BrainCircuit,
  ChevronRight,
  Clock,
  Gauge
} from "lucide-react";
import clsx from "clsx";
let globalTimeCounter = 30;
const generateInitialData = () => Array.from({ length: 30 }, (_, i) => ({
  time: i.toString(),
  hr: 80 + Math.random() * 10 - 5,
  eda: 5 + Math.random() * 2 - 1,
  temp: 36.5 + Math.random() * 0.4 - 0.2,
  imu: 1 + Math.random() * 0.5
}));
const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { name, value, color } = payload[0].payload;
    return <div className="flex items-center gap-2 px-3 py-2 rounded-xl shadow-lg border border-slate-200 bg-white">
        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
        <span className="text-slate-700 text-sm font-semibold">{name}: {value}%</span>
      </div>;
  }
  return null;
};
export function Dashboard() {
  const [data, setData] = useState(generateInitialData);
  const [status, setStatus] = useState("normal");
  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) => {
        const next = {
          time: (globalTimeCounter++).toString(),
          hr: 80 + Math.random() * 10 - 5,
          eda: 5 + Math.random() * 2 - 1,
          temp: 36.5 + Math.random() * 0.4 - 0.2,
          imu: 1 + Math.random() * 0.5
        };
        return [...prev.slice(1), next];
      });
    }, 1500);
    return () => clearInterval(interval);
  }, []);
  const statusConfig = {
    normal: {
      color: "text-emerald-600",
      hexColor: "#059669",
      bgStyle: { background: "linear-gradient(135deg, #ecfdf5, #f0fdf4)" },
      border: "border-emerald-200",
      shadow: "shadow-[0_4px_24px_rgba(5,150,105,0.15)]",
      label: "NORMAL",
      sublabel: "Stable Physiological State",
      confidence: 94,
      inference: "11ms",
      dot: "bg-emerald-500",
      ringColor: "rgba(5,150,105,0.2)"
    },
    risk: {
      color: "text-amber-600",
      hexColor: "#d97706",
      bgStyle: { background: "linear-gradient(135deg, #fffbeb, #fef3c7)" },
      border: "border-amber-200",
      shadow: "shadow-[0_4px_24px_rgba(217,119,6,0.15)]",
      label: "RISK OF MELTDOWN",
      sublabel: "Elevated Stress Indicators Detected",
      confidence: 81,
      inference: "14ms",
      dot: "bg-amber-500",
      ringColor: "rgba(217,119,6,0.2)"
    },
    meltdown: {
      color: "text-red-600",
      hexColor: "#dc2626",
      bgStyle: { background: "linear-gradient(135deg, #fff5f5, #fee2e2)" },
      border: "border-red-200",
      shadow: "shadow-[0_4px_24px_rgba(220,38,38,0.2)]",
      label: "MELTDOWN IN PROGRESS",
      sublabel: "Critical Threshold Exceeded",
      confidence: 97,
      inference: "10ms",
      dot: "bg-red-500",
      ringColor: "rgba(220,38,38,0.25)"
    }
  };
  const cycleStatus = () => {
    setStatus((prev) => prev === "normal" ? "risk" : prev === "risk" ? "meltdown" : "normal");
  };
  const currentStatus = statusConfig[status];
  const currentData = data[data.length - 1];
  const dailySummaries = [
    { name: "Heart Rate", unit: "BPM", current: currentData.hr.toFixed(1), avg: 82.4, min: 65, max: 115.2, std: 4.8, icon: Heart, color: "text-rose-500", bg: "bg-rose-50", border: "border-rose-200", hex: "#f43f5e" },
    { name: "EDA (Stress)", unit: "\xB5S", current: currentData.eda.toFixed(2), avg: 4.8, min: 1.2, max: 8.9, std: 1.2, icon: Activity, color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-200", hex: "#3b82f6" },
    { name: "Skin Temp", unit: "\xB0C", current: currentData.temp.toFixed(1), avg: 36.6, min: 36.1, max: 37.4, std: 0.2, icon: Thermometer, color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-200", hex: "#f59e0b" },
    { name: "Movement", unit: "g", current: currentData.imu.toFixed(2), avg: 1.1, min: 0.1, max: 3.5, std: 0.6, icon: Zap, color: "text-violet-500", bg: "bg-violet-50", border: "border-violet-200", hex: "#8b5cf6" }
  ];
  const statusProportionData = [
    { name: "Normal", value: 82, color: "#059669" },
    { name: "At Risk", value: 14, color: "#d97706" },
    { name: "Meltdown", value: 4, color: "#dc2626" }
  ];
  const sensorReadiness = [
    { name: "Heart Rate", shortName: "HR", score: 98, color: "#ef4444", trackColor: "#fecdd3" },
    { name: "EDA (Stress)", shortName: "EDA", score: 95, color: "#3b82f6", trackColor: "#bfdbfe" },
    { name: "Skin Temp", shortName: "Temp", score: 100, color: "#f97316", trackColor: "#fed7aa" },
    { name: "Movement", shortName: "IMU", score: 92, color: "#8b5cf6", trackColor: "#ddd6fe" }
  ];
  const overallReadiness = Math.round(
    sensorReadiness.reduce((sum, s) => sum + s.score, 0) / sensorReadiness.length
  );
  return <div className="space-y-8 pb-10">
      <div className="flex flex-col xl:flex-row gap-6">
        {
    /* Left Column: AI Status + Donut Chart */
  }
        <div className="flex-1 flex flex-col gap-6">

          {
    /* ── AI Real-time Inference Card ── */
  }
          <div
    className={clsx(
      "flex-1 rounded-3xl border transition-all duration-700 relative overflow-hidden cursor-pointer select-none group",
      currentStatus.border,
      currentStatus.shadow
    )}
    style={currentStatus.bgStyle}
    onClick={cycleStatus}
    title="Click to simulate status"
  >
            {
    /* Glow blob */
  }
            <div
    className="absolute -top-12 -right-12 w-56 h-56 rounded-full blur-3xl opacity-20 transition-all duration-700 pointer-events-none"
    style={{ backgroundColor: currentStatus.hexColor }}
  />

            {
    /* Pulse rings — meltdown only */
  }
            {status === "meltdown" && <>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-red-400/30 animate-ping pointer-events-none" />
                <div
    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full border border-red-300/20 animate-ping pointer-events-none"
    style={{ animationDelay: "0.4s" }}
  />
              </>}

            <div className="relative z-10 p-5 flex flex-col gap-0 h-full">
              {
    /* Header */
  }
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BrainCircuit className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-500 text-[11px] font-bold uppercase tracking-[0.2em]">
                    AI Real-time Inference
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/70 border border-slate-200">
                  <span className={clsx("w-1.5 h-1.5 rounded-full animate-pulse", currentStatus.dot)} />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Live</span>
                </div>
              </div>

              {
    /* Main status display — flex-1 pushes stats to bottom */
  }
              <div className="flex-1 flex flex-col items-center justify-center gap-3 py-4">
                {
    /* Icon ring */
  }
                <div
    className="w-20 h-20 rounded-full flex items-center justify-center transition-all duration-700 relative"
    style={{
      background: `radial-gradient(circle, ${currentStatus.hexColor}18, transparent 70%)`,
      boxShadow: `0 0 0 1px ${currentStatus.hexColor}30, 0 0 28px ${currentStatus.hexColor}18`
    }}
  >
                  {status === "normal" && <Heart className="w-9 h-9 text-emerald-500" strokeWidth={1.5} />}
                  {status === "risk" && <Activity className="w-9 h-9 text-amber-500 animate-pulse" strokeWidth={1.5} />}
                  {status === "meltdown" && <Zap className="w-9 h-9 text-red-500 animate-bounce" strokeWidth={1.5} />}
                </div>

                {
    /* Status label */
  }
                <div
    className={clsx(
      "text-4xl font-extrabold tracking-widest uppercase transition-all duration-500 text-center",
      currentStatus.color
    )}
    style={{ textShadow: `0 2px 16px ${currentStatus.hexColor}40` }}
  >
                  {currentStatus.label}
                </div>

                <div className="text-slate-500 text-sm font-medium tracking-wide text-center">
                  {currentStatus.sublabel}
                </div>

                {
    /* Click hint */
  }
                <div className="flex items-center gap-1 text-slate-400 group-hover:text-slate-600 transition-colors duration-300">
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-[10px] uppercase tracking-widest font-semibold">Click to simulate next state</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              </div>

              {
    /* Stats row — pinned to bottom */
  }
              <div className="grid grid-cols-3 gap-3 border-t border-slate-200/80 pt-4 mt-2">
                <div className="flex flex-col items-center gap-1">
                  <Gauge className="w-4 h-4 text-slate-400 mb-0.5" />
                  <span
    className="text-xl font-bold tabular-nums transition-all duration-500"
    style={{ color: currentStatus.hexColor }}
  >
                    {currentStatus.confidence}%
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Confidence</span>
                </div>
                <div className="flex flex-col items-center gap-1 border-x border-slate-200/80">
                  <Clock className="w-4 h-4 text-slate-400 mb-0.5" />
                  <span className="text-xl font-bold text-slate-700 tabular-nums">{currentStatus.inference}</span>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Inference</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Cpu className="w-4 h-4 text-slate-400 mb-0.5" />
                  <span className="text-xl font-bold text-slate-700">v1.0</span>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">TinyML</span>
                </div>
              </div>
            </div>
          </div>

          {
    /* Status Proportion Donut Chart */
  }
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-row items-center gap-5">
            {
    /* Donut chart */
  }
            <div className="w-32 h-32 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
    data={statusProportionData}
    cx="50%"
    cy="50%"
    innerRadius={36}
    outerRadius={58}
    paddingAngle={3}
    dataKey="value"
    stroke="none"
  >
                    {statusProportionData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {
    /* Legend + bars */
  }
            <div className="flex-1 min-w-0">
              <h3 className="text-slate-700 font-semibold text-sm mb-3 flex items-center gap-1.5">
                <PieChartIcon className="w-4 h-4 text-blue-500" />
                Today's Status Distribution
              </h3>
              <div className="flex flex-col gap-2.5">
                {statusProportionData.map((item, idx) => <div key={idx} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-slate-500 w-14 flex-shrink-0">{item.name}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
    className="h-full rounded-full transition-all duration-500"
    style={{ width: `${item.value}%`, backgroundColor: item.color }}
  />
                    </div>
                    <span className="text-xs font-bold w-8 text-right flex-shrink-0" style={{ color: item.color }}>
                      {item.value}%
                    </span>
                  </div>)}
              </div>
            </div>
          </div>
        </div>

        {
    /* Right Column: Hardware Status */
  }
        <div className="w-full xl:w-96 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-30 pointer-events-none" style={{ background: "radial-gradient(circle, #4361ee20, transparent)" }} />
          <h2 className="text-slate-800 font-semibold text-lg flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-500" />
            Hardware Status
          </h2>

          <div className="space-y-4 mt-1">
            {
    /* Battery */
  }
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3 text-slate-600">
                <div className="p-2 rounded-lg bg-emerald-50">
                  <Battery className="w-4 h-4 text-emerald-500" />
                </div>
                <span className="text-sm font-medium">Battery Level</span>
              </div>
              <span className="font-bold text-emerald-600">85%</span>
            </div>

            {
    /* Wi-Fi */
  }
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3 text-slate-600">
                <div className="p-2 rounded-lg bg-blue-50">
                  <Wifi className="w-4 h-4 text-blue-500" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Wi-Fi Network</span>
                  <span className="text-[10px] text-slate-400">Home_5G (Signal: Good)</span>
                </div>
              </div>
              <span className="font-bold text-blue-500">Connected</span>
            </div>

            {
    /* UI Latency */
  }
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3 text-slate-600">
                <div className="p-2 rounded-lg bg-indigo-50">
                  <Zap className="w-4 h-4 text-indigo-500" />
                </div>
                <span className="text-sm font-medium">UI Latency</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="font-bold text-indigo-500">≤ 300ms</span>
                <span className="text-[10px] text-slate-400">Device → Web</span>
              </div>
            </div>

            {
    /* Local Storage */
  }
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3 text-slate-600">
                <div className="p-2 rounded-lg bg-purple-50">
                  <HardDrive className="w-4 h-4 text-purple-500" />
                </div>
                <span className="text-sm font-medium">Local Storage</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="font-bold text-purple-500">28.5 GB</span>
                <span className="text-[10px] text-slate-400">MicroSD Free</span>
              </div>
            </div>

            {
    /* Sensor Readiness */
  }
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 text-slate-600">
                  <div className="p-2 rounded-lg bg-teal-50">
                    <Cpu className="w-4 h-4 text-teal-500" />
                  </div>
                  <span className="text-sm font-medium">Sensor Readiness</span>
                </div>
                <span
    className="text-sm font-bold"
    style={{
      color: overallReadiness >= 95 ? "#059669" : overallReadiness >= 80 ? "#d97706" : "#dc2626"
    }}
  >
                  {overallReadiness}%
                </span>
              </div>

              {
    /* Overall bar */
  }
              <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden mb-3">
                <div
    className="h-full rounded-full transition-all duration-700"
    style={{
      width: `${overallReadiness}%`,
      background: overallReadiness >= 95 ? "linear-gradient(90deg, #10b981, #06b6d4)" : overallReadiness >= 80 ? "linear-gradient(90deg, #f97316, #fbbf24)" : "linear-gradient(90deg, #ef4444, #f97316)",
      boxShadow: overallReadiness >= 95 ? "0 0 8px rgba(16,185,129,0.4)" : "0 0 8px rgba(251,146,60,0.4)"
    }}
  />
              </div>

              {
    /* Individual sensors */
  }
              <div className="space-y-2 pt-1 border-t border-slate-200">
                {sensorReadiness.map((sensor, idx) => <div key={idx} className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 w-9 flex-shrink-0 font-mono">
                      {sensor.shortName}
                    </span>
                    <div
    className="flex-1 h-1.5 rounded-full overflow-hidden"
    style={{ backgroundColor: sensor.trackColor }}
  >
                      <div
    className="h-full rounded-full transition-all duration-700"
    style={{
      width: `${sensor.score}%`,
      backgroundColor: sensor.color,
      boxShadow: `0 0 5px ${sensor.color}60`
    }}
  />
                    </div>
                    <span
    className="text-[10px] font-bold w-8 text-right flex-shrink-0"
    style={{ color: sensor.color }}
  >
                      {sensor.score}%
                    </span>
                  </div>)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {
    /* Daily Sensor Summary */
  }
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-500" />
          Daily Sensor Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {dailySummaries.map((sensor, idx) => <div
    key={idx}
    className={clsx("bg-white border rounded-3xl p-6 shadow-sm relative overflow-hidden", sensor.border)}
  >
              <div
    className="absolute -top-8 -right-8 w-28 h-28 rounded-full blur-3xl opacity-20 pointer-events-none"
    style={{ backgroundColor: sensor.hex }}
  />
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={clsx("p-3 rounded-xl", sensor.bg)}>
                    <sensor.icon className={clsx("w-5 h-5", sensor.color)} />
                  </div>
                  <h3 className="text-slate-700 font-medium">{sensor.name}</h3>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-end gap-2">
                  <span className={clsx("text-4xl font-bold tracking-tight", sensor.color)}>
                    {sensor.current}
                  </span>
                  <span className="text-slate-400 mb-1 font-medium">{sensor.unit}</span>
                </div>
                <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">
                  Current Value
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm border-t border-slate-100 pt-4">
                <div>
                  <div className="text-slate-400 text-[10px] uppercase tracking-wider mb-1">Average</div>
                  <div className="text-slate-700 font-medium">{sensor.avg} {sensor.unit}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[10px] uppercase tracking-wider mb-1">Std Dev</div>
                  <div className="text-slate-700 font-medium">±{sensor.std}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[10px] uppercase tracking-wider mb-1">Min</div>
                  <div className="text-slate-700 font-medium">{sensor.min} {sensor.unit}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[10px] uppercase tracking-wider mb-1">Max</div>
                  <div className="text-slate-700 font-medium">{sensor.max} {sensor.unit}</div>
                </div>
              </div>
            </div>)}
        </div>
      </div>

      {
    /* Live Sensor Telemetry */
  }
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-500" />
          Live Sensor Telemetry
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SensorChart
    title="Heart Rate & HRV (BPM)"
    color="#f43f5e"
    icon={Heart}
    data={data}
    dataKey="hr"
    domain={[55, 122]}
    baseline={82.4}
    min={65}
    max={115.2}
    unit="BPM"
  />
          <SensorChart
    title="Electrodermal Activity (EDA)"
    color="#3b82f6"
    icon={Activity}
    data={data}
    dataKey="eda"
    domain={[0, 10]}
    baseline={4.8}
    min={1.2}
    max={8.9}
    unit="µS"
  />
          <SensorChart
    title="Skin Temperature (°C)"
    color="#f59e0b"
    icon={Thermometer}
    data={data}
    dataKey="temp"
    domain={[35.5, 37.8]}
    baseline={36.6}
    min={36.1}
    max={37.4}
    unit="°C"
  />
          <SensorChart
    title="Movement Magnitude (IMU)"
    color="#8b5cf6"
    icon={Zap}
    data={data}
    dataKey="imu"
    domain={[0, 4]}
    baseline={1.1}
    min={0.1}
    max={3.5}
    unit="g"
  />
        </div>
      </div>
    </div>;
}
function SensorChart({ title, color, icon: Icon, data, dataKey, domain, baseline, min, max, unit }) {
  const refLines = [
    { label: "Max", value: max, color: "#ef4444", pos: "insideTopRight" },
    { label: "Baseline", value: baseline, color: "#f97316", pos: "insideTopRight" },
    { label: "Min", value: min, color: "#06b6d4", pos: "insideBottomRight" }
  ];
  return <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-slate-300 hover:shadow-md transition-all duration-300 group">
      {
    /* Header */
  }
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
    className="p-2.5 rounded-xl transition-all duration-300 group-hover:scale-110"
    style={{ backgroundColor: `${color}15`, color, boxShadow: `0 0 12px ${color}15` }}
  >
            <Icon className="w-4 h-4" />
          </div>
          <h3 className="text-slate-700 font-medium text-sm">{title}</h3>
        </div>
        <div className="text-xs font-mono flex items-center gap-1.5" style={{ color }}>
          Live
          <span
    className="inline-block w-1.5 h-1.5 rounded-full animate-pulse"
    style={{ backgroundColor: color }}
  />
        </div>
      </div>

      {
    /* Reference line legend */
  }
      <div className="flex items-center gap-4 mb-4 flex-wrap">
        {
    /* Live signal legend */
  }
        <div className="flex items-center gap-1.5">
          <svg width="18" height="8" viewBox="0 0 18 8">
            <line x1="0" y1="4" x2="18" y2="4" stroke={color} strokeWidth="2.5" />
          </svg>
          <span className="text-[10px] font-semibold text-slate-500">Signal</span>
        </div>
        {refLines.map((r) => <div key={r.label} className="flex items-center gap-1.5">
            <svg width="18" height="8" viewBox="0 0 18 8">
              <line x1="0" y1="4" x2="18" y2="4" stroke={r.color} strokeWidth="1.5" strokeDasharray="4 2.5" />
            </svg>
            <span className="text-[10px] font-semibold" style={{ color: r.color }}>
              {r.label}: {r.value} {unit}
            </span>
          </div>)}
      </div>

      {
    /* Chart */
  }
      <div className="h-44 w-full min-h-[176px]">
        <ResponsiveContainer width="100%" height="100%" minWidth={10} minHeight={10}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="time" hide />
            <YAxis
    stroke="#94a3b8"
    fontSize={11}
    tickLine={false}
    axisLine={false}
    domain={domain}
    width={35}
    tickFormatter={(val) => val.toFixed(1)}
  />
            <Tooltip
    contentStyle={{
      backgroundColor: "#ffffff",
      border: "1px solid #e2e8f0",
      borderRadius: "12px",
      color: "#0f172a",
      fontSize: "12px",
      boxShadow: "0 4px 16px rgba(0,0,0,0.1)"
    }}
    itemStyle={{ color, fontWeight: "bold" }}
    labelStyle={{ display: "none" }}
    formatter={(value) => [value.toFixed(2), "Value"]}
    animationDuration={200}
  />

            {
    /* Reference lines: Max, Baseline, Min */
  }
            <ReferenceLine
    y={max}
    stroke="#ef4444"
    strokeDasharray="5 3"
    strokeWidth={1.5}
    label={{ value: `Max`, position: "insideBottomRight", fontSize: 9, fill: "#ef4444", fontWeight: "700" }}
  />
            <ReferenceLine
    y={baseline}
    stroke="#f97316"
    strokeDasharray="5 3"
    strokeWidth={1.5}
    label={{ value: `Baseline`, position: "insideTopRight", fontSize: 9, fill: "#f97316", fontWeight: "700" }}
  />
            <ReferenceLine
    y={min}
    stroke="#06b6d4"
    strokeDasharray="5 3"
    strokeWidth={1.5}
    label={{ value: `Min`, position: "insideTopRight", fontSize: 9, fill: "#06b6d4", fontWeight: "700" }}
  />

            {
    /* Live signal line */
  }
            <Line
    type="monotone"
    dataKey={dataKey}
    stroke={color}
    strokeWidth={2.5}
    dot={false}
    isAnimationActive={false}
    style={{ filter: `drop-shadow(0px 3px 6px ${color}50)` }}
  />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>;
}
