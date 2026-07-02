import { useNavigate } from "react-router";
import { useState } from "react";
import {
  Printer,
  ArrowLeft,
  Heart,
  Droplets,
  Thermometer,
  Move,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Brain,
  Images,
  Loader2,
  X,
  Download,
  ExternalLink,
  ZoomIn,
  ZoomOut
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  BarChart,
  Bar,
  Cell
} from "recharts";
import logoImg from "../../imports/\u0E2A\u0E33\u0E40\u0E19\u0E32\u0E02\u0E2D\u0E07_The_Invisible_Hug_Pitch_deck-3.png";
const patient = {
  name: "Somchai Jaidee",
  dob: "12 Jun 2017",
  age: "8 years",
  weight: "28 kg",
  height: "128 cm",
  condition: "Autism Spectrum Disorder (Level 2)",
  reportDate: "8 May 2026",
  periodStart: "1 May 2026",
  periodEnd: "8 May 2026",
  deviceId: "TIH-VEST-0042",
  // The Invisible Hug
  caregiver: "Parent / Guardian"
};
const baselineItems = [
  {
    label: "Heart Rate",
    sublabel: "Body Stress",
    unit: "BPM",
    avgVal: "86",
    baselineVal: "82",
    maxVal: "115",
    minVal: "65",
    desc: "Average heart rate measured during verified calm / resting periods",
    color: "#e11d48",
    bg: "#fff1f2",
    icon: Heart
  },
  {
    label: "Sweat Level",
    sublabel: "Body Stress",
    unit: "\xB5S",
    avgVal: "5.4",
    baselineVal: "4.8",
    maxVal: "9.2",
    minVal: "3.1",
    desc: "Electrodermal activity (skin conductance) recorded in calm state",
    color: "#2563eb",
    bg: "#eff6ff",
    icon: Droplets
  },
  {
    label: "Skin Temperature",
    sublabel: "Body Reaction",
    unit: "\xB0C",
    avgVal: "36.8",
    baselineVal: "36.6",
    maxVal: "37.4",
    minVal: "36.0",
    desc: "Surface skin temperature at the vest sensor location while at rest",
    color: "#d97706",
    bg: "#fffbeb",
    icon: Thermometer
  },
  {
    label: "Movement",
    sublabel: "Motion",
    unit: "m/s\xB2",
    avgVal: "12.3",
    baselineVal: "10.8",
    maxVal: "24.5",
    minVal: "9.2",
    desc: "Acceleration magnitude while seated / at rest (resting gravity baseline)",
    color: "#7c3aed",
    bg: "#f5f3ff",
    icon: Move
  }
];
const heatmapDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const heatmapSlots = [
  "00\u201302",
  "02\u201304",
  "04\u201306",
  "06\u201308",
  "08\u201310",
  "10\u201312",
  "12\u201314",
  "14\u201316",
  "16\u201318",
  "18\u201320",
  "20\u201322",
  "22\u201324"
];
const rawHeatmap = {
  Mon: { "00\u201302": 0, "02\u201304": 0, "04\u201306": 0, "06\u201308": 1, "08\u201310": 2, "10\u201312": 5, "12\u201314": 3, "14\u201316": 2, "16\u201318": 1, "18\u201320": 0, "20\u201322": 0, "22\u201324": 0 },
  Tue: { "00\u201302": 0, "02\u201304": 0, "04\u201306": 0, "06\u201308": 0, "08\u201310": 1, "10\u201312": 2, "12\u201314": 4, "14\u201316": 1, "16\u201318": 0, "18\u201320": 0, "20\u201322": 0, "22\u201324": 0 },
  Wed: { "00\u201302": 0, "02\u201304": 0, "04\u201306": 0, "06\u201308": 1, "08\u201310": 2, "10\u201312": 4, "12\u201314": 2, "14\u201316": 3, "16\u201318": 1, "18\u201320": 0, "20\u201322": 0, "22\u201324": 0 },
  Thu: { "00\u201302": 0, "02\u201304": 0, "04\u201306": 0, "06\u201308": 0, "08\u201310": 1, "10\u201312": 3, "12\u201314": 5, "14\u201316": 2, "16\u201318": 0, "18\u201320": 0, "20\u201322": 0, "22\u201324": 0 },
  Fri: { "00\u201302": 0, "02\u201304": 0, "04\u201306": 0, "06\u201308": 0, "08\u201310": 0, "10\u201312": 1, "12\u201314": 2, "14\u201316": 1, "16\u201318": 0, "18\u201320": 0, "20\u201322": 0, "22\u201324": 0 },
  Sat: { "00\u201302": 0, "02\u201304": 0, "04\u201306": 0, "06\u201308": 0, "08\u201310": 0, "10\u201312": 0, "12\u201314": 1, "14\u201316": 0, "16\u201318": 1, "18\u201320": 0, "20\u201322": 0, "22\u201324": 0 },
  Sun: { "00\u201302": 0, "02\u201304": 0, "04\u201306": 0, "06\u201308": 0, "08\u201310": 0, "10\u201312": 0, "12\u201314": 0, "14\u201316": 1, "16\u201318": 0, "18\u201320": 0, "20\u201322": 0, "22\u201324": 0 }
};
function heatColor(v) {
  if (v === 0) return "#f1f5f9";
  if (v === 1) return "#fef08a";
  if (v === 2) return "#fdba74";
  if (v === 3) return "#fb923c";
  if (v === 4) return "#f87171";
  return "#dc2626";
}
function heatText(v) {
  if (v === 0) return "#cbd5e1";
  if (v <= 2) return "#78350f";
  return "#ffffff";
}
const triggerData = [
  { name: "AI Automated", value: 72, color: "#2563eb" },
  { name: "Manual (Caregiver)", value: 28, color: "#d97706" }
];
const criticalEvents = [
  {
    rank: 1,
    date: "6 May 2026",
    time: "10:18",
    peakHr: 120,
    peakEda: 9.2,
    duration: "15 min",
    context: "Classroom \u2014 sudden noise spike",
    outcome: "Manual Response by Caregiver",
    oc: "#c2410c"
  },
  {
    rank: 2,
    date: "3 May 2026",
    time: "11:52",
    peakHr: 115,
    peakEda: 8.6,
    duration: "12 min",
    context: "Lunchroom \u2014 crowded environment",
    outcome: "AI-Triggered \u2014 Fast Recovery",
    oc: "#059669"
  },
  {
    rank: 3,
    date: "2 May 2026",
    time: "09:05",
    peakHr: 108,
    peakEda: 7.8,
    duration: "8 min",
    context: "Hallway \u2014 class transition",
    outcome: "AI-Triggered \u2014 Normal Recovery",
    oc: "#2563eb"
  }
];
function makeHR(peak) {
  return Array.from({ length: 21 }, (_, i) => {
    const t = i - 10;
    const hr = t < 0 ? 84 + (t + 10) * ((peak - 84) / 10) + Math.random() * 3 : peak - t * ((peak - 84) / 10) + Math.random() * 3;
    return { t: t === 0 ? "0m" : `${t > 0 ? "+" : ""}${t}m`, hr: Math.round(Math.max(75, hr)) };
  });
}
function makeEDA(peak) {
  return Array.from({ length: 21 }, (_, i) => {
    const t = i - 10;
    const eda = t < 0 ? 4.2 + (t + 10) * ((peak - 4.2) / 10) + Math.random() * 0.2 : peak - t * ((peak - 4.2) / 10) + Math.random() * 0.2;
    return { t: t === 0 ? "0m" : `${t > 0 ? "+" : ""}${t}m`, eda: parseFloat(Math.max(3.5, eda).toFixed(1)) };
  });
}
function makeIMU() {
  return Array.from({ length: 21 }, (_, i) => {
    const t = i - 10;
    const imu = t < 0 ? 11 + Math.abs(t) * 1.2 + Math.random() * 1 : 24 - t * 1.1 + Math.random() * 1;
    return { t: t === 0 ? "0m" : `${t > 0 ? "+" : ""}${t}m`, imu: parseFloat(Math.max(9, imu).toFixed(1)) };
  });
}
function makeTemp(peak) {
  return Array.from({ length: 21 }, (_, i) => {
    const t = i - 10;
    const temp = t < 0 ? 36.5 + (t + 10) * ((peak - 36.5) / 10) + Math.random() * 0.05 : peak - t * ((peak - 36.5) / 10) + Math.random() * 0.05;
    return { t: t === 0 ? "0m" : `${t > 0 ? "+" : ""}${t}m`, temp: parseFloat(Math.max(36.2, temp).toFixed(1)) };
  });
}
function PageHeader({ page, total }) {
  return <div className="flex items-center justify-between border-b border-slate-300 pb-2 mb-5">
      <div className="flex items-center gap-2">
        <img
    src={logoImg}
    alt="The Invisible Hug"
    style={{ width: "28px", height: "28px", objectFit: "contain" }}
  />
        <span className="font-black tracking-wider text-slate-800" style={{ fontSize: "13px" }}>
          THE INVISIBLE HUG
        </span>
        <span className="text-slate-400 mx-2">|</span>
        <span className="text-slate-600 font-semibold" style={{ fontSize: "11px" }}>
          Analysis Report — {patient.deviceId}
        </span>
      </div>
      <span className="text-slate-500 font-medium" style={{ fontSize: "10px" }}>
        Page {page} of {total} &nbsp;·&nbsp; {patient.reportDate}
      </span>
    </div>;
}
function SectionLabel({ n, title, subtitle }) {
  return <div className="flex items-start gap-3 mb-4">
      <span
    className="w-7 h-7 rounded-full flex items-center justify-center text-white font-black flex-shrink-0 mt-0.5"
    style={{ fontSize: "12px", background: "linear-gradient(135deg,#1e40af,#3b82f6)" }}
  >
        {n}
      </span>
      <div>
        <h2 className="text-slate-900 font-extrabold tracking-tight" style={{ fontSize: "15px" }}>{title}</h2>
        {subtitle && <p className="text-slate-600 mt-0.5" style={{ fontSize: "11px" }}>{subtitle}</p>}
      </div>
    </div>;
}
function Rule() {
  return <hr className="border-slate-200 my-5" />;
}
function PageFooter() {
  return <div
    className="absolute bottom-0 left-0 right-0 mx-8 pb-4 pt-2 border-t border-slate-200 flex items-center justify-between"
    style={{ fontSize: "9px" }}
  >
      <span className="text-slate-500 font-semibold">
        THE INVISIBLE HUG Project &nbsp;·&nbsp; Device: {patient.deviceId}
      </span>
      <span className="text-slate-500">Personal Health Record — For caregiver / parent use</span>
    </div>;
}
const A4_STYLE = {
  width: "210mm",
  minHeight: "297mm",
  padding: "16mm 20mm 20mm 20mm",
  background: "#ffffff",
  boxSizing: "border-box",
  position: "relative"
};
export function ClinicalReport() {
  const navigate = useNavigate();
  const TOTAL = 6;
  const pageStyle = A4_STYLE;
  const idle = { loading: false, progress: 0, total: 0 };
  const [pdfState, setPdfState] = useState(idle);
  const [pngState, setPngState] = useState(idle);
  const [gallery, setGallery] = useState([]);
  const [zoom, setZoom] = useState(100);
  const busy = pdfState.loading || pngState.loading;
  const capturePages = async (onProgress) => {
    const { toCanvas } = await import("html-to-image");
    const pages = Array.from(document.querySelectorAll(".a4-page"));
    const canvases = [];
    for (let i = 0; i < pages.length; i++) {
      onProgress(i + 1, pages.length);
      const canvas = await toCanvas(pages[i], {
        backgroundColor: "#ffffff",
        pixelRatio: 2
      });
      canvases.push(canvas);
    }
    return canvases;
  };
  const exportPDF = async () => {
    setPdfState({ loading: true, progress: 0, total: 0 });
    try {
      const canvases = await capturePages(
        (p, t) => setPdfState({ loading: true, progress: p, total: t })
      );
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      canvases.forEach((canvas, i) => {
        const imgData = canvas.toDataURL("image/jpeg", 0.94);
        const w = 210;
        const h = canvas.height / canvas.width * w;
        if (i > 0) pdf.addPage([w, h]);
        pdf.addImage(imgData, "JPEG", 0, 0, w, h);
      });
      const blob = pdf.output("blob");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = "The_Invisible_Hug_Report.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF Generation Error:", error);
      alert("Failed to generate PDF: " + (error.message || "Unknown error"));
    } finally {
      setPdfState(idle);
    }
  };
  const exportPNG = async () => {
    setPngState({ loading: true, progress: 0, total: 0 });
    try {
      const canvases = await capturePages(
        (p, t) => setPngState({ loading: true, progress: p, total: t })
      );
      const dataUrls = canvases.map((c) => c.toDataURL("image/png"));
      setGallery(dataUrls);
    } finally {
      setPngState(idle);
    }
  };
  return <>
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 0; }
          body { margin: 0; padding: 0; background: white; }
          .no-print { display: none !important; }
          .a4-page {
            box-shadow: none !important;
            margin: 0 !important;
            border-radius: 0 !important;
            page-break-after: always;
            break-after: page;
          }
          .a4-page:last-child { page-break-after: auto; break-after: auto; }
        }
      `}</style>

      {
    /* ══════════════════════════════════════════
        PNG GALLERY MODAL
    ══════════════════════════════════════════ */
  }
      {gallery.length > 0 && <div className="fixed inset-0 z-[200] flex flex-col bg-black/90 overflow-auto">
          {
    /* header */
  }
          <div className="sticky top-0 z-10 bg-slate-900 border-b border-slate-700 px-6 py-3 flex items-center justify-between flex-shrink-0">
            <div>
              <p className="text-white font-bold text-sm">Report Pages — PNG Export</p>
              <p className="text-slate-400 text-xs mt-0.5">
                กด <kbd className="bg-slate-700 text-white rounded px-1.5 py-0.5 text-xs font-mono">Save</kbd> ใต้แต่ละหน้า
                หรือ <strong className="text-slate-300">long-press / right-click → Save image</strong> บนรูปได้เลยครับ
              </p>
            </div>
            <button
    onClick={() => setGallery([])}
    className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
  >
              <X className="w-4 h-4" /> Close
            </button>
          </div>

          {
    /* grid of pages */
  }
          <div className="flex-1 px-6 py-6">
            <div className="grid grid-cols-2 gap-6 max-w-5xl mx-auto">
              {gallery.map((url, i) => <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col">
                  <img src={url} alt={`Page ${i + 1}`} className="w-full block" />
                  <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-t border-slate-200">
                    <span className="text-slate-700 font-bold text-sm">Page {i + 1} of {gallery.length}</span>
                    <a
    href={url}
    download={`InvisibleHug_Report_Page${String(i + 1).padStart(2, "0")}.png`}
    className="flex items-center gap-2 bg-violet-700 hover:bg-violet-800 text-white rounded-lg px-3 py-1.5 text-xs font-bold transition-colors"
  >
                      <Download className="w-3.5 h-3.5" />
                      Save PNG
                    </a>
                  </div>
                </div>)}
            </div>
          </div>
        </div>}

      {
    /* ── Toolbar ── */
  }
      <div className="no-print sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-screen-xl mx-auto px-6 py-3 flex items-center justify-between">
          <button
    onClick={() => navigate("/analytics")}
    className="flex items-center gap-2 text-slate-700 hover:text-slate-900 text-sm font-semibold transition-colors"
  >
            <ArrowLeft className="w-4 h-4" />
            Back to Analytics
          </button>

          <div className="flex items-center gap-3">
            {busy && <div className="flex items-center gap-2 text-slate-500 text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                <span>
                  {pdfState.loading ? `Building PDF \u2014 page ${pdfState.progress} / ${pdfState.total}` : `Rendering page ${pngState.progress} / ${pngState.total}`}
                </span>
              </div>}

            <button
    onClick={() => window.print()}
    disabled={busy}
    className="flex items-center gap-2 border border-slate-300 hover:border-slate-400 text-slate-700 px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-40"
  >
              <Printer className="w-4 h-4" /> Print
            </button>

            {
    /* ── Zoom controls ── */
  }
            <div className="flex items-center gap-0.5 border border-slate-200 rounded-xl bg-slate-50 px-1 py-1">
              <button
    onClick={() => setZoom((z) => Math.max(40, z - 10))}
    disabled={zoom <= 40}
    className="p-1.5 rounded-lg hover:bg-slate-200 disabled:opacity-30 transition-colors text-slate-700"
    title="Zoom out"
  >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
    onClick={() => setZoom(100)}
    className="px-2 py-1 rounded-lg hover:bg-slate-200 transition-colors text-slate-700 font-bold tabular-nums"
    style={{ fontSize: "12px", minWidth: "44px", textAlign: "center" }}
    title="Reset to 100%"
  >
                {zoom}%
              </button>
              <button
    onClick={() => setZoom((z) => Math.min(200, z + 10))}
    disabled={zoom >= 200}
    className="p-1.5 rounded-lg hover:bg-slate-200 disabled:opacity-30 transition-colors text-slate-700"
    title="Zoom in"
  >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {
              /* Export PDF → opens in new tab */
            }
            <button
              onClick={exportPDF}
              disabled={busy}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow"
            >
              {pdfState.loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {pdfState.loading ? `${pdfState.progress}/${pdfState.total}` : "Download PDF"}
            </button>
          </div>
        </div>
      </div>

      {
    /* ── Pages ── */
  }
      <div className="bg-slate-300 min-h-screen py-8 print:bg-white print:py-0 overflow-auto">
        <div
    style={{ zoom: `${zoom}%` }}
    className="flex flex-col items-center gap-6 print:gap-0"
  >
          {
    /* ══════════════════════════════════════════════
        PAGE 1 — Profile & Baseline
    ══════════════════════════════════════════════ */
  }
          <div className="a4-page shadow-2xl overflow-hidden" style={pageStyle}>
            <PageHeader page={1} total={TOTAL} />

            {
    /* Banner */
  }
            <div
    className="rounded-2xl px-7 py-5 mb-6 flex items-center justify-between"
    style={{ background: "linear-gradient(135deg,#0f172a 0%,#1e3a5f 65%,#164e63 100%)" }}
  >
              <div className="flex items-center gap-5">
                <img
    src={logoImg}
    alt="The Invisible Hug"
    style={{
      width: "56px",
      height: "56px",
      objectFit: "contain",
      filter: "drop-shadow(0 4px 16px rgba(64,187,166,0.4))"
    }}
  />
                <div>
                  <h1 className="text-white font-extrabold tracking-tight" style={{ fontSize: "22px", lineHeight: 1.1 }}>
                    Analysis Report
                  </h1>
                  <p className="text-slate-400 mt-1" style={{ fontSize: "11px" }}>
                    Physiological Monitoring · Sensory Regulation<br />· Intervention Tracking
                  </p>
                </div>
              </div>
              <div className="text-right" style={{ fontSize: "10px" }}>
                <table style={{ borderSpacing: "0 2px", borderCollapse: "separate" }}>
                  <tbody>
                    {[
    ["Report Date", patient.reportDate],
    ["Data Period", "1\u20138 May 2026"],
    ["Device ID", patient.deviceId],
    ["Issued by", "THE INVISIBLE HUG Project"]
  ].map(([k, v]) => <tr key={k}>
                        <td
    className="text-slate-400 whitespace-nowrap pr-2 text-right"
    style={{ verticalAlign: "middle" }}
  >
                          {k}:
                        </td>
                        <td
    className="font-semibold whitespace-nowrap text-left"
    style={{ color: k === "Device ID" ? "#5eead4" : "#ffffff", verticalAlign: "middle" }}
  >
                          {v}
                        </td>
                      </tr>)}
                  </tbody>
                </table>
              </div>
            </div>

            {
    /* ── SECTION 1 ── */
  }
            <SectionLabel
    n="1"
    title="Child Profile & Summary"
    subtitle="Basic information and key performance indicators recorded during this reporting period."
  />
            <div className="grid grid-cols-5 gap-4 mb-5">
              {
    /* Info table */
  }
              <div className="col-span-3 border border-slate-200 rounded-xl overflow-hidden flex flex-col">
                <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex-shrink-0">
                  <p className="text-slate-700 font-bold uppercase tracking-widest" style={{ fontSize: "10px" }}>Child Information</p>
                </div>
                <table className="w-full h-full" style={{ fontSize: "12px" }}>
                  <tbody className="h-full">
                    {[
    ["Full Name", patient.name],
    ["Date of Birth", patient.dob],
    ["Age / Gender", `${patient.age} / Male`],
    ["Weight / Height", `${patient.weight} / ${patient.height}`],
    ["Condition", patient.condition],
    ["Guardian Name", "Ms. Malee Jaidee"],
    ["Issued by", "THE INVISIBLE HUG Project"]
  ].map(([k, v], i) => <tr key={k} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"} style={{ height: `${100 / 7}%` }}>
                        <td className="px-4 py-2 text-slate-600 font-semibold border-r border-slate-100 align-middle" style={{ width: "150px" }}>{k}</td>
                        <td className="px-4 py-2 text-slate-900 font-medium align-middle">{v}</td>
                      </tr>)}
                  </tbody>
                </table>
              </div>

              {
    /* KPIs */
  }
              <div className="col-span-2 flex flex-col gap-3">
                {[
    {
      icon: Clock,
      label: "Compliance Rate",
      value: "78%",
      sub: "Average 9.4 hrs/day of device wear",
      color: "#059669",
      bg: "#ecfdf5",
      border: "#a7f3d0"
    },
    {
      icon: CheckCircle2,
      label: "Hug Success Rate",
      value: "85%",
      sub: "Stress events prevented from becoming full meltdowns",
      color: "#1d4ed8",
      bg: "#eff6ff",
      border: "#bfdbfe"
    },
    {
      icon: ShieldAlert,
      label: "Total Meltdown Events",
      value: "5",
      sub: "Full meltdowns recorded this period",
      color: "#dc2626",
      bg: "#fff5f5",
      border: "#fecaca"
    }
  ].map((c) => <div
    key={c.label}
    className="rounded-xl p-3.5 border flex-1 flex flex-col"
    style={{ background: c.bg, borderColor: c.border }}
  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <c.icon className="w-4 h-4 flex-shrink-0" style={{ color: c.color }} />
                      <span className="font-bold text-slate-700 uppercase tracking-wide" style={{ fontSize: "9px" }}>{c.label}</span>
                    </div>
                    <p className="font-extrabold" style={{ fontSize: "26px", color: c.color, lineHeight: 1 }}>{c.value}</p>
                    <p className="text-slate-600 mt-1 leading-snug flex-1" style={{ fontSize: "10px" }}>{c.sub}</p>
                  </div>)}
              </div>
            </div>

            <Rule />

            {
    /* ── SECTION 2 ── */
  }
            <SectionLabel
    n="2"
    title="Physiological Baseline — Personal Reference Values"
    subtitle="Sensor readings obtained during verified calm / resting states. These personal baselines are used to detect stress-related changes."
  />
            <div className="grid grid-cols-4 gap-3 items-stretch">
              {baselineItems.map((b) => <div
    key={b.label}
    className="rounded-xl border p-4 flex flex-col"
    style={{ background: b.bg, borderColor: `${b.color}30`, borderTopWidth: "3px", borderTopColor: b.color }}
  >

                  {
    /* ① Header */
  }
                  <div className="flex items-center gap-2 mb-3" style={{ minHeight: "36px" }}>
                    <div className="p-1.5 rounded-lg flex-shrink-0" style={{ background: `${b.color}18` }}>
                      <b.icon className="w-4 h-4" style={{ color: b.color }} />
                    </div>
                    <div>
                      <p className="text-slate-800 font-extrabold leading-none" style={{ fontSize: "11px" }}>{b.label}</p>
                      <p className="font-bold uppercase tracking-widest mt-0.5" style={{ fontSize: "7.5px", color: b.color }}>{b.sublabel}</p>
                    </div>
                  </div>

                  {
    /* ② Period Average — big number */
  }
                  <div className="rounded-xl px-3 py-2 mb-2.5" style={{ background: `${b.color}10` }}>
                    <p className="font-black uppercase tracking-widest mb-1" style={{ fontSize: "7px", color: b.color, opacity: 0.7 }}>Period Avg</p>
                    <div className="flex items-end gap-1">
                      <span className="font-black" style={{ fontSize: "30px", color: b.color, lineHeight: 1 }}>{b.avgVal}</span>
                      <span className="font-bold mb-0.5" style={{ fontSize: "11px", color: b.color, opacity: 0.8 }}>{b.unit}</span>
                    </div>
                  </div>

                  {
    /* ③ Baseline / Max / Min rows */
  }
                  <div className="space-y-1 mb-2">
                    {[
    ["Baseline", b.baselineVal, b.color, `${b.color}15`],
    ["Max", b.maxVal, "#dc2626", "#fff1f1"],
    ["Min", b.minVal, "#0891b2", "#f0f9ff"]
  ].map(([lbl, val, col, bg]) => <div
    key={lbl}
    className="flex items-center justify-between rounded-lg px-2.5 py-1.5"
    style={{ background: bg }}
  >
                        <span className="font-black uppercase tracking-widest" style={{ fontSize: "7px", color: col }}>{lbl}</span>
                        <div className="flex items-end gap-0.5">
                          <span className="font-extrabold" style={{ fontSize: "14px", color: col, lineHeight: 1 }}>{val}</span>
                          <span className="font-bold mb-px" style={{ fontSize: "7.5px", color: col, opacity: 0.85 }}>{b.unit}</span>
                        </div>
                      </div>)}
                  </div>

                  {
    /* ④ Description — pushed to bottom with mt-auto */
  }
                  <div className="mt-auto pt-2" style={{ borderTop: `1px solid ${b.color}25` }}>
                    <p className="text-slate-500 leading-snug" style={{ fontSize: "9.5px" }}>{b.desc}</p>
                  </div>
                </div>)}
            </div>

            <PageFooter />
          </div>

          {
    /* ══════════════════════════════════════════════
        PAGE 2 — Trigger Analysis & Therapy
    ══════════════════════════════════════════════ */
  }
          <div className="a4-page shadow-2xl overflow-hidden" style={pageStyle}>
            <PageHeader page={2} total={TOTAL} />

            {
    /* ── SECTION 3 ── */
  }
            <SectionLabel
    n="3"
    title="Trigger & Pattern Analysis"
    subtitle="Stress event frequency by day and 2-hour time block. Darker cells = more frequent incidents. Helps identify recurring environmental triggers."
  />

            {
    /* Full 24-hour Heatmap */
  }
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 mb-4">
              <p className="text-slate-800 font-bold uppercase tracking-widest mb-3" style={{ fontSize: "10px" }}>
                Stress Incident Heatmap — Full 24-Hour Coverage (Rumbling / Meltdown Events)
              </p>

              {
    /* Column header row */
  }
              <div className="flex items-center mb-1">
                <div
    className="text-slate-600 font-bold flex-shrink-0 text-right pr-2"
    style={{ width: "38px", fontSize: "9px" }}
  >
                  Day
                </div>
                {heatmapSlots.map((s) => <div
    key={s}
    className="flex-1 text-center font-bold text-slate-700"
    style={{ fontSize: "8px" }}
  >
                    {s}
                  </div>)}
              </div>

              {
    /* Rows */
  }
              {heatmapDays.map((day) => <div key={day} className="flex items-center mb-1">
                  <div
    className="flex-shrink-0 text-right pr-2 font-extrabold text-slate-700"
    style={{ width: "38px", fontSize: "11px" }}
  >
                    {day}
                  </div>
                  {heatmapSlots.map((s) => {
    const v = rawHeatmap[day][s] ?? 0;
    return <div key={s} className="flex-1 mx-px">
                        <div
      className="rounded flex items-center justify-center font-bold"
      style={{
        background: heatColor(v),
        color: heatText(v),
        fontSize: "9px",
        height: "22px",
        border: "1px solid #e2e8f0"
      }}
      title={`${day} ${s}: ${v} event${v !== 1 ? "s" : ""}`}
    >
                          {v > 0 ? v : "\xB7"}
                        </div>
                      </div>;
  })}
                </div>)}

              {
    /* Legend */
  }
              <div className="flex items-center gap-2 mt-3 justify-end">
                <span className="text-slate-600 font-semibold" style={{ fontSize: "9px" }}>Events per block:</span>
                {[
    { c: "#f1f5f9", l: "0" },
    { c: "#fef08a", l: "1" },
    { c: "#fdba74", l: "2" },
    { c: "#fb923c", l: "3" },
    { c: "#f87171", l: "4" },
    { c: "#dc2626", l: "5+" }
  ].map(({ c, l }) => <div key={l} className="flex items-center gap-1">
                    <div className="w-4 h-3 rounded-sm" style={{ background: c, border: "1px solid #cbd5e1" }} />
                    <span className="text-slate-600 font-medium" style={{ fontSize: "9px" }}>{l}</span>
                  </div>)}
              </div>
            </div>

            {
    /* Duration stats */
  }
            <div className="grid grid-cols-4 gap-3 mb-5 items-stretch">
              {[
    { label: "Avg. Rumbling Duration", value: "8.2", unit: "min", sub: "per event", color: "#b45309", bg: "#fffbeb", border: "#fde68a" },
    { label: "Avg. Meltdown Duration", value: "12.4", unit: "min", sub: "per event", color: "#dc2626", bg: "#fff5f5", border: "#fecaca" },
    { label: "Peak Incident Day", value: "Mon", unit: "day", sub: "most events", color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" },
    { label: "Peak Incident Window", value: "10\u201312", unit: ":00 hrs", sub: "time block", color: "#0891b2", bg: "#ecfeff", border: "#a5f3fc" }
  ].map((s) => <div
    key={s.label}
    className="rounded-xl border flex flex-col overflow-hidden"
    style={{ background: s.bg, borderColor: s.border }}
  >
                  {
    /* Colored top accent bar */
  }
                  <div className="h-1 w-full" style={{ background: s.color }} />
                  <div className="flex flex-col flex-1 p-3.5">
                    {
    /* Label — fixed min-height */
  }
                    <p
    className="font-black uppercase tracking-widest leading-tight text-slate-600"
    style={{ fontSize: "8px", minHeight: "26px" }}
  >{s.label}</p>
                    {
    /* Value — mt-auto pushes to bottom */
  }
                    <div className="mt-auto">
                      <div className="flex items-end gap-1">
                        <span className="font-black" style={{ fontSize: "22px", color: s.color, lineHeight: 1 }}>{s.value}</span>
                        <div className="mb-0.5">
                          <span className="font-bold block" style={{ fontSize: "10px", color: s.color }}>{s.unit}</span>
                          <span className="font-medium block" style={{ fontSize: "8px", color: s.color, opacity: 0.6 }}>{s.sub}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>)}
            </div>

            <Rule />

            {
    /* ── SECTION 4 ── */
  }
            <SectionLabel
    n="4"
    title="Intervention Effectiveness — Vibration & Calming Response"
    subtitle="How well the vest's calming system worked, and how often it was triggered automatically vs. manually by the caregiver."
  />
            <div className="grid grid-cols-2 gap-5">
              {
    /* Metrics */
  }
              <div className="grid grid-cols-2 gap-3">
                {[
    { icon: Brain, label: "Total Interventions", value: "42", unit: "times", color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe" },
    { icon: Clock, label: "Avg. Recovery Time", value: "4.5", unit: "min", color: "#059669", bg: "#ecfdf5", border: "#a7f3d0" },
    { icon: Brain, label: "AI Auto-Triggered", value: "72%", unit: "", color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe" },
    { icon: ShieldAlert, label: "Manually by Caregiver", value: "28%", unit: "", color: "#b45309", bg: "#fffbeb", border: "#fde68a" }
  ].map((m) => <div
    key={m.label}
    className="rounded-xl border p-3.5 flex flex-col"
    style={{ background: m.bg, borderColor: m.border }}
  >
                    {
    /* Label zone — fixed min-height so values align across all 4 cards */
  }
                    <div className="flex items-start gap-1.5" style={{ minHeight: "34px" }}>
                      <m.icon className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: m.color }} />
                      <p
    className="font-bold uppercase tracking-wide leading-tight text-slate-700"
    style={{ fontSize: "9px" }}
  >{m.label}</p>
                    </div>
                    {
    /* Value — mt-auto keeps it bottom-aligned */
  }
                    <div className="mt-auto flex items-end gap-1 pt-1">
                      <span className="font-extrabold" style={{ fontSize: "26px", color: m.color, lineHeight: 1 }}>{m.value}</span>
                      {m.unit && <span className="font-semibold mb-0.5 text-slate-600" style={{ fontSize: "10px" }}>{m.unit}</span>}
                    </div>
                  </div>)}
              </div>

              {
    /* Bar chart */
  }
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                <p className="text-slate-800 font-bold uppercase tracking-widest mb-3" style={{ fontSize: "10px" }}>
                  Who Triggered the Calming Response?
                </p>
                <div style={{ height: "130px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
    data={triggerData}
    layout="vertical"
    margin={{ top: 0, right: 55, left: 5, bottom: 0 }}
  >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                      <XAxis
    type="number"
    domain={[0, 100]}
    tickFormatter={(v) => `${v}%`}
    fontSize={11}
    stroke="#475569"
    tickLine={false}
    axisLine={false}
  />
                      <YAxis
    type="category"
    dataKey="name"
    fontSize={11}
    stroke="#475569"
    tickLine={false}
    axisLine={false}
    width={110}
    tick={{ fill: "#334155", fontWeight: 600 }}
  />
                      <Tooltip
    formatter={(v) => [`${v}%`, "Proportion"]}
    contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid #e2e8f0", fontWeight: 600 }}
  />
                      <Bar
    dataKey="value"
    radius={[0, 6, 6, 0]}
    label={{ position: "right", fontSize: 12, fontWeight: 700, fill: "#1e293b", formatter: (v) => `${v}%` }}
  >
                        {triggerData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <PageFooter />
          </div>

          {
    /* ══════════════════════════════════════════════
        PAGE 3 — Critical Event #1
    ══════════════════════════════════════════════ */
  }
          <EventDetailPage ev={criticalEvents[0]} pageNum={3} total={TOTAL} />

          {
    /* ══════════════════════════════════════════════
        PAGE 4 — Critical Event #2
    ══════════════════════════════════════════════ */
  }
          <EventDetailPage ev={criticalEvents[1]} pageNum={4} total={TOTAL} />

          {
    /* ══════════════════════════════════════════════
        PAGE 5 — Critical Event #3
    ══════════════════════════════════════════════ */
  }
          <EventDetailPage ev={criticalEvents[2]} pageNum={5} total={TOTAL} />

          {
    /* ════════════════════════════════════════════
        PAGE 6 — Notes
    ════════════════════════════════════════════ */
  }
          <div className="a4-page shadow-2xl overflow-hidden" style={pageStyle}>
            <PageHeader page={6} total={TOTAL} />

            <SectionLabel
    n="6"
    title="Notes & Observations"
    subtitle="Space for the caregiver, support person, or therapist to add personal observations, patterns noticed, or next steps."
  />

            <div className="space-y-3 mb-8">
              {Array.from({ length: 13 }).map((_, i) => <div key={i} className="border-b border-slate-300" style={{ minHeight: "28px" }} />)}
            </div>

            <PageFooter />
          </div>

        </div>
      </div>
    </>;
}
function EventDetailPage({ ev, pageNum, total }) {
  const tempPeak = ev.rank === 1 ? 37.4 : ev.rank === 2 ? 37.2 : 37;
  const rankColor = ev.rank === 1 ? "#dc2626" : ev.rank === 2 ? "#ea580c" : "#ca8a04";
  const charts = [
    {
      key: "eda",
      label: "Sweat Level (EDA)",
      subtitle: `Electrodermal activity \u2014 skin conductance. Peak recorded: ${ev.peakEda} \xB5S`,
      data: makeEDA(ev.peakEda),
      color: "#2563eb",
      dk: "eda",
      unit: "\xB5S",
      domain: [2.5, Math.ceil(ev.peakEda + 0.5)]
    },
    {
      key: "hr",
      label: "Heart Rate",
      subtitle: `Cardiac stress response. Peak recorded: ${ev.peakHr} BPM`,
      data: makeHR(ev.peakHr),
      color: "#e11d48",
      dk: "hr",
      unit: "BPM",
      domain: [55, Math.ceil(ev.peakHr + 5)]
    },
    {
      key: "temp",
      label: "Skin Temperature",
      subtitle: `Surface skin temp at sensor location. Peak recorded: ${tempPeak} \xB0C`,
      data: makeTemp(tempPeak),
      color: "#d97706",
      dk: "temp",
      unit: "\xB0C",
      domain: [parseFloat((tempPeak - 1.3).toFixed(1)), parseFloat((tempPeak + 0.4).toFixed(1))]
    },
    {
      key: "imu",
      label: "Movement (Accelerometer)",
      subtitle: "Body motion intensity in m/s\xB2. Elevated values indicate agitation or self-stimulatory behaviour.",
      data: makeIMU(),
      color: "#7c3aed",
      dk: "imu",
      unit: "m/s\xB2",
      domain: [8, 28]
    }
  ];
  return <div className="a4-page shadow-2xl overflow-hidden" style={A4_STYLE}>
      <PageHeader page={pageNum} total={total} />

      {
    /* ── Section label ── */
  }
      <SectionLabel
    n="5"
    title="Critical Events — Sensor Telemetry"
    subtitle="Highest-severity stress episodes this period. Full 4-sensor readings: 10 min before → vest activation → 10 min recovery."
  />

      {
    /* ── Event header badge ── */
  }
      <div
    className="flex items-center gap-4 rounded-xl border p-3 mb-3"
    style={{ background: `${rankColor}08`, borderColor: `${rankColor}30` }}
  >
        <span
    className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white font-black"
    style={{ background: rankColor, fontSize: "15px" }}
  >
          #{ev.rank}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-extrabold text-slate-900" style={{ fontSize: "13px" }}>
            Critical Event #{ev.rank} of 3 &nbsp;—&nbsp; {ev.date} at {ev.time}
          </p>
          <p className="text-slate-600 mt-0.5" style={{ fontSize: "10px" }}>
            Duration: <strong>{ev.duration}</strong> &nbsp;·&nbsp; Context: {ev.context}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <span
    className="font-bold px-3 py-1 rounded-full border"
    style={{ color: ev.oc, borderColor: `${ev.oc}50`, background: `${ev.oc}12`, fontSize: "10px" }}
  >
            {ev.outcome}
          </span>
          <p className="text-slate-400 mt-1" style={{ fontSize: "9px" }}>
            Peak HR {ev.peakHr} BPM &nbsp;·&nbsp; Peak EDA {ev.peakEda} µS &nbsp;·&nbsp; Peak Temp {tempPeak} °C
          </p>
        </div>
      </div>

      {
    /* ── 4 full-width sensor charts ── */
  }
      <div className="space-y-2.5">
        {charts.map((ch) => <div
    key={ch.key}
    className="border border-slate-200 rounded-xl bg-white"
    style={{ padding: "10px 14px 6px 10px" }}
  >
            {
    /* Title row */
  }
            <div className="flex items-baseline gap-2 mb-1">
              <span
    className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0 relative top-0.5"
    style={{ background: ch.color }}
  />
              <span className="font-extrabold text-slate-900" style={{ fontSize: "12px" }}>
                {ch.label}
              </span>
              <span className="font-semibold" style={{ fontSize: "10px", color: ch.color }}>
                ({ch.unit})
              </span>
              <span className="text-slate-400 ml-1" style={{ fontSize: "9.5px" }}>
                — {ch.subtitle}
              </span>
            </div>

            {
    /* Area Chart */
  }
            <div style={{ height: "138px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ch.data} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id={`grad-${ch.key}-ev${ev.rank}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={ch.color} stopOpacity={0.2} />
                      <stop offset="92%" stopColor={ch.color} stopOpacity={0.01} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />

                  <XAxis
    dataKey="t"
    interval={0}
    fontSize={8.5}
    tickLine={false}
    axisLine={{ stroke: "#e2e8f0" }}
    tick={{ fill: "#64748b", fontWeight: 600 }}
  />
                  <YAxis
    domain={ch.domain}
    tickCount={5}
    fontSize={9}
    tickLine={false}
    axisLine={false}
    tick={{ fill: "#475569", fontWeight: 600 }}
    width={34}
  />

                  <Tooltip
    contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid #e2e8f0", fontWeight: 600, padding: "6px 10px" }}
    labelStyle={{ color: "#334155", fontWeight: 700 }}
    formatter={(v) => [`${v} ${ch.unit}`, ch.label]}
  />

                  <ReferenceLine
    x="0m"
    stroke="#ef4444"
    strokeDasharray="4 3"
    strokeWidth={1.5}
    label={{
      value: "Vest Activated",
      position: "insideTopRight",
      fill: "#ef4444",
      fontSize: 9,
      fontWeight: 700
    }}
  />

                  <Area
    type="monotone"
    dataKey={ch.dk}
    stroke={ch.color}
    strokeWidth={2}
    fill={`url(#grad-${ch.key}-ev${ev.rank})`}
    dot={false}
    isAnimationActive={false}
  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>)}
      </div>

      {
    /* Legend note */
  }
      <p className="mt-2 text-slate-400 italic" style={{ fontSize: "8.5px" }}>
        ‒ ‒ Red dashed line = vest activation point (0m) &nbsp;·&nbsp;
        Left = stress build-up phase &nbsp;·&nbsp; Right = recovery phase after vest activation
      </p>

      <PageFooter />
    </div>;
}
