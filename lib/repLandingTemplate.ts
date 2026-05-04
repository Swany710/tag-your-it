export type RepLandingTemplateData = {
  companyName: string;
  badge: string;
  headline: string;
  intro: string;
  primaryCtaText: string;
  microNote: string;
  serviceLine: string;
  websiteLabel: string;
  websiteUrl: string;
  ctaHeading: string;
  ctaBody: string;
  formHeading: string;
  formBody: string;
  successHeading: string;
  successBody: string;
  logoUrl: string;
};

type RepLandingTemplateInput = Omit<Partial<RepLandingTemplateData>, "logoUrl"> & {
  logoUrl?: string | null;
};

export const DEFAULT_REP_LANDING_TEMPLATE: RepLandingTemplateData = {
  companyName: "AMRG Exteriors",
  badge: "Good meeting you",
  headline: "Good meeting you - don't wait too long to take a look.",
  intro:
    "Storm damage isn't always obvious right away. It's worth taking a look sooner rather than later - this makes it easy to get started.",
  primaryCtaText: "Start My Inspection",
  microNote: "Fastest next step: send a quick text and I'll take it from there.",
  serviceLine: "Roofing | Siding | Windows",
  websiteLabel: "www.mcgeerestoration.com",
  websiteUrl: "https://www.mcgeerestoration.com",
  ctaHeading: "The sooner we check it, the better.",
  ctaBody:
    "We'll take a look, document anything we find, and walk you through your options - including insurance if it applies.",
  formHeading: "Request a free inspection",
  formBody:
    "Tell us a little about your property and {{firstName}} will get back to you fast.",
  successHeading: "Request received. You're in good hands.",
  successBody:
    "{{repName}} will follow up shortly to schedule your free inspection and walk you through the next steps.",
  logoUrl: "/rep-landing-logo.svg",
};

export function normalizeRepLandingTemplate(
  value?: RepLandingTemplateInput | null
): RepLandingTemplateData {
  const merged = {
    ...DEFAULT_REP_LANDING_TEMPLATE,
    ...value,
  };

  return {
    companyName: merged.companyName?.trim() || DEFAULT_REP_LANDING_TEMPLATE.companyName,
    badge: merged.badge?.trim() || "",
    headline: merged.headline?.trim() || DEFAULT_REP_LANDING_TEMPLATE.headline,
    intro: merged.intro?.trim() || DEFAULT_REP_LANDING_TEMPLATE.intro,
    primaryCtaText:
      merged.primaryCtaText?.trim() || DEFAULT_REP_LANDING_TEMPLATE.primaryCtaText,
    microNote: merged.microNote?.trim() || "",
    serviceLine: merged.serviceLine?.trim() || "",
    websiteLabel: merged.websiteLabel?.trim() || DEFAULT_REP_LANDING_TEMPLATE.websiteLabel,
    websiteUrl: merged.websiteUrl?.trim() || DEFAULT_REP_LANDING_TEMPLATE.websiteUrl,
    ctaHeading: merged.ctaHeading?.trim() || DEFAULT_REP_LANDING_TEMPLATE.ctaHeading,
    ctaBody: merged.ctaBody?.trim() || DEFAULT_REP_LANDING_TEMPLATE.ctaBody,
    formHeading: merged.formHeading?.trim() || DEFAULT_REP_LANDING_TEMPLATE.formHeading,
    formBody: merged.formBody?.trim() || DEFAULT_REP_LANDING_TEMPLATE.formBody,
    successHeading:
      merged.successHeading?.trim() || DEFAULT_REP_LANDING_TEMPLATE.successHeading,
    successBody: merged.successBody?.trim() || DEFAULT_REP_LANDING_TEMPLATE.successBody,
    logoUrl: merged.logoUrl?.trim() || DEFAULT_REP_LANDING_TEMPLATE.logoUrl,
  };
}
