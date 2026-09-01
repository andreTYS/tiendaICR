import type { SiteContact } from '@/modules/site-contact/domain/site-contact';

interface Props {
  contact: SiteContact;
  size?: number;
  className?: string;
}

interface Network {
  key: keyof Pick<
    SiteContact,
    'instagramUrl' | 'facebookUrl' | 'linkedinUrl' | 'tiktokUrl' | 'youtubeUrl' | 'twitterUrl'
  >;
  label: string;
  icon: React.ReactNode;
}

const NETWORKS: Network[] = [
  {
    key: 'instagramUrl',
    label: 'Instagram',
    icon: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </>
    ),
  },
  {
    key: 'facebookUrl',
    label: 'Facebook',
    icon: (
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    ),
  },
  {
    key: 'linkedinUrl',
    label: 'LinkedIn',
    icon: (
      <>
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </>
    ),
  },
  {
    key: 'tiktokUrl',
    label: 'TikTok',
    icon: (
      <path d="M14 3v10.5a3.5 3.5 0 1 1-3.5-3.5h.5V7a7 7 0 1 0 7 7V8a8 8 0 0 0 5 1.7V6a5 5 0 0 1-5-3h-4z" />
    ),
  },
  {
    key: 'youtubeUrl',
    label: 'YouTube',
    icon: (
      <>
        <path d="M22.5 6.5a2.8 2.8 0 0 0-2-2C18.8 4 12 4 12 4s-6.8 0-8.5.5a2.8 2.8 0 0 0-2 2A29 29 0 0 0 1 12a29 29 0 0 0 .5 5.5 2.8 2.8 0 0 0 2 2C5.2 20 12 20 12 20s6.8 0 8.5-.5a2.8 2.8 0 0 0 2-2A29 29 0 0 0 23 12a29 29 0 0 0-.5-5.5z" />
        <polygon points="10,15 15,12 10,9" fill="currentColor" stroke="none" />
      </>
    ),
  },
  {
    key: 'twitterUrl',
    label: 'X (Twitter)',
    icon: (
      <path d="M4 4l7.5 9.5L4.5 20H7l5.5-6 4.5 6H21l-7.7-10L20.5 4H18l-4.7 5.2L9.5 4H4z" />
    ),
  },
];

/**
 * Renders only the social networks that have a non-empty URL configured.
 * Returns null when none are configured so callers don't need to guard.
 * Server-renderable — purely presentational.
 */
export default function SocialLinks({ contact, size = 18, className }: Props) {
  const active = NETWORKS.filter((n) => contact[n.key].trim() !== '');
  if (active.length === 0) return null;

  return (
    <ul className={`social-links ${className ?? ''}`}>
      {active.map((n) => (
        <li key={n.key}>
          <a
            href={contact[n.key]}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={n.label}
            title={n.label}
          >
            <svg
              width={size}
              height={size}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {n.icon}
            </svg>
          </a>
        </li>
      ))}
    </ul>
  );
}
