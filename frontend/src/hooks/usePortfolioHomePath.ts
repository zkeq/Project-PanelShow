'use client';

import { useSyncExternalStore } from 'react';
import { getPortfolioPath, getPortfolioUsername } from '@/lib/site-domain';

// A document's hostname stays fixed through client-side navigation.
const subscribeToHostname = () => () => {};
const getBrowserHostname = () => window.location.hostname;
const getServerHostname = () => '';

export function usePortfolioHomePath(username: string): string {
  const hostname = useSyncExternalStore(subscribeToHostname, getBrowserHostname, getServerHostname);
  return getPortfolioUsername(hostname) === username ? '/' : getPortfolioPath(username);
}
