import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { MapListPage } from "./pages/MapListPage";
import { MapWorkbenchPage } from "./pages/MapWorkbenchPage";
import { Toasts } from "./components/Toasts";
import "./styles/app.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MapListPage />} />
        <Route path="/workbench/:id" element={<MapWorkbenchPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toasts />
    </BrowserRouter>
  );
}
