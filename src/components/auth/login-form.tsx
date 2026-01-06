"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertIcon } from "@/components/ui/alert";

import { loginSchema, type LoginInput } from "@/validators/auth.schema";
import { useAuth } from "@/context/auth-context";

export function LoginForm() {
  const router = useRouter();
  const { login, isAuthenticating } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Clear error when user starts typing
  const handleFieldChange = () => {
    if (apiError) {
      setApiError(null);
    }
  };

  async function onSubmit(values: LoginInput) {
    setApiError(null); // Clear previous errors
    
    const result = await login(values);

    if (result.success) {
      toast.success("Login successful!", {
        description: "Redirecting you to your dashboard...",
      });

      // Redirect to dashboard
      router.push("/");
      router.refresh();
    } else {
      const errorMessage = result.error || "Please check your email and password.";
      setApiError(errorMessage);
      toast.error("Authentication failed", {
        description: errorMessage,
      });
    }
  }

  return (
    <Card className="w-full border-border bg-card shadow-xl transition-all">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight text-center">
          Login
        </CardTitle>
        <CardDescription className="text-center">
          Access your tasks and productivity dashboard
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {apiError && (
              <Alert variant="destructive">
                <AlertIcon variant="destructive" />
                <AlertDescription>{apiError}</AlertDescription>
              </Alert>
            )}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="grid gap-2 mb-4">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <div className="">
         
                      <Input 
                        placeholder="name@example.com" 
             
                        className="pl-10 focus-visible:ring-primary" 
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          handleFieldChange();
                        }}
                        disabled={isAuthenticating}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="grid gap-2 mb-4">
             
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                  
                
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                  
                        className="pl-10 focus-visible:ring-primary" 
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          handleFieldChange();
                        }}
                        disabled={isAuthenticating}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              className="w-full font-semibold transition-transform active:scale-95" 
              disabled={isAuthenticating}
            >
              {isAuthenticating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <div className="text-sm text-muted-foreground text-center w-full">
          Don&apos;t have an account?{" "}
          <Link 
            href="/register" 
            className="text-primary hover:underline font-medium decoration-primary/30"
          >
            Create an account
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}