import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";

// Private pages never mount for anyone but the app's own admin account: a
// visitor who types the URL is sent straight back to Pause.
export default function AdminRoute({ children }) {
  const [allowed, setAllowed] = useState(null);

  useEffect(() => {
    let active = true;
    base44.auth
      .me()
      .then((me) => {
        if (active) setAllowed(me?.role === "admin");
      })
      .catch(() => {
        if (active) setAllowed(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (allowed === null) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  if (!allowed) return <Navigate to="/" replace />;

  return children;
}