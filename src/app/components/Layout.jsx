import { Outlet, NavLink } from "react-router";
import { Activity, Sliders, BarChart2, Settings, User, Bell, X, AlertTriangle, CheckCircle2, PhoneCall, Download, ChevronRight } from "lucide-react";
import clsx from "clsx";
import { useState, useRef, useEffect } from "react";
import logoImg from "../../imports/\u0E2A\u0E33\u0E40\u0E19\u0E32\u0E02\u0E2D\u0E07_The_Invisible_Hug_Pitch_deck-3.png";
const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    category: "status",
    title: "Meltdown in Progress",
    detail: "Status changed: Risk of Meltdown \u2192 Meltdown in Progress",
    time: "Today, 14:32",
    read: false,
    icon: "alert"
  },
  {
    id: 2,
    category: "status",
    title: "Risk of Meltdown Detected",
    detail: "Status changed: Normal \u2192 Risk of Meltdown",
    time: "Today, 14:28",
    read: false,
    icon: "alert"
  },
  {
    id: 3,
    category: "device",
    title: "Data Export Successful",
    detail: "7-day sensor data exported to CSV",
    time: "Today, 11:05",
    read: true,
    icon: "export"
  },
  {
    id: 4,
    category: "status",
    title: "Status Recovered",
    detail: "Status changed: Meltdown in Progress \u2192 Normal",
    time: "Yesterday, 19:47",
    read: true,
    icon: "ok"
  },
  {
    id: 5,
    category: "device",
    title: "Phone Binding Successful",
    detail: "Device linked to +66-81-234-5678",
    time: "Yesterday, 09:14",
    read: true,
    icon: "phone"
  },
  {
    id: 6,
    category: "status",
    title: "Risk of Meltdown Detected",
    detail: "Status changed: Normal \u2192 Risk of Meltdown",
    time: "Apr 28, 16:20",
    read: true,
    icon: "alert"
  },
  {
    id: 7,
    category: "status",
    title: "Status Recovered",
    detail: "Status changed: Risk of Meltdown \u2192 Normal",
    time: "Apr 28, 16:45",
    read: true,
    icon: "ok"
  },
  {
    id: 8,
    category: "device",
    title: "Data Export Successful",
    detail: "Weekly report exported to PDF",
    time: "Apr 27, 08:00",
    read: true,
    icon: "export"
  },
  {
    id: 9,
    category: "status",
    title: "Meltdown in Progress",
    detail: "Status changed: Risk of Meltdown \u2192 Meltdown in Progress",
    time: "Apr 26, 21:05",
    read: true,
    icon: "alert"
  },
  {
    id: 10,
    category: "status",
    title: "Status Recovered",
    detail: "Status changed: Meltdown in Progress \u2192 Normal",
    time: "Apr 26, 21:18",
    read: true,
    icon: "ok"
  },
  {
    id: 11,
    category: "device",
    title: "Phone Binding Successful",
    detail: "Caregiver number verified: +66-89-765-4321",
    time: "Apr 25, 13:30",
    read: true,
    icon: "phone"
  }
];
const iconMap = {
  alert: <AlertTriangle className="w-4 h-4 text-amber-500" />,
  ok: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
  phone: <PhoneCall className="w-4 h-4 text-blue-500" />,
  export: <Download className="w-4 h-4 text-purple-500" />
};
const categoryBg = {
  alert: "bg-amber-50 border-amber-200",
  ok: "bg-emerald-50 border-emerald-200",
  phone: "bg-blue-50 border-blue-200",
  export: "bg-purple-50 border-purple-200"
};
export function Layout() {
  const navItems = [
    { name: "Dashboard", path: "/", icon: Activity },
    { name: "Controls & Baseline", path: "/controls", icon: Sliders },
    { name: "Analytics", path: "/analytics", icon: BarChart2 },
    { name: "Settings", path: "/settings", icon: Settings }
  ];
  const [notifOpen, setNotifOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const panelRef = useRef(null);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const filtered = notifications.filter(
    (n) => filter === "all" ? true : n.category === filter
  );
  useEffect(() => {
    function handleClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    }
    if (notifOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [notifOpen]);
  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }
  return <div
    className="flex font-sans selection:bg-blue-500/30"
    style={{ backgroundColor: "#f0f4fc", height: "100dvh", minHeight: "100vh", overflow: "hidden" }}
  >
      {
    /* Sidebar — dark navy */
  }
      <aside
    className="w-64 flex flex-col flex-shrink-0"
    style={{ backgroundColor: "#0c1428", height: "100%", overflow: "hidden" }}
  >
        {
    /* Logo Section */
  }
        <div className="px-5 pt-7 pb-6 flex flex-col items-center gap-3 border-b border-white/5 relative overflow-hidden flex-shrink-0">
          {
    /* Background ambient glow */
  }
          <div
    className="absolute inset-0 pointer-events-none"
    style={{ background: "radial-gradient(ellipse 130% 90% at 50% -10%, rgba(70,180,160,0.12) 0%, rgba(67,97,238,0.09) 50%, transparent 75%)" }}
  />

          {
    /* Logo image — no wrapper box, display image directly */
  }
          <div className="relative z-10">
            <img
    src={logoImg}
    alt="The Invisible Hug Logo"
    className="w-[64px] h-[64px] object-contain"
    style={{ filter: "drop-shadow(0 4px 16px rgba(64,187,166,0.35))" }}
  />
          </div>

          {
    /* Brand name */
  }
          <div className="relative z-10 text-center" style={{ lineHeight: 1 }}>
            <p className="text-[9px] font-semibold tracking-[0.35em] uppercase text-slate-500 mb-[5px]">
              The Invisible
            </p>
            <p
    className="text-[18px] font-black tracking-[0.25em] uppercase"
    style={{ color: "#40bba6" }}
  >
              HUG
            </p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => <NavLink
    key={item.path}
    to={item.path}
    className={({ isActive }) => clsx(
      "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 border",
      isActive ? "border-blue-500/30 text-blue-300" : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5"
    )}
    style={({ isActive }) => isActive ? { background: "linear-gradient(135deg, rgba(67,97,238,0.2), rgba(67,97,238,0.08))" } : void 0}
  >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.name}
            </NavLink>)}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div
    className="rounded-xl p-4 relative overflow-hidden border border-purple-500/25"
    style={{ background: "linear-gradient(135deg, rgba(88,28,135,0.45), rgba(157,23,77,0.25))" }}
  >
            <div className="absolute top-2.5 right-2.5">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-400" />
              </span>
            </div>
            <h3 className="text-sm font-bold text-purple-300 mb-1">Premium Active</h3>
            <p className="text-[11px] text-purple-200/60 leading-relaxed mt-1.5">
              Medical-grade analytics &amp; remote access enabled.
            </p>
          </div>
        </div>
      </aside>

      {
    /* Main content */
  }
      <main className="flex-1 flex flex-col min-w-0" style={{ height: "100%", overflow: "hidden" }}>
        {
    /* Header */
  }
        <header className="h-12 flex items-center justify-end px-8 border-b border-slate-200 bg-white z-10 flex-shrink-0">
          <div className="flex items-center gap-4">

            {
    /* Bell + Notification Panel */
  }
            <div className="relative" ref={panelRef}>
              <button
    onClick={() => setNotifOpen((v) => !v)}
    className="relative w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors duration-150"
  >
                <Bell className="w-4 h-4 text-slate-500" strokeWidth={1.8} />
                {unreadCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />}
              </button>

              {
    /* Dropdown panel */
  }
              {notifOpen && <div
    className="fixed right-8 top-12 w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-[200] flex flex-col"
    style={{ maxHeight: "480px" }}
  >
                  {
    /* Panel header */
  }
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-slate-600" />
                      <span className="text-sm font-bold text-slate-800">Notifications</span>
                      {unreadCount > 0 && <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-600">
                          {unreadCount}
                        </span>}
                    </div>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && <button
    onClick={markAllRead}
    className="text-[11px] text-blue-500 hover:text-blue-700 font-medium transition-colors"
  >
                          Mark all read
                        </button>}
                      <button
    onClick={() => setNotifOpen(false)}
    className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
  >
                        <X className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    </div>
                  </div>

                  {
    /* Filter tabs */
  }
                  <div className="flex items-center gap-1 px-4 py-2 border-b border-slate-100 bg-slate-50">
                    {["all", "status", "device"].map((cat) => <button
    key={cat}
    onClick={() => setFilter(cat)}
    className={clsx(
      "px-3 py-1 rounded-full text-[11px] font-semibold transition-all duration-150 uppercase tracking-wide",
      filter === cat ? "bg-blue-500 text-white shadow-sm" : "text-slate-400 hover:text-slate-700 hover:bg-slate-200"
    )}
  >
                        {cat === "all" ? "All" : cat === "status" ? "Status Change" : "Device Log"}
                      </button>)}
                    <span className="ml-auto text-[10px] text-slate-400">Last 7 days</span>
                  </div>

                  {
    /* Notification list */
  }
                  <div className="overflow-y-auto flex-1">
                    {filtered.length === 0 ? <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                        <Bell className="w-8 h-8 mb-2 opacity-30" />
                        <p className="text-sm">No notifications</p>
                      </div> : filtered.map((n) => <div
    key={n.id}
    className={clsx(
      "flex items-start gap-3 px-4 py-3 border-b border-slate-50 last:border-0 transition-colors duration-100",
      !n.read ? "bg-blue-50/60" : "hover:bg-slate-50"
    )}
  >
                          {
    /* Icon badge */
  }
                          <div className={clsx(
    "w-7 h-7 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5",
    categoryBg[n.icon]
  )}>
                            {iconMap[n.icon]}
                          </div>
                          {
    /* Content */
  }
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className={clsx(
    "text-[12px] leading-snug truncate",
    !n.read ? "font-bold text-slate-800" : "font-medium text-slate-700"
  )}>
                                {n.title}
                              </p>
                              {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />}
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{n.detail}</p>
                            <p className="text-[10px] text-slate-400 mt-1">{n.time}</p>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-300 flex-shrink-0 mt-1" />
                        </div>)}
                  </div>
                </div>}
            </div>

            {
    /* User info */
  }
            <div className="text-right">
              <p className="text-[12px] font-semibold text-slate-800 leading-none">Somchai's Vest</p>
              <p className="text-[10px] text-blue-500 mt-0.5">Status: Online</p>
            </div>
            {
    /* Silhouette avatar */
  }
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden border border-slate-300 shadow-sm">
              <User className="w-5 h-5 text-slate-400" strokeWidth={1.5} />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8" style={{ backgroundColor: "#f0f4fc" }}>
          <Outlet />
        </div>
      </main>
    </div>;
}
