import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Controls } from "./pages/Controls";
import { Analytics } from "./pages/Analytics";
import { Settings } from "./pages/Settings";
import { ClinicalReport } from "./pages/ClinicalReport";
import { AiInfo } from "./pages/AiInfo";
export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "controls", Component: Controls },
      { path: "analytics", Component: Analytics },
      { path: "settings", Component: Settings },
      { path: "ai-info", Component: AiInfo }
    ]
  },
  {
    path: "/report",
    Component: ClinicalReport
  }
]);
