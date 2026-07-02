import React, { useState, useEffect, useMemo, useRef } from "react";
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
  ReferenceLine,
  AreaChart,
  Area
} from "recharts";
import { connectMQTT, disconnectMQTT } from "../../services/mqttClient";
import { fetchHistory, fetchDailyStats } from "../../services/influxClient";
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
  Gauge,
  Cloud
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

const CustomReferenceLabel = (props) => {
  const { viewBox, value, fill, position = "Left", dx = 0, dy = 0 } = props;
  const { x, y, width } = viewBox;
  const isRight = position.includes('Right');
  
  return (
    <foreignObject x={(isRight ? x + width - 110 : x + 10) + dx} y={(y || 0) - 22 + dy} width={100} height={20}>
      <div style={{ display: 'flex', justifyContent: isRight ? 'flex-end' : 'flex-start' }}>
        <span style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.85)', 
          padding: '1px 6px', 
          borderRadius: '6px', 
          fontSize: '10px', 
          fontWeight: 700, 
          color: fill,
          border: `1px solid ${fill}40`,
          backdropFilter: 'blur(3px)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          whiteSpace: 'nowrap'
        }}>
          {value}
        </span>
      </div>
    </foreignObject>
  );
};
export function Dashboard() {
  const [data, setData] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [dailyStats, setDailyStats] = useState(null);
  const [status, setStatus] = useState("normal");
  const [mqttStatus, setMqttStatus] = useState("Connecting...");
  const [uiLatency, setUiLatency] = useState(0);
  const [historyRange, setHistoryRange] = useState("-24h");
  const [historyAggregate, setHistoryAggregate] = useState("1m");
  const [deviceActive, setDeviceActive] = useState(false);
  const [baselineData, setBaselineData] = useState({ hr: null, eda: null, temp: null, imu: null });
  const [showLines, setShowLines] = useState({ max: true, min: true, avg: true, baseline: true });
  const deviceTimeoutRef = useRef(null);
  
  // โหลด History Data จาก InfluxDB เมื่อ Range หรือ Aggregate เปลี่ยน
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const hData = await fetchHistory(historyRange, historyAggregate);
        setHistoryData(hData);
      } catch (error) {
        console.error("Failed to load history", error);
      }
    };
    loadHistory();
  }, [historyRange, historyAggregate]);

  // โหลด Daily Stats ตอนเปิดเว็บและทุกๆ 5 วินาที
  useEffect(() => {
    const loadDailyStats = async () => {
      try {
        const stats = await fetchDailyStats();
        setDailyStats(stats);
      } catch (error) {
        console.error("Failed to load daily stats", error);
      }
    };

    loadDailyStats();

    // ดึงสถิติใหม่ทุกๆ 5 วินาทีตามที่ผู้ใช้ต้องการ
    const intervalStats = setInterval(loadDailyStats, 5 * 1000);
    return () => clearInterval(intervalStats);
  }, []);

  // เชื่อมต่อ MQTT รับ Live Data
  useEffect(() => {
    connectMQTT((incomingData) => {
      // incomingData หน้าตาจะเป็น { bpm: 80, temp: 36.5, gsr: 120, ax: 1, ... }
      
      // คำนวณความเคลื่อนไหว (IMU) แบบง่ายๆ จาก ax, ay, az
      const imuMagnitude = Math.sqrt(
        Math.pow(incomingData.ax || 0, 2) + 
        Math.pow(incomingData.ay || 0, 2) + 
        Math.pow(incomingData.az || 0, 2)
      );

      const newDataPoint = {
        time: new Date().toLocaleString(),
        hr: incomingData.bpm || 0,
        eda: (incomingData.gsr || 0) / 100, // แปลง GSR เป็น EDA คร่าวๆ
        temp: incomingData.temp || 0,
        imu: imuMagnitude
      };

      setData((prev) => {
        // เก็บข้อมูล Live ไว้แสดงบนกราฟ 60 จุดล่าสุด (ประมาณ 1 นาทีถ้าส่งทุกวิ)
        const next = [...prev, newDataPoint];
        if (next.length > 60) return next.slice(next.length - 60);
        return next;
      });
      
      setDeviceActive(true);
      if (deviceTimeoutRef.current) clearTimeout(deviceTimeoutRef.current);
      deviceTimeoutRef.current = setTimeout(() => {
        setDeviceActive(false);
      }, 5000);

      // คำนวณ UI Latency จริงจาก Timestamp
      if (incomingData.ts) {
        const now = Date.now();
        const diff = now - incomingData.ts;
        if (diff >= 0 && diff < 5000) { // กรองค่าที่ผิดปกติออก
          setUiLatency(diff);
        }
      }

      // เปลี่ยนสถานะคร่าวๆ ถ้าหัวใจเต้นเร็วมาก
      if (incomingData.bpm > 100) setStatus("meltdown");
      else if (incomingData.bpm > 85) setStatus("risk");
      else setStatus("normal");
    }, setMqttStatus);

    return () => disconnectMQTT();
  }, []);

  // โหลดค่า Baseline จาก localStorage
  useEffect(() => {
    const updateBaselines = () => {
      const hr = localStorage.getItem("baseline_hr");
      const eda = localStorage.getItem("baseline_eda");
      const temp = localStorage.getItem("baseline_temp");
      const imu = localStorage.getItem("baseline_imu");
      
      // Fallbacks if missing or old invalid mock values
      const hrVal = hr && hr !== "0.0" ? parseFloat(hr) : 82.0;
      const edaVal = eda && eda !== "0.0" && eda !== "4.20" && eda !== "4.2" && eda !== "0.00" ? parseFloat(eda) : 3615.5;
      const tempVal = temp && temp !== "0.0" && temp !== "36.60" && temp !== "36.6" && temp !== "0.00" ? parseFloat(temp) : 24.8;
      const imuVal = imu && imu !== "0.00" ? parseFloat(imu) : 0.15;

      setBaselineData({
        hr: hrVal,
        eda: edaVal,
        temp: tempVal,
        imu: imuVal,
      });
    };
    
    updateBaselines();
    window.addEventListener("baselineUpdated", updateBaselines);
    return () => window.removeEventListener("baselineUpdated", updateBaselines);
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
  
  // รวมข้อมูล History กับ Live Data เข้าด้วยกัน
  const combinedData = useMemo(() => {
    const liveMapped = data.map(d => ({
      time: d.time,
      bpm: d.hr,
      gsr: d.eda,
      temp: d.temp,
      imu: d.imu
    }));
    return [...historyData, ...liveMapped];
  }, [historyData, data]);

  // คำนวณค่า Min/Max ของกราฟ
  const { hrStats, edaStats, tempStats, imuStats } = useMemo(() => {
    const getStats = (dataKey) => {
      if (!combinedData || combinedData.length === 0) return { min: null, max: null, avg: null };
      const values = combinedData.map(d => d[dataKey]).filter(v => v !== undefined && v !== null && !isNaN(v));
      if (values.length === 0) return { min: null, max: null, avg: null };
      const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
      return { min: Math.min(...values), max: Math.max(...values), avg };
    };
    return {
      hrStats: getStats('bpm'),
      edaStats: getStats('gsr'),
      tempStats: getStats('temp'),
      imuStats: getStats('imu')
    };
  }, [combinedData]);

  // ใช้ข้อมูลล่าสุดที่รับมา หรือใช้ค่า 0 ถ้ายังไม่มีข้อมูล
  const currentData = data.length > 0 ? data[data.length - 1] : { hr: 0, eda: 0, temp: 0, imu: 0 };
  
  const defaultStats = { avg: 0, min: 0, max: 0, std: 0 };
  const sBpm = dailyStats?.bpm || defaultStats;
  const sEda = dailyStats?.gsr || defaultStats;
  const sTemp = dailyStats?.temp || defaultStats;
  const sImu = dailyStats?.imu || defaultStats;

  const dailySummaries = [
    { name: "Heart Rate (BPM)", unit: "BPM", current: currentData.hr.toFixed(1), avg: sBpm.avg.toFixed(1), min: sBpm.min.toFixed(0), max: sBpm.max.toFixed(1), std: sBpm.std.toFixed(1), icon: Heart, color: "text-rose-500", bg: "bg-rose-50", border: "border-rose-200", hex: "#f43f5e" },
    { name: "Electrodermal Activity (\xB5S)", unit: "\xB5S", current: currentData.eda.toFixed(2), avg: sEda.avg.toFixed(2), min: sEda.min.toFixed(2), max: sEda.max.toFixed(2), std: sEda.std.toFixed(2), icon: Activity, color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-200", hex: "#3b82f6" },
    { name: "Skin Temperature (\xB0C)", unit: "\xB0C", current: currentData.temp.toFixed(1), avg: sTemp.avg.toFixed(1), min: sTemp.min.toFixed(1), max: sTemp.max.toFixed(1), std: sTemp.std.toFixed(1), icon: Thermometer, color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-200", hex: "#f59e0b" },
    { name: "Movement Magnitude (g)", unit: "g", current: currentData.imu.toFixed(2), avg: sImu.avg.toFixed(2), min: sImu.min.toFixed(2), max: sImu.max.toFixed(2), std: sImu.std.toFixed(2), icon: Zap, color: "text-violet-500", bg: "bg-violet-50", border: "border-violet-200", hex: "#8b5cf6" }
  ];
  const statusProportionData = [
    { name: "Normal", value: 82, color: "#618C28" },
    { name: "Risk", value: 14, color: "#DFB143" },
    { name: "Meltdown", value: 4, color: "#D32027" }
  ];
  const isConnected = mqttStatus === "Connected" && deviceActive;
  const sensorReadiness = [
    { name: "Heart Rate", shortName: "HR", score: isConnected ? 100 : 0, color: "#ef4444", trackColor: "#fecdd3" },
    { name: "EDA (Stress)", shortName: "EDA", score: isConnected ? 100 : 0, color: "#3b82f6", trackColor: "#bfdbfe" },
    { name: "Skin Temp", shortName: "Temp", score: isConnected ? 100 : 0, color: "#f97316", trackColor: "#fed7aa" },
    { name: "Movement", shortName: "IMU", score: isConnected ? 100 : 0, color: "#8b5cf6", trackColor: "#ddd6fe" }
  ];
  const overallReadiness = sensorReadiness.length > 0 
    ? Math.round(sensorReadiness.reduce((sum, s) => sum + s.score, 0) / sensorReadiness.length) 
    : 0;
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
                  <span className={clsx("w-1.5 h-1.5 rounded-full", isConnected ? `animate-pulse ${currentStatus.dot}` : "bg-slate-400")} />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    {isConnected ? "Live" : "Offline"}
                  </span>
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
      "text-[44px] font-extrabold tracking-widest uppercase transition-all duration-500 text-center leading-none mt-2",
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
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">AI Model</span>
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

        {/* Right Column: Hardware Status */}
        <div className="w-full xl:w-[400px] flex-shrink-0 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col gap-6 relative overflow-hidden">
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
              <span className="font-bold text-emerald-600">100%</span>
            </div>

            {/* Wi-Fi / MQTT Status */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3 text-slate-600">
                <div className={clsx("p-2 rounded-lg", mqttStatus === "Connected" ? "bg-blue-50" : "bg-red-50")}>
                  <Wifi className={clsx("w-4 h-4", mqttStatus === "Connected" ? "text-blue-500" : "text-red-500")} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Device Status</span>
                  <span className="text-[10px] text-slate-400">
                    {mqttStatus === "Connected" ? (deviceActive ? "Online (Receiving Data)" : "System Connected, Shirt Offline") : "Offline"}
                  </span>
                </div>
              </div>
              <span className={clsx("font-bold", isConnected ? "text-blue-500" : "text-red-500")}>
                {isConnected ? "Active" : "Inactive"}
              </span>
            </div>

            {/* UI Latency */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3 text-slate-600">
                <div className="p-2 rounded-lg bg-indigo-50">
                  <Zap className="w-4 h-4 text-indigo-500" />
                </div>
                <span className="text-sm font-medium">UI Latency</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="font-bold text-indigo-500">{uiLatency}ms</span>
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
                <span className="font-bold text-purple-500">32 GB</span>
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
    className="text-base font-bold"
    style={{
      color: overallReadiness >= 95 ? "#059669" : overallReadiness >= 80 ? "#d97706" : "#dc2626"
    }}
  >
                  {overallReadiness}%
                </span>
              </div>

              {/* Overall bar */}
              <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden mb-3">
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
      {/* Daily Sensor Summary */}
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

              <div className="grid grid-cols-3 gap-y-5 gap-x-3 text-sm border-t border-slate-100 pt-5">
                <div>
                  <div className="text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-1">Average</div>
                  <div className="text-slate-700 font-medium text-base">{sensor.avg} <span className="text-xs text-slate-400">{sensor.unit}</span></div>
                </div>
                <div>
                  <div className="text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-1">Min</div>
                  <div className="text-slate-700 font-medium text-base">{sensor.min} <span className="text-xs text-slate-400">{sensor.unit}</span></div>
                </div>
                <div>
                  <div className="text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-1">Max</div>
                  <div className="text-slate-700 font-medium text-base">{sensor.max} <span className="text-xs text-slate-400">{sensor.unit}</span></div>
                </div>
              </div>
            </div>)}
        </div>
      </div>

      {/* ── Live & Historical Data (InfluxDB + MQTT) ── */}
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 px-1 mt-10">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-500" />
                <h2 className="text-lg font-bold text-slate-800">Live & Historical Data</h2>
              </div>
              {isConnected && (
                <div className="text-xs font-mono flex items-center gap-1.5 text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                  Live
                  <span className="inline-block w-1.5 h-1.5 rounded-full animate-pulse bg-emerald-500" />
                </div>
              )}
            </div>
            
            {/* Toggles for lines */}
            <div className="flex items-center flex-wrap gap-4 mt-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Show Lines:</span>
              <label className="flex items-center gap-1.5 cursor-pointer group">
                <input type="checkbox" checked={showLines.max} onChange={() => setShowLines(prev => ({...prev, max: !prev.max}))} className="rounded border-slate-300 text-red-500 focus:ring-red-500 w-4 h-4 cursor-pointer" />
                <span className="text-sm font-medium text-slate-600 group-hover:text-slate-800 transition-colors">Max</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer group">
                <input type="checkbox" checked={showLines.min} onChange={() => setShowLines(prev => ({...prev, min: !prev.min}))} className="rounded border-slate-300 text-blue-500 focus:ring-blue-500 w-4 h-4 cursor-pointer" />
                <span className="text-sm font-medium text-slate-600 group-hover:text-slate-800 transition-colors">Min</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer group">
                <input type="checkbox" checked={showLines.avg} onChange={() => setShowLines(prev => ({...prev, avg: !prev.avg}))} className="rounded border-slate-300 text-slate-500 focus:ring-slate-500 w-4 h-4 cursor-pointer" />
                <span className="text-sm font-medium text-slate-600 group-hover:text-slate-800 transition-colors">Avg</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer group">
                <input type="checkbox" checked={showLines.baseline} onChange={() => setShowLines(prev => ({...prev, baseline: !prev.baseline}))} className="rounded border-slate-300 text-emerald-500 focus:ring-emerald-500 w-4 h-4 cursor-pointer" />
                <span className="text-sm font-medium text-slate-600 group-hover:text-slate-800 transition-colors">Baseline</span>
              </label>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Dropdown 1: Time Range */}
            <select 
              className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2 outline-none cursor-pointer hover:border-indigo-300 transition-colors shadow-sm"
              onChange={(e) => setHistoryRange(e.target.value)}
              value={historyRange}
            >
              <option value="-1h">Last 1 Hour</option>
              <option value="-12h">Last 12 Hours</option>
              <option value="-24h">Last 24 Hours</option>
              <option value="-7d">Last 7 Days</option>
              <option value="-30d">Last 30 Days</option>
            </select>

            {/* Dropdown 2: Data Interval */}
            <select 
              className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2 outline-none cursor-pointer hover:border-indigo-300 transition-colors shadow-sm"
              onChange={(e) => setHistoryAggregate(e.target.value)}
              value={historyAggregate}
            >
              <option value="5s">Every 5 Seconds</option>
              <option value="1m">Every 1 Minute</option>
              <option value="10m">Every 10 Minutes</option>
              <option value="1h">Every 1 Hour</option>
              <option value="3h">Every 3 Hours</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Heart Rate History */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h3 className="text-slate-700 font-medium text-sm mb-4">Heart Rate (BPM)</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={combinedData}>
                  <defs>
                    <linearGradient id="colorHr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="time" minTickGap={50} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} formatter={(value) => [value.toFixed(1), 'Heart Rate (BPM)']} />
                  {/* Lines (Drawn First) */}
                  {showLines.baseline && baselineData.hr !== null && <ReferenceLine y={baselineData.hr} stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" />}
                  {showLines.max && hrStats.max !== null && <ReferenceLine y={hrStats.max} stroke="#f43f5e" strokeDasharray="3 3" opacity={0.6} />}
                  {showLines.avg && hrStats.avg !== null && <ReferenceLine y={hrStats.avg} stroke="#64748b" strokeDasharray="3 3" opacity={0.6} />}
                  {showLines.min && hrStats.min !== null && <ReferenceLine y={hrStats.min} stroke="#3b82f6" strokeDasharray="3 3" opacity={0.6} />}
                  
                  {/* Area Chart */}
                  <Area type="monotone" dataKey="bpm" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorHr)" />
                  
                  {/* Labels (Drawn Last to always be on top) */}
                  {showLines.baseline && baselineData.hr !== null && <ReferenceLine y={baselineData.hr} stroke="none" label={<CustomReferenceLabel value={`Baseline: ${baselineData.hr.toFixed(1)}`} fill="#10b981" position="Right" dx={-110} dy={0} />} />}
                  {showLines.max && hrStats.max !== null && <ReferenceLine y={hrStats.max} stroke="none" label={<CustomReferenceLabel value={`Max: ${hrStats.max.toFixed(1)}`} fill="#f43f5e" position="Left" dy={24} />} />}
                  {showLines.avg && hrStats.avg !== null && <ReferenceLine y={hrStats.avg} stroke="none" label={<CustomReferenceLabel value={`Avg: ${hrStats.avg.toFixed(1)}`} fill="#64748b" position="Right" dy={0} />} />}
                  {showLines.min && hrStats.min !== null && <ReferenceLine y={hrStats.min} stroke="none" label={<CustomReferenceLabel value={`Min: ${hrStats.min.toFixed(1)}`} fill="#3b82f6" position="Left" dy={0} />} />}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* EDA History */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h3 className="text-slate-700 font-medium text-sm mb-4">Electrodermal Activity (µS)</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={combinedData}>
                  <defs>
                    <linearGradient id="colorEda" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="time" minTickGap={50} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} formatter={(value) => [value.toFixed(1), 'Electrodermal Activity (µS)']} />
                  {/* Lines */}
                  {showLines.baseline && baselineData.eda !== null && <ReferenceLine y={baselineData.eda} stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" />}
                  {showLines.max && edaStats.max !== null && <ReferenceLine y={edaStats.max} stroke="#3b82f6" strokeDasharray="3 3" opacity={0.6} />}
                  {showLines.avg && edaStats.avg !== null && <ReferenceLine y={edaStats.avg} stroke="#64748b" strokeDasharray="3 3" opacity={0.6} />}
                  {showLines.min && edaStats.min !== null && <ReferenceLine y={edaStats.min} stroke="#10b981" strokeDasharray="3 3" opacity={0.6} />}
                  
                  {/* Area */}
                  <Area type="monotone" dataKey="gsr" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorEda)" />

                  {/* Labels */}
                  {showLines.baseline && baselineData.eda !== null && <ReferenceLine y={baselineData.eda} stroke="none" label={<CustomReferenceLabel value={`Baseline: ${baselineData.eda.toFixed(1)}`} fill="#10b981" position="Right" dx={-110} dy={0} />} />}
                  {showLines.max && edaStats.max !== null && <ReferenceLine y={edaStats.max} stroke="none" label={<CustomReferenceLabel value={`Max: ${edaStats.max.toFixed(1)}`} fill="#3b82f6" position="Left" dy={24} />} />}
                  {showLines.avg && edaStats.avg !== null && <ReferenceLine y={edaStats.avg} stroke="none" label={<CustomReferenceLabel value={`Avg: ${edaStats.avg.toFixed(1)}`} fill="#64748b" position="Right" dy={0} />} />}
                  {showLines.min && edaStats.min !== null && <ReferenceLine y={edaStats.min} stroke="none" label={<CustomReferenceLabel value={`Min: ${edaStats.min.toFixed(1)}`} fill="#10b981" position="Left" dy={0} />} />}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Skin Temp History */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h3 className="text-slate-700 font-medium text-sm mb-4">Skin Temperature (°C)</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={combinedData}>
                  <defs>
                    <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="time" minTickGap={50} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} formatter={(value) => [value.toFixed(1), 'Skin Temperature (°C)']} />
                  {/* Lines */}
                  {showLines.baseline && baselineData.temp !== null && <ReferenceLine y={baselineData.temp} stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" />}
                  {showLines.max && tempStats.max !== null && <ReferenceLine y={tempStats.max} stroke="#f59e0b" strokeDasharray="3 3" opacity={0.6} />}
                  {showLines.avg && tempStats.avg !== null && <ReferenceLine y={tempStats.avg} stroke="#64748b" strokeDasharray="3 3" opacity={0.6} />}
                  {showLines.min && tempStats.min !== null && <ReferenceLine y={tempStats.min} stroke="#8b5cf6" strokeDasharray="3 3" opacity={0.6} />}
                  
                  {/* Area */}
                  <Area type="monotone" dataKey="temp" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorTemp)" />

                  {/* Labels */}
                  {showLines.baseline && baselineData.temp !== null && <ReferenceLine y={baselineData.temp} stroke="none" label={<CustomReferenceLabel value={`Baseline: ${baselineData.temp.toFixed(1)}`} fill="#10b981" position="Right" dx={-110} dy={0} />} />}
                  {showLines.max && tempStats.max !== null && <ReferenceLine y={tempStats.max} stroke="none" label={<CustomReferenceLabel value={`Max: ${tempStats.max.toFixed(1)}`} fill="#f59e0b" position="Left" dy={24} />} />}
                  {showLines.avg && tempStats.avg !== null && <ReferenceLine y={tempStats.avg} stroke="none" label={<CustomReferenceLabel value={`Avg: ${tempStats.avg.toFixed(1)}`} fill="#64748b" position="Right" dy={0} />} />}
                  {showLines.min && tempStats.min !== null && <ReferenceLine y={tempStats.min} stroke="none" label={<CustomReferenceLabel value={`Min: ${tempStats.min.toFixed(1)}`} fill="#8b5cf6" position="Left" dy={0} />} />}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* IMU History */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h3 className="text-slate-700 font-medium text-sm mb-4">Movement Magnitude (g)</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={combinedData}>
                  <defs>
                    <linearGradient id="colorImu" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="time" minTickGap={50} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} formatter={(value) => [value.toFixed(2), 'Movement Magnitude (g)']} />
                  {/* Lines */}
                  {showLines.baseline && baselineData.imu !== null && <ReferenceLine y={baselineData.imu} stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" />}
                  {showLines.max && imuStats.max !== null && <ReferenceLine y={imuStats.max} stroke="#8b5cf6" strokeDasharray="3 3" opacity={0.6} />}
                  {showLines.avg && imuStats.avg !== null && <ReferenceLine y={imuStats.avg} stroke="#64748b" strokeDasharray="3 3" opacity={0.6} />}
                  {showLines.min && imuStats.min !== null && <ReferenceLine y={imuStats.min} stroke="#f43f5e" strokeDasharray="3 3" opacity={0.6} />}
                  
                  {/* Area */}
                  <Area type="monotone" dataKey="imu" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorImu)" />

                  {/* Labels */}
                  {showLines.baseline && baselineData.imu !== null && <ReferenceLine y={baselineData.imu} stroke="none" label={<CustomReferenceLabel value={`Baseline: ${baselineData.imu.toFixed(2)}`} fill="#10b981" position="Right" dx={-110} dy={0} />} />}
                  {showLines.max && imuStats.max !== null && <ReferenceLine y={imuStats.max} stroke="none" label={<CustomReferenceLabel value={`Max: ${imuStats.max.toFixed(2)}`} fill="#8b5cf6" position="Left" dy={24} />} />}
                  {showLines.avg && imuStats.avg !== null && <ReferenceLine y={imuStats.avg} stroke="none" label={<CustomReferenceLabel value={`Avg: ${imuStats.avg.toFixed(2)}`} fill="#64748b" position="Right" dy={0} />} />}
                  {showLines.min && imuStats.min !== null && <ReferenceLine y={imuStats.min} stroke="none" label={<CustomReferenceLabel value={`Min: ${imuStats.min.toFixed(2)}`} fill="#f43f5e" position="Left" dy={0} />} />}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
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
