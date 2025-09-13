import { 
    SidebarGroup, 
    SidebarGroupLabel, 
    SidebarMenu, 
    SidebarMenuButton, 
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarMenuAction
} from '@/components/admin/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/admin/ui/collapsible';
import { type NavItem, type CollapsibleNavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import { useState } from 'react';

export function NavMainCollapsible({ items = [] }: { items: CollapsibleNavItem[] }) {
    const page = usePage();
    const [openItems, setOpenItems] = useState<string[]>([]);

    const toggleItem = (itemTitle: string) => {
        setOpenItems(prev => 
            prev.includes(itemTitle) 
                ? prev.filter(title => title !== itemTitle)
                : [...prev, itemTitle]
        );
    };

    const isItemActive = (item: NavItem) => {
        const href = typeof item.href === 'string' ? item.href : item.href.url;
        return page.url.startsWith(href);
    };

    const isParentActive = (item: CollapsibleNavItem) => {
        if (!item.items) return false;
        return item.items.some(subItem => isItemActive(subItem));
    };

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <Collapsible
                        key={item.title}
                        asChild
                        open={openItems.includes(item.title)}
                        onOpenChange={() => toggleItem(item.title)}
                    >
                        <SidebarMenuItem>
                            <SidebarMenuAction
                                asChild
                                isActive={isParentActive(item)}
                                tooltip={{ children: item.title }}
                            >
                                <CollapsibleTrigger asChild>
                                    <SidebarMenuButton>
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                        <ChevronRight className={`ml-auto transition-transform duration-200 ${
                                            openItems.includes(item.title) ? 'rotate-90' : ''
                                        }`} />
                                    </SidebarMenuButton>
                                </CollapsibleTrigger>
                            </SidebarMenuAction>
                            
                            {item.items && (
                                <CollapsibleContent>
                                    <SidebarMenuSub>
                                        {item.items.map((subItem) => (
                                            <SidebarMenuSubItem key={subItem.title}>
                                                <SidebarMenuSubButton
                                                    asChild
                                                    isActive={isItemActive(subItem)}
                                                    tooltip={{ children: subItem.title }}
                                                >
                                                    <Link href={subItem.href} prefetch>
                                                        {subItem.icon && <subItem.icon />}
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
