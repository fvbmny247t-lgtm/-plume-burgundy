import "@/App.css";
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { LanguageProvider } from "./context/LanguageContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Sejours from "./pages/Sejours";
import SuiteDetail from "./pages/SuiteDetail";
import ArtDeVivre from "./pages/ArtDeVivre";
import Journal from "./pages/Journal";
import JournalArticle from "./pages/JournalArticle";
import Contact from "./pages/Contact";
import Reserver from "./pages/Reserver";
import LegalPage from "./pages/LegalPage";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import Admin from "./pages/Admin";
import { CarnetAuthProvider } from "./context/CarnetAuthContext";
import CarnetLogin from "./pages/carnet/CarnetLogin";
import CarnetRegister from "./pages/carnet/CarnetRegister";
import CarnetForgot from "./pages/carnet/CarnetForgot";
import CarnetReset from "./pages/carnet/CarnetReset";
import CarnetVerify from "./pages/carnet/CarnetVerify";
import Carnet from "./pages/carnet/Carnet";
import CarnetAccount from "./pages/carnet/CarnetAccount";
import NewsletterAction from "./pages/carnet/NewsletterAction";
import CartesCadeaux from "./pages/CartesCadeaux";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";
import Voucher from "./pages/Voucher";
import RedeemGift from "./pages/RedeemGift";
import AdminGiftCards from "./pages/AdminGiftCards";

function App() {
  return (
    <HelmetProvider>
      <LanguageProvider>
        <CarnetAuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Admin — hors du Layout marketing */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/cartes-cadeaux" element={<AdminGiftCards />} />

            {/* Site public */}
            <Route
              path="/*"
              element={
                <Layout>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/sejours" element={<Sejours />} />
                    <Route path="/sejours/:slug" element={<SuiteDetail />} />
                    <Route path="/art-de-vivre" element={<ArtDeVivre />} />
                    <Route path="/journal" element={<Journal />} />
                    <Route path="/journal/:slug" element={<JournalArticle />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/reserver" element={<Reserver />} />
                    <Route path="/cgv" element={<LegalPage variant="cgv" />} />
                    <Route path="/confidentialite" element={<LegalPage variant="privacy" />} />

                    {/* Carnet Plume — espace client */}
                    <Route path="/carnet" element={<Carnet />} />
                    <Route path="/carnet/connexion" element={<CarnetLogin />} />
                    <Route path="/carnet/inscription" element={<CarnetRegister />} />
                    <Route path="/carnet/mot-de-passe-oublie" element={<CarnetForgot />} />
                    <Route path="/carnet/reinitialiser" element={<CarnetReset />} />
                    <Route path="/carnet/verifier" element={<CarnetVerify mode="verify" />} />
                    <Route path="/carnet/confirmer-email" element={<CarnetVerify mode="change" />} />
                    <Route path="/carnet/compte" element={<CarnetAccount />} />
                    <Route path="/lettre/confirmer" element={<NewsletterAction mode="confirm" />} />
                    <Route path="/lettre/desinscription" element={<NewsletterAction mode="unsubscribe" />} />

                    {/* Cartes cadeaux */}
                    <Route path="/cartes-cadeaux" element={<CartesCadeaux />} />
                    <Route path="/paiement/succes" element={<PaymentSuccess />} />
                    <Route path="/paiement/annule" element={<PaymentCancel />} />
                    <Route path="/bon/:code" element={<Voucher />} />
                    <Route path="/utiliser-mon-bon" element={<RedeemGift />} />

                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Layout>
              }
            />
          </Routes>
        </BrowserRouter>
        </CarnetAuthProvider>
      </LanguageProvider>
    </HelmetProvider>
  );
}

export default App;
