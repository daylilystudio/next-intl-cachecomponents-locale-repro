import { getTranslations } from 'next-intl/server';

import { Link } from '@/i18n/navigation';

// Same-locale navigation. These are fine — only the locale switcher crosses locales.
export default async function NavLinks() {
  const t = await getTranslations();

  return (
    <span>
      <Link href="/" style={{ marginRight: 12 }}>
        {t('home')}
      </Link>
      <Link href="/about" style={{ marginRight: 12 }}>
        {t('about')}
      </Link>
    </span>
  );
}
