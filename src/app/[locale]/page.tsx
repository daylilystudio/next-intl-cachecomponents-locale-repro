'use cache';

import { getLocale, getTranslations } from 'next-intl/server';

export default async function HomePage() {
  const locale = await getLocale();
  const t = await getTranslations();

  return (
    <main style={{ padding: 16, border: '2px solid #060', borderRadius: 8 }}>
      <div style={{ fontSize: 20, marginBottom: 8 }}>
        PAGE locale: <b>{locale}</b>
      </div>
      <div>PAGE message: {t('greeting')}</div>
    </main>
  );
}
