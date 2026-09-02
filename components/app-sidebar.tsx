"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboardIcon, UsersIcon, ReceiptIcon, CommandIcon } from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const user = {
  name: "Pritesh Suthar",
  email: "you@invoicing.test",
  avatar: "/avatars/user.jpg",
};

const navItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboardIcon,
  },
  {
    title: "Invoices",
    url: "/dashboard/invoices",
    icon: ReceiptIcon,
  },
  {
    title: "Clients",
    url: "/dashboard/clients",
    icon: UsersIcon,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  const items = navItems.map((item) => {
    const Icon = item.icon;
    const active =
      pathname === item.url ||
      (item.url !== "/dashboard" && pathname.startsWith(item.url));
    return {
      title: item.title,
      url: item.url,
      icon: <Icon />,
      active,
    };
  });

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<Link href="/dashboard" />}
            >
              <CommandIcon className="size-5!" />
              <span className="text-base font-semibold">Invoicing</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={items} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
