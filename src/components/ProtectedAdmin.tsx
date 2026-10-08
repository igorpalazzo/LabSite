import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { session } from "../lib/api";

export default function ProtectedAdmin({ children }: { children: ReactNode }) {
  return session.get() ? children : <Navigate to="/admin" replace />;
}

