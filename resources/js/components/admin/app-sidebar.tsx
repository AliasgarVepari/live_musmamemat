import { NavFooter } from '@/components/admin/nav-footer';
import { NavMain } from '@/components/admin/nav-main';
import { NavMainCollapsible } from '@/components/admin/nav-main-collapsible';
import { NavUser } from '@/components/admin/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/admin/ui/sidebar';
import { dashboard } from '@/routes/admin';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, Crown, DollarSign, Folder, Grid3X3, LayoutGrid, Link as LinkIcon, MapPin, Settings, Tag, Users } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Users',
        href: '/admin/users',
        icon: Users,
    },
    {
        title: 'Categories',
        href: '/admin/categories',
        icon: Grid3X3,
    },
    {
        title: 'Subscription Plans',
        href: '/admin/subscription-plans',
        icon: Crown,
    },
];

const collapsibleNavItems = [
    {
        title: 'Master Module',
        href: '/admin/master',
        icon: Settings,
        items: [
            {
                title: 'Social Links',
                href: '/admin/social-links',
                icon: LinkIcon,
            },
            {
                title: 'Governorates',
                href: '/admin/governorates',
                icon: MapPin,
            },
            {
                title: 'Product Conditions',
                href: '/admin/conditions',
                icon: Tag,
            },
            {
                title: 'Price Types',
                href: '/admin/price-types',
                icon: DollarSign,
            },
        ],
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMainCollapsible items={collapsibleNavItems} />
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
