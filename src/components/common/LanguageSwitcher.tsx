'use client';

import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { setUserLocale } from '@/i18n/locale';
import { Locale } from '@/i18n/config';

export default function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();

  const toggleLanguage = async () => {
    const newLocale = locale === 'en' ? 'vi' : 'en';
    await setUserLocale(newLocale);
    router.refresh();
  };

  const displayLocale = locale === 'vi' ? 'VN' : 'EN';

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-7 w-9 p-0 text-[11px] font-bold border border-(--surface-border-color) hover:bg-primary/10 transition-colors uppercase rounded-md shadow-sm"
      onClick={toggleLanguage}
      title={locale === 'en' ? 'Đổi sang Tiếng Việt' : 'Switch to English'}
    >
      {displayLocale}
    </Button>
  );
}
