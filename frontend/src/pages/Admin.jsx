import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { LogOut, Mail, Inbox, RefreshCw, Search, Circle, CheckCircle2 } from "lucide-react";
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
  const [query, setQuery] = useState("");

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    navigate("/admin/login", { replace: true });
  }, [navigate]);

  const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY)}` });

  const load = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      navigate("/admin/login", { replace: true });
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.get(`${API}/admin/messages`, { headers: { Authorization: `Bearer ${token}` } });
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

  const toggleRead = async (m) => {
    const newRead = !m.read;
    setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, read: newRead } : x)));
    try {
      await axios.patch(`${API}/admin/messages/${m.id}`, { read: newRead }, { headers: authHeader() });
    } catch (err) {
      // revert on failure
      setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, read: !newRead } : x)));
      if (err.response?.status === 401) logout();
    }
  };

  const unreadCount = useMemo(() => messages.filter((m) => !m.read).length, [messages]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return messages;
    return messages.filter((m) =>
      [m.name, m.email, m.subject, m.message].filter(Boolean).some((f) => String(f).toLowerCase().includes(q))
    );
  }, [messages, query]);

  return (
    <div className="min-h-screen bg-cream text-ink" data-testid="admin-page">
      <header className="border-b border-ink/10 bg-white/70 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-5 flex items-center justify-between gap-4">
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
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3 mb-8">
          <Inbox size={20} strokeWidth={1.5} className="text-terracotta" />
          <h1 className="font-serif italic text-3xl md:text-4xl font-light">Boîte de réception</h1>
          {!loading && (
            <div className="flex items-center gap-3 text-sm font-sans">
              <span className="text-ink/50" data-testid="admin-messages-count">
                {messages.length} message{messages.length > 1 ? "s" : ""}
              </span>
              {unreadCount > 0 && (
                <span
                  data-testid="admin-unread-count"
                  className="inline-flex items-center gap-1.5 text-terracotta bg-terracotta/10 px-2.5 py-1 rounded-full text-xs uppercase tracking-[0.15em]"
                >
                  <Circle size={8} className="fill-terracotta text-terracotta" /> {unreadCount} non lu{unreadCount > 1 ? "s" : ""}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-8 max-w-md">
          <Search size={16} strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un nom, email, sujet…"
            data-testid="admin-search-input"
            className="w-full border border-ink/20 bg-white pl-11 pr-4 py-3 font-sans text-sm outline-none focus:border-terracotta transition-colors"
          />
        </div>

        {loading && <p className="font-sans text-ink/60" data-testid="admin-loading">Chargement…</p>}
        {error && <p className="font-sans text-red-700" data-testid="admin-error">{error}</p>}

        {!loading && !error && messages.length === 0 && (
          <div className="border border-dashed border-ink/20 p-12 text-center" data-testid="admin-empty">
            <p className="font-serif italic text-xl text-ink/60">Aucun message pour le moment.</p>
          </div>
        )}

        {!loading && !error && messages.length > 0 && filtered.length === 0 && (
          <div className="border border-dashed border-ink/20 p-12 text-center" data-testid="admin-no-results">
            <p className="font-serif italic text-xl text-ink/60">Aucun message ne correspond à « {query} ».</p>
          </div>
        )}

        <div className="space-y-4">
          {filtered.map((m, i) => (
            <article
              key={m.id || i}
              data-testid={`admin-message-${i}`}
              data-read={m.read ? "true" : "false"}
              className={`bg-white p-6 md:p-7 shadow-sm transition-colors border-l-4 ${
                m.read ? "border-l-ink/10 border-y border-r border-ink/10" : "border-l-terracotta border-y border-r border-terracotta/25"
              }`}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  {!m.read && <Circle size={9} className="fill-terracotta text-terracotta shrink-0" data-testid={`admin-unread-dot-${i}`} />}
                  <p className={`font-serif text-xl ${m.read ? "text-ink/80" : "text-ink"}`}>{m.name}</p>
                </div>
                <time className="text-xs uppercase tracking-[0.15em] text-ink/45">{fmtDate(m.created_at)}</time>
              </div>
              <a href={`mailto:${m.email}`} className="inline-flex items-center gap-2 text-sm text-terracotta hover:underline mb-3">
                <Mail size={14} strokeWidth={1.5} /> {m.email}
              </a>
              {m.subject && <p className="ps-overline text-ink/60 mb-2">{m.subject}</p>}
              <p className="font-sans text-sm md:text-base text-ink/80 leading-relaxed whitespace-pre-line">{m.message}</p>

              <div className="flex items-center justify-between gap-3 mt-5 pt-4 border-t border-ink/10">
                {m.locale ? (
                  <span className="text-[11px] uppercase tracking-[0.2em] text-ink/40 border border-ink/10 px-2 py-1">{m.locale}</span>
                ) : <span />}
                <button
                  onClick={() => toggleRead(m)}
                  data-testid={`admin-toggle-read-${i}`}
                  className={`inline-flex items-center gap-2 text-xs uppercase tracking-[0.15em] px-3.5 py-2 transition-colors ${
                    m.read
                      ? "text-ink/55 hover:text-terracotta"
                      : "bg-terracotta text-cream hover:bg-ink"
                  }`}
                >
                  {m.read ? <><Circle size={13} strokeWidth={1.5} /> Marquer non lu</> : <><CheckCircle2 size={13} strokeWidth={1.5} /> Marquer comme lu</>}
                </button>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Admin;
