"use client";

import { 
  LayoutDashboard, 
  CheckSquare, 
  Settings, 
  LogOut, 
  Archive 
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";

const menuItems = [
  { title: "Overview", url: "/dashboard", icon: LayoutDashboard },
  { title: "My Tasks", url: "/dashboard/tasks", icon: CheckSquare },
  { title: "Archive", url: "/dashboard/archive", icon: Archive },
];

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="py-4">
        <div className="flex items-center gap-2 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <CheckSquare className="size-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground group-data-[collapsible=icon]:hidden">
            TaskFlow
          </span>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground group-data-[collapsible=icon]:hidden">Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title} className="hover:bg-accent hover:text-accent-foreground">
                    <Link href={item.url}>
                      <item.icon className="size-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarGroup className="mt-auto pb-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Settings">
              <Settings className="size-5" />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Logout" className="text-destructive hover:bg-destructive/10">
              <LogOut className="size-5" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    </Sidebar>
  );
}