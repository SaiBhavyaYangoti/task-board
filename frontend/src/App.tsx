import { Navigate, Route, Routes } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Board from "./pages/Board";
import Metrics from "./pages/Metrics";
import Layout from "./components/Layout";

function Protected({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <Protected>
            <Layout />
          </Protected>
        }
      >
        <Route index element={<Navigate to="/board" replace />} />
        <Route path="board" element={<Board />} />
        <Route path="metrics" element={<Metrics />} />
      </Route>
    </Routes>
  );
}
