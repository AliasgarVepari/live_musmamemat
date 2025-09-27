import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { Providers } from './Provider';
const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <Providers>
                <App {...props} />
            </Providers>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// Force light mode globally
document.documentElement.classList.remove('dark');
document.documentElement.style.colorScheme = 'light';
