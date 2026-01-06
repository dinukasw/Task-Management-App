"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/shared/mode-toogle"; 
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";
import { LogOut } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

function getInitials(name: string | null | undefined, email: string): string {
  if (name) {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
  return email.substring(0, 2).toUpperCase();
}

export function TopNavbar() {
  const { user, isLoading, logout } = useAuth();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
  };

  // Generate breadcrumb items based on pathname
  const getBreadcrumbItems = () => {
    const items = [];
    
    // Always start with Dashboard
    items.push({ label: "Dashboard", href: "/" });
    
    // Add additional items based on pathname
    if (pathname === "/tasks") {
      items.push({ label: "Tasks", href: "/tasks" });
    } else if (pathname.startsWith("/tasks/")) {
      items.push({ label: "Tasks", href: "/tasks" });
      // Could add task name here if needed
    }
    
    return items;
  };

  const breadcrumbItems = getBreadcrumbItems();

  if (isLoading) {
    return (
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="hover:bg-accent" />
          <div className="h-4 w-1px bg-border" />
          <h2 className="text-sm font-medium text-muted-foreground">Dashboard</h2>
        </div>

        <div className="flex items-center gap-4">
          <ModeToggle />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </header>
    );
  }

  const initials = user ? getInitials(user.name, user.email) : "U";
  const displayName = user?.name || user?.email || "User";

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur">
      <div className="flex items-center gap-4">
        {/* The Toggle Icon for the Collapsible Sidebar */}
        <SidebarTrigger className="hover:bg-accent" />
        <div className="h-4 w-1px bg-border" />
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbItems.map((item, index) => {
              const isLast = index === breadcrumbItems.length - 1;
              return (
                <div key={item.href} className="flex items-center">
                  {index > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage>{item.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link href={item.href}>{item.label}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </div>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center gap-4">
        <ModeToggle />
        
        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none">
            <Avatar className="h-8 w-8 border border-border">
              <AvatarImage src="" alt={displayName} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name || "User"}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}