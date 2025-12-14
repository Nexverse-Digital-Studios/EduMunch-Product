import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/themeContext';
import { cn } from '../../utils/cn';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'relative p-2.5 rounded-xl transition-all duration-200',
        'hover:bg-gray-100 dark:hover:bg-dark-surface-secondary',
        'text-gray-600 dark:text-dark-text-primary'
      )}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5" />
      ) : (
        <Sun className="w-5 h-5" />
      )}
    </button>
  );
};
