import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Dashboard } from "@/pages/Dashboard";
import { Tasks } from "@/pages/Tasks";
import { DailyLog } from "@/pages/DailyLog";
import { Trackers } from "@/pages/Trackers";
import { Revision } from "@/pages/Revision";
import { Exams } from "@/pages/Exams";
import { CalendarPage } from "@/pages/CalendarPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { useSettingsStore } from "@/stores/useSettingsStore";

function App() {
  const applyTheme = useSettingsStore((state) => state.applyTheme);

  useEffect(() => {
    applyTheme();
  }, [applyTheme]);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/daily-log" element={<DailyLog />} />
          <Route path="/trackers" element={<Trackers />} />
          <Route path="/revision" element={<Revision />} />
          <Route path="/exams" element={<Exams />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
