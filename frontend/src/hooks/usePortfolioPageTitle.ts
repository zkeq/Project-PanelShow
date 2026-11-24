import { useEffect } from 'react';

function cleanTitle(value: unknown): string | undefined {
  return typeof value === 'string' ? value.trim() || undefined : undefined;
}

export function usePortfolioPageTitle(
  username: string,
  profile: { siteTitle?: unknown; name?: string } | null,
  projectName?: string,
) {
  const siteName = cleanTitle(profile?.siteTitle) ?? cleanTitle(profile?.name) ?? username;
  const siteTitle = siteName.endsWith('的作品集') ? siteName : `${siteName} 的作品集`;
  const title = projectName ? `${projectName} · ${siteTitle}` : siteTitle;

  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;
    return () => {
      if (document.title === title) document.title = previousTitle;
    };
  }, [title]);
}
