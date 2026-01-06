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

export function TopNavbar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur">
      <div className="flex items-center gap-4">
        {/* The Toggle Icon for the Collapsible Sidebar */}
        <SidebarTrigger className="hover:bg-accent" />
        <div className="h-4 w-1px bg-border" />
        <h2 className="text-sm font-medium text-muted-foreground">Dashboard</h2>
      </div>

      <div className="flex items-center gap-4">
        <ModeToggle />
        
        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none">
            <Avatar className="h-8 w-8 border border-border">
              <AvatarImage src="" alt="User" />
              <AvatarFallback className="bg-primary/10 text-primary">JD</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}