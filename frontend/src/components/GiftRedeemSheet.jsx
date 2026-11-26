import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useLang } from "../context/LanguageContext";
import GiftRedeemForm from "./GiftRedeemForm";

// Panneau latéral « J'ai une carte cadeau » ouvert depuis la page Réserver.
const GiftRedeemSheet = ({ open, onOpenChange, initialCode = "" }) => {
  const { t } = useLang();
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[95] bg-ink/55 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <Dialog.Content
          data-testid="gc-redeem-sheet"
          className="fixed inset-y-0 right-0 z-[96] w-full sm:max-w-[480px] bg-cream text-ink overflow-y-auto shadow-[-20px_0_60px_-30px_rgba(59,49,43,0.5)] data-[state=open]:animate-in data-[state=open]:slide-in-from-right data-[state=open]:duration-500 data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=closed]:duration-300"
        >
          <div className="px-7 sm:px-10 pt-8 pb-12">
            <div className="flex items-center justify-between mb-12">
              <span className="font-serif italic text-sm text-ink/55">Plume Suites</span>
              <Dialog.Close
                data-testid="gc-redeem-close"
                className="w-10 h-10 -mr-2 flex items-center justify-center text-ink/70 hover:text-terracotta transition-colors"
                aria-label={t({ fr: "Fermer", en: "Close" })}
              >
                <X size={20} strokeWidth={1.25} />
              </Dialog.Close>
            </div>
            <p className="ps-overline text-terracotta mb-4">{t({ fr: "Carte cadeau", en: "Gift card" })}</p>
            <Dialog.Title className="font-serif italic font-light text-4xl leading-[1.05] mb-4">
              {t({ fr: "Le séjour qu'on vous a offert.", en: "The stay you were given." })}
            </Dialog.Title>
            <Dialog.Description className="font-sans text-[15px] text-ink/70 leading-relaxed mb-10">
              {t({
                fr: "Indiquez votre code et les dates qui vous font envie. Nous nous occupons de la réservation.",
                en: "Enter your code and the dates you have in mind. We take care of the booking.",
              })}
            </Dialog.Description>
            <GiftRedeemForm initialCode={initialCode} />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default GiftRedeemSheet;
