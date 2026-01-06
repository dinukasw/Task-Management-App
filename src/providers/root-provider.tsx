"use client";

import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/context/auth-context";
import QueryProvider from "./query-provider";

export default function RootProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}