import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./index.css";

import AdminLayout from "./components/AdminLayout";
import CmsOnly from "./components/CmsOnly";
import ProtectedAdmin from "./components/ProtectedAdmin";
import Home from "./pages/Home";
import NewsArticlePage from "./pages/NewsArticlePage";
import NewsPage from "./pages/NewsPage";
import ProfessorsPage from "./pages/ProfessorsPage";
import StudentsPage from "./pages/StudentsPage";
import UnderConstruction from "./pages/UnderConstruction";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminEditorPage from "./pages/admin/AdminEditorPage";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminNewsPage from "./pages/admin/AdminNewsPage";
import AdminPreviewPage from "./pages/admin/AdminPreviewPage";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/noticias" element={<NewsPage />} />
        <Route path="/noticias/:slug" element={<NewsArticlePage />} />
        <Route path="/membros/professores" element={<ProfessorsPage />} />
        <Route path="/membros/estudantes" element={<StudentsPage />} />

        <Route path="/admin" element={<CmsOnly><AdminLoginPage /></CmsOnly>} />
        <Route
          element={
            <CmsOnly>
              <ProtectedAdmin>
                <AdminLayout />
              </ProtectedAdmin>
            </CmsOnly>
          }
        >
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/publicacoes" element={<AdminNewsPage />} />
          <Route path="/admin/publicacoes/nova" element={<AdminEditorPage />} />
          <Route path="/admin/publicacoes/:id" element={<AdminEditorPage />} />
        </Route>
        <Route
          path="/admin/preview/:id"
          element={
            <CmsOnly>
              <ProtectedAdmin>
                <AdminPreviewPage />
              </ProtectedAdmin>
            </CmsOnly>
          }
        />

        <Route path="/post/:id" element={<Navigate to="/noticias" replace />} />
        <Route path="*" element={<UnderConstruction />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
