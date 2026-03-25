import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { useAuth } from "@/lib/auth";
import { LoginPage } from "@/pages/LoginPage";
import { ChatPage } from "@/pages/ChatPage";
import { ReportPage } from "@/pages/ReportPage";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <>
    <Toaster theme="dark" position="top-right" richColors />
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/chat/:threadId?"
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        }
      />
      <Route path="/report/:token" element={<ReportPage />} />
      <Route path="*" element={<Navigate to="/chat" replace />} />
    </Routes>
    </>
  );
}
