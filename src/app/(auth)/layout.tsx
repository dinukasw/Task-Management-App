import { AuthGuard } from "@/components/auth/auth-guard";

export default function AuthLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <AuthGuard requireAuth={false} redirectTo="/">
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>
      </AuthGuard>
    );
  }