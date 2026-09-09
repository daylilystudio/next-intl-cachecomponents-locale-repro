'use cache';

import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';

import LangSwitcher from '@/components/LangSwitcher';
import NavLinks from '@/components/NavLinks';
import { routing } from '@/i18n/routing';

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Resolved via `next/root-params` inside `i18n/request.ts`
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body style={{ fontFamily: 'system-ui, sans-serif', padding: 24 }}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <header
            style={{
              padding: 16,
              marginBottom: 24,
              border: '2px solid #c00',
              borderRadius: 8,
            }}
          >
            <div style={{ fontSize: 20, marginBottom: 8 }}>
              LAYOUT locale: <b>{locale}</b>
            </div>
            <NavLinks />
            <LangSwitcher />
          </header>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
