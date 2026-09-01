import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Lock } from "lucide-react";
import PlumeLogo from "../components/PlumeLogo";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
export const TOKEN_KEY = "plume_admin_token";

function formatApiErrorDetail(detail) {
  if (detail == null) return "Une erreur est survenue. Réessayez.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail.map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e))).join(" ");
  if (detail && typeof detail.msg === "string") return detail.msg;
  return String(detail);
}

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(TOKEN_KEY)) navigate("/admin", { replace: true });
  }, [navigate]);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/admin/login`, { email, password });
      localStorage.setItem(TOKEN_KEY, data.token);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(formatApiErrorDetail(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream text-ink flex items-center justify-center px-6" data-testid="admin-login-page">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-10">
          <PlumeLogo variant="dark" size="lg" />
          <p className="ps-overline text-terracotta mt-4">Espace privé</p>
        </div>
        <form onSubmit={submit} className="bg-white border border-ink/10 shadow-sm p-8 md:p-10" data-testid="admin-login-form">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 border border-terracotta text-terracotta flex items-center justify-center">
              <Lock size={16} strokeWidth={1.5} />
            </div>
            <h1 className="font-serif italic text-2xl font-light">Connexion administrateur</h1>
          </div>

          <label className="block ps-overline text-ink/60 mb-2">Adresse email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
            data-testid="admin-email-input"
            className="w-full border border-ink/20 bg-cream/40 px-4 py-3 font-sans text-sm mb-5 outline-none focus:border-terracotta transition-colors"
          />

          <label className="block ps-overline text-ink/60 mb-2">Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            data-testid="admin-password-input"
            className="w-full border border-ink/20 bg-cream/40 px-4 py-3 font-sans text-sm mb-6 outline-none focus:border-terracotta transition-colors"
          />

          {error && (
            <p className="text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-3 mb-6" data-testid="admin-login-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            data-testid="admin-login-submit"
            className="w-full bg-ink text-cream py-4 font-sans text-sm uppercase tracking-[0.2em] hover:bg-terracotta transition-colors disabled:opacity-60"
          >
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
