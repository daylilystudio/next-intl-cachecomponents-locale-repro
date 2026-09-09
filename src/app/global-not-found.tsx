import type { Metadata } from 'next';

// Required because there is no `app/layout.tsx` — having one would break
// `next/root-params` (it would return an empty object).
export const metadata: Metadata = {
  title: '404 - Not Found',
};

export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', padding: 24 }}>
        <h1>404</h1>
        <p>Page not found</p>
      </body>
    </html>
  );
}
