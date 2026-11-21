import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme';

/** Switches between the light and dark themes; the icon shows the theme it switches to. */
const ThemeButton = () => {
  const { t } = useTranslation();
  const { theme, toggle } = useTheme();
  const toLight = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t(toLight ? 'theme_to_light' : 'theme_to_dark')}
      title={t(toLight ? 'theme_to_light' : 'theme_to_dark')}
      data-testid="theme-toggle"
      className={
        'grid h-8 w-8 place-items-center rounded-full border border-rule text-ink-2 transition-colors '
        // A firmer ring on the light page (rule alone is under 3:1 there).
        + '[:root[data-theme=light]_&]:border-ink/40 '
        + 'hover:border-ink hover:text-ink focus-visible:outline focus-visible:outline-2 '
        + 'focus-visible:outline-offset-2 focus-visible:outline-ink'
      }
    >
      {toLight ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
    </button>
  );
};

export default ThemeButton;
