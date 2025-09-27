import { useEffect } from 'react';

export function useForcedTheme() {
  useEffect(() => {
    // Force light mode for both admin and user websites
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = 'light';
    
    // Override any existing theme settings
    localStorage.setItem('appearance', 'light');
    
    // Remove any dark mode classes that might be applied
    document.body.classList.remove('dark');
    
    // Set CSS custom properties for light mode
    document.documentElement.style.setProperty('--background', '0 0% 100%');
    document.documentElement.style.setProperty('--foreground', '222.2 84% 4.9%');
  }, []);
}
