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

function App() {
  return (
    <HelmetProvider>
      <LanguageProvider>
        <BrowserRouter>
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
            </Routes>
          </Layout>
        </BrowserRouter>
      </LanguageProvider>
    </HelmetProvider>
  );
}

export default App;
