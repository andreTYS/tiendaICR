import { prisma } from '@/shared/lib/prisma';
import type { SiteContactRepository } from '../domain/site-contact-repository';
import type { SiteContact } from '../domain/site-contact';
import type { UpdateSiteContactInput } from '../domain/site-contact-schemas';
import { SITE_CONTACT_DEFAULTS } from '../domain/site-contact';

interface PrismaSiteContactRow {
  id: number;
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

function toDomain(row: PrismaSiteContactRow): SiteContact {
  return {
    id: 1,
    phone: row.phone,
    whatsapp: row.whatsapp,
    email: row.email,
    addressLine: row.addressLine,
    addressCity: row.addressCity,
    cities: row.cities,
    instagramUrl: row.instagramUrl,
    facebookUrl: row.facebookUrl,
    linkedinUrl: row.linkedinUrl,
    tiktokUrl: row.tiktokUrl,
    youtubeUrl: row.youtubeUrl,
    twitterUrl: row.twitterUrl,
    updatedAt: row.updatedAt,
  };
}

export const prismaSiteContactRepository: SiteContactRepository = {
  async get(): Promise<SiteContact> {
    const row = await prisma.siteContact.upsert({
      where: { id: 1 },
      create: { id: 1, ...SITE_CONTACT_DEFAULTS },
      update: {},
    });
    return toDomain(row);
  },

  async update(input: UpdateSiteContactInput): Promise<SiteContact> {
    const row = await prisma.siteContact.upsert({
      where: { id: 1 },
      create: { id: 1, ...SITE_CONTACT_DEFAULTS, ...input },
      update: input,
    });
    return toDomain(row);
  },
};
