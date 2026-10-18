/**
 * N-7 (designsystem 2.5): produktlogoene fra pakken (ds/produktlogo, byte for byte fra Designs 2.5): prikken i H-symbolet er plattformkoden,
 * oransje = Hengsel (merket og nettsidene), blå = Hengsel CRM, grønn = Hengsel Ute, lilla = Hengsel Admin. Bare lys utgave. SVG-ene brukes som de er, som <img>.
 * Samme data-produkt-navn som i tokens.css: nettsider, crm, ute, admin. Vite gir hver fil en hashet adresse (assetsInlineLimit 0 i nettstedenes astro.config).
 */
import nettsider from "../ds/produktlogo/logo-hengsel-lys.svg?url";
import crm from "../ds/produktlogo/logo-crm-lys.svg?url";
import ute from "../ds/produktlogo/logo-ute-lys.svg?url";
import admin from "../ds/produktlogo/logo-admin-lys.svg?url";

export type Produkt = "nettsider" | "crm" | "ute" | "admin";
export const PRODUKTLOGO: Record<Produkt, { src: string; alt: string; width: number; height: number }> = {
  nettsider: { src: nettsider, alt: "Hengsel", width: 422, height: 100 },
  crm: { src: crm, alt: "Hengsel CRM", width: 622, height: 100 },
  ute: { src: ute, alt: "Hengsel Ute", width: 570, height: 100 },
  admin: { src: admin, alt: "Hengsel Admin", width: 682, height: 100 },
};
