import { createNavigation } from 'next-intl/navigation';

import { routing } from './routing';

// Kept in a separate file from `defineRouting`, as recommended in
// https://github.com/amannn/next-intl/discussions/1627
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
