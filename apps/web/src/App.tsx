import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Protected } from "./components/Protected";
import { Shell } from "./components/Shell";
import { AdminCloudPage } from "./pages/AdminCloud";
import { DashboardPage } from "./pages/Dashboard";
import { LoginPage } from "./pages/Login";
import { RegisterPage } from "./pages/Register";
import { RequestDetailPage } from "./pages/RequestDetail";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<Protected />}>
          <Route element={<Shell />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/requests/:id" element={<RequestDetailPage />} />
            <Route path="/admin/cloud" element={<AdminCloudPage />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
