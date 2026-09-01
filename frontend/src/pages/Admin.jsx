import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { LogOut, Mail, Inbox, RefreshCw } from "lucide-react";
import { TOKEN_KEY } from "./AdminLogin";
import PlumeLogo from "../components/PlumeLogo";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const fmtDate = (v) => {
  if (!v) return "";
  const d = new Date(v);
  if (isNaN(d)) return String(v);
  return d.toLocaleString("fr-FR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

const Admin = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    navigate("/admin/login", { replace: true });
  }, [navigate]);

  const load = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      navigate("/admin/login", { replace: true });
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.get(`${API}/admin/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
        return;
      }
      setError("Impossible de charger les messages.");
    } finally {
      setLoading(false);
    }
  }, [navigate, logout]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="min-h-screen bg-cream text-ink" data-testid="admin-page">
      <header className="border-b border-ink/10 bg-white/70 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-5 flex items-center justify-between">
          <div className="flex flex-col">
            <PlumeLogo variant="dark" size="sm" />
            <p className="ps-overline text-terracotta mt-2">Messages de contact</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={load}
              data-testid="admin-refresh-btn"
              className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-ink/70 border border-ink/15 px-4 py-2.5 hover:border-terracotta hover:text-terracotta transition-colors"
            >
              <RefreshCw size={14} strokeWidth={1.5} /> Actualiser
            </button>
            <button
              onClick={logout}
              data-testid="admin-logout-btn"
              className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-cream bg-ink px-4 py-2.5 hover:bg-terracotta transition-colors"
            >
              <LogOut size={14} strokeWidth={1.5} /> Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 md:px-10 py-10">
        <div className="flex items-center gap-3 mb-8">
          <Inbox size={20} strokeWidth={1.5} className="text-terracotta" />
          <h1 className="font-serif italic text-3xl md:text-4xl font-light">Boîte de réception</h1>
          {!loading && (
            <span className="ml-2 text-sm font-sans text-ink/50" data-testid="admin-messages-count">
              {messages.length} message{messages.length > 1 ? "s" : ""}
            </span>
          )}
        </div>

        {loading && <p className="font-sans text-ink/60" data-testid="admin-loading">Chargement…</p>}
        {error && <p className="font-sans text-red-700" data-testid="admin-error">{error}</p>}

        {!loading && !error && messages.length === 0 && (
          <div className="border border-dashed border-ink/20 p-12 text-center" data-testid="admin-empty">
            <p className="font-serif italic text-xl text-ink/60">Aucun message pour le moment.</p>
          </div>
        )}

        <div className="space-y-4">
          {messages.map((m, i) => (
            <article
              key={m.id || i}
              data-testid={`admin-message-${i}`}
              className="bg-white border border-ink/10 p-6 md:p-7 shadow-sm"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-3 mb-3">
                <div>
                  <p className="font-serif text-xl text-ink">{m.name}</p>
                  <a href={`mailto:${m.email}`} className="inline-flex items-center gap-2 text-sm text-terracotta hover:underline mt-1">
                    <Mail size={14} strokeWidth={1.5} /> {m.email}
                  </a>
                </div>
                <time className="text-xs uppercase tracking-[0.15em] text-ink/45">{fmtDate(m.created_at)}</time>
              </div>
              {m.subject && (
                <p className="ps-overline text-ink/60 mb-2">{m.subject}</p>
              )}
              <p className="font-sans text-sm md:text-base text-ink/80 leading-relaxed whitespace-pre-line">{m.message}</p>
              {m.locale && (
                <span className="inline-block mt-4 text-[11px] uppercase tracking-[0.2em] text-ink/40 border border-ink/10 px-2 py-1">
                  {m.locale}
                </span>
              )}
            </article>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Admin;
