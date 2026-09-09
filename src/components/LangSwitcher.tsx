'use client';

import { useLocale } from 'next-intl';

import { Link, usePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

// The locale switcher exactly as documented:
// https://next-intl.dev/docs/routing/navigation#link
export default function LangSwitcher() {
  const pathname = usePathname();
  const current = useLocale();

  return (
    <span>
      {routing.locales.map((locale) => (
        <Link
          key={locale}
          href={pathname}
          locale={locale}
          style={{
            marginRight: 12,
            fontWeight: locale === current ? 700 : 400,
          }}
        >
          {locale}
        </Link>
      ))}
    </span>
  );
}
