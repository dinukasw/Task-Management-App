"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail, Lock } from "lucide-react";
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

import { loginSchema, type LoginInput } from "@/validators/auth.schema";
import { useAuth } from "@/context/auth-context";

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginInput) {
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Login failed");
      }

      // Update auth context
      login(data.user);

      toast.success("Login successful!", {
        description: "Redirecting you to your dashboard...",
      });

      // Redirect to dashboard
      router.push("/");
      router.refresh();
      
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Please check your email and password.";
      
      toast.error("Authentication failed", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
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
                        disabled={isLoading}
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
                        disabled={isLoading}
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
              disabled={isLoading}
            >
              {isLoading ? (
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