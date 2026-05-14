import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'bn' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('bpsc-lang', newLang);
  };

  return (
    <Button variant="ghost" size="icon" onClick={toggleLanguage} title="Switch Language">
      <Languages className="h-[1.2rem] w-[1.2rem]" />
      <span className="sr-only">
        {i18n.language === 'en' ? 'বাংলা' : 'English'}
      </span>
    </Button>
  );
}
