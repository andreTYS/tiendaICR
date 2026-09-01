/**
 * SiteContact — singleton (id = 1) holding all editable contact info and
 * social URLs surfaced by the public site (footer, /contacto, etc.).
 *
 * Empty strings model "not configured" — public consumers should treat
 * empty values as "hide this field" rather than rendering blanks.
 */
export interface SiteContact {
  id: 1;
  phone: string;
  whatsapp: string;
  email: string;
  addressLine: string;
  addressCity: string;
  cities: string;
  instagramUrl: string;
  facebookUrl: string;
  linkedinUrl: string;
  tiktokUrl: string;
  youtubeUrl: string;
  twitterUrl: string;
  updatedAt: Date;
}

export const SITE_CONTACT_DEFAULTS: Omit<SiteContact, 'id' | 'updatedAt'> = {
  phone: '',
  whatsapp: '',
  email: '',
  addressLine: '',
  addressCity: '',
  cities: '',
  instagramUrl: '',
  facebookUrl: '',
  linkedinUrl: '',
  tiktokUrl: '',
  youtubeUrl: '',
  twitterUrl: '',
};
