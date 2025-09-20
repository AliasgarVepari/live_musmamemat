import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/admin/ui/collapsible';
import {
    SidebarGroup,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/admin/ui/sidebar';
import { type CollapsibleNavItem, type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

export function NavMainCollapsible({ items = [] }: { items: CollapsibleNavItem[] }) {
    const page = usePage();
    const [openItems, setOpenItems] = useState<string[]>([]);

    const toggleItem = (itemTitle: string) => {
        setOpenItems((prev) => (prev.includes(itemTitle) ? prev.filter((title) => title !== itemTitle) : [...prev, itemTitle]));
    };

    const isItemActive = (item: NavItem) => {
        const href = typeof item.href === 'string' ? item.href : item.href.url;
        return page.url.startsWith(href);
    };

    const isParentActive = (item: CollapsibleNavItem) => {
        if (!item.items) return false;
        return item.items.some((subItem) => isItemActive(subItem));
    };

    // Automatically open parent items when their sub-items are active
    useEffect(() => {
        const activeParentItems = items.filter((item) => isParentActive(item)).map((item) => item.title);

        setOpenItems((prev) => {
            const newOpenItems = [...new Set([...prev, ...activeParentItems])];
            return newOpenItems;
        });
    }, [page.url, items]);

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarMenu>
                {items.map((item) => (
                    <Collapsible key={item.title} asChild open={openItems.includes(item.title)} onOpenChange={() => toggleItem(item.title)}>
                        <SidebarMenuItem>
                            <CollapsibleTrigger asChild>
                                <SidebarMenuButton isActive={isParentActive(item)}>
                                    {item.icon && <item.icon className="h-4 w-4" />}
                                    <span>{item.title}</span>
                                    <ChevronRight
                                        className={`ml-auto h-4 w-4 transition-transform duration-200 ${
                                            openItems.includes(item.title) ? 'rotate-90' : ''
                                        }`}
                                    />
                                </SidebarMenuButton>
                            </CollapsibleTrigger>

                            {item.items && (
                                <CollapsibleContent>
                                    <SidebarMenuSub>
                                        {item.items.map((subItem) => (
                                            <SidebarMenuSubItem key={subItem.title}>
                                                <SidebarMenuSubButton asChild isActive={isItemActive(subItem)}>
                                                    <Link href={subItem.href} prefetch>
                                                        {subItem.icon && <subItem.icon className="h-4 w-4" />}
                                                        <span>{subItem.title}</span>
                                                    </Link>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                        ))}
                                    </SidebarMenuSub>
                                </CollapsibleContent>
                            )}
                        </SidebarMenuItem>
                    </Collapsible>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
