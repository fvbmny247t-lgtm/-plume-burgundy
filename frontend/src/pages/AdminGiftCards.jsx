import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { TOKEN_KEY } from "./AdminLogin";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const blank = { slug: "", name: { fr: "", en: "" }, tagline: { fr: "", en: "" }, description: { fr: "", en: "" }, price: 0, image_url: "", includes: [], active: true, sort_order: 99 };

const AdminGiftCards = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState("coffrets");
  const [coffrets, setCoffrets] = useState([]);
  const [cards, setCards] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [editing, setEditing] = useState(null);

  const auth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY)}` } });

  const loadAll = async () => {
    try {
      const [c, k, r] = await Promise.all([
        axios.get(`${API}/admin/giftcards/coffrets`, auth()),
        axios.get(`${API}/admin/giftcards/cards`, auth()),
        axios.get(`${API}/admin/giftcards/redemptions`, auth()),
      ]);
      setCoffrets(c.data); setCards(k.data); setRedemptions(r.data);
    } catch (e) {
      if (e.response?.status === 401) navigate("/admin/login", { replace: true });
    }
  };

  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) { navigate("/admin/login", { replace: true }); return; }
    loadAll();
  }, []); // eslint-disable-line

  const saveCoffret = async (e) => {
    e.preventDefault();
    const payload = { ...editing, price: Number(editing.price), sort_order: Number(editing.sort_order) };
    try {
      if (editing.id) await axios.put(`${API}/admin/giftcards/coffrets/${editing.id}`, payload, auth());
      else await axios.post(`${API}/admin/giftcards/coffrets`, payload, auth());
      setEditing(null); loadAll();
    } catch (err) {
      const d = err.response?.data?.detail;
      window.alert(typeof d === "string" ? d : "Erreur lors de l'enregistrement.");
    }
  };
  const delCoffret = async (id) => {
    if (!window.confirm("Supprimer ce coffret ?")) return;
    try { await axios.delete(`${API}/admin/giftcards/coffrets/${id}`, auth()); loadAll(); }
    catch { window.alert("Erreur lors de la suppression."); }
  };
  const updateRedemption = async (id, status) => {
    const note = window.prompt("Note (facultatif) :", "") || null;
    try { await axios.patch(`${API}/admin/giftcards/redemptions/${id}`, { status, admin_note: note }, auth()); loadAll(); }
    catch { window.alert("Erreur lors de la mise à jour."); }
  };

  const tabBtn = (id, label) => (
    <button onClick={() => setTab(id)} data-testid={`gc-admin-tab-${id}`}
      className={`px-4 py-2 text-sm uppercase tracking-[0.15em] border-b-2 ${tab === id ? "border-terracotta text-ink" : "border-transparent text-ink/50 hover:text-ink"}`}>{label}</button>
  );

  const Nested = ({ obj, path, label }) => (
    <div className="grid grid-cols-2 gap-3 mb-3">
      <div><label className="text-xs text-ink/50">{label} (FR)</label>
        <input className="w-full border border-ink/20 px-3 py-2 text-sm" value={obj.fr || ""} onChange={(e) => setEditing((p) => ({ ...p, [path]: { ...p[path], fr: e.target.value } }))} /></div>
      <div><label className="text-xs text-ink/50">{label} (EN)</label>
        <input className="w-full border border-ink/20 px-3 py-2 text-sm" value={obj.en || ""} onChange={(e) => setEditing((p) => ({ ...p, [path]: { ...p[path], en: e.target.value } }))} /></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-cream text-ink px-6 py-10" data-testid="admin-giftcards-page">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-serif italic text-3xl">Cartes cadeaux</h1>
          <Link to="/admin" className="text-sm text-terracotta hover:underline">← Messages</Link>
        </div>
        <div className="flex gap-2 border-b border-ink/10 mb-8">
          {tabBtn("coffrets", "Coffrets")}
          {tabBtn("cards", `Vendues (${cards.length})`)}
          {tabBtn("redemptions", `Demandes (${redemptions.filter(r => r.status === "pending").length})`)}
        </div>

        {tab === "coffrets" && (
          <div data-testid="gc-admin-coffrets">
            <button onClick={() => setEditing({ ...blank })} data-testid="gc-admin-new-coffret" className="mb-6 bg-ink text-cream px-5 py-2.5 text-xs uppercase tracking-[0.2em]">+ Nouveau coffret</button>
            <div className="space-y-3">
              {coffrets.map((c) => (
                <div key={c.id} className="bg-white border border-ink/10 p-4 flex items-center gap-4">
                  <img src={c.image_url} alt="" className="w-16 h-16 object-cover bg-ink/5" />
                  <div className="flex-1">
                    <p className="font-serif text-lg">{c.name?.fr} {!c.active && <span className="text-xs text-ink/40">(inactif)</span>}</p>
                    <p className="text-sm text-ink/50">{c.price} € · {c.slug}</p>
                  </div>
                  <button onClick={() => setEditing(c)} className="text-sm text-terracotta hover:underline">Modifier</button>
                  <button onClick={() => delCoffret(c.id)} className="text-sm text-red-600 hover:underline">Suppr.</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "cards" && (
          <div data-testid="gc-admin-cards" className="bg-white border border-ink/10 divide-y divide-ink/10">
            {cards.length === 0 && <p className="p-6 text-sm text-ink/50">Aucune carte vendue pour le moment.</p>}
            {cards.map((c) => (
              <div key={c.id} className="p-4 flex flex-wrap items-center gap-x-6 gap-y-1">
                <span className="font-mono text-sm">{c.code}</span>
                <span className="text-sm flex-1">{c.coffret_name} · {c.amount} €</span>
                <span className="text-sm text-ink/60">{c.buyer_name}{c.buyer_phone ? ` · ${c.buyer_phone}` : ""} · {c.buyer_email}</span>
                <span className={`text-xs uppercase px-2 py-1 ${c.status === "redeemed" ? "bg-ink/10 text-ink/60" : c.status === "expired" ? "bg-red-50 text-red-600" : "bg-terracotta/10 text-terracotta"}`}>{c.status}</span>
              </div>
            ))}
          </div>
        )}

        {tab === "redemptions" && (
          <div data-testid="gc-admin-redemptions" className="space-y-3">
            {redemptions.length === 0 && <p className="text-sm text-ink/50">Aucune demande.</p>}
            {redemptions.map((r) => (
              <div key={r.id} className="bg-white border border-ink/10 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-sm">{r.code}</span>
                  <span className={`text-xs uppercase px-2 py-1 ${r.status === "processed" ? "bg-green-50 text-green-700" : r.status === "declined" ? "bg-red-50 text-red-600" : "bg-terracotta/10 text-terracotta"}`}>{r.status}</span>
                </div>
                <p className="text-sm"><strong>{r.guest_name}</strong> · {r.guest_email} {r.guest_phone && `· ${r.guest_phone}`}</p>
                <p className="text-sm text-ink/70">{r.coffret_name} — dates : {r.desired_dates} · {r.nb_guests} pers.</p>
                {r.message && <p className="text-sm italic text-ink/60 mt-1">« {r.message} »</p>}
                {r.admin_note && <p className="text-xs text-ink/40 mt-1">Note : {r.admin_note}</p>}
                {r.status === "pending" && (
                  <div className="flex gap-3 mt-3">
                    <button onClick={() => updateRedemption(r.id, "processed")} className="bg-ink text-cream px-4 py-2 text-xs uppercase tracking-[0.15em]">Marquer traité (bon utilisé)</button>
                    <button onClick={() => updateRedemption(r.id, "declined")} className="border border-ink/30 px-4 py-2 text-xs uppercase tracking-[0.15em]">Refuser</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {editing && (
          <div className="fixed inset-0 z-[90] bg-ink/70 flex items-center justify-center px-4 overflow-y-auto py-10" onClick={() => setEditing(null)}>
            <form onSubmit={saveCoffret} className="bg-cream w-full max-w-xl p-8 my-auto" onClick={(e) => e.stopPropagation()} data-testid="gc-admin-coffret-form">
              <h3 className="font-serif italic text-2xl mb-5">{editing.id ? "Modifier" : "Nouveau"} coffret</h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div><label className="text-xs text-ink/50">Slug</label><input required className="w-full border border-ink/20 px-3 py-2 text-sm" value={editing.slug} onChange={(e) => setEditing((p) => ({ ...p, slug: e.target.value }))} /></div>
                <div><label className="text-xs text-ink/50">Prix (€)</label><input type="number" step="1" required className="w-full border border-ink/20 px-3 py-2 text-sm" value={editing.price} onChange={(e) => setEditing((p) => ({ ...p, price: e.target.value }))} /></div>
              </div>
              {Nested({ obj: editing.name || {}, path: "name", label: "Nom" })}
              {Nested({ obj: editing.tagline || {}, path: "tagline", label: "Accroche" })}
              {Nested({ obj: editing.description || {}, path: "description", label: "Description" })}
              <div className="mb-3"><label className="text-xs text-ink/50">Image (chemin de VOTRE photo, ex. /media/… ou /images/…)</label>
                <input className="w-full border border-ink/20 px-3 py-2 text-sm" value={editing.image_url || ""} onChange={(e) => setEditing((p) => ({ ...p, image_url: e.target.value }))} placeholder="/media/votre-photo.jpg" /></div>
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div><label className="text-xs text-ink/50">Ordre</label><input type="number" className="w-full border border-ink/20 px-3 py-2 text-sm" value={editing.sort_order} onChange={(e) => setEditing((p) => ({ ...p, sort_order: e.target.value }))} /></div>
                <label className="flex items-center gap-2 mt-5 text-sm"><input type="checkbox" checked={editing.active} onChange={(e) => setEditing((p) => ({ ...p, active: e.target.checked }))} /> Actif (visible sur le site)</label>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="bg-ink text-cream px-6 py-3 text-xs uppercase tracking-[0.2em]">Enregistrer</button>
                <button type="button" onClick={() => setEditing(null)} className="border border-ink/30 px-6 py-3 text-xs uppercase tracking-[0.2em]">Annuler</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminGiftCards;
