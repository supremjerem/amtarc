import Link from 'next/link';
import { socialLinks, type SocialPlatform } from '@/lib/content';
import { DisabledSocialLink } from './DisabledSocialLink';
import { FacebookIcon, InstagramIcon, TikTokIcon, YouTubeIcon } from './icons/SocialIcons';

type SocialLinksVariant = 'contact' | 'footer';

type SocialLinksProps = Readonly<{
  variant: SocialLinksVariant;
}>;

const VARIANT_STYLES: Record<
  SocialLinksVariant,
  { pastille: string; iconColor: string; holeColor: string; iconSize: number }
> = {
  contact: {
    pastille:
      'flex h-[50px] w-[50px] items-center justify-center rounded-full bg-brand transition-transform duration-200 ease-out hover:-translate-y-[3px] hover:bg-brand-black',
    iconColor: '#ffcf1a',
    holeColor: '#16130d',
    iconSize: 22,
  },
  footer: {
    pastille:
      'flex h-[42px] w-[42px] items-center justify-center rounded-full bg-gold-gradient transition-transform duration-200 ease-out hover:-translate-y-[3px] hover:brightness-[1.06]',
    iconColor: '#16130d',
    holeColor: '#ffcf1a',
    iconSize: 19,
  },
};

function renderIcon(platform: SocialPlatform, color: string, holeColor: string, size: number) {
  switch (platform) {
    case 'facebook':
      return <FacebookIcon color={color} size={size} />;
    case 'instagram':
      return <InstagramIcon color={color} size={size} />;
    case 'tiktok':
      return <TikTokIcon color={color} size={size} />;
    case 'youtube':
      return <YouTubeIcon color={color} holeColor={holeColor} size={size} />;
  }
}

export function SocialLinks({ variant }: SocialLinksProps) {
  const styles = VARIANT_STYLES[variant];

  return (
    <div className="flex flex-wrap items-center gap-3">
      {socialLinks.map((social) => {
        const icon = renderIcon(
          social.platform,
          styles.iconColor,
          styles.holeColor,
          styles.iconSize,
        );

        if (social.comingSoon) {
          return (
            <DisabledSocialLink
              key={social.platform}
              ariaLabel={social.label}
              title={`${social.label} (bientôt)`}
              className={styles.pastille}
            >
              {icon}
            </DisabledSocialLink>
          );
        }

        return (
          <Link
            key={social.platform}
            href={social.href}
            target={social.external ? '_blank' : undefined}
            rel={social.external ? 'noopener' : undefined}
            aria-label={social.label}
            title={social.label}
            className={styles.pastille}
          >
            {icon}
          </Link>
        );
      })}
    </div>
  );
}
