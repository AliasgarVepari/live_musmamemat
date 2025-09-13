import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User | null;
    admin: AdminUser | null;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface CollapsibleNavItem extends NavItem {
    items?: NavItem[];
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    email: string;
    phone?: string;
    bio?: string;
    avatar?: string;
    location?: string;
    website?: string;
    preferences?: Record<string, any>;
    is_subscribed: boolean;
    subscription_expires_at?: string;
    ads_count: number;
    featured_ads_count: number;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface AdminUser {
    id: number;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    permissions?: string[];
    is_active: boolean;
    last_login_at?: string;
    last_login_ip?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}
