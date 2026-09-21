import type { Locale } from "@/lib/i18n/config";
import type { PolicyId } from "@/lib/i18n/routes";
import { BRAND, FULFILLMENT, LOCATIONS, HOURS } from "@/config/business";

/**
 * Policy page content. Written to state only what the business has confirmed
 * (two locations, hours, delivery offered, pickup free, hosted checkout,
 * what the site collects). Items the business must confirm are phrased as
 * "confirmed with you before purchase" rather than invented terms.
 * Edit here; each page renders sections in order.
 */
export interface PolicySection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
}
export interface PolicyContent {
  title: string;
  intro: string;
  updated: string; // ISO date
  sections: PolicySection[];
}

const stores = (locale: Locale) => LOCATIONS.map((l) => `${l.name[locale]} — ${l.address.street}, ${l.address.city} ${l.address.postalCode} (${l.phone})`);
const hours = (locale: Locale) => `${HOURS.display[locale].days}, ${HOURS.display[locale].time}`;
const UPDATED = "2026-09-13";

export function getPolicy(id: PolicyId, locale: Locale): PolicyContent {
  const fr = locale === "fr";
  switch (id) {
    case "delivery":
      return {
        title: fr ? "Livraison et cueillette" : "Delivery and pickup",
        updated: UPDATED,
        intro: fr
          ? "Vous pouvez recevoir votre électroménager par livraison ou le récupérer sans frais dans l'une de nos deux succursales de Laval."
          : "You can have your appliance delivered or pick it up free of charge at either of our two Laval locations.",
        sections: [
          {
            heading: fr ? "Cueillette en magasin" : "Store pickup",
            paragraphs: [fr ? `La cueillette est offerte sans frais. Nous vous confirmons la succursale et le moment où l'appareil est prêt. Heures d'ouverture : ${hours(locale)}.` : `Pickup is free. We confirm the store and the time your appliance is ready. Opening hours: ${hours(locale)}.`],
            bullets: stores(locale),
          },
          {
            heading: fr ? "Livraison" : "Delivery",
            paragraphs: [
              FULFILLMENT.delivery.offered
                ? fr
                  ? "La livraison est offerte dans la région. Les frais de livraison et le délai dépendent de l'adresse et de l'appareil : ils vous sont confirmés lors de la commande, avant tout paiement."
                  : "Delivery is offered in the area. Delivery fees and timing depend on the address and the appliance: they are confirmed with you when you order, before any payment."
                : fr
                  ? "La livraison n'est pas offerte pour le moment."
                  : "Delivery is not offered at this time.",
              fr ? "Assurez-vous que l'appareil passe par vos portes et escaliers : les dimensions exactes sont indiquées sur chaque fiche produit." : "Make sure the appliance fits through your doors and stairways: exact dimensions are listed on every product page.",
            ],
          },
          {
            heading: fr ? "Questions" : "Questions",
            paragraphs: [fr ? "Pour toute question sur la livraison ou la cueillette, appelez la succursale de votre choix." : "For any question about delivery or pickup, call the store of your choice."],
          },
        ],
      };
    case "returns":
      return {
        title: fr ? "Retours et remboursements" : "Returns and refunds",
        updated: UPDATED,
        intro: fr
          ? "Nos électroménagers remis à neuf sont inspectés et testés avant la vente. Les modalités de retour vous sont expliquées clairement en magasin ou par téléphone avant votre achat."
          : "Our refurbished appliances are inspected and tested before sale. Return terms are clearly explained in store or by phone before your purchase.",
        sections: [
          {
            heading: fr ? "Avant l'achat" : "Before you buy",
            bullets: [
              fr ? "Chaque fiche décrit l'état de l'appareil et ses dimensions." : "Each listing describes the appliance's condition and dimensions.",
              fr ? "Vous pouvez voir et tester l'appareil en magasin avant de l'acheter." : "You can see and test the appliance in store before buying.",
              fr ? "Notre équipe répond à vos questions 7 jours sur 7." : "Our team answers your questions 7 days a week.",
            ],
          },
          {
            heading: fr ? "Problème avec un appareil" : "Problem with an appliance",
            paragraphs: [fr ? "Si votre appareil présente un problème après la livraison ou la cueillette, communiquez avec la succursale où vous l'avez acheté dès que possible. Nous trouverons une solution avec vous." : "If your appliance has a problem after delivery or pickup, contact the store where you bought it as soon as possible. We will find a solution with you."],
            bullets: stores(locale),
          },
        ],
      };
    case "warranty":
      return {
        title: fr ? "Garantie" : "Warranty",
        updated: UPDATED,
        intro: fr ? "Les modalités de garantie vous sont précisées en magasin ou par téléphone avant l'achat." : "Warranty terms are explained in store or by phone before purchase.",
        sections: [],
      };
    case "privacy":
      return {
        title: fr ? "Politique de confidentialité" : "Privacy policy",
        updated: UPDATED,
        intro: fr
          ? `${BRAND.legalName} respecte votre vie privée. Cette politique décrit les renseignements que ce site recueille et la façon dont ils sont utilisés.`
          : `${BRAND.legalName} respects your privacy. This policy describes the information this site collects and how it is used.`,
        sections: [
          {
            heading: fr ? "Renseignements recueillis" : "Information we collect",
            bullets: [
              fr ? "Formulaire de contact et alertes de stock : nom, courriel, téléphone (facultatif) et votre message, utilisés uniquement pour vous répondre." : "Contact form and stock alerts: name, email, phone (optional) and your message, used only to reply to you.",
              fr ? "Infolettre : votre courriel et votre catégorie préférée, avec votre consentement explicite. Vous pouvez vous désabonner à tout moment." : "Newsletter: your email and preferred category, with your explicit consent. You can unsubscribe at any time.",
              fr ? "Panier : un témoin (cookie) technique conserve le contenu de votre panier pendant 14 jours." : "Cart: a technical cookie keeps your cart contents for 14 days.",
              fr ? "Commandes : les renseignements de paiement sont traités par notre fournisseur de caisse sécurisée (conforme PCI). Ce site ne stocke jamais de numéro de carte." : "Orders: payment details are processed by our secure checkout provider (PCI compliant). This site never stores card numbers.",
            ],
          },
          {
            heading: fr ? "Témoins de mesure et de publicité" : "Analytics and advertising cookies",
            paragraphs: [fr ? "Les témoins de mesure d'audience (Google Analytics) et de publicité (Google Ads, Meta) ne sont activés qu'avec votre accord, donné dans la bannière de témoins. Vous pouvez refuser sans que le site cesse de fonctionner." : "Analytics (Google Analytics) and advertising (Google Ads, Meta) cookies are enabled only with your consent, given in the cookie banner. You can decline and the site keeps working."],
          },
          {
            heading: fr ? "Vos droits" : "Your rights",
            paragraphs: [fr ? "Vous pouvez demander l'accès, la correction ou la suppression de vos renseignements en communiquant avec l'une de nos succursales." : "You can request access to, correction of or deletion of your information by contacting either of our stores."],
            bullets: stores(locale),
          },
        ],
      };
    case "terms":
    default:
      return {
        title: fr ? "Conditions générales" : "Terms and conditions",
        updated: UPDATED,
        intro: fr ? `Ces conditions s'appliquent à l'utilisation du site ${BRAND.domain.replace("https://", "")} et aux achats effectués en ligne auprès de ${BRAND.legalName}.` : `These terms apply to the use of ${BRAND.domain.replace("https://", "")} and to online purchases from ${BRAND.legalName}.`,
        sections: [
          {
            heading: fr ? "Produits et prix" : "Products and prices",
            bullets: [
              fr ? "Les prix sont en dollars canadiens; les taxes (TPS et TVQ) sont ajoutées à la caisse." : "Prices are in Canadian dollars; taxes (GST and QST) are added at checkout.",
              fr ? "Les appareils remis à neuf sont souvent des unités uniques : un appareil vendu est retiré du site." : "Refurbished appliances are often one-of-a-kind units: a sold appliance is removed from the site.",
              fr ? "Les prix « à partir de » s'appliquent à plusieurs unités; le prix exact est confirmé selon l'unité choisie." : "\"From\" prices apply to several units; the exact price is confirmed for the unit you choose.",
              fr ? "Nous nous réservons le droit de corriger une erreur de prix ou de description avant la confirmation d'une commande." : "We reserve the right to correct a price or description error before an order is confirmed.",
            ],
          },
          {
            heading: fr ? "Commandes et paiement" : "Orders and payment",
            paragraphs: [fr ? "Le paiement en ligne est effectué par une caisse hébergée et sécurisée. Une commande est confirmée lorsque vous recevez le courriel de confirmation." : "Online payment is completed through a secure hosted checkout. An order is confirmed when you receive the confirmation email."],
          },
          {
            heading: fr ? "Livraison, cueillette et retours" : "Delivery, pickup and returns",
            paragraphs: [fr ? "Voir nos politiques de livraison et de retours. Les modalités qui ne sont pas indiquées sur ce site vous sont précisées avant l'achat." : "See our delivery and returns policies. Terms not stated on this site are explained to you before purchase."],
          },
          {
            heading: fr ? "Nous joindre" : "Contact us",
            bullets: stores(locale),
          },
        ],
      };
  }
}
