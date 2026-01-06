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
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";

const menuItems = [
  { title: "Overview", url: "/", icon: LayoutDashboard }, 
  { title: "My Tasks", url: "/tasks", icon: CheckSquare },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-card">
      <SidebarHeader className="py-6">
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20 text-primary-foreground">
            <CheckSquare className="size-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground group-data-[collapsible=icon]:hidden">
            TaskFlow
          </span>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground/70 group-data-[collapsible=icon]:hidden">
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent className="pt-2">
            <SidebarMenu className="gap-1 px-2">
              {menuItems.map((item) => {
                const isActive = pathname === item.url;
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      tooltip={item.title}
                      className={cn(
                        "h-10 transition-all duration-200 ease-in-out",
                        "hover:bg-accent hover:text-accent-foreground",
                        isActive && "bg-primary/10 text-primary font-medium hover:bg-primary/15 hover:text-primary"
                      )}
                    >
                      <Link href={item.url} className="flex items-center gap-3">
                        <item.icon className={cn(
                          "size-5 shrink-0 transition-colors",
                          isActive ? "text-primary" : "text-muted-foreground"
                        )} />
                        <span className="group-data-[collapsible=icon]:hidden">
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarGroup className="mt-auto pb-6 px-2">
        <SidebarMenu className="gap-1">
          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild
              tooltip="Settings"
              className={cn(
                "h-10 transition-all duration-200 ease-in-out",
                "hover:bg-accent hover:text-accent-foreground",
                pathname === "/settings" && "bg-primary/10 text-primary font-medium hover:bg-primary/15 hover:text-primary"
              )}
            >
              <Link href="/settings" className="flex items-center gap-3">
                <Settings className={cn(
                  "size-5 shrink-0 transition-colors",
                  pathname === "/settings" ? "text-primary" : "text-muted-foreground"
                )} />
                <span className="group-data-[collapsible=icon]:hidden">Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton 
              tooltip="Logout" 
              className="h-10 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut className="size-5" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    </Sidebar>
  );
}